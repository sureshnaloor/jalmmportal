import { connectToDatabase } from  "../../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
        case "GET": {
          const { db } = await connectToDatabase();
          const vendorlist = await db.collection("vendors").find({}).limit(100).toArray();
          return res.json(vendorlist);
          
        } 

        case "POST": {
          const { db } = await connectToDatabase();
          const venNew = await db.collection("vendors").insertOne(req.body);
          return res.status(200).json({vendor: venNew, message: "Successfully inserted new vendor"});
          
        }

        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  