import { connectToDatabase } from "../../../../lib/mongoconnect";

/** Shared materialGroup addFields (must match main report logic) */
const materialGroupStage = {
  $addFields: {
    materialGroup: {
      $cond: {
        if: {
          $and: [
            { $ne: [{ $ifNull: ["$material.matcode", ""] }, ""] },
            { $ne: [{ $type: "$material.matcode" }, "missing"] },
          ],
        },
        then: "$material.matcode",
        else: { $ifNull: ["$material.matdescription", "(No description)"] },
      },
    },
  },
};

/**
 * GET /api/reports/cash-po-materials/details?materialKey=XXX&year=2024 (or year=all)
 * Returns 47-series PO line items for the given material: PO number, date, vendor code/name, unit rate, qty, value.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { materialKey, year } = req.query;
    const key = materialKey ? decodeURIComponent(String(materialKey).trim()) : null;
    if (!key) {
      return res.status(400).json({ error: "materialKey query parameter required" });
    }

    const allYears = year === "all" || year === "all-years";
    const yearNum = !allYears && year ? parseInt(year, 10) : null;
    if (!allYears && (!yearNum || isNaN(yearNum) || yearNum < 2000 || yearNum > 2100)) {
      return res.status(400).json({
        error: "Valid year query parameter required (e.g. ?year=2024 or ?year=all)",
      });
    }

    const { db } = await connectToDatabase();
    const coll = db.collection("purchaseorders");

    const match47 = { "po-number": { $regex: /^47/ } };
    const dateFilterStage = !allYears
      ? [
          { $match: { "po-date": { $exists: true, $ne: null } } },
          {
            $addFields: {
              poDateNorm: {
                $cond: {
                  if: { $eq: [{ $type: "$po-date" }, "date"] },
                  then: "$po-date",
                  else: { $toDate: "$po-date" },
                },
              },
            },
          },
          {
            $match: {
              poDateNorm: {
                $gte: new Date(yearNum, 0, 1, 0, 0, 0, 0),
                $lte: new Date(yearNum, 11, 31, 23, 59, 59, 999),
              },
            },
          },
        ]
      : [];

    const pipeline = [
      { $match: allYears ? match47 : { ...match47, "po-date": { $exists: true, $ne: null } } },
      ...dateFilterStage,
      materialGroupStage,
      { $match: { materialGroup: key } },
      {
        $addFields: {
          poDateNorm: {
            $cond: {
              if: { $eq: [{ $type: "$po-date" }, "date"] },
              then: "$po-date",
              else: { $toDate: "$po-date" },
            },
          },
        },
      },
      {
        $project: {
          "po-number": 1,
          "po-date": 1,
          poDateNorm: 1,
          vendorcode: { $ifNull: ["$vendorcode", "$vendor-code"] },
          vendorname: { $ifNull: ["$vendorname", "$vendor-name"] },
          "po-unit-price": 1,
          "po-quantity": 1,
          "po-value-sar": 1,
          "material.matcode": 1,
          "material.matdescription": 1,
          "po-line-item": 1,
          _id: 0,
        },
      },
      { $sort: { poDateNorm: -1 } },
    ];

    const items = await coll.aggregate(pipeline).toArray();

    const result = items.map((doc) => ({
      ponumber: doc["po-number"],
      podate: doc["po-date"],
      vendorcode: doc.vendorcode ?? "",
      vendorname: doc.vendorname ?? "",
      unitRate: doc["po-unit-price"],
      quantity: doc["po-quantity"],
      valueSar: doc["po-value-sar"],
      materialCode: doc.material?.matcode ?? doc["material.matcode"],
      materialDescription: doc.material?.matdescription ?? doc["material.matdescription"],
      lineItem: doc["po-line-item"],
    }));

    return res.json({ materialKey: key, year: year ?? null, items: result });
  } catch (error) {
    console.error("cash-po-materials details API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
