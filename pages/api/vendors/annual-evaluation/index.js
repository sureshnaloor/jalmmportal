import { connectToDatabase } from '../../../../lib/mongoconnect';
import {
  getVendorEvaluationYear,
  getVendorEvaluationYearRange,
  getAnnualEvaluationStorageKey,
} from '../../../../lib/vendorEvaluationYear';
import { MIN_VENDOR_PO_VALUE_SAR } from '../../../../lib/vendorEvaluationConfig';
import { computeEvaluationDisplayScores } from '../../../../lib/vendorEvaluationApproval';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const evaluationYear = req.query.year
      ? parseInt(req.query.year, 10)
      : getVendorEvaluationYear();
    const { yearStart, yearEnd } = getVendorEvaluationYearRange(evaluationYear);
    const storageKey = getAnnualEvaluationStorageKey(evaluationYear);

    const { db } = await connectToDatabase();

    const vendors = await db
      .collection('purchaseorders')
      .aggregate([
        {
          $match: {
            'po-date': { $gte: yearStart, $lte: yearEnd },
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

    const vendorCodes = vendors.map((v) => String(v.vendorcode));
    const evaluations = vendorCodes.length
      ? await db
          .collection('vendorevaluation')
          .find({ vendorcode: { $in: vendorCodes } })
          .project({ vendorcode: 1, [storageKey]: 1 })
          .toArray()
      : [];

    const evalMap = new Map(
      evaluations.map((doc) => [String(doc.vendorcode), doc[storageKey] || null])
    );

    const result = vendors.map((v) => {
      const saved = evalMap.get(String(v.vendorcode));
      const evaluated = Boolean(
        saved &&
          (Object.keys(saved.ratingMaterials || {}).length ||
            Object.keys(saved.ratingServices || {}).length ||
            saved.poEvaluations?.length)
      );
      const { fixedOverall, variableOverall } = computeEvaluationDisplayScores(saved);
      return {
        ...v,
        evaluated,
        evaluatedAt: saved?.updatedAt || saved?.createdAt || null,
        approved: Boolean(saved?.approved),
        approvedAt: saved?.approvedAt || null,
        approvedBy: saved?.approvedBy || null,
        fixedOverall,
        variableOverall,
        scoreEditedBySupplyChainHead: Boolean(saved?.scoreEditedBySupplyChainHead),
      };
    });

    return res.status(200).json({
      evaluationYear,
      minPoValue: MIN_VENDOR_PO_VALUE_SAR,
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
