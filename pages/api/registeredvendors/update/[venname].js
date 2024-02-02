import { connectToDatabase } from "../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { venname } = req.query;
  const { db } = await connectToDatabase();
  // console.log(matcode)

  try {
    switch (req.method) {
      case "GET": {
        const vendor = await db
          .collection("egisteredvendors")
          .findOne({ "vendorname": venname }) || {}

        return res.json(vendor);
      }
     
      case "PUT": {
        const vendor = await db.collection("registeredvendors").updateOne(
          { vendorname: venname },
          {
            $set: {
              vendorname: req.body.vendorName,
              vendorcode: req.body.vendorCode,              
              "address.countrycode": req.body.vendorCountry,
              "address.city": req.body.vendorCity,
              "address.address1": req.body.address1,
              "address.address2": req.body.address2,
              "address.pobox": req.body.pobox,
              "address.zipcode": req.body.zipcode,
              companyemail: req.body.email,
              "contact.fax": req.body.faxnumber,
              companywebsite: req.body.webaddress,
              companyregistrationnumber: req.body.registrationnumber,
              taxnumber: req.body.taxnumber,
              "contact.telephone1": req.body.telephone1,
              "contact.telephone2": req.body.telephone2,
              "contact.salesname": req.body.salesperson,
              "contact.salesemail": req.body.salesemail,
              "contact.salesmobile": req.body.salesmobile,
              updatedBy: req.body.username,
              updatedAt: new Date()
            },
          },
          { upsert: true }
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
