import { connectToDatabase } from "../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { materialid } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      case "GET": {       
        
        const material = await db
          .collection("specialstock")
          .findOne({ "material-code": materialid });
          
        return res.json(material);
      }  
      
      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
