import { connectToDatabase } from "../../../../lib/mongoconnect";
import { fetchOpenPurchaseOrderLines, summarizeOpenPoLines } from "../../../../lib/openBalances";

export const config = {
  api: {
    responseLimit: false,
  },
};

const handler = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not supported" });
  }

  try {
    const { db } = await connectToDatabase();
    const minPendingVal = req.query.minPendingVal != null
      ? Number(req.query.minPendingVal)
      : 0;
    const rows = await fetchOpenPurchaseOrderLines(db, {
      minPendingVal: Number.isFinite(minPendingVal) ? minPendingVal : 0,
    });
    const summary = summarizeOpenPoLines(rows);
    return res.json({
      asOnDate: new Date().toISOString(),
      summary,
      rows,
    });
  } catch (error) {
    console.error("open-gr-balance", error);
    return res.status(500).json({ error: "Failed to load open GR purchase orders" });
  }
};

export default handler;
