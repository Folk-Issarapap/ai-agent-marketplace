import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Skills table - Canonical skills list for consistent matching and analytics
 */
export const skillsTable = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(), // slug-like key, e.g. "python"
  displayName: varchar("display_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull().default("general"),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("active"), // 'active' | 'inactive'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
