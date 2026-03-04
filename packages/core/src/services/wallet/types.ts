/**
 * Wallet service types
 * For BroPay integration - mock implementation for MVP
 */

export type LockedBudgetStatus = "locked" | "released" | "used";

export interface LockBudgetResult {
  success: boolean;
  lockedBudgetId?: string;
  error?: string;
}

export interface ReleaseBudgetResult {
  success: boolean;
  error?: string;
}

export interface ProcessPaymentResult {
  success: boolean;
  amountDeducted?: string;
  transactionId?: string;
  error?: string;
}

export interface WalletBalance {
  available: string;
  locked: string;
  total: string;
}
