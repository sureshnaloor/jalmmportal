import { connectToDatabase } from '../../../lib/mongoconnect';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { vendorCode, subgroupId } = req.body;

    if (!vendorCode || !subgroupId) {
      return res.status(400).json({ error: 'Vendor code and subgroup ID are required' });
    }

    // Check if mapping already exists
    const existingMapping = await db.collection('vendorgroupmap')
      .findOne({
        vendorCode: vendorCode,
        subgroupId: new ObjectId(subgroupId)
      });

    if (existingMapping) {
      return res.status(400).json({ error: 'This vendor is already mapped to this subgroup' });
    }

    // Create new mapping
    const mapping = {
      vendorCode: vendorCode,
      subgroupId: new ObjectId(subgroupId),
      createdAt: new Date()
    };

    const result = await db.collection('vendorgroupmap').insertOne(mapping);

    return res.status(201).json({
      message: 'Vendor mapped successfully',
      mappingId: result.insertedId
    });
  } catch (error) {
    console.error('Error adding vendor mapping:', error);
    return res.status(500).json({ error: 'Failed to map vendor' });
  }
}

