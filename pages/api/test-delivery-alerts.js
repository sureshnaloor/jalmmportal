import { connectToDatabase } from '../../lib/mongoconnect';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Get today's date at start of day for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Test: Searching for POs with delivery dates before:', today.toISOString());

    // Simple query to check if we have any data
    const totalPOs = await db.collection('poschedule').countDocuments();
    console.log('Test: Total POs in poschedule collection:', totalPOs);

    // Check for POs with any delivery dates
    const posWithDeliveryDates = await db.collection('poschedule').find({
      $or: [
        { 'generaldata.podelydate': { $exists: true, $ne: null } },
        { 'generaldata.estdelydate': { $exists: true, $ne: null } }
      ]
    }).toArray();

    console.log('Test: POs with delivery dates:', posWithDeliveryDates.length);

    // Show a few examples
    const examples = posWithDeliveryDates.slice(0, 3).map(po => ({
      ponumber: po.ponumber,
      podelydate: po.generaldata?.podelydate,
      estdelydate: po.generaldata?.estdelydate
    }));

    res.status(200).json({
      message: 'Test successful',
      today: today.toISOString(),
      totalPOs,
      posWithDeliveryDates: posWithDeliveryDates.length,
      examples
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ message: 'Test failed', error: error.message });
  }
} 