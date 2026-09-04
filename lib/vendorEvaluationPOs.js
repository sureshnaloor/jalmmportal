import { MIN_VENDOR_PO_VALUE_SAR } from './vendorEvaluationConfig';
import { EVALUATION_TRACK } from './vendorEvaluationYear';
import {
  toNumber,
  resolveActualDeliveryDate,
  computeDeliveryVarianceDays,
  buildPOTimelineEvents,
  mapPOLineItem,
} from './poEvaluationHelpers';

function groupPurchaseOrderRows(rows) {
  const poMap = new Map();
  rows.forEach((row) => {
    const ponum = row['po-number'];
    if (!ponum) return;
    if (!poMap.has(ponum)) {
      poMap.set(ponum, {
        ponumber: ponum,
        podate: row['po-date'],
        deliveryDate: row['delivery-date'],
        vendorname: row.vendorname,
        plant: row['plant-code'] || '',
        povalue: 0,
        lineItems: [],
      });
    }
    const po = poMap.get(ponum);
    po.povalue += toNumber(row['po-value-sar']);
    po.lineItems.push(mapPOLineItem(row));
    if (row['po-date'] && (!po.podate || new Date(row['po-date']) > new Date(po.podate))) {
      po.podate = row['po-date'];
    }
  });
  return [...poMap.values()];
}

export async function getTopValuePOsInRange(db, vendorcode, yearStart, yearEnd, limit = 2) {
  const rows = await db
    .collection('purchaseorders')
    .find({
      vendorcode,
      'po-date': { $gte: yearStart, $lte: yearEnd },
    })
    .toArray();

  return groupPurchaseOrderRows(rows)
    .sort((a, b) => b.povalue - a.povalue)
    .slice(0, limit);
}

export async function getMostRecentPOs(db, vendorcode, limit = 2) {
  const rows = await db.collection('purchaseorders').find({ vendorcode }).toArray();
  return groupPurchaseOrderRows(rows)
    .sort((a, b) => new Date(b.podate || 0) - new Date(a.podate || 0))
    .slice(0, limit);
}

export async function getEvaluationPOs(db, vendorcode, track, yearStart, yearEnd) {
  if (track === EVALUATION_TRACK.PRIOR_PO) {
    return getMostRecentPOs(db, vendorcode, 2);
  }
  return getTopValuePOsInRange(db, vendorcode, yearStart, yearEnd, 2);
}

export async function enrichPOWithSchedule(db, po) {
  const [schedule, deliveryDocs] = await Promise.all([
    db.collection('poschedule').findOne({ ponumber: po.ponumber }),
    db.collection('materialdocumentsforpo').find({ ponumber: po.ponumber }).toArray(),
  ]);

  const actualDeliveryDate = resolveActualDeliveryDate(schedule, deliveryDocs);
  const deliveryVarianceDays = computeDeliveryVarianceDays(po.podate, actualDeliveryDate);

  return {
    ...po,
    povalue: Math.round(po.povalue * 100) / 100,
    actualDeliveryDate,
    deliveryVarianceDays,
    timeline: buildPOTimelineEvents({
      podate: po.podate,
      deliveryDate: po.deliveryDate,
      actualDeliveryDate,
      schedule,
    }),
    hasSchedule: Boolean(schedule),
  };
}

export async function getVendorPoTotals(db, vendorcode, yearStart, yearEnd) {
  const match = { vendorcode };
  if (yearStart && yearEnd) {
    match['po-date'] = { $gte: yearStart, $lte: yearEnd };
  }

  const rows = await db
    .collection('purchaseorders')
    .aggregate([
      { $match: match },
      {
        $group: {
          _id: '$po-number',
          povalue: { $sum: '$po-value-sar' },
          lastPoDate: { $max: '$po-date' },
        },
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$povalue' },
          poCount: { $sum: 1 },
          lastPoDate: { $max: '$lastPoDate' },
        },
      },
    ])
    .toArray();

  return rows[0] || { totalValue: 0, poCount: 0, lastPoDate: null };
}

export async function getCurrentYearEligibleVendorCodes(db, yearStart, yearEnd) {
  const rows = await db
    .collection('purchaseorders')
    .aggregate([
      {
        $match: {
          'po-date': { $gte: yearStart, $lte: yearEnd },
          vendorcode: { $exists: true, $nin: [null, ''] },
        },
      },
      {
        $group: {
          _id: '$vendorcode',
          totalValue: { $sum: '$po-value-sar' },
        },
      },
      {
        $match: {
          totalValue: { $gt: MIN_VENDOR_PO_VALUE_SAR },
        },
      },
    ])
    .toArray();

  return new Set(rows.map((row) => String(row._id)));
}
