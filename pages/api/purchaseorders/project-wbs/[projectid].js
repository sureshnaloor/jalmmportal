import { connectToDatabase } from '../../../../lib/mongoconnect';
import { getNetworkForProject } from '../../../../lib/projectPurchaseOrders';
import {
  decodeProjectWbs,
  buildWbsSubtreeFilter,
  consolidatePoLines,
  buildWbsPoMap,
  buildWbsTree,
  buildNetworkTreeNode,
} from '../../../../lib/wbsPurchaseOrders';
import {
  fetchWbsDescriptionsForSubtree,
  applyWbsDescriptionsToTree,
} from '../../../../lib/wbsDescriptions';

const EXCLUDED_PO_PREFIXES = ['47', '71', '91'];

function isExcludedPo(ponum) {
  const prefix = String(ponum).substring(0, 2);
  return EXCLUDED_PO_PREFIXES.includes(prefix);
}

function consolidateNetworkLines(lines) {
  const byPo = {};
  for (const line of lines) {
    const ponum = line['po-number'];
    if (!ponum || isExcludedPo(ponum)) continue;
    if (!byPo[ponum]) {
      byPo[ponum] = { ponum, poval: 0, balgrval: 0 };
    }
    byPo[ponum].poval += line['po-value-sar'] || 0;
    byPo[ponum].balgrval += line['pending-val-sar'] || 0;
  }
  return byPo;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const rootWbs = decodeProjectWbs(req.query.projectid);

    if (!rootWbs) {
      return res.status(400).json({ error: 'Project WBS is required' });
    }

    const [project, networkNum] = await Promise.all([
      db.collection('projects').findOne({ 'project-wbs': rootWbs }),
      getNetworkForProject(db, rootWbs),
    ]);

    const wbsFilter = buildWbsSubtreeFilter(rootWbs);
    const wbsLines = await db.collection('purchaseorders').find(wbsFilter).toArray();
    const filteredWbsLines = wbsLines.filter((line) => !isExcludedPo(line['po-number']));

    let networkLines = [];
    if (networkNum) {
      networkLines = await db
        .collection('purchaseorders')
        .find({
          'account.network': networkNum,
          $or: [{ 'account.wbs': { $exists: false } }, { 'account.wbs': null }],
        })
        .toArray();
      networkLines = networkLines.filter((line) => !isExcludedPo(line['po-number']));
    }

    const purchaseOrders = consolidatePoLines(filteredWbsLines).sort((a, b) =>
      String(a.ponum).localeCompare(String(b.ponum))
    );

    const wbsPoMap = buildWbsPoMap(filteredWbsLines, rootWbs);
    const wbsTree = buildWbsTree(rootWbs, wbsPoMap);
    const wbsDescriptions = await fetchWbsDescriptionsForSubtree(db, rootWbs);
    applyWbsDescriptionsToTree(wbsTree, wbsDescriptions);

    if (networkNum && networkLines.length > 0) {
      const networkPoMap = consolidateNetworkLines(networkLines);
      const networkNode = buildNetworkTreeNode(networkNum, networkPoMap);
      wbsTree.children.push(networkNode);
      wbsTree.children.sort((a, b) => {
        if (a.isNetwork) return 1;
        if (b.isNetwork) return -1;
        return a.wbs.localeCompare(b.wbs);
      });
      wbsTree.totalPoValue += networkNode.totalPoValue;
      wbsTree.totalBalanceValue += networkNode.totalBalanceValue;

      const networkPurchaseOrders = consolidatePoLines(networkLines).sort((a, b) =>
        String(a.ponum).localeCompare(String(b.ponum))
      );

      return res.json({
        project: project
          ? {
              wbs: project['project-wbs'],
              name: project['project-name'] || '',
              manager: project['project-incharge'] || '',
            }
          : { wbs: rootWbs, name: '', manager: '' },
        network: networkNum,
        purchaseOrders,
        networkPurchaseOrders,
        wbsTree,
        wbsDescriptions,
        summary: {
          poCount: purchaseOrders.length + networkPurchaseOrders.length,
          totalPoValue: wbsTree.totalPoValue,
          totalBalanceValue: wbsTree.totalBalanceValue,
        },
      });
    }

    return res.json({
      project: project
        ? {
            wbs: project['project-wbs'],
            name: project['project-name'] || '',
            manager: project['project-incharge'] || '',
          }
        : { wbs: rootWbs, name: '', manager: '' },
      network: networkNum,
      purchaseOrders,
      networkPurchaseOrders: [],
      wbsTree,
      wbsDescriptions,
      summary: {
        poCount: purchaseOrders.length,
        totalPoValue: wbsTree.totalPoValue,
        totalBalanceValue: wbsTree.totalBalanceValue,
      },
    });
  } catch (error) {
    console.error('project-wbs purchase orders error:', error);
    return res.status(500).json({ error: 'Failed to fetch project purchase orders' });
  }
}
