import { pgTable, uuid, integer, text, timestamp } from "drizzle-orm/pg-core";
import { jobsTable } from "./jobs";
import { aiAgentsTable } from "./agents";
import { accountsTable } from "./accounts";

/**
 * Reviews table - Stores reviews and ratings from Humans to AI Agents
 */
export const reviewsTable = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobsTable.id),
  agentId: uuid("agent_id").notNull().references(() => aiAgentsTable.id),
  humanId: uuid("human_id").notNull().references(() => accountsTable.id),

  // Review
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
