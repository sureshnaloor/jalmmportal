import { connectToDatabase } from '../../../../lib/mongoconnect';
import { MIN_VENDOR_PO_VALUE_SAR } from '../../../../lib/vendorEvaluationConfig';
import {
  computeEvaluationDisplayScores,
  isSupplementaryEvaluationComplete,
  getMissingSupplementarySections,
} from '../../../../lib/vendorEvaluationApproval';
import {
  getEvaluationTrackContext,
  parseEvaluationTrack,
} from '../../../../lib/vendorEvaluationYear';
import { getCurrentYearEligibleVendorCodes } from '../../../../lib/vendorEvaluationPOs';

function mapSavedEvaluation(vendor, saved) {
  const evaluated = Boolean(
    saved &&
      (Object.keys(saved.ratingMaterials || {}).length ||
        Object.keys(saved.ratingServices || {}).length ||
        saved.poEvaluations?.length)
  );
  const { fixedOverall, variableOverall } = computeEvaluationDisplayScores(saved);
  return {
    ...vendor,
    evaluated,
    evaluatedAt: saved?.updatedAt || saved?.createdAt || null,
    approved: Boolean(saved?.approved),
    approvedAt: saved?.approvedAt || null,
    approvedBy: saved?.approvedBy || null,
    fixedOverall,
    variableOverall,
    scoreEditedBySupplyChainHead: Boolean(saved?.scoreEditedBySupplyChainHead),
    supplementaryComplete: isSupplementaryEvaluationComplete(saved),
    missingSupplementary: getMissingSupplementarySections(saved),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ctx = getEvaluationTrackContext(parseEvaluationTrack(req.query.track));
    const { db } = await connectToDatabase();

    let vendors = [];

    if (ctx.isPriorPo) {
      const excludedCodes = await getCurrentYearEligibleVendorCodes(db, ctx.yearStart, ctx.yearEnd);
      const rows = await db
        .collection('purchaseorders')
        .aggregate([
          {
            $match: {
              vendorcode: { $exists: true, $nin: [null, ''] },
            },
          },
          {
            $group: {
              _id: '$vendorcode',
              vendorname: { $first: '$vendorname' },
              totalValue: { $sum: '$po-value-sar' },
              poNumbers: { $addToSet: '$po-number' },
              lastPoDate: { $max: '$po-date' },
            },
          },
          {
            $project: {
              _id: 0,
              vendorcode: '$_id',
              vendorname: 1,
              totalValue: 1,
              lastPoDate: 1,
              poCount: { $size: '$poNumbers' },
            },
          },
          { $sort: { lastPoDate: -1 } },
        ])
        .toArray();

      vendors = rows.filter((vendor) => !excludedCodes.has(String(vendor.vendorcode)));
    } else {
      vendors = await db
        .collection('purchaseorders')
        .aggregate([
          {
            $match: {
              'po-date': { $gte: ctx.yearStart, $lte: ctx.yearEnd },
              vendorcode: { $exists: true, $nin: [null, ''] },
            },
          },
          {
            $group: {
              _id: '$vendorcode',
              vendorname: { $first: '$vendorname' },
              totalValue: { $sum: '$po-value-sar' },
              poNumbers: { $addToSet: '$po-number' },
            },
          },
          {
            $match: {
              totalValue: { $gt: MIN_VENDOR_PO_VALUE_SAR },
            },
          },
          {
            $project: {
              _id: 0,
              vendorcode: '$_id',
              vendorname: 1,
              totalValue: 1,
              poCount: { $size: '$poNumbers' },
            },
          },
          { $sort: { totalValue: -1 } },
        ])
        .toArray();
    }

    const vendorCodes = vendors.map((v) => String(v.vendorcode));
    const evaluations = vendorCodes.length
      ? await db
          .collection('vendorevaluation')
          .find({ vendorcode: { $in: vendorCodes } })
          .project({ vendorcode: 1, [ctx.storageKey]: 1 })
          .toArray()
      : [];

    const evalMap = new Map(
      evaluations.map((doc) => [String(doc.vendorcode), doc[ctx.storageKey] || null])
    );

    const result = vendors.map((vendor) =>
      mapSavedEvaluation(vendor, evalMap.get(String(vendor.vendorcode)))
    );

    return res.status(200).json({
      track: ctx.track,
      evaluationYear: ctx.evaluationYear,
      previousCalendarYear: ctx.previousCalendarYear,
      minPoValue: ctx.isPriorPo ? 0 : MIN_VENDOR_PO_VALUE_SAR,
      vendors: result,
      totalVendors: result.length,
      evaluatedCount: result.filter((v) => v.evaluated).length,
      approvedCount: result.filter((v) => v.approved).length,
    });
  } catch (error) {
    console.error('annual-evaluation list error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
