import { connectToDatabase } from "../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  switch (req.method) {
    case "GET": {
      const { db } = await connectToDatabase();

      const movies = await db.collection("users").find({}).toArray();

      return res.json(movies);
      break;
    }
    default:
      return res.json({ error: "Method not supported" });
  }
}
export default handler  