import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectToDatabase } from "../../../lib/mongoconnect";
import {
  getEmbeddingStatus,
  indexMaterialEmbeddings,
} from "../../../lib/materialVectorSearch";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { db } = await connectToDatabase();

    if (req.method === "GET") {
      const status = await getEmbeddingStatus(db);
      return res.status(200).json(status);
    }

    if (req.method === "POST") {
      const batchSize = Math.min(100, Math.max(10, Number(req.body?.batchSize) || 80));
      const force = Boolean(req.body?.force);
      const result = await indexMaterialEmbeddings(db, { batchSize, force });
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("reqmatcodeall embeddings error:", error);
    return res.status(500).json({
      error: error.message || "Failed to update material embeddings",
    });
  }
}
