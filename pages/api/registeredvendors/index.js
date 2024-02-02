import { connectToDatabase } from  "../../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
        case "GET": {
          const { db } = await connectToDatabase();
          const vendorlist = await db.collection("registeredvendors").find({}).toArray();
          return res.json(vendorlist);
          
        } 

        case "POST": {
          const {db} = await connectToDatabase();
          const newvendor = await db.collection("registeredvendors").insertOne(
            {
              vendorname: req.body.vendorName,
              taxnumber: req.body.taxnumber,
              companyregistrationnumber: req.body.registrationnumber,
              companyemail: req.body.email,              
              companywebsite: req.body.webaddress,
              created_by:"admin",
              created_at: new Date(),
              address: {
                city: req.body.vendorCity,
                countrycode: req.body.vendorCountry,
                address1: req.body.address1,
                address2: req.body.address2,
                pobox: req.body.pobox,
                zipcode: req.body.zipcode,
              },
              contact:{
                telephone1: req.body.telephone1,
                telephone2: req.body.telephone2,
                salesname: req.body.salesperson,
                salesemail: req.body.salesemail,
                salesmobile: req.body.salesmobile,
                fax: req.body.faxnumber,
              }
            }
          )
            
          
          return  res.status(201).json({ message: 'Vendor registered successfully' });
        }
       
        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  