import { connectToDatabase } from  "../../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
        case "GET": {
          const { db } = await connectToDatabase();
          const simlist = await db.collection("simdetails").find({}).toArray();
          return res.json(simlist);
          
        } 

        case "POST":{
          const { db } = await connectToDatabase();
          const simlist = await db.collection("simdetails").insertOne(
            {
              type:"MOBILE",
              "account-number": req.body.accountNumber,
              "service-number": req.body.Mobile,
              "emp-number": req.body.empno,
              "employee-name": req.body.empname,
              department: req.body.deptname,
              coordinator: req.body.coordinator,
              plan: req.body.selectedPlan,
              location: req.body.location,
              "credit-limit": req.body.creditlimit,
              section: req.body.section,
            }
          );
          return res.json(simlist);
          
        }
       
        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  