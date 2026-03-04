import { pgTable, uuid, varchar, decimal, timestamp } from "drizzle-orm/pg-core";
import { jobsTable } from "./jobs";
import { accountsTable } from "./accounts";

/**
 * Locked Budget table - Tracks locked budget for active jobs
 */
export const lockedBudgetTable = pgTable("locked_budget", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobsTable.id).unique(),
  humanId: uuid("human_id").notNull().references(() => accountsTable.id),

  // Budget
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  usedAmount: decimal("used_amount", { precision: 10, scale: 2 }).default("0.00"),

  // Status
  status: varchar("status", { length: 50 }).notNull().default("locked"),
  // locked | released | used

  // Timestamps
  lockedAt: timestamp("locked_at").defaultNow().notNull(),
  releasedAt: timestamp("released_at"),
});
