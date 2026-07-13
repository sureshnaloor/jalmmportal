import { connectToDatabase } from '../../../lib/mongoconnect';
import {
  getHanaSelectedMaterials,
  buildHanaMaterialSearchMatch,
  sortHanaMaterials,
} from '../../../lib/hanaSelectedMaterials';
import { HANA_MATERIALS_MAPPED_COLLECTION } from '../../../lib/hanaMaterialsMappedConfig';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const search = (req.query.str || req.query.search || '').trim();
    const sortBy = req.query.sortBy || 'material-code';
    const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
    const unmappedOnly = req.query.unmappedOnly !== 'false';
    const inMasterOnly = req.query.inMasterOnly !== 'false';

    const hanaMaterials = getHanaSelectedMaterials();
    const hanaCodes = hanaMaterials.map((item) => item.materialCode);

    const { db } = await connectToDatabase();

    const [masterMaterials, mappings, groups, subgroups] = await Promise.all([
      db
        .collection('materials')
        .find({ 'material-code': { $in: hanaCodes } })
        .toArray(),
      db.collection(HANA_MATERIALS_MAPPED_COLLECTION).find({ materialCode: { $in: hanaCodes } }).toArray(),
      db.collection('materialgroups').find({}).toArray(),
      db.collection('materialsubgroups').find({}).toArray(),
    ]);

    const masterByCode = new Map(masterMaterials.map((m) => [m['material-code'], m]));
    const mappingByCode = new Map(mappings.map((m) => [m.materialCode, m]));
    const groupById = new Map(groups.map((g) => [String(g._id), g]));
    const subgroupById = new Map(subgroups.map((s) => [String(s._id), s]));

    let items = hanaMaterials.map((hanaItem) => {
      const master = masterByCode.get(hanaItem.materialCode);
      const mapping = mappingByCode.get(hanaItem.materialCode);
      const subgroup = mapping ? subgroupById.get(String(mapping.subgroupId)) : null;
      const group = mapping ? groupById.get(String(mapping.groupId)) : null;

      return {
        'material-code': hanaItem.materialCode,
        'material-description': master?.['material-description'] || hanaItem.description,
        'material-type': hanaItem.sapMaterialType || master?.['material-type'] || '',
        'material-group': hanaItem.sapMaterialGroup || master?.['material-group'] || '',
        'unit-measure': master?.['unit-measure'] || hanaItem.unitMeasure || '',
        inMaster: Boolean(master),
        mapped: Boolean(mapping),
        mappedSubgroup: subgroup
          ? {
              id: subgroup._id,
              name: subgroup.name,
              groupName: group?.name || '',
              label: group?.name ? `${group.name} - ${subgroup.name}` : subgroup.name,
            }
          : null,
      };
    });

    if (unmappedOnly) {
      items = items.filter((item) => item.inMaster && !item.mapped);
    }

    if (inMasterOnly) {
      items = items.filter((item) => item.inMaster);
    }

    const searched = buildHanaMaterialSearchMatch(search, items);
    if (searched) {
      items = searched;
    }

    items = sortHanaMaterials(items, sortBy, sortOrder);

    const totalCount = items.length;

    const summary = {
      totalInList: hanaMaterials.length,
      inMasterCount: hanaMaterials.filter((item) => masterByCode.has(item.materialCode)).length,
      mappedCount: mappings.length,
      unmappedCount: hanaMaterials.filter(
        (item) => masterByCode.has(item.materialCode) && !mappingByCode.has(item.materialCode)
      ).length,
      missingFromMasterCount: hanaMaterials.filter((item) => !masterByCode.has(item.materialCode)).length,
    };

    return res.status(200).json({
      materials: items,
      totalCount,
      search: search || null,
      sortBy,
      sortOrder,
      unmappedOnly,
      inMasterOnly,
      summary,
      sourceFile: 'Selected Materials and suppliers for dev HANA.xlsx',
      collection: HANA_MATERIALS_MAPPED_COLLECTION,
    });
  } catch (error) {
    console.error('Error fetching HANA selected materials:', error);
    return res.status(500).json({ error: 'Failed to fetch HANA selected materials' });
  }
}
