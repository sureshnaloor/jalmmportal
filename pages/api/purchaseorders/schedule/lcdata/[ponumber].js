import { connectToDatabase } from "../../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { ponumber } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      
      case "PUT": {
        const query = { ponumber: ponumber };
        const poschlc = await db
          .collection("poschedule")
          .updateOne(query, {
            $set: {
              "lcdata.lcestopendate": req.body.lcestopendate,
              "lcdata.lcopeneddate": req.body.lcopeneddate,
              "lcdata.lcdatadate": req.body.lcdatadate,
              "lcdata.lclastshipdate": req.body.lclastshipdate,
              "lcdata.lcexpirydate": req.body.lcexpirydate,
              "lcdata.lcincoterm": req.body.lcincoterm,
              "lcdata.lcdocuments": req.body.lcdocuments,
              "lcdata.amount": req.body.lcamount,
            },
          });

        return res.json(poschlc);
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
