import { connectToDatabase } from '../../../lib/mongoconnect';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { subgroupId, vendorCode, isUnregistered } = req.method === 'POST' ? req.body : req.query;

    if (!subgroupId || !vendorCode) {
      return res.status(400).json({ error: 'Subgroup ID and vendor code (or vendor name) are required' });
    }

    const subgroupObjectId = new ObjectId(subgroupId);

    if (isUnregistered) {
      // Remove from unregisteredvendorgroupmap (keyed by vendor-name)
      const result = await db.collection('unregisteredvendorgroupmap').deleteOne({
        'vendor-name': vendorCode,
        subgroupId: subgroupObjectId
      });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Unregistered vendor mapping not found' });
      }
    } else {
      // Remove from vendorgroupmap (keyed by vendorCode)
      const result = await db.collection('vendorgroupmap').deleteOne({
        vendorCode: vendorCode,
        subgroupId: subgroupObjectId
      });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Vendor mapping not found' });
      }
    }

    return res.status(200).json({ message: 'Vendor removed from subgroup mapping' });
  } catch (error) {
    console.error('Error removing vendor mapping:', error);
    return res.status(500).json({ error: 'Failed to remove vendor mapping' });
  }
}
