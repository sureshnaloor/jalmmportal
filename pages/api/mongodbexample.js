import { connectToDatabase } from "../../lib/mongoconnect";

const handler = async (req, res) => {
  const { db } = await connectToDatabase();

  const movies = await db
    .collection("users")
    .find({})
    .toArray();

  res.json(movies);
};

export default handler