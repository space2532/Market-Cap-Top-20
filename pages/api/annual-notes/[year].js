export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const { year } = req.query;

  if (!year || !/^\d{4}$/.test(year)) {
    return res.status(400).json({ error: 'Invalid year parameter. Provide a 4-digit year.' });
  }

  // Connect to MongoDB
  let db = null;
  try {
    const mod = await import('../../../lib/mongodb.js');
    const getDb = mod.getDb;
    const dbName = process.env.MONGODB_DB || 'market_cap_portfolio';
    db = await getDb(dbName);
  } catch (e) {
    console.error('Database connection failed:', e);
    return res.status(500).json({ error: 'Database connection failed' });
  }

  const collection = db.collection('annual_notes');

  if (req.method === 'GET') {
    try {
      const doc = await collection.findOne({ year: String(year) });
      if (!doc) {
        return res.status(200).json({});
      }
      return res.status(200).json({
        theme: doc.theme ?? '',
        trend: doc.trend ?? '',
      });
    } catch (e) {
      console.error('Failed to fetch annual notes:', e);
      return res.status(500).json({ error: 'Failed to fetch annual notes' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { theme, trend } = req.body || {};

      const updateFields = {};
      if (typeof theme === 'string') updateFields.theme = theme;
      if (typeof trend === 'string') updateFields.trend = trend;

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: 'Body must include theme or trend' });
      }

      const filter = { year: String(year) };
      const update = { $set: { year: String(year), ...updateFields } };
      await collection.updateOne(filter, update, { upsert: true });

      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Failed to save annual note:', e);
      return res.status(500).json({ error: 'Failed to save annual note' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method Not Allowed' });
}