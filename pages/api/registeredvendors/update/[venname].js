import { connectToDatabase } from "../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { venname } = req.query;
  const { db } = await connectToDatabase();
  console.log(venname)
  console.log(req.query)

  try {
    switch (req.method) {
      case "GET": {
        const vendor = await db
          .collection("registeredvendors")
          .findOne({ "vendorname": venname }) || {}

        return res.json(vendor);
      }
     
      case "PUT": {
        const vendor = await db.collection("registeredvendors").updateOne(
          { vendorname: venname },
          {
            $set: {
              vendorname: req.body.vendorName,
              vendorcode: req.body.vendorcode,
              companyregistrationnumber: req.body.companyregnumber,
              taxnumber: req.body.taxnumber,
              companyemail: req.body.email,
              companywebsite: req.body.website,
              created_date: req.body.created_date,
              created_by: req.body.created_by,
              address: {
                city: req.body.city,
                countrycode: req.body.countrycode,
                address1: req.body.address1,
                address2: req.body.address2,
                pobox: req.body.pobox,
                zipcode: req.body.zipcode,
              },
              contact:{
                telephone1: req.body.telephone1,
                telephone2: req.body.telephone2,
                salesname: req.body.salesname,
                salesemail: req.body.salesemail,
                salesmobile: req.body.salesmobile,
                fax: req.body.fax,
              },

              updatedBy: req.body.username,
              updatedAt: new Date()
            },
          },
          
        );

        return res.json(vendor);
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
