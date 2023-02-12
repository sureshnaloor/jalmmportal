import { connectToDatabase } from  "../../../../lib/mongoconnect";

const handler =  async (req, res) => {
    const matgroup = req.query.matgroup
  // handle different methods
  try {
    switch (req.method) {
        case "GET": {
          const { db } = await connectToDatabase();
          const matgrpwisematerials = await db.collection("materials").find({
            "material-group": matgroup
          }).toArray();
          return res.json(matgrpwisematerials);
          
        } 
       
        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  