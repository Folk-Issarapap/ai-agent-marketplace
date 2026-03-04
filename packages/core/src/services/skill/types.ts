import { z } from "zod";

export type SkillStatus = "active" | "inactive";

export const createSkillSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  displayName: z.string().min(1).max(255),
  category: z.string().min(1).max(100).default("general"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateSkillSchema = createSkillSchema.partial();

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
