import { connectToDatabase } from "../../../../../lib/mongoconnect";

const handler = async (req, res) => {
  const { ponumber } = req.query;
  const { db } = await connectToDatabase();

  try {
    switch (req.method) {
      
      case "PUT": {
        
        const poschpayment = await db
          .collection("poschedule")
          .update({ponumber: ponumber}, {
            $set: {
              "paymentdata.advpaiddate": req.body.advpaiddate,
              "paymentdata.advamountpaid": req.body.advamountpaid,
              "paymentdata.milestoneamountpaiddate": req.body.milestoneamountpaiddate,
              "paymentdata.milestoneamountpaid": req.body.milestoneamountpaid,
              "paymentdata.finalpaiddate": req.body.finalpaiddate,
              "paymentdata.finalcomments": req.body.finalcomments,
              "paymentdata.finalpaidamt": req.body.finalpaidamt,
              
            },
          });

        return res.json(poschpayment);
      }

      default:
        return res.json({ error: "Method not supported" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default handler;
