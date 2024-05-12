import { connectToDatabase } from "../../../lib/mongoconnect";

const handler = async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
   

      case "POST": {
        const { db } = await connectToDatabase();
        const newcalibequipcertificate = await db
          .collection("calibequipmentscertificate")
          .insertOne({
            assetnumber: req.body.equip,

            created_by: "admin",
            created_at: new Date(),
            calibcertificate: req.body.calibcertificate,
            calibfile: req.body.calibfile,
            calibratedby: req.body.calibratedby,
            calibrationdate: req.body.calibrationdate,
            calibrationfromdate: req.body.calibrationfromdate,
            calibrationtodate: req.body.calibrationtodate,
            remarks: req.body.remarks,
            calibrationpo: req.body.calibrationpo,
            
          });

        return res
          .status(201)
          .json({
            message: "calib equipment certificate info inserted successfully",
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
