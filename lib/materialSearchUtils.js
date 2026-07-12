export const MATERIAL_SORT_FIELDS = {
  'material-code': 'material-code',
  'material-description': 'material-description',
  'material-group': 'material-group',
  'unit-measure': 'unit-measure',
};

export const MAPPED_SORT_FIELDS = {
  'material-code': 'materialCode',
  'material-description': 'material.material-description',
  'material-group': 'material.material-group',
  'unit-measure': 'material.unit-measure',
  'mapped-subgroup': 'group.name',
};

export function parsePositiveInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()[\]\\/]/g, '\\$&');
}

export function buildMaterialSearchMatch(str) {
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
        { 'material-description': { $regex: escaped, $options: 'i' } },
        { 'material-code': { $regex: escaped, $options: 'i' } },
      ],
    };
  });

  return { $and: conditions };
}

export function buildMappedSearchMatch(str) {
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
        { materialCode: { $regex: escaped, $options: 'i' } },
        { 'material.material-description': { $regex: escaped, $options: 'i' } },
        { 'subgroup.name': { $regex: escaped, $options: 'i' } },
        { 'group.name': { $regex: escaped, $options: 'i' } },
      ],
    };
  });

  return { $and: conditions };
}

export function buildMaterialSort(sortBy, sortOrder, fieldMap = MATERIAL_SORT_FIELDS) {
  const field = fieldMap[sortBy] || fieldMap['material-code'];
  const direction = sortOrder === 'desc' ? -1 : 1;
  return { [field]: direction };
}
