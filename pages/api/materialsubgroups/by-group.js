import { connectToDatabase } from '../../../lib/mongoconnect';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  switch (req.method) {
    case 'GET':
      try {
        const { groupId } = req.query;
        
        if (!groupId) {
          return res.status(400).json({ error: 'Group ID is required' });
        }

        console.log('Fetching subgroups for group ID:', groupId);

        const subgroups = await db.collection('materialsubgroups')
          .find({ groupId: new ObjectId(groupId) })
          .sort({ name: 1 })
          .toArray();

        console.log(`Found ${subgroups.length} subgroups for group ${groupId}`);

        return res.status(200).json(subgroups);
      } catch (error) {
        console.error('Error fetching subgroups by group:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch subgroups',
          details: error.message 
        });
      }

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}
