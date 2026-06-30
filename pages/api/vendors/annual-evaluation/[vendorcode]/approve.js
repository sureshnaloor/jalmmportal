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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userEmail = session.user.email;
  if (!isSupplyChainHead(userEmail)) {
    return res.status(403).json({
      error: 'Can be approved by supply chain head only',
      canApprove: false,
    });
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

    const savedEval = evalDoc?.[storageKey];
    if (!savedEval) {
      return res.status(400).json({ error: 'Evaluation not found. Complete evaluation first.' });
    }

    if (savedEval.approved) {
      return res.status(400).json({ error: 'Evaluation is already approved.' });
    }

    const requiredPoNumbers = await getRequiredPoNumbers(db, vendorcode, yearStart, yearEnd);
    if (!isEvaluationComplete(savedEval, requiredPoNumbers)) {
      return res.status(400).json({ error: 'Evaluation is incomplete. All parameters must be scored.' });
    }

    const approvedPayload = {
      ...savedEval,
      approved: true,
      approvedAt: new Date(),
      approvedBy: userEmail,
    };

    await db.collection('vendorevaluation').updateOne(
      { vendorcode: String(vendorcode) },
      { $set: { [storageKey]: approvedPayload } }
    );

    return res.status(200).json({
      success: true,
      approved: true,
      approvedAt: approvedPayload.approvedAt,
      approvedBy: approvedPayload.approvedBy,
    });
  } catch (error) {
    console.error('annual-evaluation approve error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
