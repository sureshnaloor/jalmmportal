import { connectToDatabase } from '../../../lib/mongoconnect';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  switch (req.method) {
    case 'GET':
      try {
        // Fetch only groups without subgroups for better performance
        const groups = await db.collection('materialgroups')
          .find({})
          .sort({ name: 1 })
          .toArray();

        return res.status(200).json(groups);
      } catch (error) {
        console.error('Error fetching groups:', error);
        return res.status(500).json({ error: 'Failed to fetch groups' });
      }

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}
