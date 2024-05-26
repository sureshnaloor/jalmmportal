import { connectToDatabase } from  "../../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
        case "GET": {
          const { db } = await connectToDatabase();
        //   const equipmentlist = await db.collection("equipmentmaster").find({}).toArray();
        const assetlist = await db.collection("fixedassets").find({}).toArray()
          return res.json(assetlist);
          
        } 
       
        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  