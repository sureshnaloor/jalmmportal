import getMongoClient from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const db = await getMongoClient();
    
    // Get all PR logs to see what's in the collection
    const allPrLogs = await db.collection('prlogs').find({}).limit(10).toArray();
    
    // Check if the specific log exists
    const { id } = req.query;
    let specificLog = null;
    if (id) {
      try {
        const { ObjectId } = require('mongodb');
        const objectId = new ObjectId(id);
        specificLog = await db.collection('prlogs').findOne({ _id: objectId });
      } catch (e) {
        specificLog = { error: 'Invalid ObjectId' };
      }
    }
    
    res.status(200).json({
      totalPrLogs: allPrLogs.length,
      sampleLogs: allPrLogs.map(log => ({
        _id: log._id,
        title: log.title,
        type: log.type,
        status: log.status,
        createdDate: log.createdDate
      })),
      specificLog: specificLog,
      requestedId: id
    });
  } catch (e) {
    res.status(500).json({ error: 'Debug failed', details: e.message });
  }
} 