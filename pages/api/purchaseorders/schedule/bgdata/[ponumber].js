import { connectToDatabase } from "../../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { ponumber } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      
      case "PUT": {
        const query = { ponumber: ponumber };
        const poschbg = await db
          .collection("poschedule")
          .updateOne(query, {
            $set: {
              "bgdata.abgestdate": req.body.abgestdate,
              "bgdata.abgactualdate": req.body.abgactualdate,
              "bgdata.abgexpirydate": req.body.abgexpirydate,
              "bgdata.abgamount": req.body.abgamount,
              "bgdata.pbgestdate": req.body.pbgestdate,
              "bgdata.pbgactualdate": req.body.pbgactualdate,
              "bgdata.pbgreturneddate": req.body.pbgreturneddate,
              "bgdata.abgreturneddate": req.body.abgreturneddate,
              "bgdata.bgremarks": req.body.bgremarks,              
            },
          });

        return res.json(poschbg);
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
