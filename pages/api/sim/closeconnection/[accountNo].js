import { connectToDatabase } from "../../../../lib/mongoconnect";

const handler = async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
      case "PUT": {
        const { db } = await connectToDatabase();
        const {accountNo} = req.query
        console.log(accountNo)
        const simtoclose = await db
          .collection("simdetails")
          .updateOne({"account-number": accountNo}, {$set: {"close-flag": "true", "closed-date": new Date()}})
        return res.json({ status: 200, message: "deletedflagset", simtoclose });
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};
export default handler;
