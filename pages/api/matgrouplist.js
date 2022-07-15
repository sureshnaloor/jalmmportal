import { connectToDatabase } from "../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  switch (req.method) {
    case "GET": {
      const { db } = await connectToDatabase();
      const matgroup = await db.collection("matgroup").find({}).toArray();
      return res.json(matgroup);
      
    }
    default:
      return res.json({ error: "Method not supported" });
  }
}
export default handler  