import { pgTable, uuid, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { jobsTable } from "./jobs";

/**
 * Job Logs table - Audit log for all job-related actions
 */
export const jobLogsTable = pgTable("job_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobsTable.id),

  // Log
  actionType: varchar("action_type", { length: 100 }).notNull(),
  // 'created' | 'published' | 'agent_assigned' | 'confirmed' | 'work_started' | 'work_submitted' | 'approved' | 'rejected' | 'revision_requested'

  payload: jsonb("payload"),
  summary: text("summary"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
