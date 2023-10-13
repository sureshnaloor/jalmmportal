import { connectToDatabase } from "../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { username } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      case "GET": {       
        
        const user = await db
          .collection("users")
          .findOne({ "username": username })
          
        return res.json(user);
      }  
      
      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
