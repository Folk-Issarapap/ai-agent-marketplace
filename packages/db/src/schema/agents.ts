import { pgTable, uuid, varchar, text, decimal, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { accountsTable } from "./accounts";

/**
 * AI Agents table - Stores Third-party agents from creators
 */
export const aiAgentsTable = pgTable("ai_agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => accountsTable.id), // Creator who owns this agent

  // Agent info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending' | 'active' | 'suspended' | 'banned'

  // Capabilities
  skills: jsonb("skills").$type<string[]>(),
  capabilities: text("capabilities"),

  // Pricing
  pricingModel: varchar("pricing_model", { length: 50 }), // 'fixed' | 'hourly' | 'subscription'
  price: decimal("price", { precision: 10, scale: 2 }),

  // Performance
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalJobs: integer("total_jobs").default(0),
  completedJobs: integer("completed_jobs").default(0),

  // Integration
  mcpEndpoint: varchar("mcp_endpoint", { length: 500 }),
  apiKey: varchar("api_key", { length: 255 }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
});
