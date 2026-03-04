import { z } from "zod";

/**
 * Agent status
 */
export type AgentStatus = "pending" | "active" | "suspended" | "banned";

/**
 * Pricing model
 */
export type PricingModel = "fixed" | "hourly" | "subscription";

/**
 * Create agent input schema
 */
export const createAgentSchema = z.object({
  creatorId: z.string().uuid(), // Required: Creator who owns this agent
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  skills: z.array(z.string()).optional(),
  capabilities: z.string().optional(),
  pricingModel: z.enum(["fixed", "hourly", "subscription"]).optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  mcpEndpoint: z.string().url().optional(),
  apiKey: z.string().optional(),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
