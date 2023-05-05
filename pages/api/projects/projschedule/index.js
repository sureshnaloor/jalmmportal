import { connectToDatabase } from "../../../../lib/mongoconnect";

const handler = async (req, res) => {
  // handle different methods
  try {
    const { db } = await connectToDatabase();
    switch (req.method) {
        
      case "GET": {
        
        const projectschlist = await db
          .collection("projectschedule")
          .find()
          .toArray();

        return res.json(projectschlist);
      }

      case "POST": {
        const projectschedule= await db.collection("projectschedule").insert({
            activityid: req.body.activityid,
            activityname: req.body.activity,
            startdt: req.body.actstartdate,
            duration: req.body.duration,
             
            
          });
         return  res.status(200).json({ data: projectschedule});
        } 
        
      

      default:
        return res.json({ error: "not post not get Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};
export default handler;
