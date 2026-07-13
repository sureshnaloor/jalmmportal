import { connectToDatabase } from '../../../../lib/mongoconnect';
import { vendorCodeHyphenFilter, vendorCodeVariants } from '../../../../lib/vendorCodeUtils';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vendorcode } = req.query;
    if (!vendorcode) {
      return res.status(400).json({ error: 'Vendor code is required' });
    }

    const {
      telephone1,
      telephone2,
      fax,
      salesname,
      salesemail,
      salesmobile,
      username,
    } = req.body || {};

    const contact = {
      telephone1: telephone1 ?? '',
      telephone2: telephone2 ?? '',
      fax: fax ?? '',
      salesname: salesname ?? '',
      salesemail: salesemail ?? '',
      salesmobile: salesmobile ?? '',
    };

    const { db } = await connectToDatabase();
    const now = new Date();
    const editor = username || 'admin';
    const meta = { updated_at: now, updated_by: editor };
    const codes = vendorCodeVariants(vendorcode);

    const [vendorsResult, registeredResult] = await Promise.all([
      db.collection('vendors').updateOne(
        vendorCodeHyphenFilter(vendorcode),
        { $set: { contact, ...meta } }
      ),
      db.collection('registeredvendors').updateOne(
        { vendorcode: { $in: codes } },
        { $set: { contact, updatedAt: now, updatedBy: editor } }
      ),
    ]);

    if (vendorsResult.matchedCount === 0 && registeredResult.matchedCount === 0) {
      const code = String(vendorcode).replace(/\s+/g, '');
      await db.collection('vendors').insertOne({
        'vendor-code': code,
        'vendor-name': req.body?.vendorName || '',
        contact,
        ...meta,
        created_at: now,
        created_by: editor,
      });
    }

    return res.status(200).json({
      message: 'Vendor contact updated successfully',
      contact,
      updated_at: now,
      updated_by: editor,
    });
  } catch (error) {
    console.error('Error updating vendors contact:', error);
    return res.status(500).json({ error: 'Failed to update vendor contact' });
  }
}
