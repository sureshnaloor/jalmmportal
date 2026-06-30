import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';
import moment from 'moment';
import { PO_EVALUATION_WEIGHTS } from '../../lib/vendorEvaluationConfig';
import { getPriceSelectionLabel } from '../../lib/vendorEvaluationApproval';

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: 'Helvetica', fontSize: 9, color: '#1e293b' },
  header: { backgroundColor: '#1e3a8a', padding: 16, marginBottom: 16, borderRadius: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  headerSub: { fontSize: 10, color: '#e0e7ff', textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#1e40af', marginTop: 12, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 4 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 4 },
  cellLabel: { width: '55%', color: '#475569' },
  cellValue: { width: '45%', fontWeight: 'bold', color: '#0f172a' },
  poBox: { marginTop: 8, padding: 10, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4 },
  poTitle: { fontSize: 10, fontWeight: 'bold', color: '#0f172a', marginBottom: 6 },
  timelineItem: { fontSize: 8, color: '#64748b', marginBottom: 2 },
  footer: { position: 'absolute', bottom: 24, left: 32, right: 32, fontSize: 8, color: '#94a3b8', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8 },
  badge: { fontSize: 8, color: '#166534', backgroundColor: '#dcfce7', padding: 4, borderRadius: 2, marginTop: 8, textAlign: 'center' },
});

function RatingTable({ title, rows, overall }) {
  if (!rows?.length) return null;
  const rated = rows.filter((r) => r.value != null);
  if (!rated.length && overall == null) return null;

  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rows.map((row) =>
        row.value != null ? (
          <View key={row.key} style={styles.row}>
            <Text style={styles.cellLabel}>{row.key}) {row.label}</Text>
            <Text style={styles.cellValue}>{row.value} / 5</Text>
          </View>
        ) : null
      )}
      {overall != null && (
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Overall</Text>
          <Text style={styles.cellValue}>{overall} / 5</Text>
        </View>
      )}
    </View>
  );
}

function formatVariance(days) {
  if (days == null) return 'N/A';
  if (days === 0) return 'On time';
  if (days > 0) return `${days} day(s) late`;
  return `${Math.abs(days)} day(s) early`;
}

export default function AnnualEvaluationPDFDocument({ summary }) {
  if (!summary) return null;

  return (
    <Document title={`Vendor Evaluation ${summary.vendorcode}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vendor Evaluation Report</Text>
          <Text style={styles.headerSub}>
            Evaluation Year {summary.evaluationYear} — Generated {moment().format('DD MMM YYYY')}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.cellLabel}>Vendor Code</Text>
          <Text style={styles.cellValue}>{summary.vendorcode}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Vendor Name</Text>
          <Text style={styles.cellValue}>{summary.vendorname}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Total PO Value ({summary.evaluationYear})</Text>
          <Text style={styles.cellValue}>{summary.totalPoValue?.toLocaleString()} SAR</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>PO Count</Text>
          <Text style={styles.cellValue}>{summary.poCount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Fixed Parameters Overall</Text>
          <Text style={styles.cellValue}>{summary.fixedOverall ?? '—'} / 5</Text>
        </View>

        <RatingTable title="Materials (if applicable)" rows={summary.materialsRows} overall={summary.materialsOverall} />
        <RatingTable title="Services (if applicable)" rows={summary.servicesRows} overall={summary.servicesOverall} />

        <Text style={styles.sectionTitle}>PO Variable Parameters (Price 30% · Delivery 20% · Quality 10%)</Text>

        {summary.poSummaries?.map((po, idx) => {
          const ev = po.evaluation || {};
          return (
            <View key={po.ponumber} style={styles.poBox} wrap={false}>
              <Text style={styles.poTitle}>
                Top PO #{idx + 1}: {po.ponumber} — {po.povalue?.toLocaleString()} SAR
              </Text>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>PO Date</Text>
                <Text style={styles.cellValue}>{po.podate ? moment(po.podate).format('DD/MM/YYYY') : 'N/A'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Planned Delivery</Text>
                <Text style={styles.cellValue}>{po.deliveryDate ? moment(po.deliveryDate).format('DD/MM/YYYY') : 'N/A'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Actual Delivery</Text>
                <Text style={styles.cellValue}>{po.actualDeliveryDate ? moment(po.actualDeliveryDate).format('DD/MM/YYYY') : 'N/A'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Delivery Variance (from PO date)</Text>
                <Text style={styles.cellValue}>{formatVariance(po.deliveryVarianceDays)}</Text>
              </View>

              {po.timeline?.length > 0 && (
                <View style={{ marginTop: 6, marginBottom: 6 }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#475569', marginBottom: 4 }}>PO Timeline</Text>
                  {po.timeline.map((e, i) => (
                    <Text key={i} style={styles.timelineItem}>
                      • {e.label}: {moment(e.date).format('DD MMM YYYY')}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.row}>
                <Text style={styles.cellLabel}>1) {PO_EVALUATION_WEIGHTS.price.label} ({PO_EVALUATION_WEIGHTS.price.weight}%)</Text>
                <Text style={styles.cellValue}>{ev.priceRating ?? '—'} / 5 — {getPriceSelectionLabel(ev.priceSelection)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>2) {PO_EVALUATION_WEIGHTS.delivery.label} ({PO_EVALUATION_WEIGHTS.delivery.weight}%)</Text>
                <Text style={styles.cellValue}>{ev.deliveryRating ?? '—'} / 5</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>3) {PO_EVALUATION_WEIGHTS.quality.label} ({PO_EVALUATION_WEIGHTS.quality.weight}%)</Text>
                <Text style={styles.cellValue}>{ev.qualityRating ?? '—'} / 5</Text>
              </View>
              {ev.qualityNotes ? (
                <Text style={{ fontSize: 8, color: '#64748b', marginTop: 4 }}>Quality notes: {ev.qualityNotes}</Text>
              ) : null}
              {po.weightedScore != null && (
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#be123c', marginTop: 6 }}>
                  Weighted PO variable score: {po.weightedScore}%
                </Text>
              )}

              {po.lineItems?.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#475569', marginBottom: 4 }}>Line Items</Text>
                  {po.lineItems.slice(0, 8).map((item, li) => (
                    <Text key={li} style={{ fontSize: 7, color: '#64748b', marginBottom: 2 }}>
                      L{item.line}: {item.description || '—'} | Qty {item.quantity} {item.unit} @ {item.unitRate?.toLocaleString()} = {item.value?.toLocaleString()} SAR | {item.accountAssignment}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={{ marginTop: 16 }}>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>Evaluated By</Text>
            <Text style={styles.cellValue}>{summary.evaluatedBy || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>Evaluated On</Text>
            <Text style={styles.cellValue}>{summary.evaluatedAt ? moment(summary.evaluatedAt).format('DD MMM YYYY HH:mm') : '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>Approved By</Text>
            <Text style={styles.cellValue}>{summary.approvedBy || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>Approved On</Text>
            <Text style={styles.cellValue}>{summary.approvedAt ? moment(summary.approvedAt).format('DD MMM YYYY HH:mm') : '—'}</Text>
          </View>
        </View>

        {summary.approved && (
          <Text style={styles.badge}>✓ APPROVED BY SUPPLY CHAIN HEAD</Text>
        )}

        <Text style={styles.footer}>JAL Materials Management Portal — Vendor Evaluation {summary.evaluationYear}</Text>
      </Page>
    </Document>
  );
}
