import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Use placeholder during build when DATABASE_URL may not be set (e.g. CI).
const url = process.env.DATABASE_URL || "postgresql://localhost:5432/placeholder";

// Supabase: use Session pooler (port 5432) for persistent servers like Next.js.
// Transaction pooler (6543) requires prepare: false and is for serverless only.
const isSupabasePooler = url.includes("pooler.supabase.com");
const isTransactionMode = url.includes(":6543/");
const client = postgres(url, {
  ...(isSupabasePooler && { ssl: "require" }),
  ...(isTransactionMode && { prepare: false }),
});
export const db = drizzle(client, { schema });
