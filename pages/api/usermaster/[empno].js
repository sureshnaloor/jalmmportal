import { connectToDatabase } from "../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { empno } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      case "GET": {
        try {
          const empname = await db
            .collection("employees")
            .findOne({ "empno": empno });
          if (empname) {
            return res.json(empname);
          }
          return res.json(null);
        } catch (error) {
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
