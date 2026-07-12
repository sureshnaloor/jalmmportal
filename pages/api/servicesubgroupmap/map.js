import { connectToDatabase } from '../../../lib/mongoconnect';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { serviceCodes, subgroupId } = req.body;

    if (!subgroupId || !ObjectId.isValid(subgroupId)) {
      return res.status(400).json({ error: 'Valid subgroup ID is required' });
    }

    if (!Array.isArray(serviceCodes) || serviceCodes.length === 0) {
      return res.status(400).json({ error: 'At least one service code is required' });
    }

    const uniqueCodes = [...new Set(
      serviceCodes
        .map((code) => String(code || '').trim())
        .filter(Boolean)
    )];

    const subgroupObjectId = new ObjectId(subgroupId);
    const subgroup = await db.collection('materialsubgroups').findOne({ _id: subgroupObjectId });

    if (!subgroup) {
      return res.status(404).json({ error: 'Subgroup not found' });
    }

    const group = await db.collection('materialgroups').findOne({ _id: subgroup.groupId });

    if (!group) {
      return res.status(404).json({ error: 'Parent group not found' });
    }

    if (!group.isService) {
      return res.status(400).json({ error: 'Only service subgroups can be used for service mapping' });
    }

    const existingServices = await db
      .collection('services')
      .find({ serviceCode: { $in: uniqueCodes } })
      .project({ serviceCode: 1 })
      .toArray();

    const validCodes = new Set(existingServices.map((s) => s.serviceCode));
    const codesToMap = uniqueCodes.filter((code) => validCodes.has(code));

    if (codesToMap.length === 0) {
      return res.status(400).json({ error: 'None of the provided service codes exist' });
    }

    const existingMappings = await db
      .collection('servicesubgroupmap')
      .find({ serviceCode: { $in: codesToMap } })
      .project({ serviceCode: 1 })
      .toArray();

    const alreadyMapped = new Set(existingMappings.map((m) => m.serviceCode));
    const newCodes = codesToMap.filter((code) => !alreadyMapped.has(code));

    if (newCodes.length === 0) {
      return res.status(400).json({ error: 'All selected services are already mapped' });
    }

    const now = new Date();
    const mappings = newCodes.map((serviceCode) => ({
      serviceCode,
      subgroupId: subgroupObjectId,
      groupId: subgroup.groupId,
      createdAt: now,
    }));

    const result = await db.collection('servicesubgroupmap').insertMany(mappings);

    return res.status(201).json({
      message: `${newCodes.length} service(s) mapped successfully`,
      mappedCount: newCodes.length,
      skippedCount: uniqueCodes.length - newCodes.length,
      subgroup: {
        id: subgroup._id,
        name: subgroup.name,
        groupName: group.name,
      },
      insertedIds: Object.values(result.insertedIds),
    });
  } catch (error) {
    console.error('Error mapping services to subgroup:', error);
    return res.status(500).json({ error: 'Failed to map services' });
  }
}
