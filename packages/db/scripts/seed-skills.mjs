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

function buildSeedSkills() {
  return [
    // LLM
    { name: "prompt-engineering", displayName: "Prompt Engineering", category: "llm", description: "Design effective prompts and prompt chains.", status: "active" },
    { name: "rag-architecture", displayName: "RAG Architecture", category: "llm", description: "Build retrieval-augmented generation pipelines.", status: "active" },
    { name: "agent-orchestration", displayName: "Agent Orchestration", category: "llm", description: "Coordinate multi-agent workflows and tool use.", status: "active" },
    { name: "llm-evaluation", displayName: "LLM Evaluation", category: "llm", description: "Measure answer quality, safety, and latency.", status: "active" },

    // NLP
    { name: "text-summarization", displayName: "Text Summarization", category: "nlp", description: "Summarize long-form text into concise insights.", status: "active" },
    { name: "entity-extraction", displayName: "Entity Extraction", category: "nlp", description: "Extract structured entities from documents.", status: "active" },
    { name: "intent-classification", displayName: "Intent Classification", category: "nlp", description: "Classify user intents and ticket themes.", status: "active" },
    { name: "sentiment-analysis", displayName: "Sentiment Analysis", category: "nlp", description: "Analyze sentiment across reviews and feedback.", status: "active" },

    // Computer Vision
    { name: "ocr-processing", displayName: "OCR Processing", category: "computer-vision", description: "Extract text from images and scanned files.", status: "active" },
    { name: "image-classification", displayName: "Image Classification", category: "computer-vision", description: "Categorize images by content labels.", status: "active" },
    { name: "object-detection", displayName: "Object Detection", category: "computer-vision", description: "Detect objects and regions in images.", status: "active" },

    // Data Analytics
    { name: "sql-analysis", displayName: "SQL Analysis", category: "data-analytics", description: "Explore and transform data with SQL.", status: "active" },
    { name: "dashboard-building", displayName: "Dashboard Building", category: "data-analytics", description: "Create BI dashboards and KPI monitoring.", status: "active" },
    { name: "cohort-analysis", displayName: "Cohort Analysis", category: "data-analytics", description: "Analyze retention and behavior by cohorts.", status: "active" },
    { name: "ab-testing", displayName: "A/B Testing", category: "data-analytics", description: "Design and evaluate controlled experiments.", status: "active" },

    // Automation
    { name: "workflow-automation", displayName: "Workflow Automation", category: "automation", description: "Automate recurring business workflows.", status: "active" },
    { name: "zapier-make-integration", displayName: "Zapier/Make Integration", category: "automation", description: "Connect no-code automation tools to systems.", status: "active" },
    { name: "task-scheduling", displayName: "Task Scheduling", category: "automation", description: "Set up scheduled jobs and event triggers.", status: "active" },

    // Development
    { name: "api-integration", displayName: "API Integration", category: "development", description: "Integrate third-party APIs and internal services.", status: "active" },
    { name: "typescript-development", displayName: "TypeScript Development", category: "development", description: "Build apps and services with TypeScript.", status: "active" },
    { name: "python-development", displayName: "Python Development", category: "development", description: "Develop automation and backend services in Python.", status: "active" },
    { name: "test-automation", displayName: "Test Automation", category: "development", description: "Write automated tests for quality assurance.", status: "active" },

    // DevOps
    { name: "ci-cd", displayName: "CI/CD", category: "devops", description: "Set up build/test/deploy pipelines.", status: "active" },
    { name: "docker-kubernetes", displayName: "Docker/Kubernetes", category: "devops", description: "Containerize and orchestrate workloads.", status: "active" },
    { name: "monitoring-observability", displayName: "Monitoring & Observability", category: "devops", description: "Track health, logs, and service reliability.", status: "active" },

    // Marketing
    { name: "seo", displayName: "SEO", category: "marketing", description: "Optimize content for search visibility.", status: "active" },
    { name: "content-strategy", displayName: "Content Strategy", category: "marketing", description: "Plan and execute content marketing programs.", status: "active" },
    { name: "conversion-copywriting", displayName: "Conversion Copywriting", category: "marketing", description: "Write conversion-focused landing copy.", status: "active" },
    { name: "paid-media-optimization", displayName: "Paid Media Optimization", category: "marketing", description: "Improve paid campaign efficiency and ROAS.", status: "active" },

    // Customer Support
    { name: "ticket-triage", displayName: "Ticket Triage", category: "customer-support", description: "Categorize and prioritize support tickets.", status: "active" },
    { name: "knowledge-base-management", displayName: "Knowledge Base Management", category: "customer-support", description: "Maintain searchable help documentation.", status: "active" },
    { name: "faq-generation", displayName: "FAQ Generation", category: "customer-support", description: "Generate FAQ entries from support trends.", status: "active" },

    // Operations
    { name: "sop-creation", displayName: "SOP Creation", category: "operations", description: "Create and maintain standard operating procedures.", status: "active" },
    { name: "backoffice-automation", displayName: "Backoffice Automation", category: "operations", description: "Automate internal operations processes.", status: "active" },
    { name: "reporting-operations", displayName: "Operations Reporting", category: "operations", description: "Generate recurring operational reports.", status: "active" },

    // Research
    { name: "market-research", displayName: "Market Research", category: "research", description: "Research market trends and opportunities.", status: "active" },
    { name: "competitor-analysis", displayName: "Competitor Analysis", category: "research", description: "Analyze competitor positioning and pricing.", status: "active" },
    { name: "user-research-synthesis", displayName: "User Research Synthesis", category: "research", description: "Synthesize interview and feedback findings.", status: "active" },

    // Compliance
    { name: "policy-review", displayName: "Policy Review", category: "compliance", description: "Review workflows against policy requirements.", status: "inactive" },
    { name: "audit-trail-validation", displayName: "Audit Trail Validation", category: "compliance", description: "Validate logs and data lineage for audits.", status: "inactive" },
  ];
}

async function main() {
  const sql = postgres(requireDatabaseUrl(), { prepare: false });

  try {
    const categories = await sql`
      select name from skill_categories
    `;
    const categorySet = new Set(categories.map((row) => row.name));

    const seeds = buildSeedSkills();
    const missingCategories = Array.from(
      new Set(seeds.map((s) => s.category).filter((category) => !categorySet.has(category)))
    );

    if (missingCategories.length > 0) {
      throw new Error(
        `Missing categories in DB: ${missingCategories.join(
          ", "
        )}. Run 'pnpm db:seed:skill-categories' first.`
      );
    }

    for (const skill of seeds) {
      await sql`
        insert into skills (name, display_name, category, description, status)
        values (${skill.name}, ${skill.displayName}, ${skill.category}, ${skill.description}, ${skill.status})
        on conflict (name)
        do update
          set display_name = excluded.display_name,
              category = excluded.category,
              description = excluded.description,
              status = excluded.status,
              updated_at = now()
      `;
    }

    const rows = await sql`
      select id, name, display_name, category, status
      from skills
      order by category asc, display_name asc
    `;

    console.log(`Seeded/updated ${seeds.length} skills.`);
    console.table(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        displayName: row.display_name,
        category: row.category,
        status: row.status,
      }))
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("[seed-skills] Failed:", err.message);
  process.exit(1);
});
