import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { connectToDatabase } from '../../../../../lib/mongoconnect';
import { getVendorEvaluationYear } from '../../../../../lib/vendorEvaluationYear';
import {
  getPaymentTermsOption,
  PAYMENT_TERMS_OPTIONS,
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
      const paymentTerms = await getSupplementaryEvaluationSection(
        db,
        vendorcode,
        'paymentTerms',
        evaluationYear
      );
      return res.status(200).json({
        evaluationYear,
        vendorcode: String(vendorcode),
        options: PAYMENT_TERMS_OPTIONS,
        paymentTerms,
      });
    }

    if (req.method === 'PUT') {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { selectionId } = req.body || {};
      const option = getPaymentTermsOption(selectionId);
      if (!option) {
        return res.status(400).json({ error: 'Valid payment terms selection is required' });
      }

      const rankedBy = req.body?.rankedBy || session.user.name || session.user.email;
      const paymentTerms = await saveSupplementaryEvaluationSection({
        db,
        vendorcode,
        fieldName: 'paymentTerms',
        option,
        rankedBy,
        evaluationYear,
      });

      return res.status(200).json({
        success: true,
        evaluationYear,
        vendorcode: String(vendorcode),
        paymentTerms,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('payment-terms evaluation error:', error);
    if (error.statusCode === 403) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
