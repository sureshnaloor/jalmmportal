import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { connectToDatabase } from '../../../../../lib/mongoconnect';
import { getVendorEvaluationYear } from '../../../../../lib/vendorEvaluationYear';
import {
  getIsoCertificationOption,
  ISO_CERTIFICATION_OPTIONS,
} from '../../../../../lib/vendorSupplementaryEvaluationConfig';
import {
  getSupplementaryEvaluationSection,
  saveSupplementaryEvaluationSection,
} from '../../../../../lib/annualEvaluationSupplementary';

export default async function handler(req, res) {
  const { vendorcode } = req.query;
  if (!vendorcode) {
    return res.status(400).json({ error: 'vendorcode is required' });
  }

  const evaluationYear = getVendorEvaluationYear();

  try {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      const isoCertification = await getSupplementaryEvaluationSection(
        db,
        vendorcode,
        'isoCertification',
        evaluationYear
      );
      return res.status(200).json({
        evaluationYear,
        vendorcode: String(vendorcode),
        options: ISO_CERTIFICATION_OPTIONS,
        isoCertification,
      });
    }

    if (req.method === 'PUT') {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { selectionId } = req.body || {};
      const option = getIsoCertificationOption(selectionId);
      if (!option) {
        return res.status(400).json({ error: 'Valid ISO certification selection is required' });
      }

      const rankedBy = req.body?.rankedBy || session.user.name || session.user.email;
      const isoCertification = await saveSupplementaryEvaluationSection({
        db,
        vendorcode,
        fieldName: 'isoCertification',
        option,
        rankedBy,
        evaluationYear,
      });

      return res.status(200).json({
        success: true,
        evaluationYear,
        vendorcode: String(vendorcode),
        isoCertification,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('iso-certification evaluation error:', error);
    if (error.statusCode === 403) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
