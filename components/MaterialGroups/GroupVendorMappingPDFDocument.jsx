import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import moment from 'moment';

const styles = StyleSheet.create({
  page: {
    padding: 22,
    paddingBottom: 36,
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#1e293b',
  },
  coverHeader: {
    backgroundColor: '#1e3a8a',
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
  },
  coverTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  coverSub: {
    fontSize: 9,
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 5,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 7.5,
    color: '#64748b',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  legend: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  legendTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  legendText: {
    fontSize: 7.5,
    color: '#334155',
    lineHeight: 1.4,
  },
  typeBanner: {
    backgroundColor: '#1e3a8a',
    padding: 10,
    borderRadius: 4,
    marginBottom: 12,
  },
  typeBannerService: {
    backgroundColor: '#5b21b6',
  },
  typeBannerKicker: {
    fontSize: 7,
    color: '#c7d2fe',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  typeBannerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  groupBlock: {
    marginBottom: 12,
  },
  groupHeader: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderBottomWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#1e3a8a',
    width: '72%',
  },
  groupMeta: {
    fontSize: 7,
    color: '#475569',
    textAlign: 'right',
    width: '28%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'flex-start',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 7,
    color: '#0f172a',
  },
  colCode: { width: '16%', paddingRight: 4 },
  colName: { width: '26%', paddingRight: 4 },
  colAddress: { width: '44%', paddingRight: 4 },
  colEval: { width: '14%' },
  evalYes: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#166534',
  },
  evalNo: {
    fontSize: 7,
    color: '#64748b',
  },
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 22,
    right: 22,
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 5,
  },
});

function PageFooter({ evaluationYear }) {
  return (
    <Text
      style={styles.footer}
      fixed
      render={({ pageNumber, totalPages }) =>
        `JAL Materials Management Portal — Group vendor mapping ${evaluationYear} — Page ${pageNumber} of ${totalPages}`
      }
    />
  );
}

function VendorTable({ groupLabel, group, evaluationYear }) {
  return (
    <View style={styles.groupBlock} wrap>
      <View wrap={false}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>
            {groupLabel}: {group.groupName}
          </Text>
          <Text style={styles.groupMeta}>
            {group.vendorCount} vendors · {group.evaluatedCount} evaluated
          </Text>
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colCode]}>Vendor Code</Text>
          <Text style={[styles.tableHeaderCell, styles.colName]}>Vendor Name</Text>
          <Text style={[styles.tableHeaderCell, styles.colAddress]}>Address</Text>
          <Text style={[styles.tableHeaderCell, styles.colEval]}>Eval. {evaluationYear}</Text>
        </View>
      </View>
      {group.vendors.map((vendor, index) => (
        <View
          key={`${vendor.vendorCode}-${index}`}
          style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : null]}
          wrap={false}
        >
          <Text style={[styles.tableCell, styles.colCode]}>{vendor.vendorCode}</Text>
          <Text style={[styles.tableCell, styles.colName]}>{vendor.vendorName}</Text>
          <Text style={[styles.tableCell, styles.colAddress]}>{vendor.address}</Text>
          <Text style={[vendor.evaluated ? styles.evalYes : styles.evalNo, styles.colEval]}>
            {vendor.evaluated ? 'Yes' : 'No'}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function GroupVendorMappingPDFDocument({ report }) {
  if (!report) return null;

  const summary = report.summary || {};
  const evaluationYear = report.evaluationYear;

  return (
    <Document title={`Group Vendor Mapping ${evaluationYear}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.coverHeader}>
          <Text style={styles.coverTitle}>Material & Service Group Vendor Mapping</Text>
          <Text style={styles.coverSub}>
            Evaluation Year {evaluationYear} — Generated {moment(report.generatedAt).format('DD MMM YYYY HH:mm')}
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Types with mapped vendors</Text>
            <Text style={styles.summaryValue}>{summary.typeCount ?? 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Groups with mapped vendors</Text>
            <Text style={styles.summaryValue}>{summary.groupCount ?? 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Vendor mappings</Text>
            <Text style={styles.summaryValue}>{summary.vendorMappingCount ?? 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Unique mapped vendors</Text>
            <Text style={styles.summaryValue}>{summary.uniqueVendorCount ?? 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Mapped vendors evaluated {evaluationYear}</Text>
            <Text style={styles.summaryValue}>{summary.uniqueEvaluatedCount ?? 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{evaluationYear} evaluation set (PO vendors)</Text>
            <Text style={styles.summaryValue}>{summary.evaluationSetSize ?? 0}</Text>
          </View>
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>How to read this report</Text>
          <Text style={styles.legendText}>
            Each section is a material type or service type. Under it, each material group or service
            group lists the vendors mapped to that group. Evaluated = Yes when the vendor had purchase
            orders in {evaluationYear} and is included in the annual vendor evaluation set.
          </Text>
        </View>

        <PageFooter evaluationYear={evaluationYear} />
      </Page>

      {(report.types || []).map((type) => (
        <Page key={`${type.isService ? 'svc' : 'mat'}-${type.typeName}`} size="A4" style={styles.page}>
          <View style={[styles.typeBanner, type.isService ? styles.typeBannerService : null]} wrap={false}>
            <Text style={styles.typeBannerKicker}>{type.typeLabel}</Text>
            <Text style={styles.typeBannerTitle}>{type.typeName}</Text>
          </View>

          {type.groups.map((group) => (
            <VendorTable
              key={group.subgroupId}
              groupLabel={type.groupLabel}
              group={group}
              evaluationYear={evaluationYear}
            />
          ))}

          <PageFooter evaluationYear={evaluationYear} />
        </Page>
      ))}
    </Document>
  );
}
