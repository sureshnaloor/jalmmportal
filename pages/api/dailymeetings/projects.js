import { connectToDatabase } from '../../../lib/mongoconnect';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const searchTerm = req.query.str || '';
      
      // Filter: created-date > 01-jan-2020, project-name starts with ED or SS
      const cutoffDate = new Date('2020-01-01');
      
      // Build the condition - always require ED/SS prefix and date filter
      let condition = {
        'created-date': { $gte: cutoffDate },
        'project-name': { $regex: /^(ED|SS)/i }
      };

      // Add search filter if search term provided
      if (searchTerm && searchTerm.length >= 2) {
        // Search for the term anywhere in the project name, but still require ED/SS prefix
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        condition['project-name'] = {
          $regex: new RegExp(`^(ED|SS).*${escapedSearchTerm}`, 'i')
        };
      }

      const projects = await db
        .collection('projects')
        .find(condition)
        .sort({ 'created-date': -1 })
        .limit(100)
        .toArray();

      return res.status(200).json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
