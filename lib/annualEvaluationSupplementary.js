import {
  getVendorEvaluationYear,
  getAnnualEvaluationStorageKey,
} from './vendorEvaluationYear';

export async function ensureAnnualEvaluationShell(db, vendorcode, evaluationYear, rankedBy) {
  const storageKey = getAnnualEvaluationStorageKey(evaluationYear);
  const code = String(vendorcode);
  const existing = await db.collection('vendorevaluation').findOne({ vendorcode: code });
  const existingEval = existing?.[storageKey];

  if (existingEval) {
    return { storageKey, existingEval };
  }

  const now = new Date();
  const shell = {
    evaluationYear,
    ratingMaterials: {},
    ratingServices: {},
    poEvaluations: [],
    approved: false,
    approvedAt: null,
    approvedBy: null,
    createdAt: now,
    createdBy: rankedBy || null,
    updatedAt: now,
    updatedBy: rankedBy || null,
  };

  await db.collection('vendorevaluation').updateOne(
    { vendorcode: code },
    { $set: { [storageKey]: shell } },
    { upsert: true }
  );

  return { storageKey, existingEval: shell };
}

export function buildSupplementarySectionRecord(option, rankedBy) {
  const now = new Date();
  return {
    selectionId: option.id,
    selectionLabel: option.label,
    marks: option.marks,
    rankedBy: rankedBy || null,
    rankedAt: now,
  };
}

export async function saveSupplementaryEvaluationSection({
  db,
  vendorcode,
  fieldName,
  option,
  rankedBy,
  evaluationYear = getVendorEvaluationYear(),
}) {
  const storageKey = getAnnualEvaluationStorageKey(evaluationYear);
  const code = String(vendorcode);
  const evalDoc = await db.collection('vendorevaluation').findOne({ vendorcode: code });
  const existingEval = evalDoc?.[storageKey];

  if (existingEval?.approved) {
    const error = new Error('Approved evaluations cannot be modified.');
    error.statusCode = 403;
    throw error;
  }

  if (!existingEval) {
    await ensureAnnualEvaluationShell(db, code, evaluationYear, rankedBy);
  }

  const sectionRecord = buildSupplementarySectionRecord(option, rankedBy);
  const now = new Date();

  await db.collection('vendorevaluation').updateOne(
    { vendorcode: code },
    {
      $set: {
        [`${storageKey}.${fieldName}`]: sectionRecord,
        [`${storageKey}.updatedAt`]: now,
        [`${storageKey}.updatedBy`]: rankedBy || null,
      },
    },
    { upsert: true }
  );

  return sectionRecord;
}

export async function getSupplementaryEvaluationSection(db, vendorcode, fieldName, evaluationYear) {
  const storageKey = getAnnualEvaluationStorageKey(evaluationYear);
  const evalDoc = await db.collection('vendorevaluation').findOne({
    vendorcode: String(vendorcode),
  });
  return evalDoc?.[storageKey]?.[fieldName] || null;
}
