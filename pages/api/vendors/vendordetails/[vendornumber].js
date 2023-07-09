import { connectToDatabase } from "../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { vendornumber } = req.query;
  // handle different methods
  try {
    switch (req.method) {
      case "GET": {
        const { db } = await connectToDatabase();

        const vendordetails = await db
          .collection("vendors")
          .findOne({ "vendor-code": vendornumber }) || {}

        return res.json(vendordetails);
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};
export default handler;
