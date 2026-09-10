import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectToDatabase } from "../../../lib/mongoconnect";
import { enforceSapDescription } from "../../../lib/reqmatcodeallSearch";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userName = session.user.name || session.user.email;

  try {
    const { db } = await connectToDatabase();

    if (req.method === "GET") {
      const requests = await db
        .collection("matcoderequests")
        .find({ created_by: userName, source: "reqmatcodeall" })
        .sort({ created_at: -1 })
        .toArray();
      return res.status(200).json(requests);
    }

    if (req.method === "POST") {
      const newdescription = enforceSapDescription(req.body?.newdescription);
      const specification = String(req.body?.specification || "").trim();
      const uom = String(req.body?.uom || "").trim();

      if (!specification) {
        return res.status(400).json({ error: "Specification is required" });
      }
      if (!newdescription) {
        return res.status(400).json({ error: "SAP description is required" });
      }
      if (newdescription.length > 40) {
        return res
          .status(400)
          .json({ error: "SAP description must be 40 characters or fewer" });
      }
      if (!uom) {
        return res.status(400).json({ error: "Unit of measure is required" });
      }

      await db.collection("matcoderequests").insertOne({
        mattypeselected: req.body.mattypeselected || "",
        matgroupselected: req.body.matgroupselected || "",
        secondarymatgroupselected: req.body.secondarymatgroupselected || "",
        newdescription,
        longDesc: req.body.longDesc || specification,
        specification,
        uom,
        created_by: userName,
        created_at: new Date(),
        source: "reqmatcodeall",
        confirmedNotSimilar: true,
        similarMaterialCodes: Array.isArray(req.body.similarMaterialCodes)
          ? req.body.similarMaterialCodes
          : [],
      });

      return res.status(201).json({
        message: "Request for material code registered successfully",
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("reqmatcodeall save error:", error);
    return res.status(500).json({ error: "Failed to process request" });
  }
}
