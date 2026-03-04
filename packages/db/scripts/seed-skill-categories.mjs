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

function buildSeedCategories() {
  return [
    {
      name: "llm",
      displayName: "LLM",
      description: "Prompting, model orchestration, and LLM workflow design.",
      status: "active",
    },
    {
      name: "nlp",
      displayName: "NLP",
      description: "Text classification, summarization, extraction, and language tasks.",
      status: "active",
    },
    {
      name: "computer-vision",
      displayName: "Computer Vision",
      description: "Image analysis, OCR, detection, and visual intelligence workflows.",
      status: "active",
    },
    {
      name: "data-analytics",
      displayName: "Data Analytics",
      description: "SQL, BI, dashboarding, experimentation, and product analytics.",
      status: "active",
    },
    {
      name: "automation",
      displayName: "Automation",
      description: "Process automation, workflow integration, and task orchestration.",
      status: "active",
    },
    {
      name: "development",
      displayName: "Development",
      description: "Backend, frontend, scripts, API integration, and software delivery.",
      status: "active",
    },
    {
      name: "devops",
      displayName: "DevOps",
      description: "Infrastructure, CI/CD, observability, and deployment reliability.",
      status: "active",
    },
    {
      name: "marketing",
      displayName: "Marketing",
      description: "SEO, growth campaigns, content strategy, and conversion optimization.",
      status: "active",
    },
    {
      name: "customer-support",
      displayName: "Customer Support",
      description: "Help center, ticket triage, support automation, and resolution workflows.",
      status: "active",
    },
    {
      name: "operations",
      displayName: "Operations",
      description: "Back-office workflows, SOP automation, and internal operations support.",
      status: "active",
    },
    {
      name: "research",
      displayName: "Research",
      description: "Market, competitor, and knowledge synthesis for decision making.",
      status: "active",
    },
    {
      name: "compliance",
      displayName: "Compliance",
      description: "Policy checks, auditing workflows, and governance-related tasks.",
      status: "inactive",
    },
  ];
}

async function main() {
  const sql = postgres(requireDatabaseUrl(), { prepare: false });

  try {
    const seeds = buildSeedCategories();

    for (const category of seeds) {
      await sql`
        insert into skill_categories (name, display_name, description, status)
        values (${category.name}, ${category.displayName}, ${category.description}, ${category.status})
        on conflict (name)
        do update
          set display_name = excluded.display_name,
              description = excluded.description,
              status = excluded.status,
              updated_at = now()
      `;
    }

    const rows = await sql`
      select id, name, display_name, status
      from skill_categories
      order by display_name asc
    `;

    console.log(`Seeded/updated ${seeds.length} skill categories.`);
    console.table(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        displayName: row.display_name,
        status: row.status,
      }))
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("[seed-skill-categories] Failed:", err.message);
  process.exit(1);
});
