import { connectToDatabase } from '../../../lib/mongoconnect';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { materialCodes, subgroupId } = req.body;

    if (!subgroupId || !ObjectId.isValid(subgroupId)) {
      return res.status(400).json({ error: 'Valid subgroup ID is required' });
    }

    if (!Array.isArray(materialCodes) || materialCodes.length === 0) {
      return res.status(400).json({ error: 'At least one material code is required' });
    }

    const uniqueCodes = [...new Set(
      materialCodes
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

    if (group.isService) {
      return res.status(400).json({ error: 'Service subgroups cannot be used for material mapping' });
    }

    const result = await db.collection('materialsubgroupmap').updateMany(
      { materialCode: { $in: uniqueCodes } },
      {
        $set: {
          subgroupId: subgroupObjectId,
          groupId: subgroup.groupId,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'No existing mappings found for the selected materials' });
    }

    return res.status(200).json({
      message: `${result.modifiedCount} mapping(s) updated successfully`,
      updatedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
      subgroup: {
        id: subgroup._id,
        name: subgroup.name,
        groupName: group.name,
      },
    });
  } catch (error) {
    console.error('Error updating material mappings:', error);
    return res.status(500).json({ error: 'Failed to update mappings' });
  }
}
