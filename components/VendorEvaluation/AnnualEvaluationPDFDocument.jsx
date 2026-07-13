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
  page: {
    padding: 24,
    paddingBottom: 36,
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#1e293b',
    flexDirection: 'column',
  },
  pageOneMain: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 12,
  },
  pageTwoMain: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 12,
  },
  header: {
    backgroundColor: '#1e3a8a',
    padding: 14,
    marginBottom: 20,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 9,
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 6,
    padding: 14,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  infoLabel: {
    width: '42%',
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  infoValue: {
    width: '58%',
    fontSize: 8,
    color: '#0f172a',
  },
  sectionBlock: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  column: {
    width: '48.5%',
  },
  panel: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 10,
    minHeight: 120,
  },
  panelTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  ratingLabel: {
    width: '78%',
    fontSize: 6.5,
    color: '#64748b',
  },
  ratingValue: {
    width: '22%',
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'right',
  },
  overallRow: {
    flexDirection: 'row',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
  },
  poBox: {
    padding: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    width: '48.5%',
    minHeight: 200,
  },
  poTitle: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
  poRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  poLabel: {
    width: '52%',
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#475569',
  },
  poValue: {
    width: '48%',
    fontSize: 6.5,
    color: '#0f172a',
  },
  timelineItem: {
    fontSize: 6,
    color: '#64748b',
    marginBottom: 1,
  },
  scoreSection: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 6,
    padding: 20,
    marginBottom: 16,
  },
  scoreSectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  scoreCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  scoreCardLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 5,
  },
  scoreCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14532d',
  },
  scoreCardSub: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 4,
  },
  overallScoreBox: {
    marginTop: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#86efac',
    alignItems: 'center',
  },
  overallLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#166534',
  },
  overallValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#14532d',
    marginTop: 6,
  },
  overallHint: {
    fontSize: 7.5,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  metaSection: {
    padding: 14,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  metaLabel: {
    width: '35%',
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
  },
  metaValue: {
    width: '65%',
    fontSize: 8,
    color: '#0f172a',
  },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 24,
    right: 24,
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 6,
  },
  badge: {
    fontSize: 9,
    color: '#166534',
    backgroundColor: '#dcfce7',
    padding: 8,
    borderRadius: 3,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  pageTwoHeader: {
    backgroundColor: '#1e3a8a',
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
  },
  pageTwoHeaderTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  pageTwoHeaderSub: {
    fontSize: 8,
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 3,
  },
});

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? '—'}</Text>
    </View>
  );
}

function CompactRatingPanel({ title, rows, overall }) {
  const rated = (rows || []).filter((row) => row.value != null);
  if (!rated.length && overall == null) {
    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{title}</Text>
        <Text style={{ fontSize: 7, color: '#94a3b8' }}>Not applicable</Text>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      {rated.map((row) => (
        <View key={row.key} style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>
            {row.key}) {row.label}
          </Text>
          <Text style={styles.ratingValue}>{row.value}/5</Text>
        </View>
      ))}
      {overall != null && (
        <View style={styles.overallRow}>
          <Text style={[styles.ratingLabel, { fontWeight: 'bold', color: '#1e40af' }]}>Overall</Text>
          <Text style={[styles.ratingValue, { color: '#1e40af' }]}>{overall}/5</Text>
        </View>
      )}
    </View>
  );
}

function ScoreCard({ label, percent, sublabel }) {
  return (
    <View style={styles.scoreCard}>
      <Text style={styles.scoreCardLabel}>{label}</Text>
      <Text style={styles.scoreCardValue}>{percent != null ? `${percent}%` : '—'}</Text>
      {sublabel ? <Text style={styles.scoreCardSub}>{sublabel}</Text> : null}
    </View>
  );
}

function formatVariance(days) {
  if (days == null) return 'N/A';
  if (days === 0) return 'On time';
  if (days > 0) return `${days}d late`;
  return `${Math.abs(days)}d early`;
}

function CompactPOBox({ po, index }) {
  const ev = po.evaluation || {};

  return (
    <View style={styles.poBox} wrap={false}>
      <Text style={styles.poTitle}>
        PO #{index + 1}: {po.ponumber} — {po.povalue?.toLocaleString()} SAR
      </Text>

      <View style={styles.poRow}>
        <Text style={styles.poLabel}>PO Date</Text>
        <Text style={styles.poValue}>{po.podate ? moment(po.podate).format('DD/MM/YY') : 'N/A'}</Text>
      </View>
      <View style={styles.poRow}>
        <Text style={styles.poLabel}>Planned Delivery</Text>
        <Text style={styles.poValue}>{po.deliveryDate ? moment(po.deliveryDate).format('DD/MM/YY') : 'N/A'}</Text>
      </View>
      <View style={styles.poRow}>
        <Text style={styles.poLabel}>Actual Delivery</Text>
        <Text style={styles.poValue}>{po.actualDeliveryDate ? moment(po.actualDeliveryDate).format('DD/MM/YY') : 'N/A'}</Text>
      </View>
      <View style={styles.poRow}>
        <Text style={styles.poLabel}>Variance</Text>
        <Text style={styles.poValue}>{formatVariance(po.deliveryVarianceDays)}</Text>
      </View>

      {po.timeline?.length > 0 && (
        <View style={{ marginTop: 4, marginBottom: 4 }}>
          {po.timeline.slice(0, 4).map((event, i) => (
            <Text key={i} style={styles.timelineItem}>
              • {event.label}: {moment(event.date).format('DD MMM YY')}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.poRow}>
        <Text style={styles.poLabel}>Price ({PO_EVALUATION_WEIGHTS.price.weight}%)</Text>
        <Text style={styles.poValue}>
          {ev.priceRating ?? '—'}/5 — {getPriceSelectionLabel(ev.priceSelection)}
        </Text>
      </View>
      <View style={styles.poRow}>
        <Text style={styles.poLabel}>Delivery ({PO_EVALUATION_WEIGHTS.delivery.weight}%)</Text>
        <Text style={styles.poValue}>{ev.deliveryRating ?? '—'}/5</Text>
      </View>
      <View style={styles.poRow}>
        <Text style={styles.poLabel}>Quality ({PO_EVALUATION_WEIGHTS.quality.weight}%)</Text>
        <Text style={styles.poValue}>{ev.qualityRating ?? '—'}/5</Text>
      </View>

      {ev.qualityNotes ? (
        <Text style={{ fontSize: 6, color: '#64748b', marginTop: 3 }}>Notes: {ev.qualityNotes}</Text>
      ) : null}

      {po.weightedScore != null && (
        <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#be123c', marginTop: 4 }}>
          PO score: {po.weightedScore}%
        </Text>
      )}

      {po.lineItems?.length > 0 && (
        <View style={{ marginTop: 4 }}>
          {po.lineItems.slice(0, 4).map((item, li) => (
            <Text key={li} style={{ fontSize: 5.5, color: '#64748b', marginBottom: 1 }}>
              L{item.line}: {(item.description || '—').slice(0, 40)} | {item.value?.toLocaleString()} SAR
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function FinalScoresPageContent({ summary, scores }) {
  return (
    <>
      <View style={styles.scoreSection}>
        <Text style={styles.scoreSectionTitle}>Final Evaluation Scores</Text>
        <View style={styles.scoreGrid}>
          <ScoreCard
            label="Fixed Parameters"
            percent={scores.fixedPercent}
            sublabel={scores.fixedOverall != null ? `${scores.fixedOverall} / 5 rating` : null}
          />
          <ScoreCard
            label="PO Variable Score"
            percent={scores.variablePercent}
            sublabel="Average of top PO weighted scores"
          />
          <ScoreCard
            label="Payment Terms"
            percent={scores.paymentTermsPercent}
            sublabel={scores.paymentTermsLabel}
          />
          <ScoreCard
            label="ISO Certification"
            percent={scores.isoCertificationPercent}
            sublabel={scores.isoCertificationLabel}
          />
        </View>
        <View style={styles.overallScoreBox}>
          <Text style={styles.overallLabel}>Overall Score</Text>
          <Text style={styles.overallValue}>
            {scores.overallPercent != null ? `${scores.overallPercent}%` : '—'}
          </Text>
          <Text style={styles.overallHint}>
            Average of fixed, PO variable, payment terms, and ISO certification scores
          </Text>
        </View>
      </View>

      <View style={styles.metaSection}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Evaluated By</Text>
          <Text style={styles.metaValue}>{summary.evaluatedBy || '—'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Evaluated On</Text>
          <Text style={styles.metaValue}>
            {summary.evaluatedAt ? moment(summary.evaluatedAt).format('DD MMM YYYY HH:mm') : '—'}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Approved By</Text>
          <Text style={styles.metaValue}>{summary.approvedBy || '—'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Approved On</Text>
          <Text style={styles.metaValue}>
            {summary.approvedAt ? moment(summary.approvedAt).format('DD MMM YYYY HH:mm') : '—'}
          </Text>
        </View>
      </View>

      {summary.approved && (
        <Text style={styles.badge}>APPROVED BY SUPPLY CHAIN HEAD</Text>
      )}
    </>
  );
}

export default function AnnualEvaluationPDFDocument({ summary }) {
  if (!summary) return null;

  const scores = summary.finalScores || {};

  return (
    <Document title={`Vendor Evaluation ${summary.vendorcode}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vendor Evaluation Report</Text>
          <Text style={styles.headerSub}>
            Evaluation Year {summary.evaluationYear} — Generated {moment().format('DD MMM YYYY')}
          </Text>
        </View>

        <View style={styles.pageOneMain}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Vendor Information</Text>
            <InfoRow label="Vendor Code" value={summary.vendorcode} />
            <InfoRow label="Vendor Name" value={summary.vendorname} />
            <InfoRow
              label={`Total PO Value (${summary.evaluationYear})`}
              value={`${summary.totalPoValue?.toLocaleString()} SAR`}
            />
            <InfoRow label="PO Count" value={String(summary.poCount ?? '—')} />
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Fixed Parameters — Materials & Services</Text>
            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <CompactRatingPanel
                  title="Materials"
                  rows={summary.materialsRows}
                  overall={summary.materialsOverall}
                />
              </View>
              <View style={styles.column}>
                <CompactRatingPanel
                  title="Services"
                  rows={summary.servicesRows}
                  overall={summary.servicesOverall}
                />
              </View>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>PO Variable Parameters (Price 30% · Delivery 20% · Quality 10%)</Text>
            <View style={styles.twoColumn}>
              {(summary.poSummaries || []).map((po, idx) => (
                <CompactPOBox key={po.ponumber} po={po} index={idx} />
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          JAL Materials Management Portal — Vendor Evaluation {summary.evaluationYear} — Page 1 of 2
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.pageTwoHeader}>
          <Text style={styles.pageTwoHeaderTitle}>Vendor Evaluation Summary</Text>
          <Text style={styles.pageTwoHeaderSub}>
            {summary.vendorcode} — {summary.vendorname} — {summary.evaluationYear}
          </Text>
        </View>

        <View style={styles.pageTwoMain}>
          <FinalScoresPageContent summary={summary} scores={scores} />
        </View>

        <Text style={styles.footer}>
          JAL Materials Management Portal — Vendor Evaluation {summary.evaluationYear} — Page 2 of 2
        </Text>
      </Page>
    </Document>
  );
}
