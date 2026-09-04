import { connectToDatabase } from "../../../../lib/mongoconnect";
import { fetchOpenStockBalances, summarizeOpenStock } from "../../../../lib/openBalances";

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
    const rows = await fetchOpenStockBalances(db);
    const summary = summarizeOpenStock(rows);
    return res.json({
      asOnDate: new Date().toISOString(),
      summary,
      rows,
    });
  } catch (error) {
    console.error("open-stock-balance", error);
    return res.status(500).json({ error: "Failed to load open stock balances" });
  }
};

export default handler;
