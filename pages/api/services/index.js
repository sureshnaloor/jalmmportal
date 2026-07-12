import { connectToDatabase } from '../../../lib/mongoconnect';

const MAX_UPLOAD_ROWS = 10000;

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
      const [totalCount, recentServices] = await Promise.all([
        db.collection('services').countDocuments(),
        db
          .collection('services')
          .find({})
          .sort({ updatedAt: -1 })
          .limit(limit)
          .project({ serviceCode: 1, serviceDescription: 1, unitMeasure: 1, updatedAt: 1 })
          .toArray(),
      ]);

      const mappedCount = await db.collection('servicesubgroupmap').countDocuments();

      return res.status(200).json({
        totalCount,
        mappedCount,
        unmappedCount: Math.max(totalCount - mappedCount, 0),
        recentServices,
      });
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
        const serviceCode = String(record.serviceCode ?? record['service-code'] ?? '').trim();
        const serviceDescription = String(
          record.serviceDescription ?? record['service-description'] ?? ''
        ).trim();
        const unitMeasure = String(record.unitMeasure ?? record['unit-measure'] ?? '').trim();

        if (!serviceCode || !serviceDescription) {
          continue;
        }

        ops.push({
          updateOne: {
            filter: { serviceCode },
            update: {
              $set: {
                serviceCode,
                serviceDescription,
                unitMeasure,
                updatedAt: now,
              },
              $setOnInsert: {
                createdAt: now,
              },
            },
            upsert: true,
          },
        });
      }

      if (ops.length === 0) {
        return res.status(400).json({ error: 'No valid service records found in upload' });
      }

      const result = await db.collection('services').bulkWrite(ops, { ordered: false });

      return res.status(200).json({
        success: true,
        upserted: result.upsertedCount || 0,
        modified: result.modifiedCount || 0,
        total: ops.length,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('services API error:', error);
    return res.status(500).json({ error: 'Failed to process services' });
  }
}
