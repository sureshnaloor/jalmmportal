import { connectToDatabase } from  "../../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
        case "GET": {
          const { db } = await connectToDatabase();
        //   const equipmentlist = await db.collection("equipmentmaster").find({}).toArray();
        const calibprojectlist = await db.collection("projectscalibrationuse").find({},{projection:{ _id: 0 }}).toArray()
          return res.json(calibprojectlist);
          
        } 
       
        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  