export function decodeProjectWbs(projectId) {
  if (!projectId) return '';
  try {
    return decodeURIComponent(String(projectId));
  } catch {
    return String(projectId);
  }
}

export function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Mongo filter: exact WBS or any nested sub-element (e.g. ED/CP.25.002.01.001). */
export function buildWbsSubtreeFilter(rootWbs) {
  const escaped = escapeRegex(rootWbs);
  return { 'account.wbs': { $regex: `^${escaped}(\\.|$)` } };
}

export function isWbsUnderRoot(wbs, rootWbs) {
  if (!wbs || !rootWbs) return false;
  if (wbs === rootWbs) return true;
  return wbs.startsWith(`${rootWbs}.`);
}

export function getParentWbs(wbs, rootWbs) {
  if (!isWbsUnderRoot(wbs, rootWbs) || wbs === rootWbs) return null;
  const lastDot = wbs.lastIndexOf('.');
  if (lastDot <= 0) return null;
  const parent = wbs.substring(0, lastDot);
  if (parent.length < rootWbs.length) return rootWbs;
  if (!isWbsUnderRoot(parent, rootWbs) && parent !== rootWbs) return rootWbs;
  return parent;
}

function getVendorFields(line) {
  return {
    vendorcode: line.vendorcode || line['vendor-code'] || '',
    vendorname: line.vendorname || line['vendor-name'] || '',
  };
}

/** Consolidate line items into one row per PO across the subtree. */
export function consolidatePoLines(lines) {
  const byPo = {};

  for (const line of lines) {
    const ponum = line['po-number'];
    if (!ponum) continue;

    if (!byPo[ponum]) {
      const { vendorcode, vendorname } = getVendorFields(line);
      byPo[ponum] = {
        ponum,
        podate: line['po-date'],
        'delivery-date': line['delivery-date'],
        vendorcode,
        vendorname,
        poval: 0,
        balgrval: 0,
        wbsElements: new Set(),
      };
    }

    byPo[ponum].poval += line['po-value-sar'] || 0;
    byPo[ponum].balgrval += line['pending-val-sar'] || 0;
    const wbs = line.account?.wbs;
    if (wbs) byPo[ponum].wbsElements.add(wbs);
  }

  return Object.values(byPo).map((po) => {
    const wbsList = [...po.wbsElements];
    return {
      ponum: po.ponum,
      podate: po.podate,
      'delivery-date': po['delivery-date'],
      vendorcode: po.vendorcode,
      vendorname: po.vendorname,
      poval: po.poval,
      balgrval: po.balgrval,
      wbs: wbsList.length === 1 ? wbsList[0] : wbsList.sort().join(', '),
    };
  });
}

/** Map each WBS element to consolidated PO summaries assigned directly on that WBS. */
export function buildWbsPoMap(lines, rootWbs) {
  const map = {};

  for (const line of lines) {
    const wbs = line.account?.wbs;
    if (!wbs || !isWbsUnderRoot(wbs, rootWbs)) continue;

    if (!map[wbs]) map[wbs] = {};
    const ponum = line['po-number'];
    if (!ponum) continue;

    if (!map[wbs][ponum]) {
      map[wbs][ponum] = { ponum, poval: 0, balgrval: 0 };
    }
    map[wbs][ponum].poval += line['po-value-sar'] || 0;
    map[wbs][ponum].balgrval += line['pending-val-sar'] || 0;
  }

  return map;
}

function sortPosByPoValueDesc(poMap) {
  return Object.values(poMap || {}).sort((a, b) => (b.poval || 0) - (a.poval || 0));
}

function createTreeNode(wbs, poMap) {
  const pos = sortPosByPoValueDesc(poMap);
  const directPoValue = pos.reduce((sum, po) => sum + (po.poval || 0), 0);
  const directBalanceValue = pos.reduce((sum, po) => sum + (po.balgrval || 0), 0);

  return {
    wbs,
    pos,
    directPoValue,
    directBalanceValue,
    totalPoValue: directPoValue,
    totalBalanceValue: directBalanceValue,
    children: [],
  };
}

function rollupTotals(node) {
  for (const child of node.children) {
    rollupTotals(child);
    node.totalPoValue += child.totalPoValue;
    node.totalBalanceValue += child.totalBalanceValue;
  }
}

/** Build nested WBS tree with PO assignments and rolled-up totals. */
export function buildWbsTree(rootWbs, wbsPoMap) {
  const allWbs = new Set([rootWbs, ...Object.keys(wbsPoMap)]);

  for (const wbs of [...allWbs]) {
    let parent = getParentWbs(wbs, rootWbs);
    while (parent) {
      allWbs.add(parent);
      parent = getParentWbs(parent, rootWbs);
    }
  }

  const nodeMap = {};
  for (const wbs of allWbs) {
    nodeMap[wbs] = createTreeNode(wbs, wbsPoMap[wbs]);
  }

  const root = nodeMap[rootWbs];
  for (const wbs of allWbs) {
    if (wbs === rootWbs) continue;
    const parentWbs = getParentWbs(wbs, rootWbs) || rootWbs;
    nodeMap[parentWbs].children.push(nodeMap[wbs]);
  }

  for (const node of Object.values(nodeMap)) {
    node.children.sort((a, b) => a.wbs.localeCompare(b.wbs));
  }

  rollupTotals(root);
  return root;
}

export function buildNetworkTreeNode(networkNum, networkPoMap) {
  const pos = sortPosByPoValueDesc(networkPoMap);
  const directPoValue = pos.reduce((sum, po) => sum + (po.poval || 0), 0);
  const directBalanceValue = pos.reduce((sum, po) => sum + (po.balgrval || 0), 0);

  return {
    wbs: `Network: ${networkNum}`,
    isNetwork: true,
    pos,
    directPoValue,
    directBalanceValue,
    totalPoValue: directPoValue,
    totalBalanceValue: directBalanceValue,
    children: [],
  };
}
