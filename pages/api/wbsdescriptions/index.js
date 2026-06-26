import { connectToDatabase } from '../../../lib/mongoconnect';
import { normalizeWbsNumber } from '../../../lib/wbsDescriptions';

const MAX_UPLOAD_ROWS = 10000;

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      const search = String(req.query.search || '').trim();
      const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

      const filter = search
        ? {
            $or: [
              { 'wbs-number': { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
              { 'wbs-description': { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
            ],
          }
        : {};

      const [totalCount, records] = await Promise.all([
        db.collection('wbsdescriptions').countDocuments(filter),
        db
          .collection('wbsdescriptions')
          .find(filter)
          .sort({ 'wbs-number': 1 })
          .limit(limit)
          .project({ 'wbs-number': 1, 'wbs-description': 1, 'updated-at': 1 })
          .toArray(),
      ]);

      return res.json({ totalCount, records });
    }

    if (req.method === 'POST') {
      const { records } = req.body || {};

      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ error: 'No records provided' });
      }

      if (records.length > MAX_UPLOAD_ROWS) {
        return res.status(400).json({ error: `Maximum ${MAX_UPLOAD_ROWS} rows allowed per upload` });
      }

      const now = new Date();
      const ops = [];

      for (const record of records) {
        const wbsNumber = normalizeWbsNumber(record.wbsNumber ?? record['wbs-number']);
        const wbsDescription = String(record.wbsDescription ?? record['wbs-description'] ?? '').trim();

        if (!wbsNumber) continue;

        ops.push({
          updateOne: {
            filter: { 'wbs-number': wbsNumber },
            update: {
              $set: {
                'wbs-number': wbsNumber,
                'wbs-description': wbsDescription,
                'updated-at': now,
              },
            },
            upsert: true,
          },
        });
      }

      if (ops.length === 0) {
        return res.status(400).json({ error: 'No valid WBS numbers found in upload' });
      }

      const result = await db.collection('wbsdescriptions').bulkWrite(ops, { ordered: false });

      return res.json({
        success: true,
        upserted: result.upsertedCount || 0,
        modified: result.modifiedCount || 0,
        total: ops.length,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('wbsdescriptions API error:', error);
    return res.status(500).json({ error: 'Failed to process WBS descriptions' });
  }
}
