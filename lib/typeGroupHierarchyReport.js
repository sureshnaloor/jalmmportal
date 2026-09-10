/**
 * Material / Service Type → Group hierarchy (no vendors).
 * Types = materialgroups; Groups = materialsubgroups.
 */

function displayCode(doc) {
  if (!doc || typeof doc !== 'object') return '—';
  const raw =
    doc.code ||
    doc.groupCode ||
    doc.groupcode ||
    doc.subgroupCode ||
    doc.subgroupcode ||
    null;
  if (raw != null && String(raw).trim() !== '') return String(raw).trim();
  return '—';
}

export async function buildTypeGroupHierarchyReport(db) {
  const groups = await db.collection('materialgroups').find({}).sort({ name: 1 }).toArray();
  const groupIds = groups.map((group) => group._id);

  const subgroups = await db
    .collection('materialsubgroups')
    .find(groupIds.length ? { groupId: { $in: groupIds } } : {})
    .sort({ name: 1 })
    .toArray();

  const subgroupsByGroupId = new Map();
  subgroups.forEach((subgroup) => {
    const key = String(subgroup.groupId);
    if (!subgroupsByGroupId.has(key)) subgroupsByGroupId.set(key, []);
    subgroupsByGroupId.get(key).push(subgroup);
  });

  const types = groups
    .map((group) => {
      const mapped = (subgroupsByGroupId.get(String(group._id)) || [])
        .map((subgroup) => ({
          code: displayCode(subgroup),
          name: subgroup.name || '—',
          description: subgroup.description || '',
          subgroupId: String(subgroup._id),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return {
        isService: Boolean(group.isService),
        typeLabel: group.isService ? 'Service Type' : 'Material Type',
        groupLabel: group.isService ? 'Service Groups' : 'Material Groups',
        code: displayCode(group),
        name: group.name || '—',
        description: group.description || '',
        typeId: String(group._id),
        groups: mapped,
        groupCount: mapped.length,
      };
    })
    .sort((a, b) => {
      if (a.isService !== b.isService) return a.isService ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

  const materialTypes = types.filter((t) => !t.isService);
  const serviceTypes = types.filter((t) => t.isService);

  return {
    generatedAt: new Date().toISOString(),
    types,
    summary: {
      typeCount: types.length,
      materialTypeCount: materialTypes.length,
      serviceTypeCount: serviceTypes.length,
      groupCount: types.reduce((sum, t) => sum + t.groupCount, 0),
    },
  };
}
