import { connectToDatabase } from "../../../../lib/mongoconnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

const COLLECTION = "opengrpoclosures";

function userFromSession(session) {
  return {
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    role: session?.user?.role || "",
  };
}

function serializeDoc(doc) {
  if (!doc) return null;
  return {
    ...doc,
    _id: doc._id ? String(doc._id) : undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
}

const handler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

    if (req.method === "GET") {
      const docs = await collection.find({}).toArray();
      const byPo = {};
      docs.forEach((doc) => {
        if (doc.ponumber) byPo[doc.ponumber] = serializeDoc(doc);
      });
      return res.json({ closures: byPo });
    }

    if (req.method === "POST") {
      try {
        await collection.createIndex({ ponumber: 1 }, { unique: true });
      } catch {
        // index may already exist
      }

      const {
        ponumber,
        toClose,
        reason,
        vendorcode,
        vendorname,
        plantCode,
        poDate,
        lineCount,
        pendingValSar,
        poValueSar,
      } = req.body || {};

      const po = String(ponumber || "").trim();
      if (!po) {
        return res.status(400).json({ error: "PO number is required" });
      }

      const marked = Boolean(toClose);
      const reasonText = String(reason || "").trim();
      if (marked && reasonText.length < 3) {
        return res.status(400).json({
          error: "Reason for closing is required when marking a PO to close",
        });
      }

      const user = userFromSession(session);
      const now = new Date();
      const existing = await collection.findOne({ ponumber: po });

      const historyEntry = {
        toClose: marked,
        reason: reasonText,
        updatedAt: now,
        updatedByName: user.name,
        updatedByEmail: user.email,
      };

      const setFields = {
        ponumber: po,
        toClose: marked,
        reason: reasonText,
        vendorcode: vendorcode || existing?.vendorcode || "",
        vendorname: vendorname || existing?.vendorname || "",
        plantCode: plantCode || existing?.plantCode || "",
        poDate: poDate || existing?.poDate || null,
        lineCount: lineCount ?? existing?.lineCount ?? null,
        pendingValSar: pendingValSar ?? existing?.pendingValSar ?? null,
        poValueSar: poValueSar ?? existing?.poValueSar ?? null,
        updatedAt: now,
        updatedByName: user.name,
        updatedByEmail: user.email,
        updatedByRole: user.role,
      };

      if (!existing) {
        setFields.createdAt = now;
        setFields.createdByName = user.name;
        setFields.createdByEmail = user.email;
        setFields.createdByRole = user.role;
        setFields.history = [historyEntry];
        const result = await collection.insertOne(setFields);
        return res.status(201).json({
          message: "saved",
          closure: serializeDoc({ ...setFields, _id: result.insertedId }),
        });
      }

      await collection.updateOne(
        { ponumber: po },
        {
          $set: setFields,
          $push: { history: historyEntry },
        }
      );
      const updated = await collection.findOne({ ponumber: po });
      return res.status(200).json({ message: "saved", closure: serializeDoc(updated) });
    }

    return res.status(405).json({ error: "Method not supported" });
  } catch (error) {
    console.error("open-gr-closures", error);
    return res.status(500).json({ error: "Failed to save PO close request" });
  }
};

export default handler;
