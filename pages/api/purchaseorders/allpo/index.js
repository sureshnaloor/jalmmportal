import { connectToDatabase } from '../../../../lib/mongoconnect';

const EXCLUDED_PO_PREFIXES = ['47', '71', '91'];
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;
const OPEN_VALUE_THRESHOLD = 10;

function parsePositiveInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function buildGroupedPipeline({ search, skip, limit }) {
  const pipeline = [
    {
      $match: {
        $expr: {
          $not: {
            $in: [{ $substr: [{ $toString: '$po-number' }, 0, 2] }, EXCLUDED_PO_PREFIXES],
          },
        },
      },
    },
    {
      $group: {
        _id: {
          'po-number': '$po-number',
          plant: '$plant-code',
          vendorcode: '$vendorcode',
          vendorname: '$vendorname',
        },
        'po-date': { $first: '$po-date' },
        'delivery-date': { $first: '$delivery-date' },
        openvalue: { $sum: { $ifNull: ['$pending-val-sar', 0] } },
        povalue: { $sum: { $ifNull: ['$po-value-sar', 0] } },
      },
    },
  ];

  if (search) {
    pipeline.push({
      $match: {
        '_id.po-number': { $regex: search, $options: 'i' },
      },
    });
  }

  pipeline.push({ $sort: { 'po-date': -1 } });

  pipeline.push({
    $facet: {
      data: [
        { $skip: skip },
        { $limit: limit },
        {
          $addFields: {
            status: {
              $cond: [{ $gt: ['$openvalue', OPEN_VALUE_THRESHOLD] }, 'Open', 'Closed'],
            },
          },
        },
      ],
      meta: [{ $count: 'totalCount' }],
    },
  });

  return pipeline;
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
    const search = (req.query.search || '').trim();
    const skip = (page - 1) * pageSize;

    const [result] = await db
      .collection('purchaseorders')
      .aggregate(buildGroupedPipeline({ search, skip, limit: pageSize }))
      .toArray();

    const items = result?.data || [];
    const totalCount = result?.meta?.[0]?.totalCount || 0;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

    return res.status(200).json({
      items,
      page,
      pageSize,
      totalCount,
      totalPages,
      search: search || null,
    });
  } catch (error) {
    console.error('All PO list error:', error);
    return res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
}
