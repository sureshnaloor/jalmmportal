import { connectToDatabase } from '../../../../lib/mongoconnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import {
  getVendorEvaluationYear,
  getVendorEvaluationYearRange,
  getAnnualEvaluationStorageKey,
} from '../../../../lib/vendorEvaluationYear';
import { MIN_VENDOR_PO_VALUE_SAR } from '../../../../lib/vendorEvaluationConfig';
import { isEvaluationComplete } from '../../../../lib/vendorEvaluationApproval';
import {
  toNumber,
  resolveActualDeliveryDate,
  computeDeliveryVarianceDays,
  buildPOTimelineEvents,
  mapPOLineItem,
} from '../../../../lib/poEvaluationHelpers';

async function getTopPOsForVendor(db, vendorcode, yearStart, yearEnd) {
  const rows = await db
    .collection('purchaseorders')
    .find({
      vendorcode,
      'po-date': { $gte: yearStart, $lte: yearEnd },
    })
    .toArray();

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
  });

  return [...poMap.values()]
    .sort((a, b) => b.povalue - a.povalue)
    .slice(0, 2);
}

async function enrichPOWithSchedule(db, po) {
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

export default async function handler(req, res) {
  const { vendorcode } = req.query;
  if (!vendorcode) {
    return res.status(400).json({ error: 'vendorcode is required' });
  }

  const evaluationYear = req.query.year
    ? parseInt(req.query.year, 10)
    : getVendorEvaluationYear();
  const { yearStart, yearEnd } = getVendorEvaluationYearRange(evaluationYear);
  const storageKey = getAnnualEvaluationStorageKey(evaluationYear);

  try {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      const [vendorDetails, evalDoc, topPOsRaw] = await Promise.all([
        db.collection('vendors').findOne({ 'vendor-code': vendorcode }),
        db.collection('vendorevaluation').findOne({ vendorcode: String(vendorcode) }),
        getTopPOsForVendor(db, vendorcode, yearStart, yearEnd),
      ]);

      if (!topPOsRaw.length) {
        return res.status(404).json({
          error: `No qualifying POs found for vendor in ${evaluationYear}`,
        });
      }

      const allVendorRows = await db
        .collection('purchaseorders')
        .aggregate([
          {
            $match: {
              vendorcode,
              'po-date': { $gte: yearStart, $lte: yearEnd },
            },
          },
          {
            $group: {
              _id: '$po-number',
              povalue: { $sum: '$po-value-sar' },
            },
          },
          {
            $group: {
              _id: null,
              totalValue: { $sum: '$povalue' },
              poCount: { $sum: 1 },
            },
          },
        ])
        .toArray();

      const vendorTotals = allVendorRows[0] || { totalValue: 0, poCount: 0 };
      if (vendorTotals.totalValue <= MIN_VENDOR_PO_VALUE_SAR) {
        return res.status(404).json({
          error: `Vendor total PO value must exceed ${MIN_VENDOR_PO_VALUE_SAR} SAR`,
        });
      }

      const topPOs = await Promise.all(topPOsRaw.map((po) => enrichPOWithSchedule(db, po)));

      const savedEval = evalDoc?.[storageKey] || null;

      return res.status(200).json({
        evaluationYear,
        vendorcode: String(vendorcode),
        vendorname: vendorDetails?.['vendor-name'] || topPOs[0]?.vendorname || '',
        vendorDetails: vendorDetails || null,
        totalPoValue: vendorTotals.totalValue,
        poCount: vendorTotals.poCount,
        topPOs,
        evaluation: savedEval,
      });
    }

    if (req.method === 'PUT') {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const body = req.body || {};
      const existing = await db.collection('vendorevaluation').findOne({ vendorcode: String(vendorcode) });
      const existingEval = existing?.[storageKey];

      if (existingEval?.approved) {
        return res.status(403).json({ error: 'Approved evaluations cannot be modified.' });
      }

      const topPOsRaw = await getTopPOsForVendor(db, vendorcode, yearStart, yearEnd);
      const requiredPoNumbers = topPOsRaw.map((po) => po.ponumber);
      if (existingEval && isEvaluationComplete(existingEval, requiredPoNumbers)) {
        return res.status(403).json({
          error: 'Evaluation is complete and locked. Supply chain head may edit scores before approval.',
        });
      }

      const payload = {
        evaluationYear,
        ratingMaterials: body.ratingMaterials || {},
        ratingServices: body.ratingServices || {},
        poEvaluations: Array.isArray(body.poEvaluations) ? body.poEvaluations : [],
        updatedAt: new Date(),
        updatedBy: body.updatedBy || null,
        approved: false,
        approvedAt: null,
        approvedBy: null,
      };

      if (!existingEval) {
        payload.createdAt = new Date();
        payload.createdBy = body.updatedBy || null;
      }

      await db.collection('vendorevaluation').updateOne(
        { vendorcode: String(vendorcode) },
        { $set: { [storageKey]: payload } },
        { upsert: true }
      );

      return res.status(200).json({ success: true, evaluation: payload });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('annual-evaluation vendor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
