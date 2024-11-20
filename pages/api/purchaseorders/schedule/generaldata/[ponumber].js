import { connectToDatabase } from "../../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { ponumber } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      case "GET": {
        const result = await db.collection("poschedule").findOne({ ponumber: ponumber }) || {};
        return res.json(result);
      }

      case "POST":
      case "PUT": {
        const section = req.body.section;
        const formData = req.body.formData;
        
        // Create update object based on section
        const updateData = {
          ponumber: ponumber,
          [`${section}`]: formData
        };

        const result = await db.collection("poschedule").updateOne(
          { ponumber: ponumber },
          { $set: updateData },
          { upsert: true }
        );

        if (result.acknowledged) {
          const updatedDoc = await db.collection("poschedule").findOne({ ponumber: ponumber });
          console.log("Updated Document:", updatedDoc);
          console.log("Update input:", updateData);
          return res.status(200).json(updatedDoc);
        } else {
          return res.status(404).json({ error: "Update failed" });
        }
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handler;
