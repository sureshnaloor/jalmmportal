import { connectToDatabase } from "../../../lib/mongoconnect";
import { buildNetworkToProjectMap } from "../../../lib/projectPurchaseOrders";

const OPEN_BALANCE_THRESHOLD = 100;

function ensureProjectEntry(projectsMap, projectId) {
  if (!projectsMap[projectId]) {
    projectsMap[projectId] = {
      projectId,
      openPOs: [],
      seenPonumbers: new Set(),
      totalPOValue: 0,
      totalOpenValue: 0,
      openPOCount: 0,
    };
  }
  return projectsMap[projectId];
}

function addPOToProject(projectsMap, projectId, poData, materialDocsByPO) {
  const project = ensureProjectEntry(projectsMap, projectId);
  const ponumber = poData.ponum;

  if (project.seenPonumbers.has(ponumber)) {
    const existing = project.openPOs.find((po) => po.ponum === ponumber);
    if (existing && poData.assignmentType && existing.assignmentType !== poData.assignmentType) {
      existing.assignmentType = 'WBS + Network';
    }
    return;
  }

  project.seenPonumbers.add(ponumber);
  project.openPOs.push({
    ...poData,
    materialDocs: materialDocsByPO[ponumber] || [],
  });
  project.totalPOValue += poData.poval;
  project.totalOpenValue += poData.balgrval;
  project.openPOCount += 1;
}

const handler = async (req, res) => {
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      case "GET": {
        const [wbsPurchaseOrders, networkPurchaseOrders, networkToProject] = await Promise.all([
          db.collection("purchaseorders").aggregate([
            {
              $match: {
                "account.wbs": { $exists: true, $ne: null },
                "pending-val-sar": { $gt: OPEN_BALANCE_THRESHOLD },
              },
            },
            {
              $project: {
                "po-number": 1,
                "po-date": 1,
                "delivery-date": 1,
                vendorcode: 1,
                "vendor-code": 1,
                vendorname: 1,
                "vendor-name": 1,
                "po-value-sar": 1,
                "pending-val-sar": 1,
                projectId: { $substr: ["$account.wbs", 0, 12] },
              },
            },
            {
              $group: {
                _id: {
                  projectId: "$projectId",
                  ponumber: "$po-number",
                },
                "po-date": { $first: "$po-date" },
                "delivery-date": { $first: "$delivery-date" },
                vendorcode: {
                  $first: { $ifNull: ["$vendorcode", { $ifNull: ["$vendor-code", ""] }] },
                },
                vendorname: {
                  $first: { $ifNull: ["$vendorname", { $ifNull: ["$vendor-name", ""] }] },
                },
                poval: { $sum: { $ifNull: ["$po-value-sar", 0] } },
                balgrval: { $sum: { $ifNull: ["$pending-val-sar", 0] } },
              },
            },
            {
              $match: {
                balgrval: { $gt: OPEN_BALANCE_THRESHOLD },
              },
            },
            { $limit: 10000 },
          ]).toArray(),
          db.collection("purchaseorders").aggregate([
            {
              $match: {
                "account.network": { $exists: true, $ne: null },
                $or: [{ "account.wbs": { $exists: false } }, { "account.wbs": null }],
                "pending-val-sar": { $gt: OPEN_BALANCE_THRESHOLD },
              },
            },
            {
              $project: {
                "po-number": 1,
                "po-date": 1,
                "delivery-date": 1,
                vendorcode: 1,
                "vendor-code": 1,
                vendorname: 1,
                "vendor-name": 1,
                "po-value-sar": 1,
                "pending-val-sar": 1,
                network: "$account.network",
              },
            },
            {
              $group: {
                _id: {
                  network: "$network",
                  ponumber: "$po-number",
                },
                "po-date": { $first: "$po-date" },
                "delivery-date": { $first: "$delivery-date" },
                vendorcode: {
                  $first: { $ifNull: ["$vendorcode", { $ifNull: ["$vendor-code", ""] }] },
                },
                vendorname: {
                  $first: { $ifNull: ["$vendorname", { $ifNull: ["$vendor-name", ""] }] },
                },
                poval: { $sum: { $ifNull: ["$po-value-sar", 0] } },
                balgrval: { $sum: { $ifNull: ["$pending-val-sar", 0] } },
              },
            },
            {
              $match: {
                balgrval: { $gt: OPEN_BALANCE_THRESHOLD },
              },
            },
            { $limit: 10000 },
          ]).toArray(),
          buildNetworkToProjectMap(db),
        ]);

        const openPONumbers = [
          ...new Set([
            ...wbsPurchaseOrders.map((po) => po._id.ponumber),
            ...networkPurchaseOrders.map((po) => po._id.ponumber),
          ]),
        ];

        const materialDocs =
          openPONumbers.length > 0
            ? await db
                .collection("materialdocumentsforpo")
                .find({ ponumber: { $in: openPONumbers.slice(0, 1000) } })
                .project({ ponumber: 1, "delivery-date": 1, status: 1 })
                .limit(5000)
                .toArray()
            : [];

        const materialDocsByPO = {};
        materialDocs.forEach((doc) => {
          if (!materialDocsByPO[doc.ponumber]) {
            materialDocsByPO[doc.ponumber] = [];
          }
          materialDocsByPO[doc.ponumber].push(doc);
        });

        const projectsMap = {};

        wbsPurchaseOrders.forEach((po) => {
          addPOToProject(projectsMap, po._id.projectId, {
            ponum: po._id.ponumber,
            podate: po["po-date"],
            "delivery-date": po["delivery-date"],
            vendorcode: po.vendorcode,
            vendorname: po.vendorname,
            poval: po.poval,
            balgrval: po.balgrval,
            assignmentType: "WBS",
          }, materialDocsByPO);
        });

        networkPurchaseOrders.forEach((po) => {
          const projectId = networkToProject[po._id.network];
          if (!projectId) return;

          addPOToProject(projectsMap, projectId, {
            ponum: po._id.ponumber,
            podate: po["po-date"],
            "delivery-date": po["delivery-date"],
            vendorcode: po.vendorcode,
            vendorname: po.vendorname,
            poval: po.poval,
            balgrval: po.balgrval,
            assignmentType: "Network",
          }, materialDocsByPO);
        });

        const projectsArray = Object.values(projectsMap).map((project) => {
          const { seenPonumbers, ...rest } = project;
          return rest;
        });

        const projectIds = projectsArray.map((p) => p.projectId);
        let projectsInfo = [];

        if (projectIds.length > 0) {
          projectsInfo = await db
            .collection("projects")
            .find({
              $or: projectIds.map((id) => ({
                "project-wbs": { $regex: `^${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` },
              })),
            })
            .toArray();
        }

        const projectInfoMap = {};
        projectsInfo.forEach((proj) => {
          const wbs = proj["project-wbs"];
          if (wbs) {
            const projId = wbs.substring(0, 12);
            if (!projectInfoMap[projId]) {
              projectInfoMap[projId] = {
                projectName: proj["project-name"] || "",
                projectWbs: proj["project-wbs"] || "",
              };
            }
          }
        });

        const result = projectsArray.map((proj) => ({
          ...proj,
          projectName: projectInfoMap[proj.projectId]?.projectName || "",
          projectWbs: projectInfoMap[proj.projectId]?.projectWbs || proj.projectId,
        }));

        const totals = {
          totalProjects: result.length,
          totalPOs: result.reduce((sum, p) => sum + p.openPOCount, 0),
          totalPOValue: result.reduce((sum, p) => sum + p.totalPOValue, 0),
          totalOpenValue: result.reduce((sum, p) => sum + p.totalOpenValue, 0),
        };

        return res.json({
          projects: result,
          totals,
        });
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log("Error in openprojects API:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

export default handler;
