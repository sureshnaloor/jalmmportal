import { connectToDatabase } from "../../../../../lib/mongoconnect";

const handler = async (req, res) => {
  try {
    switch (req.method) {
      case "GET": {
        const { db } = await connectToDatabase();
        const vendorpolist = await db.collection("vendorsandtheirpo").aggregate([
          { $match: { vendorpo: { $ne: [], $exists: true }, }, },
          { $unwind: { path: "$vendorpo", preserveNullAndEmptyArrays: false }, },
          { $addFields: { year: { $year: "$vendorpo.podate" }, }, },
          { $match: { year: { $in: [2021, 2022, 2023] }, }, },
          { $group: { _id: "$vendor-code", count: { $sum: 1 }, "vendor-name": { $first: "$vendor-name" }, "vendor-code": { $first: "$vendor-code" }, }, },
          { $project: { _id: 0, "vendor-code": 1, "vendor-name": 1 } ,}
        ]).toArray();
        return res.status(200).json(vendorpolist);
      }
      default: {
        return res.status(405).json({ message: "Method not allowed" });        
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default handler;
