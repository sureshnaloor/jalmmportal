import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { connectToDatabase } from "../../../../lib/mongoconnect";
import { searchEstimationMaterial } from "../../../../lib/estimationSupport";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const description = String(req.body?.description || "").trim();
  if (description.length < 3) {
    return res.status(400).json({
      error: "Enter a material description of at least a few characters.",
    });
  }

  try {
    const { db } = await connectToDatabase();
    const result = await searchEstimationMaterial(db, description);
    if (!result.ready) {
      return res.status(503).json({
        error: "Material embeddings are not ready yet. Index materialembeddings and try again.",
      });
    }

    return res.status(200).json({
      description,
      indexSize: result.indexSize,
      best: result.best,
      alternatives: result.alternatives,
    });
  } catch (error) {
    console.error("estimation-support match error:", error);
    return res.status(500).json({
      error: error.message || "Failed to match this material description",
    });
  }
}
