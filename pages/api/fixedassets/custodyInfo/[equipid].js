import { connectToDatabase } from "../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { equipid } = req.query;
  const { db } = await connectToDatabase();
//   console.log(equipid)
   
  try {
    switch (req.method) {
      case "PUT": {
        try {
          const equipment = await db
            .collection("fixedassets")
            .updateOne({ "assetnumber": equipid },{ $set: {custodyFlag: "yes"}});
            
            
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
