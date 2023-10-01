import { connectToDatabase } from "../../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { ponumber } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      case "GET": {       
        
        const result = await db
          .collection("poschedule")
          .findOne(
            {"ponumber":ponumber
            } 
          )      
          
          return res.json(result)
      }  

      case "PUT": {
        const poschgeneral = await db.collection("poschedule").updateOne(
          { ponumber: ponumber },
          {
            $set: {
              "gendata.$.poackdate": req.body.poackdate,
              "gendata.$.podelydate": req.body.podelydate,              
              "gendata.$.estdelydate": req.body.estdelydate,
              "gendata.$.delysch": req.body.delysch,
              "gendate.$.basedesignapprdate": req.body.basedesignapprdate,
              "gendata.$.basedesigncomments": req.body.basedesigncomments,
              "gendata.$.basedesignrecdate": req.body.basedesignrecdate,
              "gendata.$.mfgclearancedate": req.body.mfgclearancedate,
              "gendata.$.itpapprdate":req.body.itpapprdate,
            },
          },
          { upsert: true }
        );

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
