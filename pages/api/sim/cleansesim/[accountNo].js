import { connectToDatabase } from "../../../../lib/mongoconnect";

const handler = async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
      case "POST": {
        const { db } = await connectToDatabase();
        const data = req.body;
        const { filter3, filter2, filter1, creditlimit, correctname } = data;
        const { accountNo } = req.query;
        const simcleansed = await db.collection("simdetails").findOneAndUpdate(
          { "account-number": accountNo },

          {
            $set: {
              "cleansed.department": filter2,
              "cleansed.location": filter3,
              "cleansed.coordinator": filter1,
              "cleansed.creditlimit": creditlimit,
              "cleansed.employee": correctname,
              "flag":"cleansed"
            },
          }
        );
        return res.json({
          status: 200,
          message: "cleansed",
          data: simcleansed,
        });
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};
export default handler;
