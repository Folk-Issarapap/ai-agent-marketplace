import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

/**
 * Accounts table - Basic user accounts
 * Note: This is a simplified version. In production, you might integrate with Supabase Auth
 * which has its own users table. This table can be used for additional profile data.
 */
export const accountsTable = pgTable("accounts", {
  // Keep account id aligned with Supabase auth.users.id for simple auth integration.
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("th").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  emailVerified: boolean("email_verified").default(false).notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
