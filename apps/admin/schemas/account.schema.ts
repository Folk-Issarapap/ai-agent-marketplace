import { z } from 'zod';

/**
 * Account form schemas
 * Simplified version for admin app (no i18n, no roles)
 */

/**
 * Create Account Schema
 */
export const createAccountSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  displayName: z.string().max(255, 'Display name must be less than 255 characters').optional(),
  preferredLanguage: z.enum(['en', 'th']).default('th'),
});

/**
 * Update Account Profile Schema
 */
export const updateAccountProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  displayName: z.string().max(255, 'Display name must be less than 255 characters').optional(),
});

/**
 * Update Account Settings Schema
 */
export const updateAccountSettingsSchema = z.object({
  status: z.enum(['active', 'inactive']),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;
export type UpdateAccountProfileFormValues = z.infer<typeof updateAccountProfileSchema>;
export type UpdateAccountSettingsFormValues = z.infer<typeof updateAccountSettingsSchema>;