import { z } from 'zod';

/**
 * Job form schemas for marketplace app
 */

/**
 * Create Job Schema
 * Based on PRD: goal, task, tools, budget, deadline (optional), maxRevisions
 */
export const createJobSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be less than 255 characters'),
  goal: z
    .string()
    .min(1, 'Goal is required')
    .min(10, 'Goal must be at least 10 characters')
    .max(2000, 'Goal must be less than 2000 characters'),
  task: z
    .string()
    .min(1, 'Task is required')
    .min(10, 'Task must be at least 10 characters')
    .max(5000, 'Task must be less than 5000 characters'),
  allowedTools: z.array(z.string()).optional().default([]),
  budget: z
    .string()
    .min(1, 'Budget is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Budget must be a valid number (e.g., 100 or 100.50)'),
  deadline: z.string().optional().nullable(),
  maxRevisions: z
    .number()
    .int()
    .min(0, 'Max revisions must be at least 0')
    .max(5, 'Max revisions must be at most 5')
    .optional()
    .default(2),
});

/**
 * Update Job Schema (for draft editing)
 */
export const updateJobSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be less than 255 characters')
    .optional(),
  goal: z
    .string()
    .min(1, 'Goal is required')
    .min(10, 'Goal must be at least 10 characters')
    .max(2000, 'Goal must be less than 2000 characters')
    .optional(),
  task: z
    .string()
    .min(1, 'Task is required')
    .min(10, 'Task must be at least 10 characters')
    .max(5000, 'Task must be less than 5000 characters')
    .optional(),
  allowedTools: z.array(z.string()).optional(),
  budget: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Budget must be a valid number (e.g., 100 or 100.50)')
    .optional(),
  deadline: z.string().optional().nullable(),
  maxRevisions: z
    .number()
    .int()
    .min(0, 'Max revisions must be at least 0')
    .max(5, 'Max revisions must be at most 5')
    .optional(),
});

export type CreateJobFormValues = z.infer<typeof createJobSchema>;
export type UpdateJobFormValues = z.infer<typeof updateJobSchema>;
