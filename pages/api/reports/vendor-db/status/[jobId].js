import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { connectToDatabase } from '../../../../../lib/mongoconnect';
import {
  getJobForUser,
  findLatestCompletedJobForUser,
  findActiveJobForUser,
  serializeJobStatus,
} from '../../../../../lib/vendorDbJob';

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
  const { jobId, subgroupId } = req.query;

  if (!subgroupId && jobId !== 'latest') {
    return res.status(400).json({ error: 'subgroupId is required' });
  }

  try {
    const { db } = await connectToDatabase();

    if (jobId === 'latest') {
      if (!subgroupId) {
        return res.status(400).json({ error: 'subgroupId is required' });
      }
      const active = await findActiveJobForUser(db, userId, subgroupId);
      if (active) {
        return res.status(200).json(serializeJobStatus(active));
      }
      const completed = await findLatestCompletedJobForUser(db, userId, subgroupId);
      if (completed) {
        return res.status(200).json(serializeJobStatus(completed));
      }
      return res.status(200).json({ status: 'idle' });
    }

    const job = await getJobForUser(db, jobId, userId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.status(200).json(serializeJobStatus(job));
  } catch (error) {
    console.error('Status vendor DB report error:', error);
    return res.status(500).json({ error: 'Failed to get job status' });
  }
}
