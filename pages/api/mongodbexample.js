import { connectToDatabase } from "../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  switch (req.method) {
    case "GET": {
      const { db } = await connectToDatabase();
      const users = await db.collection("users").find({}).toArray();
      return res.json(users);
      
    }
    default:
      return res.json({ error: "Method not supported" });
  }
}
export default handler  