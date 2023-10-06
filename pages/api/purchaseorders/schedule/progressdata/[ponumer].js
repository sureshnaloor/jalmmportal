import { connectToDatabase } from "../../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { ponumber } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      
      case "PUT": {
        const query = { ponumber: ponumber };
        const poschprogress = await db
          .collection("poschedule")
          .updateOne(query, {
            $set: {
              "progressdata.mfgstart": req.body.mfgstart,
              "progressdata.Bldate": req.body.Bldate,
              "progressdata.Fatdate": req.body.Fatdate,
              "progressdata.Fatreportdate": req.body.Fatreportdate,
              "progressdata.vesselreacheddate": req.body.vesselreacheddate,
              "progressdata.customscleareddate": req.body.customscleareddate,
                         
            },
          });

        return res.json(poschprogress);
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
