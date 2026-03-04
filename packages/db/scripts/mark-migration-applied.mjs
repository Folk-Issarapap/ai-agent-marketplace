import postgres from "postgres";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFromFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function loadEnv() {
  const root = resolve(__dirname, "../../..");
  const candidateFiles = [
    resolve(root, ".env"),
    resolve(root, ".env.local"),
    resolve(__dirname, "../.env"),
    resolve(__dirname, "../.env.local"),
  ];
  for (const file of candidateFiles) {
    loadEnvFromFile(file);
  }
}

function requireDatabaseUrl() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is required. Set it in root .env/.env.local or export it in the shell."
    );
  }
  return url;
}

async function main() {
  const sql = postgres(requireDatabaseUrl(), { prepare: false });

  try {
    console.log("🔍 Checking migration status...");

    // Check if migration 0000 is already applied
    const existing = await sql`
      SELECT hash, created_at
      FROM drizzle.__drizzle_migrations
      WHERE hash = '0000_smooth_the_spike'
    `;

    if (existing.length > 0) {
      console.log("✅ Migration 0000_smooth_the_spike is already marked as applied.");
      console.log("   Applied at:", existing[0].created_at);
    } else {
      console.log("📝 Marking migration 0000_smooth_the_spike as applied...");
      // Check if hash column exists and what the primary key is
      const tableInfo = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'drizzle' 
        AND table_name = '__drizzle_migrations'
      `;
      
      // Try to insert, ignore if already exists
      try {
        await sql`
          INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
          VALUES ('0000_smooth_the_spike', ${Date.now()})
        `;
        console.log("✅ Migration 0000_smooth_the_spike marked as applied.");
      } catch (err) {
        if (err.message.includes('duplicate') || err.message.includes('unique')) {
          console.log("✅ Migration 0000_smooth_the_spike was already marked (duplicate detected).");
        } else {
          throw err;
        }
      }
    }

    // Check migration 0001
    const existing0001 = await sql`
      SELECT hash, created_at
      FROM drizzle.__drizzle_migrations
      WHERE hash = '0001_conscious_gertrude_yorkes'
    `;

    if (existing0001.length > 0) {
      console.log("✅ Migration 0001_conscious_gertrude_yorkes is already applied.");
      console.log("   Applied at:", existing0001[0].created_at);
    } else {
      console.log("ℹ️  Migration 0001_conscious_gertrude_yorkes is not yet applied.");
      console.log("   Run 'pnpm db:migrate' to apply it.");
    }

    // Show all applied migrations
    const allMigrations = await sql`
      SELECT hash, created_at
      FROM drizzle.__drizzle_migrations
      ORDER BY created_at
    `;

    console.log("\n📋 All applied migrations:");
    console.table(allMigrations);

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("[mark-migration-applied] Failed:", err.message);
  process.exit(1);
});
