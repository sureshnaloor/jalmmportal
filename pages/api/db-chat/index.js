import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { listReadableCollections, runDbChat } from "../../../lib/mcp/dbChatAgent";

export const config = {
  api: {
    responseLimit: false,
  },
};

function writeSse(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  if (typeof res.flush === "function") res.flush();
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "GET") {
    try {
      const data = await listReadableCollections();
      return res.status(200).json(data);
    } catch (error) {
      console.error("DB chat collections error:", error);
      const message = String(error.message || error);
      const unreachable = /not valid|unreachable|ETIMEDOUT|ECONNREFUSED|timed out|wire version/i.test(
        message
      );
      const wireMismatch = /wire version/i.test(message);
      return res.status(503).json({
        error: wireMismatch
          ? "MongoDB MCP could not connect because the database is older than the official MCP driver. The app now uses the portal's MongoDB 4.2-compatible driver — restart the server and try again."
          : unreachable
          ? "MongoDB MCP is running in read-only mode, but the database server is not reachable right now. Check that MongoDB is up and MONGODB_URI in .env.local is correct."
          : message || "Failed to list collections via MongoDB MCP",
      });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const lastUser = [...messages]
    .reverse()
    .find((msg) => msg?.role === "user" && String(msg.content || "").trim());
  if (!lastUser) {
    return res.status(400).json({ error: "A user prompt is required" });
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  try {
    const result = await runDbChat({
      messages,
      onEvent: (event) => writeSse(res, event.type, event),
    });
    writeSse(res, "done", result);
    res.end();
  } catch (error) {
    console.error("DB chat error:", error);
    writeSse(res, "error", {
      error: error.message || "Failed to query MongoDB via MCP",
    });
    res.end();
  }
}
