import { connectToDatabase } from '../../../lib/mongoconnect';

/**
 * GET: Return one document from vendoraddress collection for the given vendor code.
 * Collection fields: _id, vendorcode, vendor-accountperson, email1, email2, email3, email4, email5 (any can be null).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vendorcode } = req.query;
    if (!vendorcode) {
      return res.status(400).json({ error: 'Vendor code is required' });
    }

    const { db } = await connectToDatabase();
    const code = String(vendorcode).trim();

    const doc = await db.collection('vendoraddress').findOne({
      $or: [
        { vendorcode: code },
        { vendorcode: Number(code) },
      ],
    });

    return res.status(200).json(doc || null);
  } catch (err) {
    console.error('vendoraddress API error:', err);
    return res.status(500).json({ error: 'Failed to fetch vendor address' });
  }
}
