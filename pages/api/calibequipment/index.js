import { connectToDatabase } from  "../../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
        case "GET": {
          const { db } = await connectToDatabase();
          const calibequiplist = await db.collection("calibequipments").find({}).toArray();
          return res.json(calibequiplist);
          
        } 

        case "POST": {
          const {db} = await connectToDatabase();
          const newcalibequipinfo = await db.collection("calibequipments").insertOne(
            {
              assetnumber: req.body.equip,
              user: req.body.user,
              
              created_by:"admin",
              created_at: new Date(),
              geninfo: {
                website: req.body.website,
                technicalname: req.body.technicalname,
                manufacturer: req.body.manufacturer,
                model: req.body.model,
                application: req.body.application,
                calibflag: req.body.calibflag,
                accessories: req.body.accessories,
                serialnumber:req.body.serialnumber,
                legacynumber:req.body.oldassetnumber
              },
              
            }
          )
            
          
          return  res.status(201).json({ message: 'calib equipment general info inserted successfully' });
        }
       
        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  