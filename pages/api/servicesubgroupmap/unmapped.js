import { connectToDatabase } from '../../../lib/mongoconnect';
import {
  SERVICE_SORT_FIELDS,
  buildServiceSearchMatch,
  buildServiceSort,
  parsePositiveInt,
} from '../../../lib/serviceSearchUtils';

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;

function buildQuery(mappedCodes, searchMatch) {
  const parts = [];

  if (mappedCodes.length > 0) {
    parts.push({ serviceCode: { $nin: mappedCodes } });
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
    const sortBy = req.query.sortBy || 'service-code';
    const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
    const skip = (page - 1) * pageSize;

    const mappedCodes = await db.collection('servicesubgroupmap').distinct('serviceCode');
    const searchMatch = buildServiceSearchMatch(search);
    const query = buildQuery(mappedCodes, searchMatch);
    const sort = buildServiceSort(sortBy, sortOrder, SERVICE_SORT_FIELDS);

    const [services, totalCount] = await Promise.all([
      db.collection('services').find(query).sort(sort).skip(skip).limit(pageSize).toArray(),
      db.collection('services').countDocuments(query),
    ]);

    const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

    return res.status(200).json({
      services,
      page,
      pageSize,
      totalCount,
      totalPages,
      search: search || null,
      sortBy: SERVICE_SORT_FIELDS[sortBy] ? sortBy : 'service-code',
      sortOrder,
    });
  } catch (error) {
    console.error('Error fetching unmapped services:', error);
    return res.status(500).json({ error: 'Failed to fetch unmapped services' });
  }
}
