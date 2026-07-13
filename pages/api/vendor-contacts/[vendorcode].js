import { connectToDatabase } from '../../../lib/mongoconnect';
import { vendorCodeHyphenFilter, vendorCodeLowerFilter } from '../../../lib/vendorCodeUtils';

function stripMeta(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { ...rest, _id: _id?.toString?.() };
}

function metaFromDoc(doc) {
  if (!doc) return { updated_at: null, updated_by: null };
  return {
    updated_at: doc.updated_at || doc.updatedAt || null,
    updated_by: doc.updated_by || doc.updatedBy || null,
  };
}

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
    const hyphenFilter = vendorCodeHyphenFilter(vendorcode);
    const lowerFilter = vendorCodeLowerFilter(vendorcode);

    const [vendorDoc, vendorsDataDoc, vendorAddressDoc] = await Promise.all([
      db.collection('vendors').findOne(hyphenFilter),
      db.collection('vendorsdata').findOne(hyphenFilter),
      db.collection('vendoraddress').findOne(lowerFilter),
    ]);

    const vendorName =
      vendorDoc?.['vendor-name'] ||
      vendorsDataDoc?.['vendor-name'] ||
      vendorsDataDoc?.vendorName ||
      null;

    const contact = vendorDoc?.contact || null;
    const contactMeta = metaFromDoc(vendorDoc);

    const contactInfo =
      vendorsDataDoc?.['contact-info'] ??
      vendorsDataDoc?.contactInfo ??
      vendorsDataDoc?.contact_info ??
      null;
    const vendorsDataMeta = metaFromDoc(vendorsDataDoc);

    return res.status(200).json({
      vendorCode: String(vendorcode).trim(),
      vendorName,
      vendorsContact: {
        exists: !!vendorDoc,
        data: contact,
        updated_at: contactMeta.updated_at,
        updated_by: contactMeta.updated_by,
      },
      vendorsDataContactInfo: {
        exists: !!vendorsDataDoc,
        data: contactInfo,
        updated_at: vendorsDataMeta.updated_at,
        updated_by: vendorsDataMeta.updated_by,
      },
      vendorAddress: {
        exists: !!vendorAddressDoc,
        data: vendorAddressDoc ? stripMeta(vendorAddressDoc) : null,
        updated_at: vendorAddressDoc?.updated_at || vendorAddressDoc?.updatedAt || null,
        updated_by: vendorAddressDoc?.updated_by || vendorAddressDoc?.updatedBy || null,
      },
    });
  } catch (error) {
    console.error('Error fetching vendor contacts:', error);
    return res.status(500).json({ error: 'Failed to fetch vendor contact data' });
  }
}
