import { connectToDatabase } from '../../../../lib/mongoconnect';
import { vendorCodeHyphenFilter } from '../../../../lib/vendorCodeUtils';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vendorcode } = req.query;
    if (!vendorcode) {
      return res.status(400).json({ error: 'Vendor code is required' });
    }

    const { contactInfo, vendorName, username } = req.body || {};
    const trimmedInfo = typeof contactInfo === 'string' ? contactInfo.trim() : '';

    const { db } = await connectToDatabase();
    const now = new Date();
    const editor = username || 'admin';
    const filter = vendorCodeHyphenFilter(vendorcode);

    const existing = await db.collection('vendorsdata').findOne(filter);

    if (existing) {
      await db.collection('vendorsdata').updateOne(filter, {
        $set: {
          'contact-info': trimmedInfo,
          updated_at: now,
          updated_by: editor,
        },
      });
    } else {
      const code = String(vendorcode).replace(/\s+/g, '');
      await db.collection('vendorsdata').insertOne({
        'vendor-code': code,
        'vendor-name': vendorName || '',
        'contact-info': trimmedInfo,
        created_at: now,
        updated_at: now,
        updated_by: editor,
        created_by: editor,
      });
    }

    return res.status(200).json({
      message: 'Contact info updated successfully',
      contactInfo: trimmedInfo,
      updated_at: now,
      updated_by: editor,
    });
  } catch (error) {
    console.error('Error updating vendorsdata contact-info:', error);
    return res.status(500).json({ error: 'Failed to update contact info' });
  }
}
