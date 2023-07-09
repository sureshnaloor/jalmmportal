import { connectToDatabase } from "../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { vendornumber } = req.query;
  
  const { db } = await connectToDatabase();
  // console.log(matcode)

  try {
    switch (req.method) {
      case "GET": {
        const vendoreval =
          (await db
            .collection("vendorevaluation")
            .findOne({ vendorcode: vendornumber })) || [];

        return res.json(vendoreval);
      }

      case "PUT": {
        const vendoreval = await db.collection("vendorevaluation").updateOne(
          { vendorcode: vendornumber },
          {
            $push: {past: {
             pastyear: req.body.pastyear,
              pastyearscore: req.body.score,
              updatedBy: req.body.createdBy,
              updatedAt: req.body.createdAt
            },
          }},
          { upsert: true }
        );

        return res.json(vendoreval);
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
