import { connectToDatabase } from "../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { db } = await connectToDatabase();
  // handle different methods

  try {
    switch (req.method) {
      case "POST": {
        const data = req.body;
        const { email, password, name, role } = data;
        // validate email and password
        // console.log(req.body["email"])
        // console.log(email, password);

        if (!email) {
          return res.status(400).send("Email is missing or invalid.");
        }

        //save to db
        const user = await db
          .collection("users")
          .insertOne({ email: email, password: password, name: name, role: role });

        // console.log(user)
        return res.status(200).json({ message: "success!" });
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log({ error });
  }
};
export default handler;
