import { connectToDatabase } from  "../../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  try {
    
    switch (req.method) {
        case "POST": {
          const { db } = await connectToDatabase();
          const data = req.body;
          const { department, section, location, coordinator, creditlimit} = data;
          const accountNo = req.query
          const simcleansed = await db.collection("simdetailscleansed").insertOne({ "account-number":accountNo, 
        department, section, location, coordinator, creditlimit})
          return res.json({status:200, message:'deleted', data:simcleansed});
          
        } 
       
        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  