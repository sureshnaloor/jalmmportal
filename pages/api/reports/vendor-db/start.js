import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { connectToDatabase } from '../../../../lib/mongoconnect';
import {
  ensureJobsIndexes,
  findActiveJobForUser,
  createJob,
  kickOffJob,
} from '../../../../lib/vendorDbJob';

const ALLOWED_ROLES = ['admin', 'user', 'project'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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
  const { subgroupId, groupName = null, subgroupName = null, isService = false } = req.body || {};

  if (!subgroupId) {
    return res.status(400).json({ error: 'subgroupId is required' });
  }

  try {
    const { db } = await connectToDatabase();
    await ensureJobsIndexes(db);

    const activeJob = await findActiveJobForUser(db, userId, subgroupId);
    if (activeJob) {
      return res.status(200).json({
        jobId: activeJob._id.toString(),
        status: activeJob.status,
        message: 'Job already in progress',
      });
    }

    const job = await createJob(db, userId, {
      subgroupId,
      groupName,
      subgroupName,
      isService: isService === true || isService === 'true',
    });
    kickOffJob(job._id);

    return res.status(202).json({
      jobId: job.jobId,
      status: 'pending',
    });
  } catch (error) {
    console.error('Start vendor DB report error:', error);
    return res.status(500).json({ error: 'Failed to start report job' });
  }
}
