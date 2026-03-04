import { pgTable, uuid, varchar, decimal, timestamp } from "drizzle-orm/pg-core";
import { jobsTable } from "./jobs";

/**
 * Payment Instructions - Mock payment details shown when job is awaiting payment.
 * After approve: job → payment_pending, create this record.
 * After user confirms: processPayment, job → completed, update confirmedAt.
 */
export const paymentInstructionsTable = pgTable("payment_instructions", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobsTable.id, { onDelete: "cascade" })
    .unique(),

  // Bank transfer (mock)
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  referenceNumber: varchar("reference_number", { length: 50 }).notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
});
