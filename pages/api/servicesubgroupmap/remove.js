import { connectToDatabase } from '../../../lib/mongoconnect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { serviceCodes } = req.body;

    if (!Array.isArray(serviceCodes) || serviceCodes.length === 0) {
      return res.status(400).json({ error: 'At least one service code is required' });
    }

    const uniqueCodes = [...new Set(
      serviceCodes
        .map((code) => String(code || '').trim())
        .filter(Boolean)
    )];

    const result = await db.collection('servicesubgroupmap').deleteMany({
      serviceCode: { $in: uniqueCodes },
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No mappings found for the selected services' });
    }

    return res.status(200).json({
      message: `${result.deletedCount} mapping(s) removed successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error removing service mappings:', error);
    return res.status(500).json({ error: 'Failed to remove mappings' });
  }
}
