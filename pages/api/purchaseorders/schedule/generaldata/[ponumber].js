import { connectToDatabase } from "../../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { ponumber } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      case "GET": {
        const result =
          (await db.collection("poschedule").findOne({ ponumber: ponumber })) ||
          {};

        return res.json(result);
      }

      case "POST": {
        const poschgeneral = await db.collection("poschedule").insertOne({
          ponumber: ponumber,
          generaldata: {
            poackdate: req.body.poackdate,
            podelydate: req.body.podelydate,
            estdelydate: req.body.estdelydate,
            delysch: req.body.delysch,
            basedesignapprdate: req.body.basedesignapprdate,
            basedesigncomments: req.body.basedesigncomments,
            basedesignrecdate: req.body.basedesignrecdate,
            mfgclearancedate: req.body.mfgclearancedate,
            itpapprdate: req.body.itpapprdate,
            detdesignrecdate: req.body.detdesignrecdate,
            detdesignaprdate: req.body.detdesignaprdate,
          },
        });

        return res.json(poschgeneral);
      }

      case "PUT": {
        const query = { ponumber: ponumber };
        const poschgeneral = await db
          .collection("poschedule")
          .updateOne(query, {
            $set: {
              "generaldata.poackdate": req.body.poackdate,
              "generaldata.podelydate": req.body.podelydate,
              "generaldata.estdelydate": req.body.estdelydate,
              "generaldata.delysch": req.body.delysch,
              "generaldata.basedesignapprdate": req.body.basedesignapprdate,
              "generaldata.basedesignrecdate": req.body.basedesignrecdate,
              "generaldata.basedesigncomments": req.body.basedesigncomments,
              "generaldata.mfgclearancedate": req.body.mfgclearancedate,
              "generaldata.itpapprdate": req.body.itpapprdate,
              "generaldata.detdesignrecdate": req.body.detdesignrecdate,
              "generaldata.detdesignaprdate": req.body.detdesignaprdate,
            },
          });

        return res.json(poschgeneral);
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
