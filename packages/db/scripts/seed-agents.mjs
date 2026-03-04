import postgres from "postgres";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DAY_MS = 24 * 60 * 60 * 1000;

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

function buildMockAgents() {
  return [
    {
      name: "[MOCK] SEO Content Strategist",
      description: "Plans SEO pillars, clusters, and content strategy for growth teams.",
      status: "active",
      skills: ["SEO", "Content Planning", "Keyword Research"],
      capabilities:
        "Generates content roadmap, topic clusters, and SERP-focused outlines.",
      pricingModel: "fixed",
      price: "149.00",
      rating: "4.80",
      totalJobs: 42,
      completedJobs: 39,
    },
    {
      name: "[MOCK] Data Analyst Copilot",
      description: "Transforms event logs and raw data into clear product insights.",
      status: "active",
      skills: ["SQL", "Analytics", "Dashboarding"],
      capabilities: "Analyzes funnels, cohorts, retention, and conversion anomalies.",
      pricingModel: "hourly",
      price: "35.00",
      rating: "4.65",
      totalJobs: 58,
      completedJobs: 54,
    },
    {
      name: "[MOCK] Product Copywriter",
      description: "Writes conversion-focused product copy across onboarding flows.",
      status: "active",
      skills: ["Copywriting", "UX Writing", "A/B Messaging"],
      capabilities: "Creates headlines, value props, and product onboarding copy.",
      pricingModel: "fixed",
      price: "120.00",
      rating: "4.70",
      totalJobs: 36,
      completedJobs: 31,
    },
    {
      name: "[MOCK] API Documentation Agent",
      description: "Creates developer-friendly API docs and integration examples.",
      status: "active",
      skills: ["API Docs", "OpenAPI", "Developer Experience"],
      capabilities: "Builds endpoint docs, quick starts, and code snippets.",
      pricingModel: "subscription",
      price: "89.00",
      rating: "4.55",
      totalJobs: 29,
      completedJobs: 26,
    },
    {
      name: "[MOCK] Competitor Intelligence Bot",
      description: "Collects and summarizes competitor positioning and pricing changes.",
      status: "active",
      skills: ["Market Research", "Positioning", "Monitoring"],
      capabilities: "Tracks feature and pricing changes and outputs weekly briefs.",
      pricingModel: "fixed",
      price: "99.00",
      rating: "4.40",
      totalJobs: 21,
      completedJobs: 18,
    },
    {
      name: "[MOCK] Social Media Planner",
      description: "Prepares channel-specific social content calendars and post ideas.",
      status: "active",
      skills: ["Social Strategy", "Campaign Planning", "Brand Voice"],
      capabilities: "Produces monthly calendars with platform-tailored variations.",
      pricingModel: "fixed",
      price: "109.00",
      rating: "4.60",
      totalJobs: 33,
      completedJobs: 30,
    },
    {
      name: "[MOCK] Support FAQ Curator",
      description: "Turns support tickets into clear FAQ and troubleshooting guides.",
      status: "active",
      skills: ["Knowledge Base", "Customer Support", "Documentation"],
      capabilities: "Creates categorized FAQ content with concise answer templates.",
      pricingModel: "hourly",
      price: "28.00",
      rating: "4.35",
      totalJobs: 19,
      completedJobs: 16,
    },
    {
      name: "[MOCK] Release Notes Writer",
      description: "Converts sprint changes into readable user-facing release notes.",
      status: "active",
      skills: ["Technical Writing", "Product Comms", "Change Logs"],
      capabilities: "Drafts segmented release notes for users and stakeholders.",
      pricingModel: "fixed",
      price: "85.00",
      rating: "4.50",
      totalJobs: 25,
      completedJobs: 23,
    },
    {
      name: "[MOCK] Experimental Vision Agent",
      description: "Beta image interpretation workflow for product operations.",
      status: "pending",
      skills: ["Vision", "Classification", "Automation"],
      capabilities: "Performs image tagging and extraction in batch workflows.",
      pricingModel: "subscription",
      price: "129.00",
      rating: "0.00",
      totalJobs: 0,
      completedJobs: 0,
    },
    {
      name: "[MOCK] Legacy Outreach Bot",
      description: "Legacy outbound content generator, currently suspended.",
      status: "suspended",
      skills: ["Outreach", "Email Drafting", "Lead Nurturing"],
      capabilities: "Generates outbound sequences with role-based templates.",
      pricingModel: "fixed",
      price: "59.00",
      rating: "3.90",
      totalJobs: 14,
      completedJobs: 10,
    },
  ];
}

async function main() {
  const sql = postgres(requireDatabaseUrl(), { prepare: false });

  try {
    const accounts = await sql`
      select id, email
      from accounts
      where status = 'active'
      order by created_at asc
      limit 20
    `;

    if (!accounts.length) {
      throw new Error(
        "No active accounts found in `accounts` table. Create or sync accounts first, then run seed again."
      );
    }

    await sql`delete from ai_agents where name like '[MOCK] %'`;

    const templates = buildMockAgents();
    const forcedCreatorId = process.env.SEED_CREATOR_ID?.trim() || null;
    const forcedCreator = forcedCreatorId
      ? accounts.find((a) => a.id === forcedCreatorId)
      : null;

    if (forcedCreatorId && !forcedCreator) {
      throw new Error(
        `SEED_CREATOR_ID=${forcedCreatorId} is not an active account in accounts table.`
      );
    }

    const ownerPool = forcedCreator ? [forcedCreator] : accounts;
    const inserted = [];

    for (let i = 0; i < templates.length; i += 1) {
      const t = templates[i];
      const owner = ownerPool[i % ownerPool.length];
      const createdAt = new Date(Date.now() - (templates.length - i) * DAY_MS);
      const updatedAt = new Date(createdAt.getTime() + 60 * 60 * 1000);
      const approvedAt = t.status === "active" ? new Date(createdAt.getTime() + 30 * 60 * 1000) : null;

      const creatorId = owner.id; // All agents now require a creator

      const [agent] = await sql`
        insert into ai_agents (
          creator_id,
          name,
          description,
          status,
          skills,
          capabilities,
          pricing_model,
          price,
          rating,
          total_jobs,
          completed_jobs,
          created_at,
          updated_at,
          approved_at
        ) values (
          ${creatorId},
          ${t.name},
          ${t.description},
          ${t.status},
          ${sql.json(t.skills)},
          ${t.capabilities},
          ${t.pricingModel},
          ${t.price},
          ${t.rating},
          ${t.totalJobs},
          ${t.completedJobs},
          ${createdAt},
          ${updatedAt},
          ${approvedAt}
        )
        returning id, name, status, creator_id
      `;

      inserted.push(agent);
    }

    if (forcedCreator) {
      console.log(`Seeding creator fixed to: ${forcedCreator.id} (${forcedCreator.email})`);
    } else {
      console.log(`Seeding creators in round-robin across ${ownerPool.length} active accounts.`);
    }

    console.log(`Seeded ${inserted.length} mock agents.`);
    console.table(
      inserted.map((a) => ({
        id: a.id,
        status: a.status,
        creator: a.creator_id,
        name: a.name,
      }))
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("[seed-agents] Failed:", err.message);
  process.exit(1);
});
