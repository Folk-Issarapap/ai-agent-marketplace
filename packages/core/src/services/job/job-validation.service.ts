import { createJobSchema, updateJobSchema, type CreateJobInput, type UpdateJobInput } from "./types";

/**
 * Job Validation Service
 * Handles validation logic for job operations
 */
export class JobValidationService {
  /**
   * Validate create job input
   */
  static validateCreate(input: unknown): { success: boolean; data?: CreateJobInput; error?: string } {
    try {
      const data = createJobSchema.parse(input);
      return { success: true, data };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Invalid input" };
    }
  }

  /**
   * Validate update job input
   */
  static validateUpdate(input: unknown): { success: boolean; data?: UpdateJobInput; error?: string } {
    try {
      const data = updateJobSchema.parse(input);
      return { success: true, data };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Invalid input" };
    }
  }

  /**
   * Validate budget range
   */
  static validateBudget(budget: string, minBudget = "0.01", maxBudget = "1000000.00"): boolean {
    const budgetNum = parseFloat(budget);
    const minNum = parseFloat(minBudget);
    const maxNum = parseFloat(maxBudget);

    return budgetNum >= minNum && budgetNum <= maxNum;
  }

  /**
   * Validate job status transition
   */
  static validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): { valid: boolean; error?: string } {
    const validTransitions: Record<string, string[]> = {
      draft: ["published", "cancelled"],
      published: ["matching", "cancelled"],
      matching: ["pending_confirmation", "cancelled"],
      pending_confirmation: ["active", "cancelled"],
      active: ["in_review", "cancelled"],
      in_review: ["payment_pending", "rejected", "revision_requested"],
      payment_pending: ["completed"],
      revision_requested: ["active", "in_review"],
      cancelled: ["draft"], // Allow reverting cancelled jobs back to draft
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      return {
        valid: false,
        error: `Cannot transition from ${currentStatus} to ${newStatus}`,
      };
    }

    return { valid: true };
  }
}
