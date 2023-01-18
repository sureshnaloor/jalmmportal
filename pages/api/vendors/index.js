import { connectToDatabase } from "../../../lib/mongoconnect";

const handler = async (req, res) => {
  
  // handle different methods
  try {
    switch (req.method) {
      
      case "GET": {
        const { db } = await connectToDatabase();
        const str = req.query.str
        if (str){
          let searchstring = str.split(',')
          console.log(searchstring)
          let regexstr = ``;
          searchstring.forEach(element => {
            return regexstr = `${regexstr}(?=.*\\b${element}\\b)`
          });
          var regexsearchstring = new RegExp(`^${regexstr}.*$`)
          console.log(regexsearchstring)
        }
        

        
        let condition = str ? {'vendor-name':{'$regex':regexsearchstring, '$options' : 'i'}} : {$expr: { $lt: [0.8, { $rand: {} }] }}
        
          const vendorlist = await db
            .collection("vendors")
            // .find({$expr: { $lt: [0.8, { $rand: {} }] }})
            .find(condition)
            .sort({ created_date: -1 })            
            .limit(50)
            .toArray();
          return res.json(vendorlist);
        
      }

      case "POST": {
        const { db } = await connectToDatabase();
        const venNew = await db.collection("vendors").insertOne(req.body);
        return res
          .status(200)
          .json({
            vendor: venNew,
            message: "Successfully inserted new vendor",
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
