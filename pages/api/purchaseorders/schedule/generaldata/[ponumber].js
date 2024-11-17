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
        const updateData = {
          ponumber: ponumber,
          generaldata: {
            poackdate: req.body.poackdate,
            podelydate: req.body.podelydate,
            estdelydate: req.body.estdelydate,
            delysch: req.body.delysch,
            basedesignapprdate: req.body.basedesignapprdate,
            basedesigncomments: req.body.basedesigncomments,
            generalcomments: req.body.generalcomments,
            basedesignrecdate: req.body.basedesignrecdate,
            mfgclearancedate: req.body.mfgclearancedate,
            itpapprdate: req.body.itpapprdate,
            detdesignrecdate: req.body.detdesignrecdate,
            detdesignaprdate: req.body.detdesignaprdate,
            grdate: req.body.grdate,
            finalworkcompleteddate: req.body.finalworkcompleteddate,
          },
        };

        const result = await db.collection("poschedule").updateOne(
          { ponumber: ponumber },
          { $set: updateData },
          { upsert: true } // This will update if exists, or insert if it doesn't
        );

        if (result.upsertedCount > 0 || result.modifiedCount > 0) {
          const updatedDocument = await db.collection("poschedule").findOne({ ponumber: ponumber });
          return res.status(200).json(updatedDocument);
        } else {
          return res.status(404).json({ error: "Document not found and not inserted" });
        }
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handler;
