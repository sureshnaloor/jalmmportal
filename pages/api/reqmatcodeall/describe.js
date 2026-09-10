import { getServerSession } from "next-auth/next";
import { OpenAI } from "openai";
import { authOptions } from "../auth/[...nextauth]";
import { connectToDatabase } from "../../../lib/mongoconnect";
import {
  enforceSapDescription,
  findSimilarMaterials,
} from "../../../lib/reqmatcodeallSearch";

const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

function fallbackDescription(specification) {
  return enforceSapDescription(specification);
}

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
    return res.status(400).json({ error: "Specification is required" });
  }

  try {
    const { db } = await connectToDatabase();
    let similar = Array.isArray(req.body?.similarMaterials)
      ? req.body.similarMaterials
      : [];

    if (similar.length === 0) {
      const found = await findSimilarMaterials(db, specification);
      similar = found.matches;
    }

    const examples = similar
      .slice(0, 12)
      .map((m) => {
        const code = m["material-code"] || m.code || "";
        const desc = m["material-description"] || m.description || "";
        const uom = m["unit-measure"] || m.uom || "";
        return `- ${code}: ${desc}${uom ? ` [${uom}]` : ""}`;
      })
      .join("\n");

    if (!OPENAI_API_KEY) {
      return res.status(200).json({
        description: fallbackDescription(specification),
        suggestedUom: similar[0]?.["unit-measure"] || req.body?.uom || "EA",
        usedFallback: true,
        exampleCount: similar.length,
      });
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.15,
      max_tokens: 120,
      messages: [
        {
          role: "system",
          content:
            "You are an SAP MM specialist who writes short material master descriptions. Reply with JSON only.",
        },
        {
          role: "user",
          content: `Create a SAP material-master short description for a NEW material.

USER SPECIFICATION:
${specification}

EXISTING MATERIALS OF SIMILAR NATURE (use these as the style guide):
${examples || "(no close matches found — still follow typical SAP noun-first style)"}

RULES:
1. Output MUST be UPPERCASE.
2. Output MUST be 40 characters or fewer. Count spaces.
3. Match the wording, abbreviations, and order used by the similar existing materials.
4. Typical order: NOUN / PRIMARY TYPE, SIZE, RATING/CLASS, MATERIAL GRADE, OTHER KEY SPEC.
5. Use common SAP abbreviations (SS, CS, SW, BW, NPT, SCH, GI, PVC, XLPE, etc.) when the examples do.
6. Do not invent a material code.
7. Do not wrap the description in quotes.
8. Prefer the unit of measure used by the closest similar materials.

Return JSON only in this shape:
{"description":"....","uom":"EA"}`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    let parsed = {};
    try {
      const jsonText = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(jsonText);
    } catch {
      parsed = { description: raw };
    }

    const description = enforceSapDescription(
      parsed.description || fallbackDescription(specification)
    );
    const suggestedUom = String(
      parsed.uom || similar[0]?.["unit-measure"] || req.body?.uom || "EA"
    )
      .trim()
      .toUpperCase()
      .slice(0, 8);

    return res.status(200).json({
      description,
      suggestedUom,
      length: description.length,
      exampleCount: similar.length,
      usedFallback: false,
    });
  } catch (error) {
    console.error("reqmatcodeall describe error:", error);
    return res.status(200).json({
      description: fallbackDescription(req.body?.specification),
      suggestedUom: req.body?.uom || "EA",
      usedFallback: true,
      error: "OpenAI request failed; a shortened specification was used instead.",
    });
  }
}
