import { connectToDatabase } from '../../../../lib/mongoconnect';

/**
 * GET: Returns PO numbers and values from vendorevaluation collection
 * for the given vendorcode. Uses the most recent powiseevalyearN (largest N),
 * and returns up to 2 entries from that year's powiserating array.
 * Does not modify or depend on vendorevaluationmarks or any other existing APIs.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { vendorcode } = req.query;
  if (!vendorcode) {
    return res.status(400).json({ error: 'vendorcode is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const doc = await db.collection('vendorevaluation').findOne({ vendorcode: String(vendorcode) });

    if (!doc) {
      return res.status(200).json({ vendorcode, poDetails: [], fixedEval: [] });
    }

    // Fixed eval: 5 values from fixedevalyear2024 (or fixedvalyear2024), else fixedevalyear1 (or fixedvalyear1)
    let fixedEval = [];
    const getFixedEval = (obj) => (obj && Array.isArray(obj.fixedeval) ? obj.fixedeval : null);
    const fixed2024 = getFixedEval(doc.fixedevalyear2024) || getFixedEval(doc.fixedvalyear2024);
    const fixed1 = getFixedEval(doc.fixedevalyear1) || getFixedEval(doc.fixedvalyear1);
    const fixedSource = fixed2024 || fixed1;
    if (fixedSource && fixedSource.length >= 5) {
      fixedEval = fixedSource.slice(0, 5).map((v) => (v != null ? Number(v) : ''));
    }

    const yearPattern = /^powiseevalyear(\d+)$/;
    let latestYear = -1;
    let latestYearKey = null;

    for (const key of Object.keys(doc)) {
      const m = key.match(yearPattern);
      if (m) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > latestYear && doc[key] && typeof doc[key] === 'object') {
          latestYear = num;
          latestYearKey = key;
        }
      }
    }

    let poDetails = [];
    if (latestYearKey !== null && Array.isArray(doc[latestYearKey].powiserating)) {
      const powiserating = doc[latestYearKey].powiserating;
      poDetails = powiserating
        .slice(0, 2)
        .map((item) => ({
          ponumber: item && (item.ponumber != null) ? String(item.ponumber) : '',
          povalue: item && (item.povalue != null) ? String(item.povalue) : '',
        }))
        .filter((item) => item.ponumber || item.povalue);
    }

    return res.status(200).json({ vendorcode, poDetails, fixedEval });
  } catch (error) {
    console.error('Error fetching vendorevaluation PO details:', error);
    return res.status(500).json({ error: 'Failed to fetch PO details' });
  }
}
