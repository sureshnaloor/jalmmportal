import { connectToDatabase } from "../../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { ponumber } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      
      case "PUT": {
        const query = { ponumber: ponumber };
        const poschshipment = await db
          .collection("poschedule")
          .updateOne(query, {
            $set: {
              "shipdata.shipmentbookeddate": req.body.shipmentbookeddate,
              "shipdata.grossweight": req.body.grossweight,
              "shipdata.saberapplieddate": req.body.saberapplieddate,
              "shipdata.saberreceiveddate": req.body.saberreceiveddate,
              "shipdata.ffnoMinateddate": req.body.ffnoMinateddate,
              "shipdata.finalremarks": req.body.finalremarks,
                         
            },
          });

        return res.json(poschshipment);
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
