import { connectToDatabase } from  "../../../../lib/mongoconnect";

const handler =  async (req, res) => {

    const { vendorid } = req.query;
  // handle different methods
  try {
    switch (req.method) {
        case "GET": {
          const { db } = await connectToDatabase();
          const vendorFileList = await db.collection("vendorsfiles").find({"vendorid":vendorid}).toArray();
          return res.json(vendorFileList);
          
        } 
 
        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  