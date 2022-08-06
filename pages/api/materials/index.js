import { connectToDatabase } from  "../../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
        case "GET": {
          const { db } = await connectToDatabase();
          const matlist = await db.collection("materials").find({}).toArray();
          return res.json(matlist);
          
        } 

        case "POST": {
          const { db } = await connectToDatabase();
          const matNew = await db.collection("materials").insertOne(req.body);
          return res.status(200).json({matgroup: matgroupNew, message: "Successfully inserted new material"});
          
        }

        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  