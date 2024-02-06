import { connectToDatabase } from "../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { venname } = req.query;
  const { db } = await connectToDatabase();
  
  try {
    switch (req.method) {
      case "GET": {
        const vendormap = await db
          .collection("vendormapgroup")
          .find({ "vendorname": venname }).toArray()

        return res.json(vendormap);
      }
     
      case "POST": {
        
            const {servicecategorySelected, servicesubcategorySelected, user} = req.body
     
            if (!servicecategorySelected || !servicesubcategorySelected ) {
             return res.status(400).send("data is missing or invalid.");
           }
     
           const vendormap = await db
               .collection("vendormapgroup")
               .insertOne({ vendorname: venname, type: servicecategorySelected, group: servicesubcategorySelected,  updatedBy: user, updatedAt: new Date() });
     
             // console.log(user)
             return res.status(200).json({ message: "success!" });
           }   
    
      

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
