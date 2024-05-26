import { connectToDatabase } from "../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { equipid } = req.query;
  const {todate} = req.body;
  const { db } = await connectToDatabase();
  console.log(equipid);

  try {
    switch (req.method) {
      case "GET": {
        try {
          const equipment = await db
            .collection("calibequipmentscustody")
            .find({ assetnumber: equipid }).sort({custodyfrom:-1 }).toArray();
          if (equipment) {
            return res.json(equipment);
          }
          return res.json({});
        } catch (error) {
          console.error(err);
        }
      }

      case "PUT":{
        try {
          const equipment = await db
            .collection("calibequipmentscustody")
            .findOneAndUpdate({ assetnumber: equipid }, {custodyto:{ $eq: null }},
              {custodyto: todate },
              { new: true }
            )
          
        } catch (error) {
          console.error(err);
        }
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
