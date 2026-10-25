import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectToDatabase } from "../../../lib/mongoconnect";

const COLLECTION = "reqmatcodeallchoices";

function asText(value) {
  return String(value || "").trim();
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userName = session.user.name || session.user.email || "";
  const userEmail = session.user.email || "";

  try {
    const { db } = await connectToDatabase();

    if (req.method === "GET") {
      const choices = await db
        .collection(COLLECTION)
        .find({ $or: [{ userEmail }, { userName }] })
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();
      return res.status(200).json(choices);
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const originalDescription = asText(req.body?.originalDescription);
    const chosenDescription = asText(req.body?.chosenDescription);
    if (!originalDescription || !chosenDescription) {
      return res.status(400).json({
        error: "Original and chosen descriptions are required.",
      });
    }

    const doc = {
      userName,
      userEmail,
      createdAt: new Date(),
      source: asText(req.body?.source) || "single",
      csvRowIndex:
        req.body?.csvRowIndex == null ? null : Number(req.body.csvRowIndex),
      batchId: asText(req.body?.batchId) || null,
      selectionKind: asText(req.body?.selectionKind) || "existing",
      originalDescription,
      chosenDescription,
      originalUom: asText(req.body?.originalUom),
      chosenUom: asText(req.body?.chosenUom),
      originalType: asText(req.body?.originalType),
      chosenType: asText(req.body?.chosenType),
      originalGroup: asText(req.body?.originalGroup),
      chosenGroup: asText(req.body?.chosenGroup),
      chosenMaterialCode: asText(req.body?.chosenMaterialCode),
      templateMaterialCode: asText(req.body?.templateMaterialCode) || null,
      templateDescription: asText(req.body?.templateDescription),
    };

    await db.collection(COLLECTION).insertOne(doc);
    return res.status(201).json({ message: "Selection saved", id: doc._id });
  } catch (error) {
    console.error("reqmatcodeall choices error:", error);
    return res.status(500).json({ error: "Failed to save selection" });
  }
}
