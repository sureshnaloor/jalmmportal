export const SERVICE_SORT_FIELDS = {
  'service-code': 'serviceCode',
  'service-description': 'serviceDescription',
  'unit-measure': 'unitMeasure',
};

export const SERVICE_MAPPED_SORT_FIELDS = {
  'service-code': 'serviceCode',
  'service-description': 'service.serviceDescription',
  'unit-measure': 'service.unitMeasure',
  'mapped-subgroup': 'group.name',
};

export function parsePositiveInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()[\]\\/]/g, '\\$&');
}

export function buildServiceSearchMatch(str) {
  if (!str || !str.trim()) {
    return null;
  }

  const cleanedStr = str.trim().replace(/^\*+|\*+$/g, '');
  const searchTerms = cleanedStr
    .split('*')
    .map((term) => term.trim())
    .filter((term) => term.length > 0)
    .slice(0, 4);

  if (searchTerms.length === 0) {
    return null;
  }

  const conditions = searchTerms.map((term) => {
    const escaped = escapeRegex(term);
    return {
      $or: [
        { serviceDescription: { $regex: escaped, $options: 'i' } },
        { serviceCode: { $regex: escaped, $options: 'i' } },
      ],
    };
  });

  return { $and: conditions };
}

export function buildServiceMappedSearchMatch(str) {
  if (!str || !str.trim()) {
    return null;
  }

  const cleanedStr = str.trim().replace(/^\*+|\*+$/g, '');
  const searchTerms = cleanedStr
    .split('*')
    .map((term) => term.trim())
    .filter((term) => term.length > 0)
    .slice(0, 4);

  if (searchTerms.length === 0) {
    return null;
  }

  const conditions = searchTerms.map((term) => {
    const escaped = escapeRegex(term);
    return {
      $or: [
        { serviceCode: { $regex: escaped, $options: 'i' } },
        { 'service.serviceDescription': { $regex: escaped, $options: 'i' } },
        { 'subgroup.name': { $regex: escaped, $options: 'i' } },
        { 'group.name': { $regex: escaped, $options: 'i' } },
      ],
    };
  });

  return { $and: conditions };
}

export function buildServiceSort(sortBy, sortOrder, fieldMap = SERVICE_SORT_FIELDS) {
  const field = fieldMap[sortBy] || fieldMap['service-code'];
  const direction = sortOrder === 'desc' ? -1 : 1;
  return { [field]: direction };
}
