"use server";

import type { TransactionWithRelations } from "@workspace/core/services/transaction/types";

export type GetTransactionsFilters = {
  search?: string;
  integrationId?: string;
  status?: string;
  direction?: string;
  referenceType?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type GetTransactionsResult = {
  success: true;
  data: {
    data: TransactionWithRelations[];
    total: number;
    totalPages: number;
  };
} | {
  success: false;
  data?: undefined;
  error: string;
};

/**
 * Fetch transactions with pagination and filters.
 * Stub implementation: returns empty list until transaction feature is implemented.
 */
export async function getTransactions(
  page: number,
  pageSize: number,
  _filters: GetTransactionsFilters = {}
): Promise<GetTransactionsResult> {
  try {
    // Stub: no transaction table yet. Return empty result.
    const data: TransactionWithRelations[] = [];
    const total = 0;
    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
    return {
      success: true,
      data: { data, total, totalPages },
    };
  } catch (error) {
    console.error("[marketplace.transactions.getTransactions] error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch transactions",
    };
  }
}
