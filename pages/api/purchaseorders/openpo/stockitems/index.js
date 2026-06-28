import { connectToDatabase } from "../../../../../lib/mongoconnect";

const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

const handler = async (req, res) => {
  try {
    switch (req.method) {
      case "GET": {
        const { db } = await connectToDatabase();
        const stockPoList = await db
          .collection("purchaseorders")
          .aggregate([
            {
              $group: {
                _id: {
                  "po-number": "$po-number",
                  plant: "$plant-code",
                  vendorcode: "$vendorcode",
                  vendorname: "$vendorname",
                },
                "po-date": { $first: "$po-date" },
                "delivery-date": { $first: "$delivery-date" },
                openvalue: { $sum: "$pending-val-sar" },
                povalue: { $sum: "$po-value-sar" },
              },
            },
            {
              $match: {
                openvalue: { $gt: 100 },
                "po-date": { $exists: true, $ne: null },
                "delivery-date": { $exists: true, $ne: null },
                $expr: {
                  $lt: [
                    "$delivery-date",
                    { $add: ["$po-date", TEN_DAYS_MS] },
                  ],
                },
              },
            },
          ])
          .toArray();

        return res.json(stockPoList);
      }

      default:
        return res.status(405).json({ error: "Method not supported" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
