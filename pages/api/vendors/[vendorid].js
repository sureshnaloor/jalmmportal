import { connectToDatabase } from "../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { vendorid } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      case "GET": {       
        
        const vencode = await db
          .collection("vendors")
          .findOne({ "vendor-code": vendorid });
          
        return res.status(200).res.json(vencode);
      }     

      
      case "DELETE": {       
        
        const vencode = await db
          .collection("vendors")
          .deleteOne({ "vencode-code": vencode });
          
        return res.status(200).json({ message: "Successfully deleted the vendor"});
      }     

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
