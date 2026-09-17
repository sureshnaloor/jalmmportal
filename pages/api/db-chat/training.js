import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { saveTrainingLesson, trainingSummary } from "../../../lib/mcp/agentTraining";
import { isSupplyChainHead } from "../../../lib/vendorEvaluationApproval";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!isSupplyChainHead(session.user?.email)) {
    return res.status(403).json({
      error:
        "Currently under testing. This feature is available only for admin users.",
    });
  }

  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "GET") {
    return res.status(200).json(trainingSummary());
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const result = saveTrainingLesson(req.body || {}, {
      createdBy: session.user?.email || session.user?.name || null,
    });
    return res.status(201).json({
      message: "Training saved. The agent will use it on the next prompt.",
      lessonId: result.lesson.id,
      count: result.count,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Failed to save agent training",
    });
  }
}
