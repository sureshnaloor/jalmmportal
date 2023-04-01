import { connectToDatabase } from "../../../lib/mongoconnect";

const handler = async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
      case "GET": {
        const { db } = await connectToDatabase();
        // const nperPage = 100;
        const page = req.query.page || 1
        const limit = parseInt(req.query.limit) || 10
        // console.log(limit);
        const matdoclist = await db
          .collection("materialdocuments")
          .find({})
          .sort({ "doc-date": -1 })
          .limit(limit)
          .skip(page > 0 ? (page - 1) * limit: 0)
          .toArray();
        return res.json(matdoclist);
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};
export default handler;
