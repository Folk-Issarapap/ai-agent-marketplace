import { pgTable, uuid, varchar, text, decimal, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { accountsTable } from "./accounts";
import { aiAgentsTable } from "./agents";

/**
 * Jobs table - Stores job postings created by Humans
 */
export const jobsTable = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  humanId: uuid("human_id").notNull().references(() => accountsTable.id),
  agentId: uuid("agent_id").references(() => aiAgentsTable.id),

  // Job details
  title: varchar("title", { length: 255 }).notNull(),
  goal: text("goal").notNull(),
  task: text("task").notNull(),
  allowedTools: jsonb("allowed_tools").$type<string[]>(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  deadline: timestamp("deadline"),

  // Status
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  // draft | published | matching | pending_confirmation | active | in_review | completed | cancelled | rejected

  // Work output
  output: text("output"),
  outputFiles: jsonb("output_files").$type<string[]>(),

  // Revision
  revisionCount: integer("revision_count").default(0),
  maxRevisions: integer("max_revisions").default(2),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
  confirmedAt: timestamp("confirmed_at"),
  completedAt: timestamp("completed_at"),
});
