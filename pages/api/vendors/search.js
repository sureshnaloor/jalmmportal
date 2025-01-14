import { connectToDatabase } from '../../../lib/mongoconnect';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const { db } = await connectToDatabase();

    // Create a case-insensitive search regex
    const searchRegex = new RegExp(term, 'i');

    const vendors = await db.collection('vendors')
      .find({
        $or: [
          { 'vendor-name': searchRegex },
          
        ]
      })
      .limit(10) // Limit results to prevent overwhelming the UI
      .project({
        'vendor-name': 1,
        'vendor-code': 1,
        _id: 0
      })
      .toArray();

    return res.status(200).json(vendors);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Failed to search vendors' });
  }
} 