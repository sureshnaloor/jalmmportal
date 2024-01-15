import { connectToDatabase } from  "../../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
        case "GET": {
          const { db } = await connectToDatabase();
          const vendorlist = await db.collection("registeredvendors").find({}).toArray();
          return res.json(vendorlist);
          
        } 
       
        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  