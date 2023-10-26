import { connectToDatabase } from "../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { account } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      case "GET": {
        try {
          const simdata = await db
            .collection("simdetails")
            .findOne({ "account-number": account });
          if (simdata) {
            return res.json(simdata);
          }
          return res.json({});
        } catch (error) {
          console.error(err);
        }
        
      }

      case "PUT": {
        try{
           
        const simdata = await db
          .collection("simdetails")
          .updateOne({"account-number": account}, {
            $set: {
              "emp-number": req.body["emp-number"],
              "employee-name": req.body["employee-name"],
              "department": req.body["department"],
              "section": req.body["section"],
              "coordinator": req.body.coordinator,
              "plan": req.body.plan,
              "credit-limit": req.body["credit-limit"],
              "location": req.body.location,
              "usage-from": req.body["usage-from"],
              "usage-to": req.body["usage-to"]
            },
          });

        return res.json(simdata);
      }
      catch (error) {
        console.error(err);
      }
        }
      

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
