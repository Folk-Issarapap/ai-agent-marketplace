import { pgTable, uuid, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

/**
 * Admin chat conversations - stores conversation metadata
 * Messages are stored in chat_messages table
 */
export const chatConversationsTable = pgTable("chat_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 500 }).notNull().default("New chat"),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  accountId: uuid("account_id"), // Optional: link to auth user when available

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Admin chat messages - stores full UIMessage as JSONB
 * Supports text, file, tool-call parts from AI SDK format
 */
export const chatMessagesTable = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => chatConversationsTable.id, { onDelete: "cascade" }),
  messageIndex: integer("message_index").notNull(), // For ordering (0, 1, 2...)
  content: jsonb("content").$type<unknown>().notNull(), // Full UIMessage

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
