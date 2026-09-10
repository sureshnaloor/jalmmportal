const STOP_WORDS = new Set([
  "A",
  "AN",
  "THE",
  "OF",
  "FOR",
  "AND",
  "OR",
  "WITH",
  "TO",
  "IN",
  "ON",
  "AT",
  "BY",
  "FROM",
  "AS",
  "IS",
  "IT",
  "THIS",
  "THAT",
  "THESE",
  "THOSE",
  "USED",
  "USE",
  "USING",
  "REQUIRED",
  "REQUIRE",
  "NEED",
  "NEEDED",
  "PLEASE",
  "MATERIAL",
  "MATERIALS",
  "ITEM",
  "ITEMS",
  "NEW",
  "CODE",
  "CODES",
  "DESCRIPTION",
  "SPEC",
  "SPECS",
  "SPECIFICATION",
  "TYPE",
  "SIZE",
  "MAKE",
  "BRAND",
  "MODEL",
  "QTY",
  "QUANTITY",
  "ONE",
  "TWO",
  "ALSO",
  "SAME",
  "LIKE",
  "SIMILAR",
  "REQUEST",
  "WE",
  "OUR",
  "HAVE",
  "HAS",
  "NOT",
  "NO",
  "YES",
]);

const SYNONYMS = {
  INCH: "IN",
  INCHES: "IN",
  MILLIMETER: "MM",
  MILLIMETERS: "MM",
  STAINLESS: "SS",
  KILOGRAM: "KG",
  KILOGRAMS: "KG",
  PIECE: "EA",
  EACH: "EA",
  PCS: "EA",
  PC: "EA",
  NOS: "EA",
  NUMBER: "EA",
};

function escapeRegex(string) {
  return String(string).replace(/[.*+?^${}()[\]\\/]/g, "\\$&");
}

export function extractTokens(text) {
  const normalized = String(text || "")
    .toUpperCase()
    .replace(/"/g, " IN ")
    .replace(/'/g, "");

  const raw = normalized
    .split(/[^A-Z0-9#./+-]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const tokens = [];
  const seen = new Set();

  raw.forEach((token) => {
    if (token.length < 2 && !/^\d+$/.test(token)) return;
    const mapped = SYNONYMS[token] || token;
    if (STOP_WORDS.has(token) && !SYNONYMS[token]) return;
    if (STOP_WORDS.has(mapped) && mapped === token) return;
    if (seen.has(mapped)) return;
    seen.add(mapped);
    tokens.push(mapped);
  });

  return tokens;
}

export function distinctiveTokens(tokens, limit = 5) {
  return [...tokens]
    .sort((a, b) => {
      const scoreA = a.length + (/[0-9]/.test(a) ? 3 : 0);
      const scoreB = b.length + (/[0-9]/.test(b) ? 3 : 0);
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

function descriptionRegex(term) {
  return { "material-description": { $regex: escapeRegex(term), $options: "i" } };
}

function scoreMaterial(material, tokens) {
  const desc = String(material["material-description"] || "").toUpperCase();
  const code = String(material["material-code"] || "").toUpperCase();
  const firstWord = desc.split(/[^A-Z0-9#./+-]+/).filter(Boolean)[0] || "";

  let score = 0;
  let matched = 0;

  tokens.forEach((token, index) => {
    if (desc.includes(token)) {
      matched += 1;
      score += token.length >= 4 ? 4 : 2;
      if (index === 0 && firstWord === token) score += 8;
      else if (firstWord === token) score += 4;
    }
    if (code.includes(token)) score += 1;
  });

  if (tokens.length > 0) {
    score += Math.round((matched / tokens.length) * 10);
  }

  return { score, matched, matchRatio: tokens.length ? matched / tokens.length : 0 };
}

function mergeByCode(lists) {
  const map = new Map();
  lists.flat().forEach((item) => {
    const code = item?.["material-code"];
    if (!code) return;
    if (!map.has(code)) map.set(code, item);
  });
  return Array.from(map.values());
}

async function queryMaterials(db, condition, limit) {
  return db
    .collection("materials")
    .find({
      $and: [
        condition,
        {
          "material-description": {
            $nin: ["UNDER CONSTRUCTION -DO NOT USE", ""],
          },
        },
      ],
    })
    .project({
      "material-code": 1,
      "material-description": 1,
      "unit-measure": 1,
      "material-group": 1,
      "material-type": 1,
    })
    .limit(limit)
    .toArray();
}

export async function findSimilarMaterialsLexical(db, specification) {
  const tokens = extractTokens(specification);
  if (tokens.length === 0) {
    return { tokens: [], matches: [] };
  }

  const distinctive = distinctiveTokens(tokens, 5);
  const results = [];

  const andTerms = distinctive.slice(0, Math.min(3, distinctive.length));
  if (andTerms.length > 0) {
    results.push(
      await queryMaterials(
        db,
        { $and: andTerms.map(descriptionRegex) },
        250
      )
    );
  }

  if (results.flat().length < 10 && andTerms.length > 1) {
    results.push(await queryMaterials(db, descriptionRegex(andTerms[0]), 350));
  }

  if (results.flat().length < 8 && distinctive.length > 0) {
    results.push(
      await queryMaterials(db, { $or: distinctive.map(descriptionRegex) }, 400)
    );
  }

  const candidates = mergeByCode(results).filter(
    (item) =>
      String(item["material-description"] || "").toUpperCase() !==
      "UNDER CONSTRUCTION -DO NOT USE"
  );

  const scored = candidates
    .map((material) => {
      const { score, matched, matchRatio } = scoreMaterial(material, tokens);
      return {
        "material-code": material["material-code"] || "",
        "material-description": material["material-description"] || "",
        "unit-measure": material["unit-measure"] || "",
        "material-group": material["material-group"] || "",
        "material-type": material["material-type"] || "",
        score,
        matchedTerms: matched,
        matchPercent: Math.round(matchRatio * 100),
      };
    })
    .filter((item) => item.score > 0 && item.matchedTerms > 0)
    .sort((a, b) => b.score - a.score || b.matchPercent - a.matchPercent)
    .slice(0, 25);

  const matches = await enrichMatchesWithGroupLookup(db, scored);

  return { tokens, matches };
}

export async function findSimilarMaterials(db, specification) {
  try {
    const { findSimilarMaterialsSemantic } = await import("./materialVectorSearch");
    const semantic = await findSimilarMaterialsSemantic(db, specification);
    if (semantic.ready && semantic.matches.length > 0) {
      const matches = await enrichMatchesWithGroupLookup(db, semantic.matches);
      return {
        tokens: [],
        matches,
        mode: "semantic",
        indexSize: semantic.indexSize,
      };
    }
  } catch (error) {
    console.error("Semantic material search failed, using text search:", error.message);
  }

  const lexical = await findSimilarMaterialsLexical(db, specification);
  return { ...lexical, mode: "lexical" };
}

async function enrichMatchesWithGroupLookup(db, matches) {
  if (!matches.length) return matches;

  const groupCodes = [
    ...new Set(matches.map((m) => m["material-group"]).filter(Boolean)),
  ];

  const [typeDocs, groupDocs] = await Promise.all([
    groupCodes.length
      ? db
          .collection("mattypes")
          .find({ matgroupprimary: { $in: groupCodes } })
          .project({
            materialtype: 1,
            matgroupprimary: 1,
            matgroupprimarydesc: 1,
            matgroupsecondarydesc: 1,
          })
          .toArray()
      : [],
    groupCodes.length
      ? db
          .collection("matgroup")
          .find({ "material-group": { $in: groupCodes } })
          .project({
            "material-group": 1,
            "matgroup-primary-desc": 1,
            "matgroup-secondary-desc": 1,
            "changed-primary-desc": 1,
            "changed-secondary-desc": 1,
          })
          .toArray()
      : [],
  ]);

  const typesByKey = new Map();
  const typesByGroup = new Map();
  typeDocs.forEach((doc) => {
    const group = doc.matgroupprimary;
    if (!group) return;
    typesByGroup.set(group, doc);
    if (doc.materialtype) {
      typesByKey.set(`${doc.materialtype}|${group}`, doc);
    }
  });

  const groupsByCode = new Map(
    groupDocs.map((doc) => [doc["material-group"], doc])
  );

  return matches.map((match) => {
    const sapGroup = match["material-group"];
    const sapType = match["material-type"];
    const typeDoc =
      typesByKey.get(`${sapType}|${sapGroup}`) || typesByGroup.get(sapGroup);
    const groupDoc = groupsByCode.get(sapGroup);

    return {
      ...match,
      "material-type": sapType || typeDoc?.materialtype || "",
      matgroupprimarydesc:
        typeDoc?.matgroupprimarydesc ||
        groupDoc?.["changed-primary-desc"] ||
        groupDoc?.["matgroup-primary-desc"] ||
        "",
      matgroupsecondarydesc:
        typeDoc?.matgroupsecondarydesc ||
        groupDoc?.["changed-secondary-desc"] ||
        groupDoc?.["matgroup-secondary-desc"] ||
        "",
    };
  });
}

export function enforceSapDescription(text) {
  const cleaned = String(text || "")
    .replace(/^(Output:|Standardized Description:|Description:)\s*/i, "")
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  if (cleaned.length <= 40) return cleaned;

  const sliced = cleaned.slice(0, 40);
  const lastSpace = sliced.lastIndexOf(" ");
  if (lastSpace >= 20) return sliced.slice(0, lastSpace).trim();
  return sliced.trim();
}
