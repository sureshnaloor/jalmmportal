import { connectToDatabase } from '../../../../lib/mongoconnect';
import { vendorCodeLowerFilter } from '../../../../lib/vendorCodeUtils';

const EDITABLE_FIELDS = [
  'vendor-accountperson',
  'email1',
  'email2',
  'email3',
  'email4',
  'email5',
  'street',
  'address1',
  'address2',
  'district',
  'city',
  'pobox',
  'zipcode',
  'countrycode',
];

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vendorcode } = req.query;
    if (!vendorcode) {
      return res.status(400).json({ error: 'Vendor code is required' });
    }

    const { data, username } = req.body || {};
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Address data is required' });
    }

    const { db } = await connectToDatabase();
    const now = new Date();
    const editor = username || 'admin';
    const code = String(vendorcode).replace(/\s+/g, '');
    const filter = vendorCodeLowerFilter(vendorcode);

    const payload = { vendorcode: code };
    EDITABLE_FIELDS.forEach((field) => {
      if (data[field] !== undefined) {
        payload[field] = data[field] == null ? '' : String(data[field]).trim();
      }
    });

    if (Array.isArray(data.salespersons)) {
      payload.salespersons = data.salespersons
        .map((person) => ({
          name: String(person?.name || '').trim(),
          email: String(person?.email || '').trim(),
          mobile: String(person?.mobile || '').trim(),
          landline: String(person?.landline || '').trim(),
          remarks: String(person?.remarks || '').trim(),
        }))
        .filter(
          (person) =>
            person.name || person.email || person.mobile || person.landline || person.remarks
        );
    }

    payload.updated_at = now;
    payload.updated_by = editor;

    const existing = await db.collection('vendoraddress').findOne(filter);

    if (existing) {
      await db.collection('vendoraddress').updateOne(filter, { $set: payload });
    } else {
      await db.collection('vendoraddress').insertOne({
        ...payload,
        created_at: now,
        created_by: editor,
      });
    }

    const saved = await db.collection('vendoraddress').findOne(filter);
    const { _id, ...rest } = saved || {};

    return res.status(200).json({
      message: 'Vendor address record updated successfully',
      data: { ...rest, _id: _id?.toString?.() },
      updated_at: now,
      updated_by: editor,
    });
  } catch (error) {
    console.error('Error updating vendoraddress:', error);
    return res.status(500).json({ error: 'Failed to update vendor address record' });
  }
}
