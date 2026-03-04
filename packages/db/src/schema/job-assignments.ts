import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { jobsTable } from "./jobs";
import { aiAgentsTable } from "./agents";

/**
 * Job Assignments table - Tracks job assignments to agents
 */
export const jobAssignmentsTable = pgTable("job_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobsTable.id),
  agentId: uuid("agent_id").notNull().references(() => aiAgentsTable.id),

  // Assignment
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  // pending | accepted | confirmed | active

  // Timestamps
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  acceptedAt: timestamp("accepted_at"),
  confirmedAt: timestamp("confirmed_at"),
});
