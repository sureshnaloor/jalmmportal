import { connectToDatabase } from  "../../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
        case "GET": {
          const { db } = await connectToDatabase();
        //   const equipmentlist = await db.collection("equipmentmaster").find({}).toArray();
        const equipmentlist = await db.collection("equipmentmaster").aggregate([
            {
                $lookup:{
                    from:"equipmentusers",
                    localField:"Assetnumber",
                    foreignField: "Assetnumber",
                    as:"equipment_users"
                }
            },
            { $unwind: "$equipment_users"},

            {
                $lookup:{
                    from:"equipmentcalibration",
                    localField:"Assetnumber",
                    foreignField: "Assetnumber",
                    as:"equipment_calibration"
                }
            },
            { $unwind: "$equipment_calibration"},

        ]).toArray()
          return res.json(equipmentlist);
          
        } 
       
        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  