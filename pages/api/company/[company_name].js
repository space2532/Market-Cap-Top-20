import clientPromise, { getDb } from "../../../lib/mongodb";

const RESERVED_FIELDS = new Set(["_id", "company_name"]);

export default async function handler(req, res) {
  const { company_name: companyName } = req.query;

  if (!companyName || typeof companyName !== "string" || companyName.trim() === "") {
    return res.status(400).json({ error: "Invalid company_name parameter." });
  }

  try {
    await clientPromise; // ensure client is connected
    const databaseName = process.env.MONGODB_DB || "market_cap";
    const db = await getDb(databaseName);
    const collection = db.collection("companies");

    if (req.method === "GET") {
      const document = await collection.findOne(
        { company_name: companyName },
        { projection: { _id: 0 } }
      );

      if (!document) {
        return res.status(404).json({ error: "Company not found" });
      }

      return res.status(200).json(document);
    }

    if (req.method === "POST") {
      const { field, text } = req.body || {};

      if (!field || typeof field !== "string" || field.trim() === "") {
        return res.status(400).json({ error: "Field is required and must be a non-empty string." });
      }
      if (RESERVED_FIELDS.has(field)) {
        return res.status(400).json({ error: `Field '${field}' cannot be modified.` });
      }

      const update = {
        $set: {
          [field]: text,
          last_updated: new Date(),
        },
        $setOnInsert: { company_name: companyName },
      };

      const result = await collection.updateOne(
        { company_name: companyName },
        update,
        { upsert: true }
      );

      const updated = await collection.findOne(
        { company_name: companyName },
        { projection: { _id: 0 } }
      );
      const statusCode = result.upsertedId ? 201 : 200;
      return res.status(statusCode).json(updated);
    }

    if (req.method === "DELETE") {
      const { field } = req.body || {};

      if (!field || typeof field !== "string" || field.trim() === "") {
        return res.status(400).json({ error: "Field is required and must be a non-empty string." });
      }
      if (RESERVED_FIELDS.has(field)) {
        return res.status(400).json({ error: `Field '${field}' cannot be deleted.` });
      }

      const update = {
        $unset: { [field]: "" },
        $set: { last_updated: new Date() },
      };

      const result = await collection.updateOne(
        { company_name: companyName },
        update
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Company not found" });
      }

      const updated = await collection.findOne(
        { company_name: companyName },
        { projection: { _id: 0 } }
      );
      return res.status(200).json(updated);
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error("/api/company/[company_name] error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


