import { connectToDatabase } from "../../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { ponumber } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      case "GET": {
        const result =
          (await db.collection("poschedule").findOne({ ponumber: ponumber })) ||
          {};

        return res.json(result);
      }

      case "POST": {
        const poschgeneral = await db.collection("poschedule").insertOne({
          ponumber: ponumber,
          generaldata: {
            poackdate: req.body.poackdate,
            podelydate: req.body.podelydate,
            estdelydate: req.body.estdelydate,
            delysch: req.body.delysch,
            basedesignapprdate: req.body.basedesignapprdate,
            basedesigncomments: req.body.basedesigncomments,
            basedesignrecdate: req.body.basedesignrecdate,
            mfgclearancedate: req.body.mfgclearancedate,
            itpapprdate: req.body.itpapprdate,
            detdesignrecdate: req.body.detdesignrecdate,
            detdesignaprdate: req.body.detdesignaprdate,
            grdate:req.body.grdate,
            finalworkcompleteddate: req.body.finalworkcompleteddate,
          },
          paymentdata: {
            advpaiddate: req.body.advpaiddate,
            advamountpaid: req.body.advamountpaid,
            milestoneamountpaiddate: req.body.milestoneamountpaiddate,
            milestoneamountpaid: req.body.milestoneamountpaid,
            finalpaiddate: req.body.finalpaiddate,
            finalpaidamt: req.body.finalpaidamt,
            finalcomments: req.body.finalcomments,
          },
          bgdata: {
            abgestdate: req.body.abgestdate,
            abgactualdate: req.body.abgactualdate,
            abgexpirydate: req.body.abgexpirydate,
            abgamount: req.body.abgamount,
            pbgestdate: req.body.pbgestdate,
            pbgactualdate: req.body.pbgactualdate,
            pbgreturneddate: req.body.pbgreturneddate,
            abgreturneddate: req.body.abgreturneddate,
            pbgexpirydate: req.body.pbgexpirydate,
            pbgamount: req.body.pbgamount,
            bgremarks: req.body.bgremarks,
          },
          lcdata: {
            lcdatadate: req.body.lcdatadate,
            lcestopendate: req.body.lcestopendate,
            lcopeneddate: req.body.lcopeneddate,
            lcexpirydate: req.body.lcexpirydate,
            lcincoterm: req.body.lcincoterm,
            lcdocuments: req.body.lcdocuments,
            lclastshipdate: req.body.lclastshipdate,    
            lcamount: req.body.lcamount,
            lcremarks: req.body.lcremarks,
            lcswift: req.body.lcswift,
          },
          progressdata: {
            mfgstart: req.body.mfgstart,
            Bldate: req.body.Bldate,
            Fatdate: req.body.Fatdate,
            Fatreportdate: req.body.Fatreportdate,
            vesselreacheddate: req.body.vesselreacheddate,
            customscleareddate: req.body.customscleareddate,
          },
          shipdata: {
            shipmentbookeddate: req.body.shipmentbookeddate,
            grossweight: req.body.grossweight,
            saberapplieddate: req.body.saberapplieddate,
            saberreceiveddate: req.body.saberreceiveddate,
            ffnoMinateddate: req.body.ffnoMinateddate,
            finalremarks: req.body.finalremarks,
          },
        });


        return res.json(poschgeneral);
      }

      case "PUT": {
        const query = { ponumber: ponumber };
        const poschgeneral = await db
          .collection("poschedule")
          .updateOne(query, {
            $set: {
              "generaldata.poackdate": req.body.poackdate,
              "generaldata.podelydate": req.body.podelydate,
              "generaldata.estdelydate": req.body.estdelydate,
              "generaldata.delysch": req.body.delysch,
              "generaldata.basedesignapprdate": req.body.basedesignapprdate,
              "generaldata.basedesignrecdate": req.body.basedesignrecdate,
              "generaldata.basedesigncomments": req.body.basedesigncomments,
              "generaldata.mfgclearancedate": req.body.mfgclearancedate,
              "generaldata.itpapprdate": req.body.itpapprdate,
              "generaldata.grdate": req.body.grdate,
              "generaldata.finalworkcompleteddate": req.body.finalworkcompleteddate,
              "generaldata.detdesignrecdate": req.body.detdesignrecdate,
              "generaldata.detdesignaprdate": req.body.detdesignaprdate,
              "paymentdata.advpaiddate": req.body.advpaiddate,
              "paymentdata.advamountpaid": req.body.advamountpaid,
              "paymentdata.milestoneamountpaiddate": req.body.milestoneamountpaiddate,
              "paymentdata.milestoneamountpaid": req.body.milestoneamountpaid,
              "paymentdata.finalpaiddate": req.body.finalpaiddate,
              "paymentdata.finalpaidamt": req.body.finalpaidamt,
              "paymentdata.finalcomments": req.body.finalcomments,
              "bgdata.abgestdate": req.body.abgestdate,
              "bgdata.abgactualdate": req.body.abgactualdate,
              "bgdata.abgexpirydate": req.body.abgexpirydate,
              "bgdata.abgamount": req.body.abgamount,
              "bgdata.pbgestdate": req.body.pbgestdate,
              "bgdata.pbgactualdate": req.body.pbgactualdate,
              "bgdata.pbgreturneddate": req.body.pbgreturneddate,
              "bgdata.abgreturneddate": req.body.abgreturneddate,
              "bgdata.bgremarks": req.body.bgremarks,
              "bgdata.pbgamount": req.body.pbgamount,
              "bgdata.pbgexpirydate": req.body.pbgexpirydate,
              "lcdata.lcestopendate": req.body.lcestopendate,
              "lcdata.lcopeneddate": req.body.lcopeneddate,
              "lcdata.lcdatadate": req.body.lcdatadate,
              "lcdata.lclastshipdate": req.body.lclastshipdate,
              "lcdata.lcexpirydate": req.body.lcexpirydate,
              "lcdata.lcincoterm": req.body.lcincoterm,
              "lcdata.lcdocuments": req.body.lcdocuments,
              "lcdata.lcamount": req.body.lcamount,
              "lcdata.lcremarks": req.body.lcremarks,
              "lcdata.lcswift": req.body.lcswift,
              "progressdata.mfgstart": req.body.mfgstart,
              "progressdata.Bldate": req.body.Bldate,
              "progressdata.Fatdate": req.body.Fatdate,
              "progressdata.Fatreportdate": req.body.Fatreportdate,
              "progressdata.vesselreacheddate": req.body.vesselreacheddate,
              "progressdata.customscleareddate": req.body.customscleareddate,
              "shipdata.shipmentbookeddate": req.body.shipmentbookeddate,
              "shipdata.grossweight": req.body.grossweight,
              "shipdata.saberapplieddate": req.body.saberapplieddate,
              "shipdata.saberreceiveddate": req.body.saberreceiveddate,
              "shipdata.ffnoMinateddate": req.body.ffnoMinateddate,
              "shipdata.finalremarks": req.body.finalremarks,
            },
          });

        return res.json(poschgeneral);
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
