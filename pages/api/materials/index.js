import { connectToDatabase } from  "../../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
        case "GET": {
          const { db } = await connectToDatabase();
          // const query = req.query
          // const {searchstr} = query
          // const searchlist = ["pipe","pvc","sch"]
          const str = req.query.str
          if(str){
            let searchstring = str.split(',')
            console.log(searchstring)
            let regexstr = ``;
            searchstring.forEach(element => {
              return regexstr = `${regexstr}(?=.*\\b${element}\\b)`
            })

            var regexsearchstring = new RegExp(`^${regexstr}.*$`)
            console.log(regexsearchstring)
          }

          let condition = str ? {'material-description':{'$regex':regexsearchstring, '$options' : 'i'}} : {$expr: { $lt: [0.8, { $rand: {} }] }}

          // // const searchstr = new RegExp(searchlist.join('|'), 'gi')
          
          const matlist = await db
            .collection("materials")
            .find(condition)
            .sort({ created_date: -1 })
            .limit(300)
            .toArray();
          // console.log(matlist)
          return res.json(matlist);          
        } 

        case "POST": {
          const { db } = await connectToDatabase();
          const matNew = await db.collection("materials").insertOne(req.body);
          return res.status(200).json({matgroup: matgroupNew, message: "Successfully inserted new material"});
          
        }

        default:
          return res.json({ error: "Method not supported" });
      }
    
  } catch (error) {
    console.log(error)
  }
  
}
export default handler  