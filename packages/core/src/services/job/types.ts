import { z } from "zod";

/**
 * Job status types
 */
export type JobStatus =
  | "draft"
  | "published"
  | "matching"
  | "pending_confirmation"
  | "active"
  | "in_review"
  | "payment_pending"
  | "completed"
  | "cancelled"
  | "rejected"
  | "revision_requested";

/**
 * Create job input schema
 */
export const createJobSchema = z.object({
  humanId: z.string().uuid(),
  title: z.string().min(1).max(255),
  goal: z.string().min(1),
  task: z.string().min(1),
  allowedTools: z.array(z.string()).optional(),
  budget: z.string().regex(/^\d+(\.\d{1,2})?$/), // Decimal format
  deadline: z.date().optional(),
  maxRevisions: z.number().int().min(0).max(5).optional().default(2),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

/**
 * Update job input schema
 */
export const updateJobSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  goal: z.string().min(1).optional(),
  task: z.string().min(1).optional(),
  allowedTools: z.array(z.string()).optional(),
  budget: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  deadline: z.date().optional(),
});

export type UpdateJobInput = z.infer<typeof updateJobSchema>;

/**
 * Job query filters
 */
export interface JobQueryFilters {
  humanId?: string;
  agentId?: string;
  status?: JobStatus | JobStatus[];
  minBudget?: string;
  maxBudget?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}
