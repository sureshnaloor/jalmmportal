import { connectToDatabase } from './mongoconnect';
import { buildDelayedPOReport } from './delayedPoReport';

export const JOBS_COLLECTION = 'delayedporeportjobs';

const ACTIVE_STATUSES = ['pending', 'running'];

function projectScopeFilter(projectId, openOnly = true) {
  if (!projectId) {
    return { $or: [{ projectId: null }, { projectId: { $exists: false } }] };
  }
  if (openOnly !== false) {
    return {
      projectId,
      $or: [{ openOnly: true }, { openOnly: { $exists: false } }],
    };
  }
  return { projectId, openOnly: false };
}

export async function ensureJobsIndexes(db) {
  const col = db.collection(JOBS_COLLECTION);
  try {
    await col.createIndex({ requestedBy: 1, status: 1, requestedAt: -1 });
    await col.createIndex({ requestedBy: 1, projectId: 1, openOnly: 1, status: 1, completedAt: -1 });
    await col.createIndex({ completedAt: 1 }, { expireAfterSeconds: 86400 });
  } catch (err) {
    // Index may already exist
    if (err?.code !== 85 && err?.code !== 86) {
      console.warn('delayedporeportjobs index warning:', err.message);
    }
  }
}

export async function findActiveJobForUser(db, userId, projectId = null, openOnly = true) {
  return db.collection(JOBS_COLLECTION).findOne({
    requestedBy: userId,
    status: { $in: ACTIVE_STATUSES },
    ...projectScopeFilter(projectId, openOnly),
  });
}

export async function findLatestCompletedJobForUser(db, userId, projectId = null, openOnly = true) {
  return db.collection(JOBS_COLLECTION).findOne(
    {
      requestedBy: userId,
      status: 'completed',
      ...projectScopeFilter(projectId, openOnly),
    },
    { sort: { completedAt: -1 } }
  );
}

export async function createJob(db, userId, { projectId = null, projectName = null, openOnly = true } = {}) {
  const job = {
    status: 'pending',
    requestedBy: userId,
    projectId,
    projectName,
    openOnly: openOnly !== false,
    requestedAt: new Date(),
    completedAt: null,
    progress: { processedPOs: 0, totalPOs: 0 },
    reportData: null,
    summary: null,
    error: null,
  };
  const result = await db.collection(JOBS_COLLECTION).insertOne(job);
  return { ...job, _id: result.insertedId, jobId: result.insertedId.toString() };
}

export async function processDelayedPOJob(jobId) {
  const { db } = await connectToDatabase();
  const { ObjectId } = await import('mongodb');
  const oid = typeof jobId === 'string' ? new ObjectId(jobId) : jobId;
  const col = db.collection(JOBS_COLLECTION);

  try {
    const job = await col.findOne({ _id: oid });

    await col.updateOne(
      { _id: oid },
      { $set: { status: 'running', startedAt: new Date() } }
    );

    const reportData = await buildDelayedPOReport(
      db,
      async (progress) => {
        await col.updateOne({ _id: oid }, { $set: { progress } });
      },
      {
        projectId: job?.projectId || null,
        projectName: job?.projectName || null,
        openOnly: job?.openOnly !== false,
      }
    );

    await col.updateOne(
      { _id: oid },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          reportData,
          summary: reportData.summary,
          progress: {
            processedPOs: reportData.summary.totalPOs,
            totalPOs: reportData.summary.totalPOs,
          },
        },
      }
    );
  } catch (error) {
    console.error('Delayed PO job failed:', error);
    await col.updateOne(
      { _id: oid },
      {
        $set: {
          status: 'failed',
          completedAt: new Date(),
          error: error.message || 'Unknown error',
        },
      }
    );
  }
}

export function kickOffJob(jobId) {
  processDelayedPOJob(jobId).catch((err) => {
    console.error('Unhandled delayed PO job error:', err);
  });
}

export async function getJobForUser(db, jobId, userId) {
  const { ObjectId } = await import('mongodb');
  if (!ObjectId.isValid(jobId)) return null;
  return db.collection(JOBS_COLLECTION).findOne({
    _id: new ObjectId(jobId),
    requestedBy: userId,
  });
}

export function serializeJobStatus(job) {
  if (!job) return null;
  return {
    jobId: job._id.toString(),
    status: job.status,
    projectId: job.projectId || null,
    projectName: job.projectName || null,
    openOnly: job.openOnly !== false,
    progress: job.progress || { processedPOs: 0, totalPOs: 0 },
    summary: job.summary || null,
    error: job.error || null,
    requestedAt: job.requestedAt,
    completedAt: job.completedAt,
  };
}
