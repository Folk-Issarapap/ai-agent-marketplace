"use server";

import type { Integration } from "@workspace/core/services/integration";

export type GetIntegrationsFilters = {
  status?: string;
};

export type GetIntegrationsResult = {
  success: true;
  data: { data: Integration[]; total: number };
} | {
  success: false;
  data?: undefined;
  error: string;
};

/**
 * Fetch integrations (e.g. for transaction filters).
 * Stub implementation: returns empty list until integration feature is implemented.
 */
export async function getIntegrations(
  _page: number,
  _pageSize: number,
  _filters: GetIntegrationsFilters = {}
): Promise<GetIntegrationsResult> {
  try {
    const data: Integration[] = [];
    return { success: true, data: { data, total: 0 } };
  } catch (error) {
    console.error("[marketplace.integrations.getIntegrations] error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch integrations",
    };
  }
}
