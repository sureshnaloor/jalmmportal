import { connectToDatabase } from  "../../../lib/mongoconnect";

const handler =  async (req, res) => {
  // handle different methods
  try {
    switch (req.method) {
        case "GET": {
          const { db } = await connectToDatabase();
          // const query = req.query
          // const {searchstr} = query
          const searchlist = ["pipe","pvc","sch"]
          // // const searchstr = new RegExp(searchlist.join('|'), 'gi')
          const searchstr = new RegExp(`^(?=.*\\b${searchlist[0].toUpperCase()}\\b)(?=.*\\b${searchlist[1].toUpperCase()}\\b)(?=.*\\b${searchlist[2].toUpperCase()}\\b).*$`)
          console.log(searchstr)
          const matlist = await db.collection("materials").find({"material-description":{$regex:searchstr}}).limit(100).toArray();
          console.log(matlist)
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