import { connectToDatabase } from "../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { matcode } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      case "GET": {
        const material = await db
          .collection("materialcleansecomments")
          .find({ "matcode": matcode }).toArray();

        return res.json(material);
      }

        case "POST": {
          const material = await db.collection("materialcleansecomments").insertOne({
              matcode: matcode,
              user:req.body.user,
              comment:req.body.comment,
          })
          return res.json(material)
        }

      
      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
