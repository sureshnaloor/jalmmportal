import moment from 'moment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { connectToDatabase } from '../../../../../lib/mongoconnect';
import { getJobForUser } from '../../../../../lib/vendorDbJob';
import { generateExcelBuffer, generatePdfBuffer } from '../../../../../lib/vendorDbReport';

const ALLOWED_ROLES = ['admin', 'user', 'project'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userRole = (session.user.role || '').toLowerCase();
  if (!ALLOWED_ROLES.includes(userRole)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const userId = session.user.email;
  const { jobId } = req.query;
  const format = (req.query.format || 'xlsx').toLowerCase();

  if (!['xlsx', 'pdf'].includes(format)) {
    return res.status(400).json({ error: 'Invalid format. Use xlsx or pdf' });
  }

  try {
    const { db } = await connectToDatabase();
    const job = await getJobForUser(db, jobId, userId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'completed' || !job.reportData) {
      return res.status(400).json({ error: 'Report not ready' });
    }

    const timestamp = moment().format('YYYY-MM-DD_HH-mm');
    let buffer;
    let contentType;
    let filename;

    if (format === 'pdf') {
      buffer = await generatePdfBuffer(job.reportData);
      contentType = 'application/pdf';
      filename = `Vendor_Database_Report_${timestamp}.pdf`;
    } else {
      buffer = generateExcelBuffer(job.reportData);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `Vendor_Database_Report_${timestamp}.xlsx`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (error) {
    console.error('Download vendor DB report error:', error);
    return res.status(500).json({ error: 'Failed to generate download' });
  }
}
