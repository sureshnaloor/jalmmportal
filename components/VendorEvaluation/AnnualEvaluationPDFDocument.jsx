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

const SCM_HEAD_PRINT_NAME = 'Suresh Unnikrishnan- Head, SCM';

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
  draftBadge: {
    fontSize: 9,
    color: '#92400e',
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 3,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  draftWatermark: {
    position: 'absolute',
    top: '42%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 64,
    color: '#fecaca',
    opacity: 0.28,
    letterSpacing: 8,
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
  signatureHint: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 18,
  },
  signatureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '48%',
    minHeight: 168,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  signatureRole: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 6,
  },
  signatureSpace: {
    height: 72,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    marginBottom: 12,
    justifyContent: 'flex-end',
    padding: 6,
  },
  signatureSpaceLabel: {
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'center',
  },
  signatureField: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  signatureFieldLabel: {
    width: '18%',
    fontSize: 7.5,
    color: '#475569',
    fontWeight: 'bold',
  },
  signatureLine: {
    width: '82%',
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    height: 12,
  },
  groupsHint: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 14,
    textAlign: 'center',
  },
  groupSection: {
    marginBottom: 16,
  },
  groupSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  groupSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  groupCount: {
    fontSize: 8,
    color: '#475569',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e3a8a',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 8,
    color: '#0f172a',
  },
  typeCol: {
    width: '48%',
    paddingRight: 8,
  },
  groupCol: {
    width: '52%',
  },
  parentTypeCell: {
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  groupItem: {
    fontSize: 8,
    color: '#0f172a',
    marginBottom: 3,
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    padding: 14,
    backgroundColor: '#fafafa',
  },
  emptyText: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
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

function CompactPOBox({ po, index, isPriorPo = false }) {
  const ev = po.evaluation || {};

  return (
    <View style={styles.poBox} wrap={false}>
      <Text style={styles.poTitle}>
        {isPriorPo ? 'Most recent PO' : 'PO'} #{index + 1}: {po.ponumber} — {po.povalue?.toLocaleString()} SAR
      </Text>

      <View style={styles.poRow}>
        <Text style={styles.poLabel}>PO Date</Text>
        <Text style={styles.poValue}>{po.podate ? moment(po.podate).format('DD/MM/YY') : 'N/A'}</Text>
      </View>

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

function PageFooter({ evaluationYear, isDraft }) {
  return (
    <Text
      style={styles.footer}
      fixed
      render={({ pageNumber, totalPages }) =>
        `JAL Materials Management Portal — Vendor Evaluation ${evaluationYear}${isDraft ? ' — DRAFT' : ''} — Page ${pageNumber} of ${totalPages}`
      }
    />
  );
}

function DraftWatermark({ approved }) {
  if (approved) return null;
  return (
    <Text style={styles.draftWatermark} fixed>
      DRAFT
    </Text>
  );
}

function groupByParentType(rows) {
  const grouped = [];
  const indexByParent = new Map();

  (rows || []).forEach((row) => {
    const parent = row.groupName || '—';
    if (!indexByParent.has(parent)) {
      indexByParent.set(parent, grouped.length);
      grouped.push({ parentType: parent, groups: [] });
    }
    grouped[indexByParent.get(parent)].groups.push(row.subgroupName || '—');
  });

  return grouped;
}

function GroupAssignmentTable({ title, typeLabel, groupLabel, rows = [] }) {
  const grouped = groupByParentType(rows);

  return (
    <View style={styles.groupSection}>
      <View style={styles.groupSectionHeader}>
        <Text style={styles.groupSectionTitle}>{title}</Text>
        <Text style={styles.groupCount}>
          {rows.length} assigned
        </Text>
      </View>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.typeCol]}>{typeLabel}</Text>
        <Text style={[styles.tableHeaderCell, styles.groupCol]}>{groupLabel}</Text>
      </View>
      {grouped.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>None assigned to this vendor</Text>
        </View>
      ) : (
        grouped.map((block, blockIndex) => (
          <View
            key={`${block.parentType}-${blockIndex}`}
            style={[styles.tableRow, blockIndex % 2 === 1 ? styles.tableRowAlt : null]}
            wrap={false}
          >
            <Text style={[styles.tableCell, styles.typeCol, styles.parentTypeCell]}>
              {block.parentType}
            </Text>
            <View style={styles.groupCol}>
              {block.groups.map((name, groupIndex) => (
                <Text key={`${name}-${groupIndex}`} style={styles.groupItem}>
                  {name}
                </Text>
              ))}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function SignatureBlock({ role }) {
  return (
    <View style={styles.signatureBox} wrap={false}>
      <Text style={styles.signatureRole}>{role}</Text>
      <View style={styles.signatureSpace}>
        <Text style={styles.signatureSpaceLabel}>Signature</Text>
      </View>
      <View style={styles.signatureField}>
        <Text style={styles.signatureFieldLabel}>Name</Text>
        <View style={styles.signatureLine} />
      </View>
      <View style={styles.signatureField}>
        <Text style={styles.signatureFieldLabel}>Date</Text>
        <View style={styles.signatureLine} />
      </View>
    </View>
  );
}

function SignaturePageContent() {
  return (
    <>
      <Text style={styles.signatureHint}>
        Affix signatures in the boxes below. This draft is for circulation before supply chain head approval.
      </Text>
      <View style={styles.signatureGrid}>
        <SignatureBlock role="Project Team" />
        <SignatureBlock role="Department" />
        <SignatureBlock role="Finance" />
        <SignatureBlock role="MMD" />
      </View>
    </>
  );
}

function AssignedGroupsPageContent({ summary }) {
  const materialGroups = summary.materialGroups || [];
  const serviceGroups = summary.serviceGroups || [];

  return (
    <>
      <Text style={styles.groupsHint}>
        Material and service groups mapped to this vendor, with the parent type for each assignment
      </Text>
      <GroupAssignmentTable
        title="Material Groups"
        typeLabel="Material Type"
        groupLabel="Material Group"
        rows={materialGroups}
      />
      <GroupAssignmentTable
        title="Service Groups"
        typeLabel="Service Type"
        groupLabel="Service Group"
        rows={serviceGroups}
      />
    </>
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
          <Text style={styles.metaValue}>
            {summary.evaluatedBy ? SCM_HEAD_PRINT_NAME : '—'}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Evaluated On</Text>
          <Text style={styles.metaValue}>
            {summary.evaluatedAt ? moment(summary.evaluatedAt).format('DD MMM YYYY HH:mm') : '—'}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Approved By</Text>
          <Text style={styles.metaValue}>
            {summary.approvedBy || summary.approved ? SCM_HEAD_PRINT_NAME : '—'}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Approved On</Text>
          <Text style={styles.metaValue}>
            {summary.approvedAt ? moment(summary.approvedAt).format('DD MMM YYYY HH:mm') : '—'}
          </Text>
        </View>
      </View>

      {summary.approved ? (
        <Text style={styles.badge}>APPROVED BY SUPPLY CHAIN HEAD</Text>
      ) : (
        <Text style={styles.draftBadge}>DRAFT — PENDING APPROVAL</Text>
      )}
    </>
  );
}

export default function AnnualEvaluationPDFDocument({ summary }) {
  if (!summary) return null;

  const scores = summary.finalScores || {};
  const isPriorPo = summary.track === 'prior-po';
  const poValueLabel = isPriorPo
    ? 'Lifetime PO Value'
    : `Total PO Value (${summary.evaluationYear})`;
  const headerSub = isPriorPo
    ? `Fresh evaluation ${summary.evaluationYear} — most recent POs (no qualifying PO in ${summary.previousCalendarYear})${summary.approved ? '' : ' — DRAFT'} — Generated ${moment().format('DD MMM YYYY')}`
    : `Evaluation Year ${summary.evaluationYear}${summary.approved ? '' : ' — DRAFT'} — Generated ${moment().format('DD MMM YYYY')}`;

  return (
    <Document title={`Vendor Evaluation ${summary.vendorcode}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vendor Evaluation Report</Text>
          <Text style={styles.headerSub}>{headerSub}</Text>
        </View>

        <View style={styles.pageOneMain}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Vendor Information</Text>
            <InfoRow label="Vendor Code" value={summary.vendorcode} />
            <InfoRow label="Vendor Name" value={summary.vendorname} />
            <InfoRow label={poValueLabel} value={`${summary.totalPoValue?.toLocaleString()} SAR`} />
            <InfoRow label={isPriorPo ? 'Lifetime PO Count' : 'PO Count'} value={String(summary.poCount ?? '—')} />
            {isPriorPo && summary.lastPoDate ? (
              <InfoRow
                label="Last PO Date"
                value={moment(summary.lastPoDate).format('DD MMM YYYY')}
              />
            ) : null}
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
            <Text style={styles.sectionTitle}>
              {isPriorPo
                ? 'Most Recent POs — Variable Parameters (Price 30% · Delivery 20% · Quality 10%)'
                : 'PO Variable Parameters (Price 30% · Delivery 20% · Quality 10%)'}
            </Text>
            <View style={styles.twoColumn}>
              {(summary.poSummaries || []).map((po, idx) => (
                <CompactPOBox key={po.ponumber} po={po} index={idx} isPriorPo={isPriorPo} />
              ))}
            </View>
          </View>
        </View>

        <DraftWatermark approved={summary.approved} />
        <PageFooter evaluationYear={summary.evaluationYear} isDraft={!summary.approved} />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.pageTwoHeader}>
          <Text style={styles.pageTwoHeaderTitle}>Vendor Evaluation Summary</Text>
          <Text style={styles.pageTwoHeaderSub}>
            {summary.vendorcode} — {summary.vendorname} — {summary.evaluationYear}
            {summary.approved ? '' : ' — DRAFT'}
          </Text>
        </View>

        <View style={styles.pageTwoMain}>
          <FinalScoresPageContent summary={summary} scores={scores} />
        </View>

        <DraftWatermark approved={summary.approved} />
        <PageFooter evaluationYear={summary.evaluationYear} isDraft={!summary.approved} />
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.pageTwoHeader}>
          <Text style={styles.pageTwoHeaderTitle}>Assigned Material & Service Groups</Text>
          <Text style={styles.pageTwoHeaderSub}>
            {summary.vendorcode} — {summary.vendorname} — {summary.evaluationYear}
            {summary.approved ? '' : ' — DRAFT'}
          </Text>
        </View>

        <AssignedGroupsPageContent summary={summary} />

        <DraftWatermark approved={summary.approved} />
        <PageFooter evaluationYear={summary.evaluationYear} isDraft={!summary.approved} />
      </Page>

      {!summary.approved && (
        <Page size="A4" style={styles.page}>
          <View style={styles.pageTwoHeader}>
            <Text style={styles.pageTwoHeaderTitle}>Signature Sheet</Text>
            <Text style={styles.pageTwoHeaderSub}>
              {summary.vendorcode} — {summary.vendorname} — {summary.evaluationYear} — DRAFT
            </Text>
          </View>

          <SignaturePageContent />

          <PageFooter evaluationYear={summary.evaluationYear} isDraft />
        </Page>
      )}
    </Document>
  );
}
