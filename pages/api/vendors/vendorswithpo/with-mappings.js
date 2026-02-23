import { connectToDatabase } from '../../../../lib/mongoconnect';
import { ObjectId } from 'mongodb';

/**
 * GET: Returns vendors who have at least one PO, with their mapped
 * material/service group-subgroup labels for display.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();

    // 1. Vendors with at least one PO
    const vendorList = await db.collection('vendorsandtheirpo').aggregate([
      { $match: { vendorpo: { $not: { $size: 0 } } } },
      { $project: { 'vendor-code': 1, 'vendor-name': 1 } }
    ]).toArray();

    // 2. Groups with subgroups for resolving subgroupId -> label
    const groups = await db.collection('materialgroups').find({}).sort({ name: 1 }).toArray();
    const subgroupIdToInfo = new Map();
    for (const group of groups) {
      const subgroups = await db.collection('materialsubgroups')
        .find({ groupId: group._id })
        .sort({ name: 1 })
        .toArray();
      for (const subgroup of subgroups) {
        subgroupIdToInfo.set(String(subgroup._id), {
          groupName: group.name,
          subgroupName: subgroup.name,
          isService: !!group.isService
        });
      }
    }

    // 3. vendorgroupmap (SAP vendor code) and unregisteredvendorgroupmap (vendor name, no SAP code)
    const allMappings = await db.collection('vendorgroupmap').find({}).toArray();
    const unregisteredMappings = await db.collection('unregisteredvendorgroupmap').find({}).toArray();

    // 4. By vendorCode (SAP) and by vendor-name (unregistered); legacy: name stored in vendorgroupmap.vendorCode
    const mappingsByVendor = new Map();
    for (const m of allMappings) {
      const code = m.vendorCode;
      if (!mappingsByVendor.has(code)) mappingsByVendor.set(code, []);
      const info = subgroupIdToInfo.get(String(m.subgroupId));
      if (info) mappingsByVendor.get(code).push(info);
    }
    const mappingsByVendorName = new Map();
    for (const m of unregisteredMappings) {
      const name = (m['vendor-name'] || '').trim();
      if (!name) continue;
      if (!mappingsByVendorName.has(name)) mappingsByVendorName.set(name, []);
      const info = subgroupIdToInfo.get(String(m.subgroupId));
      if (info) mappingsByVendorName.get(name).push(info);
    }

    // 5. Use unregistered when no real SAP code (empty or code === name). Prefer unregistered collection, fallback to legacy vendorgroupmap by name.
    const result = vendorList.map((v) => {
      const code = v['vendor-code'];
      const name = (v['vendor-name'] || '').trim();
      const codeStr = code != null ? String(code).trim() : '';
      const isUnregistered = codeStr === '' || codeStr === name;
      const mappings = isUnregistered
        ? (mappingsByVendorName.get(name) || mappingsByVendor.get(name) || [])
        : (mappingsByVendor.get(code) || []);
      return {
        'vendor-code': code,
        'vendor-name': v['vendor-name'] || '',
        mappings
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in vendorswithpo/with-mappings:', error);
    return res.status(500).json({ error: 'Failed to fetch vendors with mappings' });
  }
}
