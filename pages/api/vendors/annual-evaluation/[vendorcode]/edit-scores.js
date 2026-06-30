import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { connectToDatabase } from '../../../../../lib/mongoconnect';
import {
  getVendorEvaluationYear,
  getVendorEvaluationYearRange,
  getAnnualEvaluationStorageKey,
} from '../../../../../lib/vendorEvaluationYear';
import {
  isSupplyChainHead,
  isEvaluationComplete,
  extractScoreSnapshot,
} from '../../../../../lib/vendorEvaluationApproval';

async function getRequiredPoNumbers(db, vendorcode, yearStart, yearEnd) {
  const rows = await db
    .collection('purchaseorders')
    .aggregate([
      {
        $match: {
          vendorcode,
          'po-date': { $gte: yearStart, $lte: yearEnd },
        },
      },
      {
        $group: {
          _id: '$po-number',
          povalue: { $sum: '$po-value-sar' },
        },
      },
      { $sort: { povalue: -1 } },
      { $limit: 2 },
    ])
    .toArray();
  return rows.map((r) => r._id).filter(Boolean);
}

function validateScorePayload(body) {
  const poEvaluations = Array.isArray(body.poEvaluations) ? body.poEvaluations : [];
  const incompletePO = poEvaluations.find(
    (p) => !p.priceRating || !p.deliveryRating || !p.qualityRating || !p.priceSelection
  );
  if (incompletePO) {
    return `Complete all PO ratings for ${incompletePO.ponumber} before saving.`;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userEmail = session.user.email;
  if (!isSupplyChainHead(userEmail)) {
    return res.status(403).json({ error: 'Only the supply chain head can edit evaluation scores.' });
  }

  const { vendorcode } = req.query;
  if (!vendorcode) {
    return res.status(400).json({ error: 'vendorcode is required' });
  }

  const evaluationYear = getVendorEvaluationYear();
  const { yearStart, yearEnd } = getVendorEvaluationYearRange(evaluationYear);
  const storageKey = getAnnualEvaluationStorageKey(evaluationYear);

  try {
    const { db } = await connectToDatabase();
    const evalDoc = await db
      .collection('vendorevaluation')
      .findOne({ vendorcode: String(vendorcode) });

    const existingEval = evalDoc?.[storageKey];
    if (!existingEval) {
      return res.status(400).json({ error: 'Evaluation not found. Complete evaluation first.' });
    }

    if (existingEval.approved) {
      return res.status(403).json({ error: 'Approved evaluations cannot be modified.' });
    }

    const requiredPoNumbers = await getRequiredPoNumbers(db, vendorcode, yearStart, yearEnd);
    if (!isEvaluationComplete(existingEval, requiredPoNumbers)) {
      return res.status(400).json({ error: 'Evaluation is incomplete. All parameters must be scored first.' });
    }

    const body = req.body || {};
    const validationError = validateScorePayload(body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const now = new Date();
    const editedSnapshot = {
      ratingMaterials: body.ratingMaterials || {},
      ratingServices: body.ratingServices || {},
      poEvaluations: Array.isArray(body.poEvaluations) ? body.poEvaluations : [],
    };

    const originalScores =
      existingEval.originalScores ||
      extractScoreSnapshot({
        ratingMaterials: existingEval.ratingMaterials,
        ratingServices: existingEval.ratingServices,
        poEvaluations: existingEval.poEvaluations,
      });

    const supplyChainScoreEdits = [
      ...(existingEval.supplyChainScoreEdits || []),
      {
        editedAt: now,
        editedBy: userEmail,
        ...extractScoreSnapshot(editedSnapshot),
      },
    ];

    const payload = {
      ...existingEval,
      ratingMaterials: editedSnapshot.ratingMaterials,
      ratingServices: editedSnapshot.ratingServices,
      poEvaluations: editedSnapshot.poEvaluations,
      originalScores,
      supplyChainScoreEdits,
      scoreEditedBySupplyChainHead: true,
      lastScoreEditAt: now,
      lastScoreEditBy: userEmail,
    };

    await db.collection('vendorevaluation').updateOne(
      { vendorcode: String(vendorcode) },
      { $set: { [storageKey]: payload } }
    );

    return res.status(200).json({ success: true, evaluation: payload });
  } catch (error) {
    console.error('annual-evaluation edit-scores error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
