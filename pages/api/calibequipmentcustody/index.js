import { connectToDatabase } from "../../../lib/mongoconnect";

const handler = async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
    //   case "GET": {
    //     const { db } = await connectToDatabase();
    //     const calibequiplist = await db
    //       .collection("calibequipmentscustody")
    //       .find({
    //         $or: [
    //             {assetnumber: req.body.equip},
    //             {custodydate : null}
    //         ]
    //       }
    //       )
    //     return res.json(calibequiplist);
    //   }

      case "POST": {
        const { db } = await connectToDatabase();
        const newcalibequipcustody = await db
          .collection("calibequipmentscustody")
          .insertOne({
            assetnumber: req.body.equip,

            created_by: "admin",
            created_at: new Date(),
            custodianempnumber: req.body.empnumber,
            custodianname: req.body.empname,
            department: req.body.department,
            project: req.body.project,
            racklocation: req.body.racklocation,
            remarks: req.body.remarks,
            custodyfrom: req.body.datefrom,
            custodyto: req.body.dateto,
          });

        return res
          .status(201)
          .json({
            message: "calib equipment general info inserted successfully",
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
