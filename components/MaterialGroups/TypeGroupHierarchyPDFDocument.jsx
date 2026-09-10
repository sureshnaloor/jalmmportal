import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import moment from 'moment';

/** Three palette colors: type banner, groups header, group accent */
const COLORS = {
  type: '#0f766e',
  typeSoft: '#ccfbf1',
  groups: '#1e3a8a',
  groupsSoft: '#e0e7ff',
  accent: '#c2410c',
  accentSoft: '#ffedd5',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  rowAlt: '#f8fafc',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 28,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: COLORS.text,
  },
  coverHeader: {
    backgroundColor: COLORS.type,
    padding: 18,
    borderRadius: 6,
    marginBottom: 18,
  },
  coverTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  coverSub: {
    fontSize: 9,
    color: COLORS.typeSoft,
    textAlign: 'center',
    marginTop: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: '23%',
    backgroundColor: COLORS.rowAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 5,
    padding: 10,
  },
  summaryLabel: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.groups,
  },
  legend: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
  },
  legendTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.groups,
    marginBottom: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 8,
    color: COLORS.text,
    lineHeight: 1.35,
  },
  typeBanner: {
    backgroundColor: COLORS.type,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginBottom: 14,
  },
  typeBannerService: {
    backgroundColor: '#5b21b6',
  },
  typeKicker: {
    fontSize: 8,
    color: COLORS.typeSoft,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  typeTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 1.3,
  },
  typeMetaRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  typeMetaLabel: {
    fontSize: 8,
    color: COLORS.typeSoft,
    width: '18%',
    fontFamily: 'Helvetica-Bold',
  },
  typeMetaValue: {
    fontSize: 9,
    color: '#fff',
    width: '82%',
    lineHeight: 1.35,
  },
  sectionHeader: {
    backgroundColor: COLORS.groups,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#fff',
    letterSpacing: 0.4,
  },
  sectionHeaderMeta: {
    fontSize: 8,
    color: COLORS.groupsSoft,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
  },
  tableRowAlt: {
    backgroundColor: COLORS.accentSoft,
  },
  tableCell: {
    fontSize: 8.5,
    color: COLORS.text,
    lineHeight: 1.35,
  },
  colCode: { width: '16%', paddingRight: 4 },
  colName: { width: '28%', paddingRight: 4 },
  colDesc: { width: '56%' },
  codeText: {
    fontFamily: 'Helvetica-Bold',
    color: COLORS.accent,
  },
  nameText: {
    fontFamily: 'Helvetica-Bold',
    color: COLORS.groups,
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    padding: 14,
    backgroundColor: COLORS.rowAlt,
  },
  emptyText: {
    fontSize: 9,
    color: COLORS.muted,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 28,
    right: 28,
    fontSize: 7.5,
    color: COLORS.muted,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
});

function PageFooter() {
  return (
    <Text
      style={styles.footer}
      fixed
      render={({ pageNumber, totalPages }) =>
        `JAL Materials Management Portal — Material & Service Types and Groups — Page ${pageNumber} of ${totalPages}`
      }
    />
  );
}

function TypePage({ type }) {
  return (
    <Page size="A4" orientation="portrait" style={styles.page}>
      <View style={[styles.typeBanner, type.isService ? styles.typeBannerService : null]} wrap={false}>
        <Text style={styles.typeKicker}>{type.typeLabel}</Text>
        <Text style={styles.typeTitle}>{type.name}</Text>
        <View style={styles.typeMetaRow}>
          <Text style={styles.typeMetaLabel}>Code</Text>
          <Text style={styles.typeMetaValue}>{type.code}</Text>
        </View>
        <View style={styles.typeMetaRow}>
          <Text style={styles.typeMetaLabel}>Name</Text>
          <Text style={styles.typeMetaValue}>{type.name}</Text>
        </View>
        <View style={styles.typeMetaRow}>
          <Text style={styles.typeMetaLabel}>Description</Text>
          <Text style={styles.typeMetaValue}>{type.description || '—'}</Text>
        </View>
      </View>

      <View wrap={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>{type.groupLabel}</Text>
          <Text style={styles.sectionHeaderMeta}>{type.groupCount} group{type.groupCount === 1 ? '' : 's'}</Text>
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colCode]}>Code</Text>
          <Text style={[styles.tableHeaderCell, styles.colName]}>Name</Text>
          <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
        </View>
      </View>

      {type.groups.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No groups mapped to this type.</Text>
        </View>
      ) : (
        type.groups.map((group, index) => (
          <View
            key={group.subgroupId}
            style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : null]}
            wrap={false}
          >
            <Text style={[styles.tableCell, styles.colCode, styles.codeText]}>{group.code}</Text>
            <Text style={[styles.tableCell, styles.colName, styles.nameText]}>{group.name}</Text>
            <Text style={[styles.tableCell, styles.colDesc]}>{group.description || '—'}</Text>
          </View>
        ))
      )}

      <PageFooter />
    </Page>
  );
}

export default function TypeGroupHierarchyPDFDocument({ report }) {
  if (!report) return null;

  const summary = report.summary || {};

  return (
    <Document title="Material & Service Types and Groups">
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.coverHeader}>
          <Text style={styles.coverTitle}>Material & Service Types and Groups</Text>
          <Text style={styles.coverSub}>
            Hierarchy directory — Generated {moment(report.generatedAt).format('DD MMM YYYY HH:mm')}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Types</Text>
            <Text style={styles.summaryValue}>{summary.typeCount ?? 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Material Types</Text>
            <Text style={styles.summaryValue}>{summary.materialTypeCount ?? 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Service Types</Text>
            <Text style={styles.summaryValue}>{summary.serviceTypeCount ?? 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Groups</Text>
            <Text style={styles.summaryValue}>{summary.groupCount ?? 0}</Text>
          </View>
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Colour key</Text>
          <View style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: COLORS.type }]} />
            <Text style={styles.legendText}>Teal — Material / Service Type header (code, name, description)</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: COLORS.groups }]} />
            <Text style={styles.legendText}>Navy — Groups section title</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: COLORS.accent }]} />
            <Text style={styles.legendText}>Amber — Group table header / group codes</Text>
          </View>
          <Text style={[styles.legendText, { marginTop: 6 }]}>
            Each following page is one type. All groups mapped to that type are listed underneath.
            Material types appear first, then service types.
          </Text>
        </View>

        <PageFooter />
      </Page>

      {(report.types || []).map((type) => (
        <TypePage key={type.typeId} type={type} />
      ))}
    </Document>
  );
}
