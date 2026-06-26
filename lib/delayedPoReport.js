import XLSX from 'xlsx';
import moment from 'moment';
import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import {
  normalizeProjectIdForQuery,
  getLineAssignmentType,
  getNetworkForProject,
  buildProjectPurchaseOrderFilter,
} from './projectPurchaseOrders';

const { Document, Page, View, Text, StyleSheet } = ReactPDF;

const EXCLUDED_PO_PREFIXES = ['47', '71', '91'];
const QTY_EPSILON = 0.001;

export function parseDecimal(value) {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value.$numberDecimal != null) {
    return parseFloat(value.$numberDecimal) || 0;
  }
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function isExcludedPONumber(ponumber) {
  if (!ponumber) return true;
  const prefix = String(ponumber).substring(0, 2);
  return EXCLUDED_PO_PREFIXES.includes(prefix);
}

export function normalizeLineItem(lineItem) {
  if (lineItem == null) return '';
  return String(lineItem).trim();
}

function formatDate(date) {
  if (!date) return null;
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function formatDateString(date) {
  const dateObj = formatDate(date);
  return dateObj ? moment(dateObj).format('MM/DD/YYYY') : '';
}

function formatPaymentArray(payments) {
  if (!payments || !Array.isArray(payments) || payments.length === 0) return '';
  return payments
    .map((p) => {
      const date = formatDateString(p.date);
      const amount = p.amount || '';
      const remarks = p.remarks || p.comments || '';
      return `${date} - ${amount}${remarks ? ` (${remarks})` : ''}`;
    })
    .join('; ');
}

function isNonEmpty(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return true;
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
}

export function formatScheduleForExport(scheduleData) {
  if (!scheduleData) {
    return { general: [], payment: [], bankGuarantee: [], lc: [], progress: [], shipment: [] };
  }

  const sections = {
    general: [],
    payment: [],
    bankGuarantee: [],
    lc: [],
    progress: [],
    shipment: [],
  };

  const gd = scheduleData.generaldata || {};
  const generalFields = [
    ['PO Acknowledgment Date', formatDateString(gd.poackdate)],
    ['PO Delivery Date', formatDateString(gd.podelydate)],
    ['Estimated Delivery Date', formatDateString(gd.estdelydate)],
    ['Delivery Schedule', gd.delysch],
    ['Base Design Received Date', formatDateString(gd.basedesignrecdate)],
    ['Base Design Approval Date', formatDateString(gd.basedesignapprdate)],
    ['Base Design Comments', gd.basedesigncomments],
    ['Detailed Design Received Date', formatDateString(gd.detdesignrecdate)],
    ['Detailed Design Approval Date', formatDateString(gd.detdesignaprdate)],
    ['Manufacturing Clearance Date', formatDateString(gd.mfgclearancedate)],
    ['ITP Approval Date', formatDateString(gd.itpapprdate)],
    ['GR Date', formatDateString(gd.grdate)],
    ['Final Work Completed Date', formatDateString(gd.finalworkcompleteddate)],
    ['General Comments', gd.generalcomments],
  ];
  generalFields.forEach(([label, value]) => {
    if (isNonEmpty(value)) sections.general.push({ label, value: String(value) });
  });

  const pd = scheduleData.paymentdata || {};
  if (pd.advpaiddate || pd.advamountpaid) {
    if (isNonEmpty(pd.advpaiddate)) sections.payment.push({ label: 'Advance Payment Date', value: formatDateString(pd.advpaiddate) });
    if (isNonEmpty(pd.advamountpaid)) sections.payment.push({ label: 'Advance Payment Amount', value: String(pd.advamountpaid) });
  } else if (pd.advancePayments?.length) {
    sections.payment.push({ label: 'Advance Payments', value: formatPaymentArray(pd.advancePayments) });
  }
  if (pd.milestoneamountpaiddate || pd.milestoneamountpaid) {
    if (isNonEmpty(pd.milestoneamountpaiddate)) sections.payment.push({ label: 'Milestone Payment Date', value: formatDateString(pd.milestoneamountpaiddate) });
    if (isNonEmpty(pd.milestoneamountpaid)) sections.payment.push({ label: 'Milestone Payment Amount', value: String(pd.milestoneamountpaid) });
  } else if (pd.milestonePayments?.length) {
    sections.payment.push({ label: 'Milestone Payments', value: formatPaymentArray(pd.milestonePayments) });
  }
  if (pd.finalpaiddate || pd.finalpaidamt || pd.finalcomments) {
    if (isNonEmpty(pd.finalpaiddate)) sections.payment.push({ label: 'Final Payment Date', value: formatDateString(pd.finalpaiddate) });
    if (isNonEmpty(pd.finalpaidamt)) sections.payment.push({ label: 'Final Payment Amount', value: String(pd.finalpaidamt) });
    if (isNonEmpty(pd.finalcomments)) sections.payment.push({ label: 'Final Payment Comments', value: String(pd.finalcomments) });
  } else if (pd.finalPayment) {
    if (isNonEmpty(pd.finalPayment.date)) sections.payment.push({ label: 'Final Payment Date', value: formatDateString(pd.finalPayment.date) });
    if (isNonEmpty(pd.finalPayment.amount)) sections.payment.push({ label: 'Final Payment Amount', value: String(pd.finalPayment.amount) });
    if (isNonEmpty(pd.finalPayment.comments)) sections.payment.push({ label: 'Final Payment Comments', value: String(pd.finalPayment.comments) });
  }

  const bg = scheduleData.bgdata || {};
  const bgFields = [
    ['ABG Expected Date', formatDateString(bg.abgestdate)],
    ['ABG Actual Date', formatDateString(bg.abgactualdate)],
    ['ABG Expiry Date', formatDateString(bg.abgexpirydate)],
    ['ABG Amount', bg.abgamount],
    ['ABG Returned Date', formatDateString(bg.abgreturneddate)],
    ['PBG Expected Date', formatDateString(bg.pbgestdate)],
    ['PBG Actual Date', formatDateString(bg.pbgactualdate)],
    ['PBG Expiry Date', formatDateString(bg.pbgexpirydate)],
    ['PBG Returned Date', formatDateString(bg.pbgreturneddate)],
    ['PBG Amount', bg.pbgamount],
    ['BG Remarks', bg.bgremarks],
  ];
  bgFields.forEach(([label, value]) => {
    if (isNonEmpty(value)) sections.bankGuarantee.push({ label, value: String(value) });
  });

  const lc = scheduleData.lcdata || {};
  const lcFields = [
    ['LC Data Date', formatDateString(lc.lcdatadate)],
    ['LC Expected Open Date', formatDateString(lc.lcestopendate)],
    ['LC Opened Date', formatDateString(lc.lcopeneddate)],
    ['LC Expiry Date', formatDateString(lc.lcexpirydate)],
    ['LC Last Ship Date', formatDateString(lc.lclastshipdate)],
    ['LC Incoterm', lc.lcincoterm],
    ['LC Documents', lc.lcdocuments],
    ['LC Amount', lc.lcamount],
    ['LC Remarks', lc.lcremarks],
    ['LC Swift', lc.lcswift],
  ];
  lcFields.forEach(([label, value]) => {
    if (isNonEmpty(value)) sections.lc.push({ label, value: String(value) });
  });

  const prog = scheduleData.progressdata || {};
  const progFields = [
    ['Manufacturing Start Date', formatDateString(prog.mfgstart)],
    ['BL Date', formatDateString(prog.Bldate)],
    ['FAT Date', formatDateString(prog.Fatdate)],
    ['FAT Report Date', formatDateString(prog.Fatreportdate)],
    ['Vessel Reached Date', formatDateString(prog.vesselreacheddate)],
    ['Customs Cleared Date', formatDateString(prog.customscleareddate)],
  ];
  progFields.forEach(([label, value]) => {
    if (isNonEmpty(value)) sections.progress.push({ label, value: String(value) });
  });

  const ship = scheduleData.shipdata || {};
  const shipFields = [
    ['Shipment Booked Date', formatDateString(ship.shipmentbookeddate)],
    ['Gross Weight', ship.grossweight],
    ['SABER Applied Date', formatDateString(ship.saberapplieddate)],
    ['SABER Received Date', formatDateString(ship.saberreceiveddate)],
    ['FF Nominated Date', formatDateString(ship.ffnoMinateddate)],
    ['Final Remarks', ship.finalremarks],
  ];
  shipFields.forEach(([label, value]) => {
    if (isNonEmpty(value)) sections.shipment.push({ label, value: String(value) });
  });

  return sections;
}

function buildGrLookup(grAggregates) {
  const lookup = new Map();
  for (const row of grAggregates) {
    const key = `${row._id.ponumber}::${normalizeLineItem(row._id.polineitem)}`;
    lookup.set(key, row.totalQty || 0);
  }
  return lookup;
}

function yieldToEventLoop() {
  return new Promise((resolve) => setImmediate(resolve));
}

export { normalizeProjectIdForQuery } from './projectPurchaseOrders';

export async function buildDelayedPOReport(db, onProgress, options = {}) {
  const { projectId = null, projectName = null, openOnly = true } = options;

  let candidateLines;
  if (projectId) {
    const networkNum = await getNetworkForProject(db, projectId);
    const poQuery = buildProjectPurchaseOrderFilter(projectId, networkNum, { openOnly });
    candidateLines = await db.collection('purchaseorders').find(poQuery).toArray();
  } else {
    const poQuery = openOnly ? { 'pending-val-sar': { $gt: 0 } } : {};
    candidateLines = await db.collection('purchaseorders').find(poQuery).toArray();
  }

  const filteredLines = candidateLines.filter(
    (line) => !isExcludedPONumber(line['po-number'])
  );

  const poNumbers = [...new Set(filteredLines.map((l) => l['po-number']))];

  let grAggregates = [];
  const chunkSize = 500;
  for (let i = 0; i < poNumbers.length; i += chunkSize) {
    const chunk = poNumbers.slice(i, i + chunkSize);
    const grDocs = await db
      .collection('materialdocumentsforpo')
      .find({ ponumber: { $in: chunk } })
      .project({ ponumber: 1, polineitem: 1, documentqty: 1 })
      .toArray();

    const chunkMap = new Map();
    for (const doc of grDocs) {
      const key = `${doc.ponumber}::${normalizeLineItem(doc.polineitem)}`;
      const qty = parseDecimal(doc.documentqty);
      chunkMap.set(key, (chunkMap.get(key) || 0) + qty);
    }

    for (const [key, totalQty] of chunkMap) {
      const [ponumber, polineitem] = key.split('::');
      grAggregates.push({
        _id: { ponumber, polineitem },
        totalQty,
      });
    }

    if (onProgress) {
      await onProgress({
        processedPOs: Math.min(i + chunkSize, poNumbers.length),
        totalPOs: poNumbers.length,
      });
    }
    await yieldToEventLoop();
  }

  const grLookup = buildGrLookup(grAggregates);

  const reportLines = [];
  for (const line of filteredLines) {
    const ponumber = line['po-number'];
    const lineItem = normalizeLineItem(line['po-line-item']);
    const orderedQty = parseDecimal(line['po-quantity']);
    const grKey = `${ponumber}::${lineItem}`;
    const deliveredQty = grLookup.get(grKey) || 0;
    const pendingValueSar = line['pending-val-sar'] || 0;

    if (openOnly) {
      if (pendingValueSar <= 0) continue;
      if (deliveredQty >= orderedQty - QTY_EPSILON) continue;
    }

    const pendingQty = openOnly
      ? Math.max(0, orderedQty - deliveredQty)
      : Math.max(0, parseDecimal(line['pending-qty']) || Math.max(0, orderedQty - deliveredQty));

    reportLines.push({
        ponumber,
        lineItem,
        materialCode: line?.material?.matcode || '',
        materialDescription: line?.material?.matdescription || '',
        material: line?.material?.matdescription || line?.material?.matcode || '',
        uom: line['po-unit-of-measure'] || '',
        orderedQty,
        grQty: deliveredQty,
        pendingQty,
        poValueSar: line['po-value-sar'] || 0,
        pendingValueSar,
        poStatus: pendingValueSar > 0 && deliveredQty < orderedQty - QTY_EPSILON ? 'Open' : 'Closed',
        assignmentType: getLineAssignmentType(line),
        vendorcode: line.vendorcode || line['vendor-code'] || '',
        vendorname: line.vendorname || line['vendor-name'] || '',
        plant: line['plant-code'] || '',
        poDate: line['po-date'] || null,
        deliveryDate: line['delivery-date'] || null,
      });
  }

  const openLines = reportLines;

  const poMap = new Map();
  for (const line of openLines) {
    if (!poMap.has(line.ponumber)) {
      poMap.set(line.ponumber, {
        ponumber: line.ponumber,
        vendorcode: line.vendorcode,
        vendorname: line.vendorname,
        plant: line.plant,
        poDate: line.poDate,
        deliveryDate: line.deliveryDate,
        totalPoValue: 0,
        totalBalance: 0,
        assignmentTypes: new Set(),
        lines: [],
        schedule: null,
      });
    }
    const po = poMap.get(line.ponumber);
    po.totalPoValue += line.poValueSar;
    po.totalBalance += line.pendingValueSar;
    if (line.assignmentType) po.assignmentTypes.add(line.assignmentType);
    po.lines.push(line);
  }

  const sortedPOs = [...poMap.values()].sort((a, b) => b.totalBalance - a.totalBalance);
  sortedPOs.forEach((po) => {
    po.lines.sort((a, b) => b.pendingValueSar - a.pendingValueSar);
    const types = [...(po.assignmentTypes || [])];
    po.assignmentType =
      types.length === 2 ? 'WBS + Network' : types[0] || '';
    delete po.assignmentTypes;
  });

  const sortedPoNumbers = sortedPOs.map((p) => p.ponumber);
  const scheduleMap = new Map();

  for (let i = 0; i < sortedPoNumbers.length; i += chunkSize) {
    const chunk = sortedPoNumbers.slice(i, i + chunkSize);
    const schedules = await db
      .collection('poschedule')
      .find({ ponumber: { $in: chunk } })
      .toArray();
    schedules.forEach((s) => scheduleMap.set(s.ponumber, s));
    await yieldToEventLoop();
  }

  for (const po of sortedPOs) {
    const scheduleDoc = scheduleMap.get(po.ponumber) || null;
    po.schedule = formatScheduleForExport(scheduleDoc);
  }

  const totalPendingSAR = openLines.reduce((sum, l) => sum + l.pendingValueSar, 0);

  return {
    generatedAt: new Date().toISOString(),
    projectId,
    projectName,
    openOnly,
    summary: {
      totalPOs: sortedPOs.length,
      totalLines: openLines.length,
      totalPendingSAR,
      scope: openOnly ? 'open' : 'all',
    },
    pos: sortedPOs,
  };
}

export function generateExcelBuffer(reportData) {
  const lineRows = [];
  const projectLabel = reportData.projectName || reportData.projectId || '';

  for (const po of reportData.pos) {
    po.lines.forEach((line, idx) => {
      const row = {
        'PO Number': po.ponumber,
        'Vendor Code': po.vendorcode,
        'Vendor Name': po.vendorname,
        'Plant': po.plant,
        'PO Date': line.poDate ? formatDateString(line.poDate) : '',
        'PO Assignment': line.assignmentType || po.assignmentType || '',
        'Delivery Date': line.deliveryDate ? formatDateString(line.deliveryDate) : '',
        'Line Item': line.lineItem,
        'Material/Service Code': line.materialCode || '',
        'Material/Service Description': line.materialDescription || line.material || '',
        'UOM': line.uom,
        'PO Qty': line.orderedQty,
        'GR Qty': line.grQty,
        'Pending Qty': line.pendingQty,
        'PO Value (SAR)': line.poValueSar,
        'Pending Value (SAR)': line.pendingValueSar,
        'PO Total Balance (SAR)': po.totalBalance,
        'First Line Of PO': idx === 0 ? 'Yes' : '',
      };
      if (!reportData.openOnly) {
        row['PO Status'] = line.poStatus || '';
      }
      if (projectLabel) {
        row['Project'] = projectLabel;
        row['Project WBS'] = reportData.projectId || '';
      }
      lineRows.push(row);
    });
  }

  const scheduleRows = reportData.pos.map((po) => {
    const row = {
      'PO Number': po.ponumber,
      'Vendor Code': po.vendorcode,
      'Vendor Name': po.vendorname,
      'PO Date': po.poDate ? formatDateString(po.poDate) : '',
      'PO Assignment': po.assignmentType || '',
      'PO Value (SAR)': po.totalPoValue || 0,
      'PO Total Balance (SAR)': po.totalBalance,
    };
    if (projectLabel) {
      row['Project'] = projectLabel;
      row['Project WBS'] = reportData.projectId || '';
    }

    const addSection = (prefix, items) => {
      items.forEach((item) => {
        row[`${prefix}: ${item.label}`] = item.value;
      });
    };

    if (po.schedule) {
      addSection('General', po.schedule.general);
      addSection('Payment', po.schedule.payment);
      addSection('Bank Guarantee', po.schedule.bankGuarantee);
      addSection('LC', po.schedule.lc);
      addSection('Progress', po.schedule.progress);
      addSection('Shipment', po.schedule.shipment);
    }

    return row;
  });

  const wb = XLSX.utils.book_new();
  const wsLines = XLSX.utils.json_to_sheet(lineRows.length ? lineRows : [{ Note: 'No open PO lines found' }]);
  const wsSchedule = XLSX.utils.json_to_sheet(scheduleRows.length ? scheduleRows : [{ Note: 'No schedule data' }]);
  XLSX.utils.book_append_sheet(wb, wsLines, 'Open PO Lines');
  XLSX.utils.book_append_sheet(wb, wsSchedule, 'PO Schedule Summary');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', cellDates: true });
}

const pdfStyles = StyleSheet.create({
  page: { padding: 24, fontFamily: 'Helvetica', fontSize: 8 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, color: '#1e3a8a' },
  subtitle: { fontSize: 9, color: '#475569', marginBottom: 10, lineHeight: 1.35 },
  poHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
    marginTop: 12,
    marginBottom: 4,
    lineHeight: 1.3,
  },
  poHeaderMeta: { fontSize: 8, color: '#475569', marginBottom: 6, lineHeight: 1.35 },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderTop: '1 solid #cbd5e1',
    borderBottom: '1 solid #cbd5e1',
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginTop: 4,
    alignItems: 'flex-start',
  },
  tableDataRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #e2e8f0',
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignItems: 'flex-start',
  },
  thCell: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#475569',
    lineHeight: 1.3,
    paddingRight: 3,
  },
  tdCell: {
    fontSize: 6.5,
    color: '#334155',
    lineHeight: 1.4,
    paddingRight: 3,
  },
  scheduleSectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 8,
    marginBottom: 3,
  },
  scheduleLabel: { fontSize: 7, fontWeight: 'bold', color: '#64748b', marginTop: 2 },
  scheduleValue: { fontSize: 7, color: '#0f172a', marginBottom: 2, lineHeight: 1.4 },
  poDivider: { fontSize: 7, color: '#cbd5e1', marginTop: 8, marginBottom: 4 },
});

/** Fixed column widths (portrait A4) — must sum to 100% */
const LINE_COL = {
  line: '7%',
  poQty: '9%',
  uom: '8%',
  grQty: '9%',
  pending: '13%',
  code: '14%',
  desc: '40%',
};

function PoLineTableHeader() {
  return (
    <View style={pdfStyles.tableHeaderRow}>
      <Text style={[pdfStyles.thCell, { width: LINE_COL.line }]}>Line</Text>
      <Text style={[pdfStyles.thCell, { width: LINE_COL.poQty }]}>PO Qty</Text>
      <Text style={[pdfStyles.thCell, { width: LINE_COL.uom }]}>UOM</Text>
      <Text style={[pdfStyles.thCell, { width: LINE_COL.grQty }]}>GR Qty</Text>
      <Text style={[pdfStyles.thCell, { width: LINE_COL.pending }]}>Pending SAR</Text>
      <Text style={[pdfStyles.thCell, { width: LINE_COL.code }]}>Mat/Svc Code</Text>
      <Text style={[pdfStyles.thCell, { width: LINE_COL.desc }]}>Mat/Svc Description</Text>
    </View>
  );
}

function PoLineTableCell({ width, children }) {
  return (
    <View style={{ width, paddingRight: 3 }}>
      <Text style={pdfStyles.tdCell}>{children}</Text>
    </View>
  );
}

function PoLineTableRow({ line }) {
  const code = (line.materialCode || '').trim() || '—';
  const desc = (line.materialDescription || line.material || '').trim() || '—';
  const uom = (line.uom || '').trim() || '—';

  return (
    <View style={pdfStyles.tableDataRow}>
      <PoLineTableCell width={LINE_COL.line}>{line.lineItem}</PoLineTableCell>
      <PoLineTableCell width={LINE_COL.poQty}>{String(line.orderedQty)}</PoLineTableCell>
      <PoLineTableCell width={LINE_COL.uom}>{uom}</PoLineTableCell>
      <PoLineTableCell width={LINE_COL.grQty}>{String(line.grQty)}</PoLineTableCell>
      <PoLineTableCell width={LINE_COL.pending}>{line.pendingValueSar.toLocaleString()}</PoLineTableCell>
      <PoLineTableCell width={LINE_COL.code}>{code}</PoLineTableCell>
      <PoLineTableCell width={LINE_COL.desc}>{desc}</PoLineTableCell>
    </View>
  );
}

function renderPoLineNodes(line, poNumber) {
  return [<PoLineTableRow key={`${poNumber}-line-${line.lineItem}`} line={line} />];
}

function renderSchedulePdfNodes(schedule, poNumber) {
  if (!schedule) return [];
  const nodes = [];
  const sections = [
    ['General', schedule.general],
    ['Payment', schedule.payment],
    ['Bank Guarantee', schedule.bankGuarantee],
    ['LC', schedule.lc],
    ['Progress', schedule.progress],
    ['Shipment', schedule.shipment],
  ];

  sections.forEach(([title, items]) => {
    if (!items?.length) return;
    nodes.push(
      <Text key={`${poNumber}-sch-${title}`} style={pdfStyles.scheduleSectionTitle}>
        {title}
      </Text>
    );
    items.forEach((item, i) => {
      nodes.push(
        <Text key={`${poNumber}-sch-${title}-lbl-${i}`} style={pdfStyles.scheduleLabel}>
          {item.label}
        </Text>,
        <Text key={`${poNumber}-sch-${title}-val-${i}`} style={pdfStyles.scheduleValue}>
          {item.value}
        </Text>
      );
    });
  });

  return nodes;
}

/** Flat page-flow nodes — large POs with many lines must not sit inside one unbreakable View. */
function renderPoPdfNodes(po) {
  const k = (suffix) => `${po.ponumber}-${suffix}`;
  const nodes = [];

  nodes.push(
    <Text key={k('hdr')} style={pdfStyles.poHeader}>
      {`PO ${po.ponumber} | ${po.vendorname || 'N/A'}`}
    </Text>,
    <Text key={k('meta')} style={pdfStyles.poHeaderMeta}>
      {`PO Date: ${formatReportPoDate(po.poDate || po.lines?.[0]?.poDate)} | PO Value: ${getPoTotalValue(po).toLocaleString()} SAR | Balance: ${(po.totalBalance || 0).toLocaleString()} SAR${po.assignmentType ? ` | Assignment: ${po.assignmentType}` : ''}`}
    </Text>,
    <PoLineTableHeader key={k('line-hdr')} />
  );

  (po.lines || []).forEach((line) => {
    nodes.push(...renderPoLineNodes(line, po.ponumber));
  });

  nodes.push(...renderSchedulePdfNodes(po.schedule, po.ponumber));

  nodes.push(
    <Text key={k('div')} style={pdfStyles.poDivider}>
      {'—'.repeat(72)}
    </Text>
  );

  return nodes;
}

function formatReportPoDate(date) {
  if (!date) return 'N/A';
  const formatted = formatDateString(date);
  return formatted || 'N/A';
}

function getPoTotalValue(po) {
  if (po.totalPoValue != null) return po.totalPoValue;
  return (po.lines || []).reduce((sum, line) => sum + (line.poValueSar || 0), 0);
}

function DelayedPOReportDocument({ reportData }) {
  const { summary, generatedAt, pos, projectId, projectName, openOnly } = reportData;
  const title = projectId
    ? `Open PO Report — ${projectName || projectId}`
    : 'Open PO Report';
  const scopeLabel = openOnly === false ? 'All POs (open + closed)' : 'Open POs only';

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={pdfStyles.page} wrap>
        <Text style={pdfStyles.title}>{title}</Text>
        {projectId ? (
          <Text style={pdfStyles.subtitle}>Project WBS: {projectId}</Text>
        ) : null}
        <Text style={pdfStyles.subtitle}>
          {`Scope: ${scopeLabel} | Generated: ${moment(generatedAt).format('MMM D, YYYY HH:mm')} | POs: ${summary.totalPOs} | Lines: ${summary.totalLines} | Total Pending: ${summary.totalPendingSAR.toLocaleString()} SAR`}
        </Text>

        {pos.length === 0 ? (
          <Text>No open PO lines with incomplete GR found.</Text>
        ) : (
          pos.flatMap((po) => renderPoPdfNodes(po))
        )}
      </Page>
    </Document>
  );
}

export async function generatePdfBuffer(reportData) {
  const doc = React.createElement(DelayedPOReportDocument, { reportData });
  const stream = await ReactPDF.renderToStream(doc);
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
