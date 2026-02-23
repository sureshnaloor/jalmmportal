import { connectToDatabase } from "../../../../../lib/mongoconnect";

const handler = async (req, res) => {
  try {
    switch (req.method) {
      case "GET": {
        const { db } = await connectToDatabase();
        
        // Optimized: Use a single aggregation pipeline to do everything in MongoDB
        // This avoids multiple round trips and JavaScript filtering
        const vendorsNotEvaluated = await db.collection("vendorsandtheirpo").aggregate([
          // Step 1: Match documents with non-empty vendorpo arrays
          { $match: { vendorpo: { $ne: [], $exists: true } } },
          
          // Step 2: Filter vendorpo array to only include 2024 POs before unwinding
          // This reduces the number of documents created by $unwind
          {
            $addFields: {
              vendorpo2024: {
                $filter: {
                  input: "$vendorpo",
                  as: "po",
                  cond: {
                    $and: [
                      { $ne: ["$$po.po-date", null] },
                      { $ne: ["$$po.po-date", undefined] },
                      { $eq: [{ $year: "$$po.po-date" }, 2024] }
                    ]
                  }
                }
              }
            }
          },
          
          // Step 3: Only keep documents that have at least one 2024 PO
          { $match: { vendorpo2024: { $ne: [], $exists: true } } },
          
          // Step 4: Unwind only the filtered 2024 POs (much fewer documents now)
          { $unwind: { path: "$vendorpo2024", preserveNullAndEmptyArrays: false } },
          
          // Step 5: Group by vendor-code to get unique vendors
          {
            $group: {
              _id: "$vendor-code",
              "vendor-name": { $first: "$vendor-name" },
              "vendor-code": { $first: "$vendor-code" }
            }
          },
          
          // Step 6: Lookup vendors who have been evaluated (using $lookup for efficient join)
          {
            $lookup: {
              from: "vendorevaluation",
              let: { vendorCode: "$vendor-code" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$vendorcode", { $toString: "$$vendorCode" }] },
                        {
                          $or: [
                            { $and: [{ $ne: ["$fixedeval", null] }, { $ne: [{ $size: { $ifNull: ["$fixedeval", []] } }, 0] }] },
                            { $ne: ["$fixedevalyear2024", null] }
                          ]
                        }
                      ]
                    }
                  }
                },
                { $project: { _id: 1 } },
                { $limit: 1 }
              ],
              as: "evaluated"
            }
          },
          
          // Step 7: Filter out vendors who have been evaluated (empty evaluated array = not evaluated)
          { $match: { evaluated: { $size: 0 } } },
          
          // Step 8: Project final result
          {
            $project: {
              _id: 0,
              "vendor-code": 1,
              "vendor-name": 1
            }
          }
        ]).toArray();

        return res.status(200).json(vendorsNotEvaluated);
      }
      default: {
        return res.status(405).json({ message: "Method not allowed" });        
      }
    }
  } catch (error) {
    console.error("Error fetching vendors not evaluated for fixed scores:", error);
    res.status(500).json({ message: error.message });
  }
};

export default handler;





