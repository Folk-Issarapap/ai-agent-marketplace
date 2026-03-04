import postgres from "postgres";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DAY_MS = 24 * 60 * 60 * 1000;
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

function buildMockJobs() {
  return [
    {
      title: "[MOCK] Landing Page Copywriting",
      goal: "Create high-converting copy for an AI product landing page.",
      task: "Write hero headline, sub-headline, features section, and CTA copy.",
      allowedTools: ["notion", "google-docs"],
      budget: "120.00",
      status: "draft",
      deadlineOffsetDays: 5,
      revisionCount: 0,
      maxRevisions: 2,
    },
    {
      title: "[MOCK] SEO Blog Pack",
      goal: "Publish SEO-friendly blog content for product awareness.",
      task: "Generate 3 blog outlines and 1 full long-form article.",
      allowedTools: ["ahrefs", "google-search-console"],
      budget: "180.00",
      status: "published",
      deadlineOffsetDays: 7,
      revisionCount: 0,
      maxRevisions: 3,
    },
    {
      title: "[MOCK] Product Analytics Summary",
      goal: "Understand funnel drop-offs and conversion bottlenecks.",
      task: "Analyze event data and provide a weekly analytics summary.",
      allowedTools: ["mixpanel", "bigquery"],
      budget: "230.00",
      status: "matching",
      deadlineOffsetDays: 4,
      revisionCount: 1,
      maxRevisions: 3,
    },
    {
      title: "[MOCK] Support FAQ Builder",
      goal: "Reduce repetitive support tickets for onboarding issues.",
      task: "Draft an FAQ page with 20 common questions and clear answers.",
      allowedTools: ["intercom", "notion"],
      budget: "95.00",
      status: "active",
      deadlineOffsetDays: 3,
      revisionCount: 1,
      maxRevisions: 2,
    },
    {
      title: "[MOCK] Feature Comparison Matrix",
      goal: "Help users compare plans and choose suitable tiers.",
      task: "Create a detailed comparison matrix across Free, Pro, and Team plans.",
      allowedTools: ["figma", "google-sheets"],
      budget: "140.00",
      status: "in_review",
      deadlineOffsetDays: 2,
      revisionCount: 2,
      maxRevisions: 3,
    },
    {
      title: "[MOCK] API Onboarding Guide",
      goal: "Accelerate developer activation for API users.",
      task: "Write setup guide, auth flow docs, and sample requests.",
      allowedTools: ["postman", "github"],
      budget: "260.00",
      status: "completed",
      deadlineOffsetDays: -1,
      revisionCount: 1,
      maxRevisions: 2,
    },
    {
      title: "[MOCK] Competitor Research Snapshot",
      goal: "Identify positioning opportunities against competitors.",
      task: "Summarize top 5 competitors with strengths, weaknesses, and pricing.",
      allowedTools: ["google", "notion"],
      budget: "110.00",
      status: "cancelled",
      deadlineOffsetDays: 6,
      revisionCount: 0,
      maxRevisions: 2,
    },
    {
      title: "[MOCK] Release Notes Draft",
      goal: "Communicate product updates clearly to end users.",
      task: "Draft release notes for latest sprint with user-facing benefits.",
      allowedTools: ["jira", "notion"],
      budget: "80.00",
      status: "draft",
      deadlineOffsetDays: 4,
      revisionCount: 0,
      maxRevisions: 1,
    },
    {
      title: "[MOCK] Social Content Calendar",
      goal: "Maintain consistent weekly content output across channels.",
      task: "Produce a 4-week social calendar with post captions and hashtags.",
      allowedTools: ["canva", "buffer"],
      budget: "150.00",
      status: "published",
      deadlineOffsetDays: 8,
      revisionCount: 0,
      maxRevisions: 2,
    },
    {
      title: "[MOCK] Demo Video Script",
      goal: "Increase conversion from trial to paid with product storytelling.",
      task: "Write a 90-second demo script with scenes and voiceover notes.",
      allowedTools: ["loom", "figma"],
      budget: "175.00",
      status: "pending_confirmation",
      deadlineOffsetDays: 3,
      revisionCount: 1,
      maxRevisions: 2,
    },
  ];
}

async function main() {
  const sql = postgres(requireDatabaseUrl(), { prepare: false });

  try {
    const accounts = await sql`
      select id, name, email
      from accounts
      where status = 'active'
      order by created_at asc
      limit 10
    `;

    if (!accounts.length) {
      throw new Error(
        "No active accounts found in `accounts` table. Create or sync accounts first, then run seed again."
      );
    }

    await sql`delete from jobs where title like '[MOCK] %'`;

    const templates = buildMockJobs();
    const forcedHumanId = process.env.SEED_HUMAN_ID?.trim() || null;
    const forcedOwner = forcedHumanId
      ? accounts.find((a) => a.id === forcedHumanId)
      : null;

    if (forcedHumanId && !forcedOwner) {
      throw new Error(
        `SEED_HUMAN_ID=${forcedHumanId} is not an active account in accounts table.`
      );
    }

    const ownerPool = forcedOwner ? [forcedOwner] : accounts;
    const now = Date.now();
    const inserted = [];

    for (let i = 0; i < templates.length; i += 1) {
      const t = templates[i];
      const owner = ownerPool[i % ownerPool.length];
      const createdAt = new Date(now - (templates.length - i) * DAY_MS);
      const updatedAt = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);
      const deadline =
        t.deadlineOffsetDays >= 0 ? new Date(now + t.deadlineOffsetDays * DAY_MS) : null;

      const publishedAt =
        t.status === "published" ||
        t.status === "matching" ||
        t.status === "active" ||
        t.status === "in_review" ||
        t.status === "completed" ||
        t.status === "pending_confirmation"
          ? new Date(createdAt.getTime() + 1 * 60 * 60 * 1000)
          : null;

      const confirmedAt =
        t.status === "pending_confirmation" || t.status === "active" || t.status === "in_review" || t.status === "completed"
          ? new Date(createdAt.getTime() + 3 * 60 * 60 * 1000)
          : null;

      const completedAt =
        t.status === "completed" ? new Date(createdAt.getTime() + 26 * 60 * 60 * 1000) : null;

      const [job] = await sql`
        insert into jobs (
          human_id,
          title,
          goal,
          task,
          allowed_tools,
          budget,
          deadline,
          status,
          revision_count,
          max_revisions,
          created_at,
          updated_at,
          published_at,
          confirmed_at,
          completed_at
        ) values (
          ${owner.id},
          ${t.title},
          ${t.goal},
          ${t.task},
          ${sql.json(t.allowedTools)},
          ${t.budget},
          ${deadline},
          ${t.status},
          ${t.revisionCount},
          ${t.maxRevisions},
          ${createdAt},
          ${updatedAt},
          ${publishedAt},
          ${confirmedAt},
          ${completedAt}
        )
        returning id, title, status, human_id
      `;

      inserted.push(job);
    }

    if (forcedOwner) {
      console.log(`Seeding owner fixed to: ${forcedOwner.id} (${forcedOwner.email})`);
    } else {
      console.log(`Seeding owners in round-robin across ${ownerPool.length} active accounts.`);
    }
    console.log(`Seeded ${inserted.length} mock jobs.`);
    console.table(
      inserted.map((j) => ({
        id: j.id,
        status: j.status,
        owner: j.human_id,
        title: j.title,
      }))
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("[seed-jobs] Failed:", err.message);
  process.exit(1);
});
