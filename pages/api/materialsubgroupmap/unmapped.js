import { connectToDatabase } from '../../../lib/mongoconnect';
import {
  MATERIAL_SORT_FIELDS,
  buildMaterialSearchMatch,
  buildMaterialSort,
  parsePositiveInt,
} from '../../../lib/materialSearchUtils';

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;

function buildQuery(mappedCodes, searchMatch) {
  const parts = [];

  if (mappedCodes.length > 0) {
    parts.push({ 'material-code': { $nin: mappedCodes } });
  }

  if (searchMatch) {
    parts.push(searchMatch);
  }

  if (parts.length === 0) {
    return {};
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return { $and: parts };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const page = parsePositiveInt(req.query.page, 1);
    const pageSize = Math.min(
      parsePositiveInt(req.query.pageSize, DEFAULT_PAGE_SIZE),
      MAX_PAGE_SIZE
    );
    const search = (req.query.str || req.query.search || '').trim();
    const sortBy = req.query.sortBy || 'material-code';
    const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
    const skip = (page - 1) * pageSize;

    const mappedCodes = await db.collection('materialsubgroupmap').distinct('materialCode');
    const searchMatch = buildMaterialSearchMatch(search);
    const query = buildQuery(mappedCodes, searchMatch);
    const sort = buildMaterialSort(sortBy, sortOrder, MATERIAL_SORT_FIELDS);

    const [materials, totalCount] = await Promise.all([
      db
        .collection('materials')
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      db.collection('materials').countDocuments(query),
    ]);

    const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

    return res.status(200).json({
      materials,
      page,
      pageSize,
      totalCount,
      totalPages,
      search: search || null,
      sortBy: MATERIAL_SORT_FIELDS[sortBy] ? sortBy : 'material-code',
      sortOrder,
    });
  } catch (error) {
    console.error('Error fetching unmapped materials:', error);
    return res.status(500).json({ error: 'Failed to fetch unmapped materials' });
  }
}
