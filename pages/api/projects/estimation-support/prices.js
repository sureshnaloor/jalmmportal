import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { connectToDatabase } from "../../../../lib/mongoconnect";
import { fetchEstimationPrices } from "../../../../lib/estimationSupport";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const materialCode = String(req.query.materialCode || "").trim();
  if (!materialCode) {
    return res.status(400).json({ error: "A material code is required." });
  }

  try {
    const { db } = await connectToDatabase();
    const prices = await fetchEstimationPrices(db, materialCode);
    return res.status(200).json(prices);
  } catch (error) {
    console.error("estimation-support prices error:", error);
    return res.status(500).json({
      error: error.message || "Failed to load stock and purchase prices",
    });
  }
}
