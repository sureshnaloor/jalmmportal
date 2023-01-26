import { connectToDatabase } from  "../../../lib/mongoconnect";

const handler =  async (req, res) => {
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

         let condition = str ? {'project-name':{'$regex':regexsearchstring, '$options' : 'i'}} : {$expr: { $lt: [0.8, { $rand: {} }] }}
        
          const projectlist = await db
            .collection("projects")
            // .find({$expr: { $lt: [0.8, { $rand: {} }] }})
            .find(condition)
            .sort({ created_date: -1 })            
            .limit(50)
            .toArray();
          return res.json(projectlist);
        
          
        } 
 
        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  