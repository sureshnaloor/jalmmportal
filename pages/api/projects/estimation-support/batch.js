import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { connectToDatabase } from "../../../../lib/mongoconnect";
import { matchEstimationBatch } from "../../../../lib/estimationSupport";
import { BULK_BATCH_SIZE } from "../../../../lib/estimationBulkSheet";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const items = req.body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Add at least one material description." });
  }
  if (items.length > BULK_BATCH_SIZE) {
    return res.status(400).json({
      error: `Send at most ${BULK_BATCH_SIZE} materials in one batch.`,
    });
  }

  try {
    const { db } = await connectToDatabase();
    const result = await matchEstimationBatch(db, items);
    if (!result.ready) {
      return res.status(503).json({
        error: "Material embeddings are not ready yet. Index materialembeddings and try again.",
      });
    }

    return res.status(200).json({
      indexSize: result.indexSize,
      rows: result.rows,
    });
  } catch (error) {
    console.error("estimation-support batch error:", error);
    return res.status(500).json({
      error: error.message || "Failed to match this batch",
    });
  }
}
