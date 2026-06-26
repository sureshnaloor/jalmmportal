// Temporarily disabled — document type matching needs alignment with actual stored values.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(503).json({
    error: 'Complete document set report is temporarily disabled',
    disabled: true,
  });
}
