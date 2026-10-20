// src/lib/mongodb.js

import { MongoClient } from "mongodb";
import { DB_NAME } from "./constant";

const options = {};
let globalClientPromise;

export function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please add your Mongo URI to .env.local or set MONGODB_URI env variable",
    );
  }
  // Reuse one connection pool per server instance in every environment.
  // A new client per call would open a new pool on each request and use up
  // the Atlas connection limit on Vercel.
  if (!globalClientPromise) {
    const client = new MongoClient(uri, options);
    globalClientPromise = client.connect().catch((error) => {
      // Let the next request try again instead of reusing a failed connection
      globalClientPromise = undefined;
      throw error;
    });
  }
  return globalClientPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}
