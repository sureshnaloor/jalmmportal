import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectToDatabase } from "../../../lib/mongoconnect";
import { findSimilarMaterials } from "../../../lib/reqmatcodeallSearch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const specification = String(req.body?.specification || "").trim();
  if (specification.length < 4) {
    return res.status(400).json({
      error: "Please enter a more complete specification (at least a few words).",
    });
  }

  try {
    const { db } = await connectToDatabase();
    const result = await findSimilarMaterials(db, specification);

    return res.status(200).json({
      specification,
      tokens: result.tokens || [],
      count: result.matches.length,
      matches: result.matches,
      mode: result.mode || "lexical",
      indexSize: result.indexSize || 0,
    });
  } catch (error) {
    console.error("reqmatcodeall search error:", error);
    return res.status(500).json({ error: "Failed to search similar materials" });
  }
}
