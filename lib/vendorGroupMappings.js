import { vendorCodeVariants } from './vendorCodeUtils';

function mappingLookupKeys(vendorcode) {
  const keys = new Set();
  for (const variant of vendorCodeVariants(vendorcode)) {
    keys.add(variant);
    const asString = String(variant);
    keys.add(asString);
    keys.add(asString.toUpperCase());
    keys.add(asString.toLowerCase());
  }
  return [...keys].filter((value) => value !== '');
}

function sortAssignments(a, b) {
  const groupCmp = (a.groupName || '').localeCompare(b.groupName || '');
  if (groupCmp !== 0) return groupCmp;
  return (a.subgroupName || '').localeCompare(b.subgroupName || '');
}

/**
 * Resolve vendorgroupmap rows for a vendor into material/service group labels.
 * Parent group name is the material type / service type; subgroup is the assigned group.
 */
export async function getVendorGroupAssignments(db, vendorcode) {
  if (!vendorcode) {
    return { materialGroups: [], serviceGroups: [] };
  }

  const groups = await db.collection('materialgroups').find({}).toArray();
  const groupById = new Map(groups.map((group) => [String(group._id), group]));

  const subgroups = await db
    .collection('materialsubgroups')
    .find(groups.length ? { groupId: { $in: groups.map((group) => group._id) } } : {})
    .toArray();

  const subgroupIdToInfo = new Map();
  for (const subgroup of subgroups) {
    const group = groupById.get(String(subgroup.groupId));
    if (!group) continue;
    subgroupIdToInfo.set(String(subgroup._id), {
      groupName: group.name || '',
      subgroupName: subgroup.name || '',
      isService: Boolean(group.isService),
    });
  }

  const mappings = await db
    .collection('vendorgroupmap')
    .find({ vendorCode: { $in: mappingLookupKeys(vendorcode) } })
    .toArray();

  const seen = new Set();
  const materialGroups = [];
  const serviceGroups = [];

  for (const mapping of mappings) {
    if (mapping.subgroupId == null) continue;
    const info = subgroupIdToInfo.get(String(mapping.subgroupId));
    if (!info) continue;

    const key = `${info.isService}|${info.groupName}|${info.subgroupName}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const row = {
      groupName: info.groupName,
      subgroupName: info.subgroupName,
      isService: info.isService,
    };

    if (info.isService) serviceGroups.push(row);
    else materialGroups.push(row);
  }

  materialGroups.sort(sortAssignments);
  serviceGroups.sort(sortAssignments);

  return { materialGroups, serviceGroups };
}
