import { connectToDatabase } from "../../../../lib/mongoconnect";

const handler = async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
      case "GET": {
        const { db } = await connectToDatabase();
        const openpolist = await db
          .collection("purchaseorders")
          .aggregate([
                       
            {
              $group: { _id: {
                "po-number":"$po-number",
                "plant": "$plant-code",
                "vendorcode" : "$vendorcode",
                "vendorname": "$vendorname",
                
              },  openvalue: { $sum: "$pending-val-sar"} },
            },
            {
                $match: {
                    openvalue:{$gt:100}
                }
            }
            
          ])
          .toArray();

          
        return res.json(openpolist);
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};
export default handler;
