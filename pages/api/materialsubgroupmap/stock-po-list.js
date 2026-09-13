import { connectToDatabase } from '../../../lib/mongoconnect';
import {
  getStockOpenPoMaterials,
  materialCodeQueryValues,
  normalizeMaterialCode,
  buildStockOpenPoSearchMatch,
  sortStockOpenPoMaterials,
  STOCK_OPEN_PO_SOURCE_FILE,
} from '../../../lib/stockOpenPoMaterials';
import {
  parsePositiveInt,
} from '../../../lib/materialSearchUtils';

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const search = (req.query.str || req.query.search || '').trim();
    const sortBy = req.query.sortBy || 'material-code';
    const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
    const unmappedOnly = req.query.unmappedOnly !== 'false';
    const page = parsePositiveInt(req.query.page, 1);
    const pageSize = Math.min(
      parsePositiveInt(req.query.pageSize, DEFAULT_PAGE_SIZE),
      MAX_PAGE_SIZE
    );

    const stockMaterials = getStockOpenPoMaterials();
    const codes = stockMaterials.map((item) => item.materialCode);
    const queryValues = materialCodeQueryValues(codes);

    const { db } = await connectToDatabase();

    const [masterMaterials, mappings, groups, subgroups] = await Promise.all([
      db
        .collection('materials')
        .find({ 'material-code': { $in: queryValues } })
        .toArray(),
      db
        .collection('materialsubgroupmap')
        .find({ materialCode: { $in: queryValues } })
        .toArray(),
      db.collection('materialgroups').find({}).toArray(),
      db.collection('materialsubgroups').find({}).toArray(),
    ]);

    const masterByCode = new Map(
      masterMaterials.map((m) => [normalizeMaterialCode(m['material-code']), m])
    );
    const mappingByCode = new Map(
      mappings.map((m) => [normalizeMaterialCode(m.materialCode), m])
    );
    const groupById = new Map(groups.map((g) => [String(g._id), g]));
    const subgroupById = new Map(subgroups.map((s) => [String(s._id), s]));

    let items = stockMaterials.map((excelItem) => {
      const master = masterByCode.get(excelItem.materialCode);
      const mapping = mappingByCode.get(excelItem.materialCode);
      const subgroup = mapping ? subgroupById.get(String(mapping.subgroupId)) : null;
      const group = mapping ? groupById.get(String(mapping.groupId)) : null;
      const mapped = Boolean(mapping);

      return {
        'material-code': excelItem.materialCode,
        'material-description':
          master?.['material-description'] || excelItem.description,
        'material-type':
          master?.['material-type'] || excelItem.sapMaterialType || '',
        'material-type-description': excelItem.sapMaterialTypeDescription || '',
        'material-group':
          master?.['material-group'] || excelItem.sapMaterialGroup || '',
        'material-group-description':
          excelItem.sapMaterialGroupDescription ||
          excelItem.hanaMaterialGroupDescription ||
          '',
        'unit-measure': master?.['unit-measure'] || excelItem.unitMeasure || '',
        inMaster: Boolean(master),
        mapped,
        mappedSubgroup: subgroup
          ? {
              id: subgroup._id,
              name: subgroup.name,
              groupName: group?.name || '',
              label: group?.name
                ? `${group.name} - ${subgroup.name}`
                : subgroup.name,
            }
          : mapped
            ? { id: mapping.subgroupId, name: '', groupName: '', label: 'Already mapped' }
            : null,
      };
    });

    const summary = {
      totalInList: stockMaterials.length,
      inMasterCount: items.filter((item) => item.inMaster).length,
      mappedCount: items.filter((item) => item.mapped).length,
      unmappedCount: items.filter((item) => item.inMaster && !item.mapped).length,
      missingFromMasterCount: items.filter((item) => !item.inMaster).length,
    };

    if (unmappedOnly) {
      items = items.filter((item) => item.inMaster && !item.mapped);
    }

    const searched = buildStockOpenPoSearchMatch(search, items);
    if (searched) {
      items = searched;
    }

    items = sortStockOpenPoMaterials(items, sortBy, sortOrder);

    const totalCount = items.length;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return res.status(200).json({
      materials: paged,
      page: safePage,
      pageSize,
      totalCount,
      totalPages,
      search: search || null,
      sortBy,
      sortOrder,
      unmappedOnly,
      summary,
      sourceFile: STOCK_OPEN_PO_SOURCE_FILE,
      collection: 'materialsubgroupmap',
    });
  } catch (error) {
    console.error('Error fetching stock and open PO materials:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch stock and open PO materials',
    });
  }
}
