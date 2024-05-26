import { connectToDatabase } from "../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { todate } = req.query;
  
  const { db } = await connectToDatabase();
  console.log(todate);
  try {
    switch (req.method) {


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
