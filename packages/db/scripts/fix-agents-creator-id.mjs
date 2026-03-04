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
    console.log("🔍 Checking for agents with null creator_id...");
    
    // Check how many agents have null creator_id
    const nullAgents = await sql`
      SELECT id, name, creator_id, type
      FROM ai_agents
      WHERE creator_id IS NULL
    `;

    if (nullAgents.length === 0) {
      console.log("✅ No agents with null creator_id found. Nothing to fix.");
      return;
    }

    console.log(`⚠️  Found ${nullAgents.length} agents with null creator_id:`);
    console.table(nullAgents.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type || 'unknown',
      creator_id: a.creator_id
    })));

    // Get first active account to use as default creator
    const [defaultAccount] = await sql`
      SELECT id, email
      FROM accounts
      WHERE status = 'active'
      ORDER BY created_at ASC
      LIMIT 1
    `;

    if (!defaultAccount) {
      throw new Error(
        "No active accounts found. Cannot assign creator_id. Please create an account first."
      );
    }

    console.log(`\n📝 Using default creator: ${defaultAccount.id} (${defaultAccount.email})`);

    // Ask for confirmation (in production, you might want to make this interactive)
    const action = process.env.FIX_ACTION || "assign"; // 'assign' or 'delete'
    
    if (action === "delete") {
      console.log("\n🗑️  Deleting agents with null creator_id...");
      const deleted = await sql`
        DELETE FROM ai_agents
        WHERE creator_id IS NULL
        RETURNING id, name
      `;
      console.log(`✅ Deleted ${deleted.length} agents.`);
      console.table(deleted);
    } else {
      console.log("\n✏️  Assigning default creator_id to agents with null creator_id...");
      const updated = await sql`
        UPDATE ai_agents
        SET creator_id = ${defaultAccount.id}
        WHERE creator_id IS NULL
        RETURNING id, name, creator_id
      `;
      console.log(`✅ Updated ${updated.length} agents.`);
      console.table(updated);
    }

    // Verify no null values remain
    const remainingNull = await sql`
      SELECT COUNT(*) as count
      FROM ai_agents
      WHERE creator_id IS NULL
    `;

    if (remainingNull[0].count > 0) {
      throw new Error(`❌ Still have ${remainingNull[0].count} agents with null creator_id`);
    }

    console.log("\n✅ All agents now have creator_id. Safe to add NOT NULL constraint.");

    // Optionally drop type column if it exists
    console.log("\n🔍 Checking for type column...");
    try {
      const hasTypeColumn = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'ai_agents' AND column_name = 'type'
      `;

      if (hasTypeColumn.length > 0) {
        console.log("⚠️  Type column exists. You may want to drop it manually:");
        console.log("   ALTER TABLE ai_agents DROP COLUMN IF EXISTS type;");
      } else {
        console.log("✅ Type column does not exist (or already dropped).");
      }
    } catch (err) {
      console.log("⚠️  Could not check for type column:", err.message);
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("[fix-agents-creator-id] Failed:", err.message);
  process.exit(1);
});
