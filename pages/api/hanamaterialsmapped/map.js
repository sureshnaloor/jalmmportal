import { connectToDatabase } from '../../../lib/mongoconnect';
import { ObjectId } from 'mongodb';
import { getHanaSelectedMaterialCodes } from '../../../lib/hanaSelectedMaterials';
import { HANA_MATERIALS_MAPPED_COLLECTION } from '../../../lib/hanaMaterialsMappedConfig';

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

    const uniqueCodes = [
      ...new Set(
        materialCodes
          .map((code) => String(code || '').trim())
          .filter(Boolean)
      ),
    ];

    if (uniqueCodes.length === 0) {
      return res.status(400).json({ error: 'At least one valid material code is required' });
    }

    const hanaCodeSet = new Set(getHanaSelectedMaterialCodes());
    const hanaCodes = uniqueCodes.filter((code) => hanaCodeSet.has(code));

    if (hanaCodes.length === 0) {
      return res.status(400).json({ error: 'None of the provided material codes are in the HANA selection list' });
    }

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

    const existingMaterials = await db
      .collection('materials')
      .find({ 'material-code': { $in: hanaCodes } })
      .project({ 'material-code': 1 })
      .toArray();

    const validCodes = new Set(existingMaterials.map((m) => m['material-code']));
    const codesToMap = hanaCodes.filter((code) => validCodes.has(code));

    if (codesToMap.length === 0) {
      return res.status(400).json({ error: 'None of the provided material codes exist in the material master' });
    }

    const existingMappings = await db
      .collection(HANA_MATERIALS_MAPPED_COLLECTION)
      .find({ materialCode: { $in: codesToMap } })
      .project({ materialCode: 1 })
      .toArray();

    const alreadyMapped = new Set(existingMappings.map((m) => m.materialCode));
    const newCodes = codesToMap.filter((code) => !alreadyMapped.has(code));

    if (newCodes.length === 0) {
      return res.status(400).json({ error: 'All selected materials are already mapped in HANA mappings' });
    }

    const now = new Date();
    const mappings = newCodes.map((materialCode) => ({
      materialCode,
      subgroupId: subgroupObjectId,
      groupId: subgroup.groupId,
      createdAt: now,
    }));

    const result = await db.collection(HANA_MATERIALS_MAPPED_COLLECTION).insertMany(mappings);

    return res.status(201).json({
      message: `${newCodes.length} HANA material(s) mapped successfully`,
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
    console.error('Error mapping HANA materials to subgroup:', error);
    return res.status(500).json({ error: 'Failed to map HANA materials' });
  }
}
