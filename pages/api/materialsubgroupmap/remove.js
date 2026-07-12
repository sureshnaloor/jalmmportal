import { connectToDatabase } from '../../../lib/mongoconnect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { materialCodes } = req.body;

    if (!Array.isArray(materialCodes) || materialCodes.length === 0) {
      return res.status(400).json({ error: 'At least one material code is required' });
    }

    const uniqueCodes = [...new Set(
      materialCodes
        .map((code) => String(code || '').trim())
        .filter(Boolean)
    )];

    const result = await db.collection('materialsubgroupmap').deleteMany({
      materialCode: { $in: uniqueCodes },
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No mappings found for the selected materials' });
    }

    return res.status(200).json({
      message: `${result.deletedCount} mapping(s) removed successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error removing material mappings:', error);
    return res.status(500).json({ error: 'Failed to remove mappings' });
  }
}
