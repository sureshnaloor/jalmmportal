import { vendorCodeVariants } from './vendorCodeUtils';
import { MIN_VENDOR_PO_VALUE_SAR } from './vendorEvaluationConfig';
import {
  getVendorEvaluationYear,
  getVendorEvaluationYearRange,
} from './vendorEvaluationYear';

const ADDRESS_FIELDS = [
  'street',
  'address1',
  'address2',
  'district',
  'city',
  'pobox',
  'zipcode',
  'countrycode',
];

function queryKeys(codes) {
  const keys = new Set();
  for (const code of codes) {
    if (code == null || code === '') continue;
    for (const variant of vendorCodeVariants(code)) {
      keys.add(variant);
      keys.add(String(variant));
    }
  }
  return [...keys].filter((value) => value !== '');
}

function lookupKey(code) {
  return String(code ?? '')
    .trim()
    .replace(/\s+/g, '');
}

export function formatVendorAddress(vendor, addressDoc) {
  const nested = vendor?.address && typeof vendor.address === 'object' ? vendor.address : {};
  const flat = addressDoc && typeof addressDoc === 'object' ? addressDoc : {};
  const parts = [];

  ADDRESS_FIELDS.forEach((field) => {
    const value = flat[field] || nested[field];
    if (!value) return;
    if (field === 'pobox') parts.push(`P.O. Box: ${value}`);
    else parts.push(String(value).trim());
  });

  return parts.length ? parts.join(', ') : '—';
}

function putByCode(map, code, value) {
  if (code == null || code === '') return;
  for (const variant of vendorCodeVariants(code)) {
    const key = lookupKey(variant);
    if (!key) continue;
    map.set(key, value);
  }
}

function getByCode(map, code) {
  for (const variant of vendorCodeVariants(code)) {
    const found = map.get(lookupKey(variant));
    if (found) return found;
  }
  return null;
}

async function getEvaluationYearVendorCodes(db, evaluationYear) {
  const { yearStart, yearEnd } = getVendorEvaluationYearRange(evaluationYear);
  const rows = await db
    .collection('purchaseorders')
    .aggregate([
      {
        $match: {
          'po-date': { $gte: yearStart, $lte: yearEnd },
          vendorcode: { $exists: true, $nin: [null, ''] },
        },
      },
      {
        $group: {
          _id: '$vendorcode',
          totalValue: { $sum: '$po-value-sar' },
        },
      },
      {
        $match: {
          totalValue: { $gt: MIN_VENDOR_PO_VALUE_SAR },
        },
      },
    ])
    .toArray();

  const set = new Set();
  rows.forEach((row) => {
    vendorCodeVariants(row._id).forEach((variant) => set.add(lookupKey(variant)));
  });
  return { set, count: rows.length };
}

function isEvaluated(code, evaluationCodes) {
  return vendorCodeVariants(code).some((variant) => evaluationCodes.has(lookupKey(variant)));
}

function vendorDisplay(vendorDoc, code, isUnregistered, addressDoc, evaluationCodes) {
  const vendorCode = vendorDoc?.['vendor-code'] || vendorDoc?.vendorcode || code || '—';
  const vendorName =
    vendorDoc?.['vendor-name'] || vendorDoc?.vendorname || (isUnregistered ? code : vendorCode) || '—';

  return {
    vendorCode: String(vendorCode),
    vendorName: String(vendorName),
    address: formatVendorAddress(vendorDoc, addressDoc),
    evaluated: isEvaluated(vendorCode, evaluationCodes) || isEvaluated(code, evaluationCodes),
    isUnregistered: Boolean(isUnregistered || vendorDoc?.isUnregistered),
  };
}

/**
 * Consolidated mapping of every material/service type and group to assigned vendors,
 * including whether each vendor is in the current evaluation-year PO set.
 */
export async function buildGroupVendorMappingReport(db, evaluationYear = getVendorEvaluationYear()) {
  const [groups, registeredMappings, unregisteredMappings, evaluationYearVendors] = await Promise.all([
    db.collection('materialgroups').find({}).sort({ name: 1 }).toArray(),
    db.collection('vendorgroupmap').find({}).toArray(),
    db.collection('unregisteredvendorgroupmap').find({}).toArray(),
    getEvaluationYearVendorCodes(db, evaluationYear),
  ]);
  const evaluationCodes = evaluationYearVendors.set;

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

  const vendorsBySubgroup = new Map();
  const addVendorToSubgroup = (subgroupId, vendorCode, isUnregistered) => {
    if (!subgroupId || vendorCode == null || vendorCode === '') return;
    const key = String(subgroupId);
    if (!vendorsBySubgroup.has(key)) vendorsBySubgroup.set(key, []);
    vendorsBySubgroup.get(key).push({ vendorCode, isUnregistered });
  };

  registeredMappings.forEach((mapping) => {
    addVendorToSubgroup(mapping.subgroupId, mapping.vendorCode, false);
  });
  unregisteredMappings.forEach((mapping) => {
    addVendorToSubgroup(mapping.subgroupId, mapping['vendor-name'], true);
  });

  const uniqueCodes = [
    ...new Set(
      [...vendorsBySubgroup.values()]
        .flat()
        .map((entry) => entry.vendorCode)
        .filter(Boolean)
        .map((code) => String(code))
    ),
  ];
  const lookupCodes = queryKeys(uniqueCodes);

  const [vendorDocs, addressDocs] = await Promise.all([
    lookupCodes.length
      ? db
          .collection('vendors')
          .find({
            $or: [{ 'vendor-code': { $in: lookupCodes } }, { 'vendor-name': { $in: lookupCodes } }],
          })
          .toArray()
      : Promise.resolve([]),
    lookupCodes.length
      ? db
          .collection('vendoraddress')
          .find({ vendorcode: { $in: lookupCodes } })
          .toArray()
      : Promise.resolve([]),
  ]);

  const vendorByCode = new Map();
  vendorDocs.forEach((vendor) => {
    putByCode(vendorByCode, vendor['vendor-code'] || vendor.vendorcode, vendor);
    if (vendor['vendor-name']) putByCode(vendorByCode, vendor['vendor-name'], vendor);
  });

  const addressByCode = new Map();
  addressDocs.forEach((doc) => {
    putByCode(addressByCode, doc.vendorcode, doc);
  });

  const types = groups
    .map((group) => {
      const groupSubgroups = subgroupsByGroupId.get(String(group._id)) || [];
      const mappedGroups = groupSubgroups
        .map((subgroup) => {
          const mapped = vendorsBySubgroup.get(String(subgroup._id)) || [];
          const seen = new Set();
          const vendors = [];

          mapped.forEach((entry) => {
            const dedupeKey = lookupKey(entry.vendorCode);
            if (!dedupeKey || seen.has(dedupeKey)) return;
            seen.add(dedupeKey);

            const vendorDoc = getByCode(vendorByCode, entry.vendorCode);
            const addressDoc = getByCode(addressByCode, vendorDoc?.['vendor-code'] || entry.vendorCode);
            vendors.push(
              vendorDisplay(vendorDoc, entry.vendorCode, entry.isUnregistered, addressDoc, evaluationCodes)
            );
          });

          vendors.sort((a, b) => a.vendorName.localeCompare(b.vendorName));

          return {
            groupName: subgroup.name || '',
            subgroupId: String(subgroup._id),
            vendors,
            vendorCount: vendors.length,
            evaluatedCount: vendors.filter((vendor) => vendor.evaluated).length,
          };
        })
        .filter((item) => item.vendorCount > 0)
        .sort((a, b) => a.groupName.localeCompare(b.groupName));

      return {
        isService: Boolean(group.isService),
        typeName: group.name || '',
        typeLabel: group.isService ? 'Service Type' : 'Material Type',
        groupLabel: group.isService ? 'Service Group' : 'Material Group',
        groups: mappedGroups,
      };
    })
    .filter((type) => type.groups.length > 0)
    .sort((a, b) => {
      if (a.isService !== b.isService) return a.isService ? 1 : -1;
      return a.typeName.localeCompare(b.typeName);
    });

  const allVendors = types.flatMap((type) => type.groups.flatMap((group) => group.vendors));
  const uniqueVendorKeys = new Set(allVendors.map((vendor) => lookupKey(vendor.vendorCode)));
  const uniqueEvaluatedKeys = new Set(
    allVendors.filter((vendor) => vendor.evaluated).map((vendor) => lookupKey(vendor.vendorCode))
  );

  return {
    evaluationYear,
    generatedAt: new Date().toISOString(),
    types,
    summary: {
      typeCount: types.length,
      groupCount: types.reduce((sum, type) => sum + type.groups.length, 0),
      vendorMappingCount: allVendors.length,
      evaluatedMappingCount: allVendors.filter((vendor) => vendor.evaluated).length,
      uniqueVendorCount: uniqueVendorKeys.size,
      uniqueEvaluatedCount: uniqueEvaluatedKeys.size,
      evaluationSetSize: evaluationYearVendors.count,
    },
  };
}
