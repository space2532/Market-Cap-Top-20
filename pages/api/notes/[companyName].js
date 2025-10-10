export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const { companyName } = req.query;
  if (!companyName || typeof companyName !== 'string') {
    return res.status(400).json({ error: 'Invalid companyName' });
  }

  const decodedName = decodeURIComponent(companyName);
  const allowedFields = new Set(['industry', 'business', 'recent_issues', 'user_memo']);

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

  if (req.method === 'GET') {
    try {
      const collection = db.collection('notes');
      const doc = await collection.findOne({ companyName: decodedName });
      return res.status(200).json({
        companyName: decodedName,
        industry: doc?.industry || '',
        business: doc?.business || '',
        recent_issues: doc?.recent_issues || '',
        user_memo: doc?.user_memo || '',
        last_updated: doc?.last_updated || null,
      });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { field, content } = req.body || {};
      if (!allowedFields.has(field)) {
        return res.status(400).json({ error: 'Invalid field' });
      }
      const value = String(content || '');
      const collection = db.collection('notes');
      const update = { 
        $set: { 
          companyName: decodedName, 
          [field]: value,
          last_updated: new Date()
        } 
      };
      await collection.updateOne({ companyName: decodedName }, update, { upsert: true });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save note' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { field } = req.body || {};
      if (!allowedFields.has(field)) {
        return res.status(400).json({ error: 'Invalid field' });
      }
      const collection = db.collection('notes');
      const update = { 
        $set: { 
          [field]: '',
          last_updated: new Date()
        } 
      };
      await collection.updateOne({ companyName: decodedName }, update, { upsert: true });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to delete note' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ error: 'Method Not Allowed' });
}


