import { connectToDatabase } from "../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { venname } = req.query;
  const { db } = await connectToDatabase();
  // console.log(matcode)

  try {
    switch (req.method) {
      case "GET": {
        const vendor = await db
          .collection("registeredvendors")
          .findOne({ "vendorname": venname }) || {}

        return res.json(vendor);
      }
     
      case "PUT": {
        const vendor = await db.collection("registeredvendors").updateOne(
          { vendorname: venname },
          {
            $set: {
              vendorname: req.body.vendorName,
              group: req.body.group,
              type: req.body.type,
              secondarygroup: req.body.secondarygroup,
              updatedBy: req.body.username,
              updatedAt: new Date()
            },
          },
          { upsert: true }
        );

        return res.json(vendor);
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
