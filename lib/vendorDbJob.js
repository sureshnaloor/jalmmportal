import { connectToDatabase } from './mongoconnect';
import { buildVendorDbReport } from './vendorDbReport';

export const JOBS_COLLECTION = 'vendordbreportjobs';

const ACTIVE_STATUSES = ['pending', 'running'];

function subgroupScopeFilter(subgroupId) {
  return { subgroupId };
}

export async function ensureJobsIndexes(db) {
  const col = db.collection(JOBS_COLLECTION);
  try {
    await col.createIndex({ requestedBy: 1, subgroupId: 1, status: 1, requestedAt: -1 });
    await col.createIndex({ requestedBy: 1, subgroupId: 1, status: 1, completedAt: -1 });
    await col.createIndex({ completedAt: 1 }, { expireAfterSeconds: 86400 });
  } catch (err) {
    if (err?.code !== 85 && err?.code !== 86) {
      console.warn('vendordbreportjobs index warning:', err.message);
    }
  }
}

export async function findActiveJobForUser(db, userId, subgroupId) {
  if (!subgroupId) return null;
  return db.collection(JOBS_COLLECTION).findOne({
    requestedBy: userId,
    status: { $in: ACTIVE_STATUSES },
    ...subgroupScopeFilter(subgroupId),
  });
}

export async function findLatestCompletedJobForUser(db, userId, subgroupId) {
  if (!subgroupId) return null;
  return db.collection(JOBS_COLLECTION).findOne(
    {
      requestedBy: userId,
      status: 'completed',
      ...subgroupScopeFilter(subgroupId),
    },
    { sort: { completedAt: -1 } }
  );
}

export async function createJob(db, userId, { subgroupId, groupName = null, subgroupName = null, isService = false } = {}) {
  const job = {
    status: 'pending',
    requestedBy: userId,
    subgroupId,
    groupName,
    subgroupName,
    isService: !!isService,
    requestedAt: new Date(),
    completedAt: null,
    progress: { processedVendors: 0, totalVendors: 0 },
    reportData: null,
    summary: null,
    error: null,
  };
  const result = await db.collection(JOBS_COLLECTION).insertOne(job);
  return { ...job, _id: result.insertedId, jobId: result.insertedId.toString() };
}

export async function processVendorDbJob(jobId) {
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

    const reportData = await buildVendorDbReport(
      db,
      async (progress) => {
        await col.updateOne({ _id: oid }, { $set: { progress } });
      },
      {
        subgroupId: job?.subgroupId,
        groupName: job?.groupName || null,
        subgroupName: job?.subgroupName || null,
        isService: job?.isService || false,
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
            processedVendors: reportData.summary.totalVendorsReported,
            totalVendors: reportData.summary.mappedVendorCount || reportData.summary.totalVendorsReported,
          },
        },
      }
    );
  } catch (error) {
    console.error('Vendor DB report job failed:', error);
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
  processVendorDbJob(jobId).catch((err) => {
    console.error('Unhandled vendor DB report job error:', err);
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
    subgroupId: job.subgroupId || null,
    progress: job.progress || { processedVendors: 0, totalVendors: 0 },
    summary: job.summary || null,
    error: job.error || null,
    requestedAt: job.requestedAt,
    completedAt: job.completedAt,
  };
}
