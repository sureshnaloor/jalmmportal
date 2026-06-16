export function normalizeProjectIdForQuery(projectId) {
  if (!projectId) return null;
  try {
    const decoded = decodeURIComponent(String(projectId));
    return decoded.substring(0, 12);
  } catch {
    return String(projectId).substring(0, 12);
  }
}

export function getLineAssignmentType(line) {
  const wbs = line?.account?.wbs;
  const network = line?.account?.network;
  if (wbs != null && wbs !== '') return 'WBS';
  if (network != null && network !== '') return 'Network';
  return '';
}

export async function getNetworkForProject(db, projectId) {
  const queryProjectId = normalizeProjectIdForQuery(projectId);
  if (!queryProjectId) return null;

  let decoded = String(projectId);
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // keep raw value
  }

  const escaped = queryProjectId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const network = await db.collection('networks').findOne({
    $or: [
      { 'project-wbs': decoded },
      { 'project-wbs': { $regex: `^${escaped}` } },
    ],
  });

  return network?.['network-num'] || null;
}

export function buildProjectPurchaseOrderFilter(projectId, networkNum, { openOnly = true } = {}) {
  const queryProjectId = normalizeProjectIdForQuery(projectId);
  const scopeFilters = [];

  if (queryProjectId) {
    scopeFilters.push({
      $expr: { $eq: [{ $substr: ['$account.wbs', 0, 12] }, queryProjectId] },
    });
  }

  if (networkNum) {
    scopeFilters.push({
      'account.network': networkNum,
      $or: [{ 'account.wbs': { $exists: false } }, { 'account.wbs': null }],
    });
  }

  let query = {};
  if (scopeFilters.length === 1) {
    query = scopeFilters[0];
  } else if (scopeFilters.length > 1) {
    query = { $or: scopeFilters };
  }

  if (openOnly) {
    const pendingFilter = { 'pending-val-sar': { $gt: 0 } };
    query = Object.keys(query).length ? { $and: [query, pendingFilter] } : pendingFilter;
  }

  return query;
}

export async function buildNetworkToProjectMap(db) {
  const networks = await db
    .collection('networks')
    .find({})
    .project({ 'network-num': 1, 'project-wbs': 1 })
    .toArray();

  const map = {};
  networks.forEach((network) => {
    const networkNum = network['network-num'];
    const projectWbs = network['project-wbs'];
    if (!networkNum || !projectWbs) return;
    map[networkNum] = String(projectWbs).substring(0, 12);
  });
  return map;
}

export async function fetchProjectPurchaseOrderLines(db, projectId, { openOnly = true } = {}) {
  const networkNum = await getNetworkForProject(db, projectId);
  const filter = buildProjectPurchaseOrderFilter(projectId, networkNum, { openOnly });
  return db.collection('purchaseorders').find(filter).toArray();
}
