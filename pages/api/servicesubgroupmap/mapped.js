import { connectToDatabase } from '../../../lib/mongoconnect';
import {
  SERVICE_MAPPED_SORT_FIELDS,
  buildServiceMappedSearchMatch,
  buildServiceSort,
  parsePositiveInt,
} from '../../../lib/serviceSearchUtils';

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;

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

    const searchMatch = buildServiceMappedSearchMatch(search);
    const sort = buildServiceSort(sortBy, sortOrder, SERVICE_MAPPED_SORT_FIELDS);

    const pipeline = [
      {
        $lookup: {
          from: 'services',
          localField: 'serviceCode',
          foreignField: 'serviceCode',
          as: 'service',
        },
      },
      { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'materialsubgroups',
          localField: 'subgroupId',
          foreignField: '_id',
          as: 'subgroup',
        },
      },
      { $unwind: { path: '$subgroup', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'materialgroups',
          localField: 'groupId',
          foreignField: '_id',
          as: 'group',
        },
      },
      { $unwind: { path: '$group', preserveNullAndEmptyArrays: true } },
      { $match: { 'group.isService': true } },
    ];

    if (searchMatch) {
      pipeline.push({ $match: searchMatch });
    }

    pipeline.push(
      { $sort: sort },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: pageSize },
            {
              $project: {
                _id: 1,
                serviceCode: 1,
                subgroupId: 1,
                groupId: 1,
                createdAt: 1,
                'service.serviceDescription': 1,
                'service.unitMeasure': 1,
                'subgroup.name': 1,
                'group.name': 1,
              },
            },
          ],
          meta: [{ $count: 'totalCount' }],
        },
      }
    );

    const [result] = await db.collection('servicesubgroupmap').aggregate(pipeline).toArray();
    const items = (result?.data || []).map((row) => ({
      mappingId: row._id,
      serviceCode: row.serviceCode,
      subgroupId: row.subgroupId,
      groupId: row.groupId,
      createdAt: row.createdAt,
      serviceDescription: row.service?.serviceDescription || '',
      unitMeasure: row.service?.unitMeasure || '',
      subgroupName: row.subgroup?.name || '',
      groupName: row.group?.name || '',
      mappedLabel: row.group?.name && row.subgroup?.name
        ? `${row.group.name} - ${row.subgroup.name}`
        : '',
    }));

    const totalCount = result?.meta?.[0]?.totalCount || 0;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

    return res.status(200).json({
      items,
      page,
      pageSize,
      totalCount,
      totalPages,
      search: search || null,
      sortBy: SERVICE_MAPPED_SORT_FIELDS[sortBy] ? sortBy : 'service-code',
      sortOrder,
    });
  } catch (error) {
    console.error('Error fetching mapped services:', error);
    return res.status(500).json({ error: 'Failed to fetch mapped services' });
  }
}
