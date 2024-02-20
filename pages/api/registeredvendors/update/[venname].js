import { connectToDatabase } from "../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { vendorname } = req.query;
  const { db } = await connectToDatabase();
  // console.log(matcode)

  try {
    switch (req.method) {
      case "GET": {
        const vendor = await db
          .collection("registeredvendors")
          .findOne({ "vendorname": vendorname }) || {}

        return res.json(vendor);
      }
     
      case "PUT": {
        const vendor = await db.collection("registeredvendors").updateOne(
          { vendorname: vendorname },
          {
            $set: {
              vendorname: req.body.vendorName,
              companyregistrationnumber: req.body.companyregnumber,
              taxnumber: req.body.taxnumber,

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
