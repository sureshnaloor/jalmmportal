import {connectToDatabase} from "../../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const {db} = await connectToDatabase();

  try {
    switch (req.method) {
      case "GET":
        const vendorpolist = await db.collection("vendorsandtheirpo").aggregate([
          {$match: 
            {vendorpo: {$ne:[], $exists: true},
          },},
          {
            $unwind: {path: "$vendorpo", preserveNullAndEmptyArrays: false},
          },
          {$addFields: {year:{$year: {$toDate: "$vendorpo.podate"}}}},
          {$match: {year: {$in:[2021, 2022, 2023]}}},
          {$group: {_id: "$vendor-code", count: {$sum:1},
          "vendor-name": {$first: "$vendor-name"},
          "vendor-code": {$first: "$vendor-code"},
        }},
        {
            $project: {
              _id: 0,
              "vendor-name":1,
              "vendor-code":1,
              
            },
        }
          
        ]).toArray();
        return res.status(200).json(vendorpolist);
      
    }
    
  } catch (error) {
    res.status(500).json({message: error.message});
  }
 
};

export default handler;