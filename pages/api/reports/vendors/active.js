import { connectToDatabase } from '../../../../lib/mongoconnect';
import { fetchActiveVendorsReport } from '../../../../lib/dormantVendorsReport';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const vendors = await fetchActiveVendorsReport(db);

    return res.status(200).json({
      cutoffDate: '2020-01-01',
      totalCount: vendors.length,
      vendors,
    });
  } catch (error) {
    console.error('Error generating active vendors report:', error);
    return res.status(500).json({ error: 'Error generating active vendors report' });
  }
}
