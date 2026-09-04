import { connectToDatabase } from '../../../../lib/mongoconnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { MIN_VENDOR_PO_VALUE_SAR } from '../../../../lib/vendorEvaluationConfig';
import { isEvaluationComplete } from '../../../../lib/vendorEvaluationApproval';
import { getVendorGroupAssignments } from '../../../../lib/vendorGroupMappings';
import {
  getEvaluationTrackContext,
  parseEvaluationTrack,
} from '../../../../lib/vendorEvaluationYear';
import {
  getEvaluationPOs,
  enrichPOWithSchedule,
  getVendorPoTotals,
  getCurrentYearEligibleVendorCodes,
} from '../../../../lib/vendorEvaluationPOs';

export default async function handler(req, res) {
  const { vendorcode } = req.query;
  if (!vendorcode) {
    return res.status(400).json({ error: 'vendorcode is required' });
  }

  const ctx = getEvaluationTrackContext(parseEvaluationTrack(req.query.track));
  const { evaluationYear, storageKey, yearStart, yearEnd, isPriorPo, track } = ctx;

  try {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      if (isPriorPo) {
        const excludedCodes = await getCurrentYearEligibleVendorCodes(db, yearStart, yearEnd);
        if (excludedCodes.has(String(vendorcode))) {
          return res.status(404).json({
            error: 'This vendor is covered under current-year evaluation and is not in the prior-PO list.',
          });
        }
      }

      const [vendorDetails, evalDoc, topPOsRaw] = await Promise.all([
        db.collection('vendors').findOne({ 'vendor-code': vendorcode }),
        db.collection('vendorevaluation').findOne({ vendorcode: String(vendorcode) }),
        getEvaluationPOs(db, vendorcode, track, yearStart, yearEnd),
      ]);

      if (!topPOsRaw.length) {
        return res.status(404).json({
          error: isPriorPo
            ? 'No purchase orders found for this vendor'
            : `No qualifying POs found for vendor in ${evaluationYear}`,
        });
      }

      const vendorTotals = await getVendorPoTotals(
        db,
        vendorcode,
        isPriorPo ? null : yearStart,
        isPriorPo ? null : yearEnd
      );

      if (!isPriorPo && vendorTotals.totalValue <= MIN_VENDOR_PO_VALUE_SAR) {
        return res.status(404).json({
          error: `Vendor total PO value must exceed ${MIN_VENDOR_PO_VALUE_SAR} SAR`,
        });
      }

      const [topPOs, groupAssignments] = await Promise.all([
        Promise.all(topPOsRaw.map((po) => enrichPOWithSchedule(db, po))),
        getVendorGroupAssignments(db, vendorcode),
      ]);

      let savedEval = evalDoc?.[storageKey] || null;

      if (savedEval?.approvedBy && String(savedEval.approvedBy).includes('@')) {
        const approver = await db.collection('users').findOne(
          { email: String(savedEval.approvedBy) },
          { projection: { name: 1 } }
        );
        if (approver?.name) {
          savedEval = { ...savedEval, approvedBy: approver.name };
        }
      }

      return res.status(200).json({
        track,
        evaluationYear,
        previousCalendarYear: ctx.previousCalendarYear,
        vendorcode: String(vendorcode),
        vendorname: vendorDetails?.['vendor-name'] || topPOs[0]?.vendorname || '',
        vendorDetails: vendorDetails || null,
        totalPoValue: vendorTotals.totalValue,
        poCount: vendorTotals.poCount,
        lastPoDate: vendorTotals.lastPoDate || null,
        topPOs,
        evaluation: savedEval,
        materialGroups: groupAssignments.materialGroups,
        serviceGroups: groupAssignments.serviceGroups,
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

      const topPOsRaw = await getEvaluationPOs(db, vendorcode, track, yearStart, yearEnd);
      const requiredPoNumbers = topPOsRaw.map((po) => po.ponumber);
      if (existingEval && isEvaluationComplete(existingEval, requiredPoNumbers)) {
        return res.status(403).json({
          error: 'Evaluation is complete and locked. Supply chain head may edit scores before approval.',
        });
      }

      const payload = {
        evaluationYear,
        track,
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
