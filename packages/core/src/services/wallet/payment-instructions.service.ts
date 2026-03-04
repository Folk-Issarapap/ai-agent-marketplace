/**
 * Payment Instructions Service
 * Creates and fetches payment instructions for jobs in payment_pending status
 */

import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { paymentInstructionsTable } from "@workspace/db/schema";

const MOCK_BANK_NAME = "Mock Bank";
const MOCK_ACCOUNT_NUMBER = "123-4-56789-0";
const MOCK_ACCOUNT_NAME = "AI Agent Marketplace";

export class PaymentInstructionsService {
  /**
   * Create payment instructions for a job (after approve -> payment_pending)
   */
  static async create(jobId: string, amount: string) {
    const referenceNumber = `REF-${jobId.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const [row] = await db
      .insert(paymentInstructionsTable)
      .values({
        jobId,
        bankName: MOCK_BANK_NAME,
        accountNumber: MOCK_ACCOUNT_NUMBER,
        accountName: MOCK_ACCOUNT_NAME,
        amount,
        referenceNumber,
      })
      .returning();
    return row;
  }

  /**
   * Get payment instructions by job ID
   */
  static async getByJobId(jobId: string) {
    const [row] = await db
      .select()
      .from(paymentInstructionsTable)
      .where(eq(paymentInstructionsTable.jobId, jobId))
      .limit(1);
    return row ?? null;
  }

  /**
   * Mark payment as confirmed
   */
  static async markConfirmed(jobId: string) {
    const [updated] = await db
      .update(paymentInstructionsTable)
      .set({ confirmedAt: new Date() })
      .where(eq(paymentInstructionsTable.jobId, jobId))
      .returning();
    return updated ?? null;
  }
}
