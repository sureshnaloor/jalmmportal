import moment from 'moment';

export function toNumber(val) {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  if (val.$numberDecimal != null) return parseFloat(val.$numberDecimal) || 0;
  const n = parseFloat(val);
  return Number.isNaN(n) ? 0 : n;
}

export function formatAccountAssignment(item) {
  const acc = item?.account || {};
  if (acc.wbs) return `Project/WBS: ${acc.wbs}`;
  if (acc.order) return `Order: ${acc.order}`;
  if (acc.costcenter) return `Cost Center: ${acc.costcenter}`;
  if (acc['cost-center']) return `Cost Center: ${acc['cost-center']}`;
  if (acc.network) return `Network: ${acc.network}`;
  if (acc['asset-number']) return `Asset: ${acc['asset-number']}`;
  if (acc.asset) return `Asset: ${acc.asset}`;
  if (acc['sale-order']) return `Sale Order: ${acc['sale-order']}`;
  return '—';
}

export function resolveActualDeliveryDate(schedule, deliveryDocs) {
  const gd = schedule?.generaldata || {};
  const fromSchedule = gd.podelydate || gd.estdelydate || gd.grdate || null;
  if (fromSchedule) return fromSchedule;

  if (Array.isArray(deliveryDocs) && deliveryDocs.length > 0) {
    const sorted = [...deliveryDocs].sort((a, b) => {
      const da = new Date(a.documentdate || a['doc-date'] || 0);
      const db = new Date(b.documentdate || b['doc-date'] || 0);
      return db - da;
    });
    return sorted[0].documentdate || sorted[0]['doc-date'] || null;
  }
  return null;
}

export function computeDeliveryVarianceDays(referenceDate, actualDate) {
  if (!referenceDate || !actualDate) return null;
  const ref = moment(referenceDate).startOf('day');
  const act = moment(actualDate).startOf('day');
  if (!ref.isValid() || !act.isValid()) return null;
  return act.diff(ref, 'days');
}

export function buildPOTimelineEvents({ podate, deliveryDate, actualDeliveryDate, schedule }) {
  const events = [];

  if (podate) {
    events.push({ date: podate, label: 'PO Date', type: 'po-date' });
  }
  if (deliveryDate) {
    events.push({ date: deliveryDate, label: 'Planned Delivery', type: 'planned-delivery' });
  }

  const gd = schedule?.generaldata || {};
  const milestoneFields = [
    ['poackdate', 'PO Acknowledgement'],
    ['basedesignrecdate', 'Base Design Received'],
    ['basedesignapprdate', 'Base Design Approved'],
    ['detdesignrecdate', 'Detailed Design Received'],
    ['mfgclearancedate', 'Manufacturing Clearance'],
    ['itpapprdate', 'ITP Approved'],
    ['finalworkcompleteddate', 'Final Work Completed'],
    ['grdate', 'GR Date'],
  ];

  milestoneFields.forEach(([key, label]) => {
    if (gd[key]) {
      events.push({ date: gd[key], label, type: 'milestone' });
    }
  });

  if (actualDeliveryDate) {
    events.push({ date: actualDeliveryDate, label: 'Actual Delivery', type: 'actual-delivery' });
  }

  return events
    .filter((e) => e.date && moment(e.date).isValid())
    .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());
}

export function mapPOLineItem(item) {
  return {
    line: item['po-line-item'],
    materialCode: item?.material?.matcode || item['material-code'] || '',
    description: item?.material?.matdescription || item['material-text'] || '',
    quantity: toNumber(item['po-quantity']),
    unit: item['po-unit-of-measure'] || '',
    unitRate: toNumber(item['po-unit-price']),
    value: toNumber(item['po-value-sar']),
    accountAssignment: formatAccountAssignment(item),
  };
}
