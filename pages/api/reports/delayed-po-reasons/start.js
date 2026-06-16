import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { connectToDatabase } from '../../../../lib/mongoconnect';
import {
  ensureJobsIndexes,
  findActiveJobForUser,
  createJob,
  kickOffJob,
} from '../../../../lib/delayedPoJob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.email;
  const { projectId = null, projectName = null, openOnly = true } = req.body || {};

  try {
    const { db } = await connectToDatabase();
    await ensureJobsIndexes(db);

    const activeJob = await findActiveJobForUser(db, userId, projectId || null, openOnly !== false);
    if (activeJob) {
      return res.status(200).json({
        jobId: activeJob._id.toString(),
        status: activeJob.status,
        message: 'Job already in progress',
      });
    }

    const job = await createJob(db, userId, {
      projectId: projectId || null,
      projectName: projectName || null,
      openOnly: openOnly !== false,
    });
    kickOffJob(job._id);

    return res.status(202).json({
      jobId: job.jobId,
      status: 'pending',
    });
  } catch (error) {
    console.error('Start delayed PO report error:', error);
    return res.status(500).json({ error: 'Failed to start report job' });
  }
}
