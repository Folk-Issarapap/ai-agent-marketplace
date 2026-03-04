/**
 * Wallet Mock Service (BroPay Mock)
 * Mock implementation for MVP - simulates KYC, wallet balance, lock budget, payment
 * Replace with actual BroPay integration in production
 */

import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { lockedBudgetTable } from "@workspace/db/schema";
import type {
  LockBudgetResult,
  ReleaseBudgetResult,
  ProcessPaymentResult,
  WalletBalance,
} from "./types";

const MOCK_DEFAULT_BALANCE = "10000.00"; // Mock: always sufficient for MVP

export class WalletMockService {
  /**
   * Get wallet balance for user (mock - always returns sufficient balance)
   */
  static async getBalance(humanId: string): Promise<WalletBalance> {
    // Mock: Return sufficient balance for all operations
    const lockedRows = await db
      .select({ amount: lockedBudgetTable.amount })
      .from(lockedBudgetTable)
      .where(
        and(eq(lockedBudgetTable.humanId, humanId), eq(lockedBudgetTable.status, "locked"))
      );

    const lockedAmount = lockedRows.reduce((sum, r) => sum + Number(r.amount), 0);

    return {
      available: String(parseFloat(MOCK_DEFAULT_BALANCE) - lockedAmount),
      locked: String(lockedAmount),
      total: MOCK_DEFAULT_BALANCE,
    };
  }

  /**
   * Check if user has sufficient balance for job budget (mock - always true)
   */
  static async hasSufficientBalance(humanId: string, requiredAmount: string): Promise<boolean> {
    const balance = await this.getBalance(humanId);
    return parseFloat(balance.available) >= parseFloat(requiredAmount);
  }

  /**
   * Lock budget for job when user confirms (mock - writes to locked_budget table)
   */
  static async lockBudget(
    jobId: string,
    humanId: string,
    amount: string
  ): Promise<LockBudgetResult> {
    try {
      // Check if already locked
      const [existing] = await db
        .select()
        .from(lockedBudgetTable)
        .where(eq(lockedBudgetTable.jobId, jobId));

      if (existing && existing.status === "locked") {
        return { success: true, lockedBudgetId: existing.id };
      }

      const [locked] = await db
        .insert(lockedBudgetTable)
        .values({
          jobId,
          humanId,
          amount,
          usedAmount: "0.00",
          status: "locked",
        })
        .returning();

      if (!locked) {
        return {
          success: false,
          error: "Failed to lock budget",
        };
      }

      return { success: true, lockedBudgetId: locked.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to lock budget",
      };
    }
  }

  /**
   * Release locked budget (reject, cancel) - mock
   */
  static async releaseLockedBudget(jobId: string): Promise<ReleaseBudgetResult> {
    try {
      const [existing] = await db
        .select()
        .from(lockedBudgetTable)
        .where(eq(lockedBudgetTable.jobId, jobId));

      if (!existing) {
        return { success: true }; // No lock to release
      }

      if (existing.status !== "locked") {
        return { success: true }; // Already released/used
      }

      await db
        .update(lockedBudgetTable)
        .set({
          status: "released",
          releasedAt: new Date(),
        })
        .where(eq(lockedBudgetTable.jobId, jobId));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to release budget",
      };
    }
  }

  /**
   * Process payment on approve (mock - updates locked_budget to used)
   * In production: deduct from wallet, release remaining, record transaction
   */
  static async processPayment(
    jobId: string,
    amountToDeduct: string
  ): Promise<ProcessPaymentResult> {
    try {
      const [locked] = await db
        .select()
        .from(lockedBudgetTable)
        .where(eq(lockedBudgetTable.jobId, jobId));

      if (!locked) {
        return {
          success: false,
          error: "No locked budget for this job. Confirm the agent first so the budget is locked, then you can approve and pay.",
        };
      }

      if (locked.status !== "locked") {
        return {
          success: false,
          error: locked.status === "used"
            ? "Payment was already processed for this job."
            : "Budget is not in locked state. Cannot process payment.",
        };
      }

      await db
        .update(lockedBudgetTable)
        .set({
          status: "used",
          usedAmount: amountToDeduct,
          releasedAt: new Date(),
        })
        .where(eq(lockedBudgetTable.jobId, jobId));

      return {
        success: true,
        amountDeducted: amountToDeduct,
        transactionId: `mock-txn-${jobId}-${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process payment",
      };
    }
  }

  /**
   * Get locked budget details for a job (for Payment UI)
   */
  static async getLockedBudgetByJobId(jobId: string) {
    const [row] = await db
      .select()
      .from(lockedBudgetTable)
      .where(eq(lockedBudgetTable.jobId, jobId))
      .limit(1);
    return row ?? null;
  }

  /**
   * Check if payment has been processed for a job (locked_budget status = "used").
   * Use this to show Review only after payment is done.
   */
  static async isPaymentProcessed(jobId: string): Promise<boolean> {
    const [row] = await db
      .select({ status: lockedBudgetTable.status })
      .from(lockedBudgetTable)
      .where(eq(lockedBudgetTable.jobId, jobId))
      .limit(1);
    return row?.status === "used";
  }
}
