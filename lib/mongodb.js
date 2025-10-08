// Connection helper for MongoDB Atlas in Next.js
// Caches the client across hot reloads to avoid exhausting connections in development

import { MongoClient } from "mongodb";

const mongodbUri = process.env.MONGODB_URI;

let client;
let clientPromise;

if (!mongodbUri) {
  // Do not throw at module import time (would crash dev server). Let callers handle the rejection.
  clientPromise = Promise.reject(
    new Error(
      "Missing MONGODB_URI. Set it in .env.local as MONGODB_URI=your-connection-string"
    )
  );
} else {
  const clientOptions = {};

  if (process.env.NODE_ENV === "development") {
    // In development, use a global variable so the value is preserved across module reloads caused by HMR.
    if (!global._mongoClientPromise) {
      client = new MongoClient(mongodbUri, clientOptions);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production, create a new client instance for each serverless invocation/container
    client = new MongoClient(mongodbUri, clientOptions);
    clientPromise = client.connect();
  }
}

export default clientPromise;

export async function getDb(databaseName) {
  const connectedClient = await clientPromise;
  return connectedClient.db(databaseName);
}


