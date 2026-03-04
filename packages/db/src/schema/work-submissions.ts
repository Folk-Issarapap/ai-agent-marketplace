import { pgTable, uuid, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { jobsTable } from "./jobs";
import { aiAgentsTable } from "./agents";

/**
 * Work Submissions table - Stores work submissions from AI Agents
 */
export const workSubmissionsTable = pgTable("work_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobsTable.id),
  agentId: uuid("agent_id").notNull().references(() => aiAgentsTable.id),

  // Submission
  content: text("content").notNull(),
  files: jsonb("files").$type<string[]>(),
  description: text("description"),

  // Status
  status: varchar("status", { length: 50 }).notNull().default("submitted"),
  // submitted | approved | rejected | revision_requested

  // Timestamps
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});
