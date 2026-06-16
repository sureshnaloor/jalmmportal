import XLSX from 'xlsx';
import moment from 'moment';
import React from 'react';
import ReactPDF from '@react-pdf/renderer';
const { Document, Page, View, Text, StyleSheet } = ReactPDF;

const START_YEAR = 2021;
const FIXED_EVAL_LABELS = [
  'Quote quality and response',
  'Payment terms',
  'Quality/HSE',
  'Technical documentation',
  'Salesman responsiveness',
];
const FIXED_EVAL_MAPS = [
  { 1: 'Poor', 2: 'Fair', 3: 'Good' },
  { 5: 'Poor', 10: 'Fair', 20: 'Good' },
  { 1: 'Poor', 2: 'Fair', 3: 'Good' },
  { 1: 'Poor', 2: 'Fair', 3: 'Good' },
  { 1: 'Poor', 2: 'Fair', 3: 'Good' },
];

function yieldToEventLoop() {
  return new Promise((resolve) => setImmediate(resolve));
}

export function parseDecimal(value) {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value.$numberDecimal != null) {
    return parseFloat(value.$numberDecimal) || 0;
  }
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function parseScore(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'object' && value.$numberDecimal != null) {
    const n = parseFloat(value.$numberDecimal);
    return Number.isNaN(n) ? null : n;
  }
  const n = parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

function getReportYears() {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = START_YEAR; y <= current; y += 1) years.push(y);
  return years;
}

function emptyYearStats(years) {
  const byYear = {};
  years.forEach((y) => {
    byYear[y] = { poCount: 0, lineItemCount: 0, totalValue: 0 };
  });
  return {
    totalValue: 0,
    lineItemCount: 0,
    poCount: 0,
    byYear,
  };
}

function formatAddress(address) {
  if (!address || typeof address !== 'object') return 'N/A';
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.address1) parts.push(address.address1);
  if (address.address2) parts.push(address.address2);
  if (address.district) parts.push(address.district);
  if (address.city) parts.push(address.city);
  if (address.pobox) parts.push(`P.O. Box: ${address.pobox}`);
  if (address.zipcode) parts.push(address.zipcode);
  if (address.countrycode) parts.push(address.countrycode);
  return parts.length > 0 ? parts.join(', ') : 'N/A';
}

function formatContact(contact, vendorAddress) {
  const parts = [];
  const tel = contact?.telephone1 ?? contact?.telelphone1;
  if (tel) parts.push(`Tel: ${tel}`);
  if (contact?.telephone2) parts.push(`Tel2: ${contact.telephone2}`);
  if (contact?.fax) parts.push(`Fax: ${contact.fax}`);
  const accountPerson = vendorAddress?.['vendor-accountperson'] ?? vendorAddress?.accountPerson;
  if (accountPerson) parts.push(`Account person: ${accountPerson}`);
  const emails = [
    vendorAddress?.email1,
    vendorAddress?.email2,
    vendorAddress?.email3,
    vendorAddress?.email4,
    vendorAddress?.email5,
    contact?.salesemail,
    contact?.email,
  ].filter((e) => e != null && String(e).trim() !== '');
  if (emails.length) parts.push(`Email: ${[...new Set(emails)].join(', ')}`);
  if (contact?.salesname) parts.push(`Sales: ${contact.salesname}`);
  if (contact?.salesmobile) parts.push(`Mob: ${contact.salesmobile}`);
  return parts.length > 0 ? parts.join('; ') : 'N/A';
}

function extractFixedEval(doc) {
  const getFixedEval = (obj) => (obj && Array.isArray(obj.fixedeval) ? obj.fixedeval : null);
  const fixed2024 = getFixedEval(doc?.fixedevalyear2024) || getFixedEval(doc?.fixedvalyear2024);
  const fixed1 = getFixedEval(doc?.fixedevalyear1) || getFixedEval(doc?.fixedvalyear1);
  const source = fixed2024 || fixed1;
  if (!source || source.length < 5) return [];
  return FIXED_EVAL_LABELS.map((label, i) => {
    const raw = source[i];
    const num = raw !== '' && raw != null ? Number(raw) : null;
    const map = FIXED_EVAL_MAPS[i];
    const text = num != null && map[num] != null ? map[num] : (num != null ? String(num) : '—');
    return { label, text };
  });
}

function extractPoEvalDetails(doc) {
  if (!doc) return [];
  const yearPattern = /^powiseevalyear(\d+)$/;
  let latestYear = -1;
  let latestYearKey = null;
  for (const key of Object.keys(doc)) {
    const m = key.match(yearPattern);
    if (m) {
      const num = parseInt(m[1], 10);
      if (!Number.isNaN(num) && num > latestYear && doc[key] && typeof doc[key] === 'object') {
        latestYear = num;
        latestYearKey = key;
      }
    }
  }
  if (!latestYearKey || !Array.isArray(doc[latestYearKey].powiserating)) return [];
  return doc[latestYearKey].powiserating
    .map((item) => ({
      ponumber: item?.ponumber != null ? String(item.ponumber) : '',
      povalue: item?.povalue != null ? String(item.povalue) : '',
      deliveryrating: item?.deliveryrating,
      pricerating: item?.pricerating,
      qualityrating: item?.qualityrating,
      porating: item?.porating,
    }))
    .filter((item) => item.ponumber || item.povalue);
}

function extractPastYears(doc) {
  if (!doc || !Array.isArray(doc.past)) return [];
  return doc.past
    .map((p) => ({
      year: p.pastyear,
      score: parseScore(p.pastyearscore),
    }))
    .filter((p) => p.year != null);
}

function buildEvaluationBlock(marks, evalDoc) {
  return {
    finalscore2022: parseScore(marks?.finalscore2022),
    finalscore2023: parseScore(marks?.finalscore2023),
    finalscore2024: parseScore(marks?.finalscore2024),
    finalfixedscore: parseScore(marks?.finalfixedscore),
    pastYears: extractPastYears(evalDoc),
    fixedEval: extractFixedEval(evalDoc),
    poEvalDetails: extractPoEvalDetails(evalDoc),
  };
}

function assignDenseRanks(items, valueKey) {
  const sorted = [...items].sort(
    (a, b) => b[valueKey] - a[valueKey] || a.vendorName.localeCompare(b.vendorName)
  );
  const ranks = new Map();
  let rank = 1;
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i][valueKey] < sorted[i - 1][valueKey]) rank = i + 1;
    ranks.set(sorted[i].vendorCode, rank);
  }
  return ranks;
}

function rankTopVendors(vendorEntries) {
  if (!vendorEntries.length) return [];
  const valueRanks = assignDenseRanks(vendorEntries, 'totalValue');
  const countRanks = assignDenseRanks(vendorEntries, 'lineItemCount');
  return vendorEntries
    .map((v) => ({
      ...v,
      compositeScore: (valueRanks.get(v.vendorCode) + countRanks.get(v.vendorCode)) / 2,
    }))
    .sort(
      (a, b) =>
        a.compositeScore - b.compositeScore
        || b.totalValue - a.totalValue
        || a.vendorName.localeCompare(b.vendorName)
    )
    .slice(0, 5);
}

async function aggregatePoStatsForVendors(db, vendorCodes, years) {
  const statsMap = new Map();
  vendorCodes.forEach((code) => {
    statsMap.set(code, emptyYearStats(years));
  });

  if (!vendorCodes.length) return statsMap;

  const poNumbersByVendor = new Map();
  vendorCodes.forEach((code) => poNumbersByVendor.set(code, new Set()));

  const CHUNK = 80;
  for (let i = 0; i < vendorCodes.length; i += CHUNK) {
    const chunk = vendorCodes.slice(i, i + CHUNK);
    const pipeline = [
      { $match: { vendorcode: { $in: chunk } } },
      {
        $group: {
          _id: {
            vendorcode: '$vendorcode',
            year: { $year: '$po-date' },
            ponumber: '$po-number',
          },
          lineItems: { $sum: 1 },
          value: { $sum: { $ifNull: ['$po-value-sar', 0] } },
        },
      },
    ];
    const results = await db.collection('purchaseorders').aggregate(pipeline).toArray();

    for (const row of results) {
      const code = row._id.vendorcode;
      const stats = statsMap.get(code);
      if (!stats) continue;
      const year = row._id.year;
      const value = parseDecimal(row.value);
      const lineItems = row.lineItems || 0;

      stats.lineItemCount += lineItems;
      stats.totalValue += value;
      const poSet = poNumbersByVendor.get(code);
      if (poSet && row._id.ponumber != null) poSet.add(row._id.ponumber);

      if (years.includes(year)) {
        if (!stats.byYear[year]) {
          stats.byYear[year] = { poCount: 0, lineItemCount: 0, totalValue: 0 };
        }
        const ys = stats.byYear[year];
        if (!ys._poSet) ys._poSet = new Set();
        ys.lineItemCount += lineItems;
        ys.totalValue += value;
        ys._poSet.add(row._id.ponumber);
      }
    }
    await yieldToEventLoop();
  }

  for (const [code, stats] of statsMap) {
    stats.poCount = poNumbersByVendor.get(code)?.size || 0;
    for (const year of years) {
      const ys = stats.byYear[year];
      if (ys?._poSet) {
        ys.poCount = ys._poSet.size;
        delete ys._poSet;
      }
    }
  }

  return statsMap;
}

function normalizeVendorCode(vendor) {
  return vendor['vendor-code'] || vendor.vendorcode || vendor.vendorCode || vendor['vendor-name'] || '';
}

function buildVendorEntry(vendor, vendorAddress, marks, evalDoc, poStats, years) {
  const vendorCode = normalizeVendorCode(vendor);
  const stats = poStats.get(vendorCode) || emptyYearStats(years);
  const yearStats = years.map((y) => ({
    year: y,
    poCount: stats.byYear[y]?.poCount || 0,
    lineItemCount: stats.byYear[y]?.lineItemCount || 0,
    totalValue: stats.byYear[y]?.totalValue || 0,
  }));

  return {
    vendorCode,
    vendorName: vendor['vendor-name'] || vendor.vendorname || vendorCode || 'N/A',
    isUnregistered: !!vendor.isUnregistered,
    status: vendor.isUnregistered ? 'Unregistered' : 'Registered',
    address: formatAddress(vendor.address),
    contact: formatContact(vendor.contact, vendorAddress),
    evaluation: buildEvaluationBlock(marks, evalDoc),
    poStats: {
      cumulative: {
        poCount: stats.poCount,
        lineItemCount: stats.lineItemCount,
        totalValue: stats.totalValue,
      },
      byYear: yearStats,
    },
    totalValue: stats.totalValue,
    lineItemCount: stats.lineItemCount,
  };
}

export async function buildVendorDbReport(db, onProgress, options = {}) {
  const { subgroupId, groupName: inputGroupName, subgroupName: inputSubgroupName, isService: inputIsService } = options;
  if (!subgroupId) {
    throw new Error('subgroupId is required');
  }

  const { ObjectId } = await import('mongodb');
  const years = getReportYears();

  let groupName = inputGroupName || '';
  let subgroupName = inputSubgroupName || '';
  let subgroupDescription = '';
  let isService = !!inputIsService;

  if (!groupName || !subgroupName) {
    const sgDoc = await db.collection('materialsubgroups').findOne({ _id: new ObjectId(subgroupId) });
    if (sgDoc) {
      subgroupName = subgroupName || sgDoc.name || '';
      subgroupDescription = sgDoc.description || '';
      const group = sgDoc.groupId
        ? await db.collection('materialgroups').findOne({ _id: sgDoc.groupId })
        : null;
      if (group) {
        groupName = groupName || group.name || '';
        isService = !!group.isService;
      }
    }
  }

  const sg = {
    subgroupId: String(subgroupId),
    subgroupName,
    subgroupDescription,
    groupName,
    isService,
    typeLabel: isService ? 'Service' : 'Material',
  };

  const registeredMappings = await db.collection('vendorgroupmap')
    .find({ subgroupId: new ObjectId(subgroupId) })
    .toArray();
  const unregisteredMappings = await db.collection('unregisteredvendorgroupmap')
    .find({ subgroupId: new ObjectId(subgroupId) })
    .toArray();

  const codes = new Set();
  const unregisteredCodes = new Set();
  for (const m of registeredMappings) {
    if (m.vendorCode) codes.add(String(m.vendorCode).trim());
  }
  for (const m of unregisteredMappings) {
    const name = m['vendor-name'];
    if (name) {
      const code = String(name).trim();
      codes.add(code);
      unregisteredCodes.add(code);
    }
  }

  const uniqueCodes = [...codes];
  const totalVendors = uniqueCodes.length || 1;
  await onProgress?.({ processedVendors: 0, totalVendors });

  let subgroupResult;
  if (uniqueCodes.length === 0) {
    subgroupResult = {
      ...sg,
      title: `${sg.groupName} → ${sg.subgroupName}`,
      hasVendors: false,
      message: 'No vendors mapped so far',
      vendors: [],
    };
  } else {
    const vendors = await db
      .collection('vendors')
      .find({
        $or: [
          { 'vendor-code': { $in: uniqueCodes } },
          { 'vendor-name': { $in: uniqueCodes } },
        ],
      })
      .toArray();

    const vendorByCode = new Map();
    vendors.forEach((v) => {
      const code = normalizeVendorCode(v);
      if (code) vendorByCode.set(code, v);
    });

    const [vendorAddresses, evalMarks, evalDocs] = await Promise.all([
      db.collection('vendoraddress').find({ vendorcode: { $in: uniqueCodes } }).toArray(),
      db.collection('vendorevaluationmarks').find({ vendorcode: { $in: uniqueCodes } }).toArray(),
      db.collection('vendorevaluation').find({ vendorcode: { $in: uniqueCodes } }).toArray(),
    ]);

    const addressByCode = new Map(vendorAddresses.map((a) => [a.vendorcode, a]));
    const marksByCode = new Map(evalMarks.map((m) => [m.vendorcode, m]));
    const evalByCode = new Map(evalDocs.map((e) => [e.vendorcode, e]));

    const poStatsMap = await aggregatePoStatsForVendors(db, uniqueCodes, years);

    const vendorEntries = [];
    for (let i = 0; i < uniqueCodes.length; i += 1) {
      const code = uniqueCodes[i];
      let vendor = vendorByCode.get(code);
      if (!vendor) {
        vendor = {
          'vendor-code': code,
          'vendor-name': code,
          isUnregistered: unregisteredCodes.has(code),
        };
      } else if (unregisteredCodes.has(code)) {
        vendor = { ...vendor, isUnregistered: true };
      }
      vendorEntries.push(
        buildVendorEntry(
          vendor,
          addressByCode.get(code),
          marksByCode.get(code),
          evalByCode.get(code),
          poStatsMap,
          years
        )
      );
      if (i % 10 === 0 || i === uniqueCodes.length - 1) {
        await onProgress?.({ processedVendors: i + 1, totalVendors: uniqueCodes.length });
        await yieldToEventLoop();
      }
    }

    const topVendors = rankTopVendors(vendorEntries);
    subgroupResult = {
      ...sg,
      title: `${sg.groupName} → ${sg.subgroupName}`,
      hasVendors: true,
      message: null,
      mappedVendorCount: uniqueCodes.length,
      vendors: topVendors.map((v, idx) => ({
        rank: idx + 1,
        ...v,
      })),
    };
  }

  await onProgress?.({ processedVendors: totalVendors, totalVendors });

  return {
    generatedAt: new Date().toISOString(),
    years,
    subgroupId: String(subgroupId),
    summary: {
      subgroupId: String(subgroupId),
      title: subgroupResult.title,
      mappedVendorCount: subgroupResult.mappedVendorCount || 0,
      totalVendorsReported: subgroupResult.vendors?.length || 0,
      scope: `Subgroup: ${subgroupResult.title}`,
    },
    subgroups: [subgroupResult],
  };
}

function formatScore(value) {
  return value != null ? String(value) : 'N/A';
}

function formatPoEvalForExport(poEvalDetails) {
  if (!poEvalDetails?.length) return 'N/A';
  return poEvalDetails
    .map((po) => {
      const parts = [`${po.ponumber || '-'}: ${po.povalue || '-'}`];
      if (po.porating != null) parts.push(`rating ${po.porating}/15`);
      return parts.join(' ');
    })
    .join('; ');
}

function formatFixedEvalForExport(fixedEval) {
  if (!fixedEval?.length) return 'N/A';
  return fixedEval.map((f) => `${f.label}: ${f.text}`).join('; ');
}

function formatPastYearsForExport(pastYears) {
  if (!pastYears?.length) return 'N/A';
  return pastYears.map((p) => `${p.year}: ${p.score != null ? p.score : 'N/A'}`).join('; ');
}

export function generateExcelBuffer(reportData) {
  const rows = [];
  const years = reportData.years || getReportYears();

  for (const sg of reportData.subgroups) {
    if (!sg.hasVendors) {
      rows.push({
        'Subgroup Title': sg.title,
        Type: sg.typeLabel,
        'Subgroup Description': sg.subgroupDescription || '',
        Status: sg.message,
      });
      continue;
    }

    for (const v of sg.vendors) {
      const row = {
        'Subgroup Title': sg.title,
        Type: sg.typeLabel,
        'Mapped Vendors': sg.mappedVendorCount,
        Rank: v.rank,
        'Vendor Name': v.vendorName,
        'Vendor Code': v.vendorCode,
        Status: v.status,
        Address: v.address,
        Contact: v.contact,
        'Eval Score 2022': formatScore(v.evaluation.finalscore2022),
        'Eval Score 2023': formatScore(v.evaluation.finalscore2023),
        'Eval Score 2024': formatScore(v.evaluation.finalscore2024),
        'Final Fixed Score': formatScore(v.evaluation.finalfixedscore),
        'Past Year Scores': formatPastYearsForExport(v.evaluation.pastYears),
        'Fixed Evaluation': formatFixedEvalForExport(v.evaluation.fixedEval),
        'POs Used for Evaluation': formatPoEvalForExport(v.evaluation.poEvalDetails),
        'Cumulative PO Count': v.poStats.cumulative.poCount,
        'Cumulative Line Items': v.poStats.cumulative.lineItemCount,
        'Cumulative PO Value (SAR)': v.poStats.cumulative.totalValue,
      };

      for (const ys of v.poStats.byYear) {
        row[`${ys.year} PO Count`] = ys.poCount;
        row[`${ys.year} Line Items`] = ys.lineItemCount;
        row[`${ys.year} PO Value (SAR)`] = ys.totalValue;
      }

      rows.push(row);
    }
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(
    rows.length ? rows : [{ Note: 'No subgroup data available' }]
  );
  XLSX.utils.book_append_sheet(wb, ws, 'Vendor Database Report');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', cellDates: true });
}

const pdfStyles = StyleSheet.create({
  page: { padding: 28, fontFamily: 'Helvetica', fontSize: 8 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, color: '#1e3a8a' },
  subtitle: { fontSize: 9, color: '#475569', marginBottom: 12, lineHeight: 1.35 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#0f766e', marginTop: 12, marginBottom: 4 },
  sectionMeta: { fontSize: 8, color: '#64748b', marginBottom: 8, lineHeight: 1.35 },
  emptyMsg: { fontSize: 9, color: '#94a3b8', fontStyle: 'italic', marginBottom: 10 },
  vendorHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
    marginTop: 10,
    marginBottom: 6,
    lineHeight: 1.3,
  },
  fieldLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 4,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 7,
    color: '#0f172a',
    lineHeight: 1.5,
    marginBottom: 3,
  },
  subheading: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 8,
    marginBottom: 4,
  },
  vendorDivider: {
    fontSize: 7,
    color: '#cbd5e1',
    marginTop: 10,
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderBottom: '0.5 solid #e2e8f0',
  },
  thPeriod: { width: '14%', fontSize: 6, fontWeight: 'bold', color: '#475569' },
  thCount: { width: '18%', fontSize: 6, fontWeight: 'bold', color: '#475569' },
  thLines: { width: '22%', fontSize: 6, fontWeight: 'bold', color: '#475569' },
  thValue: { width: '46%', fontSize: 6, fontWeight: 'bold', color: '#475569' },
  tdPeriod: { width: '14%', fontSize: 6, color: '#334155', lineHeight: 1.35 },
  tdCount: { width: '18%', fontSize: 6, color: '#334155', lineHeight: 1.35 },
  tdLines: { width: '22%', fontSize: 6, color: '#334155', lineHeight: 1.35 },
  tdValue: { width: '46%', fontSize: 6, color: '#334155', lineHeight: 1.35 },
});

function formatPoEvalLines(poEvalDetails) {
  if (!poEvalDetails?.length) return [];
  return poEvalDetails.map((po) => {
    const parts = [`${po.ponumber || '-'}: ${po.povalue || '-'}`];
    if (po.porating != null) parts.push(`rating ${po.porating}/15`);
    if (po.deliveryrating != null || po.pricerating != null || po.qualityrating != null) {
      parts.push(`(D:${po.deliveryrating ?? '-'} P:${po.pricerating ?? '-'} Q:${po.qualityrating ?? '-'})`);
    }
    return parts.join(' ');
  });
}

function formatFixedEvalLines(fixedEval) {
  if (!fixedEval?.length) return [];
  return fixedEval.map((f) => `${f.label}: ${f.text}`);
}

function formatPastYearLines(pastYears) {
  if (!pastYears?.length) return [];
  return pastYears.map((p) => `${p.year}: ${p.score != null ? p.score : 'N/A'}`);
}

function formatEvaluationScoreLines(evaluation) {
  return [
    `2022: ${formatScore(evaluation.finalscore2022)}`,
    `2023: ${formatScore(evaluation.finalscore2023)}`,
    `2024: ${formatScore(evaluation.finalscore2024)}`,
    `Final fixed: ${formatScore(evaluation.finalfixedscore)}`,
  ];
}

function PoStatsHeaderRow() {
  return (
    <View style={pdfStyles.tableHeader}>
      <Text style={pdfStyles.thPeriod}>Period</Text>
      <Text style={pdfStyles.thCount}>PO Count</Text>
      <Text style={pdfStyles.thLines}>Line Items</Text>
      <Text style={pdfStyles.thValue}>Value (SAR)</Text>
    </View>
  );
}

function PoStatsDataRow({ period, poCount, lineItems, value, boldPeriod }) {
  return (
    <View style={pdfStyles.tableRow}>
      <Text style={boldPeriod ? [pdfStyles.tdPeriod, { fontWeight: 'bold' }] : pdfStyles.tdPeriod}>
        {period}
      </Text>
      <Text style={pdfStyles.tdCount}>{poCount}</Text>
      <Text style={pdfStyles.tdLines}>{lineItems}</Text>
      <Text style={pdfStyles.tdValue}>{value}</Text>
    </View>
  );
}

/** Flat page-flow nodes only — no large wrapping Views (react-pdf cannot split them across pages). */
function renderVendorPdfNodes(vendor, keyPrefix) {
  const k = (suffix) => `${keyPrefix}-${suffix}`;
  const nodes = [];

  nodes.push(
    <Text key={k('hdr')} style={pdfStyles.vendorHeader}>
      {`#${vendor.rank} ${vendor.vendorName} (${vendor.vendorCode}) — ${vendor.status}`}
    </Text>
  );

  const addField = (label, lines) => {
    nodes.push(
      <Text key={k(`lbl-${label}`)} style={pdfStyles.fieldLabel}>
        {label}
      </Text>
    );
    const fieldLines = lines?.length ? lines : null;
    if (!fieldLines) {
      nodes.push(<Text key={k(`val-${label}-0`)} style={pdfStyles.fieldValue}>N/A</Text>);
      return;
    }
    fieldLines.forEach((line, i) => {
      nodes.push(
        <Text key={k(`val-${label}-${i}`)} style={pdfStyles.fieldValue}>
          {line}
        </Text>
      );
    });
  };

  addField('Address', vendor.address && vendor.address !== 'N/A' ? [vendor.address] : []);
  addField('Contact', vendor.contact && vendor.contact !== 'N/A' ? [vendor.contact] : []);
  addField('Evaluation', formatEvaluationScoreLines(vendor.evaluation));
  addField('Past years', formatPastYearLines(vendor.evaluation.pastYears));
  addField('Fixed eval', formatFixedEvalLines(vendor.evaluation.fixedEval));
  addField('PO eval POs', formatPoEvalLines(vendor.evaluation.poEvalDetails));

  nodes.push(
    <Text key={k('stats-title')} style={pdfStyles.subheading}>
      PO Statistics
    </Text>,
    <PoStatsHeaderRow key={k('stats-hdr')} />
  );

  vendor.poStats.byYear.forEach((ys) => {
    nodes.push(
      <PoStatsDataRow
        key={k(`stats-${ys.year}`)}
        period={String(ys.year)}
        poCount={ys.poCount}
        lineItems={ys.lineItemCount}
        value={ys.totalValue.toLocaleString()}
      />
    );
  });

  nodes.push(
    <PoStatsDataRow
      key={k('stats-cum')}
      period="Cumulative"
      poCount={vendor.poStats.cumulative.poCount}
      lineItems={vendor.poStats.cumulative.lineItemCount}
      value={vendor.poStats.cumulative.totalValue.toLocaleString()}
      boldPeriod
    />,
    <Text key={k('div')} style={pdfStyles.vendorDivider}>
      {'—'.repeat(100)}
    </Text>
  );

  return nodes;
}

function renderSubgroupPdfNodes(sg) {
  const nodes = [
    <Text key={`${sg.subgroupId}-title`} style={pdfStyles.sectionTitle}>
      {sg.title}
    </Text>,
    <Text key={`${sg.subgroupId}-meta`} style={pdfStyles.sectionMeta}>
      {sg.typeLabel}
      {sg.subgroupDescription ? ` | ${sg.subgroupDescription}` : ''}
      {sg.hasVendors ? ` | ${sg.mappedVendorCount} mapped vendor(s), showing top ${sg.vendors.length}` : ''}
    </Text>,
  ];

  if (!sg.hasVendors) {
    nodes.push(
      <Text key={`${sg.subgroupId}-empty`} style={pdfStyles.emptyMsg}>
        {sg.message}
      </Text>
    );
    return nodes;
  }

  sg.vendors.forEach((v) => {
    nodes.push(...renderVendorPdfNodes(v, `${sg.subgroupId}-${v.vendorCode}`));
  });

  return nodes;
}

function VendorDbReportDocument({ reportData }) {
  const { summary, generatedAt, subgroups } = reportData;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page} wrap>
        <Text style={pdfStyles.title}>Vendor Database Report</Text>
        <Text style={pdfStyles.subtitle}>
          {`Generated: ${moment(generatedAt).format('MMM D, YYYY HH:mm')} | ${summary.title || summary.scope} | Top vendors: ${summary.totalVendorsReported}`}
        </Text>

        {subgroups.flatMap((sg) => renderSubgroupPdfNodes(sg))}
      </Page>
    </Document>
  );
}

export async function generatePdfBuffer(reportData) {
  const doc = React.createElement(VendorDbReportDocument, { reportData });
  const stream = await ReactPDF.renderToStream(doc);
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
