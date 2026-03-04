"use server";

import { createSupabaseAdminClientWithoutCookies } from "@/utils/supabase/server-admin";

export type AdminAccount = {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  status: "active" | "inactive";
  preferredLanguage?: "en" | "th";
  createdAt: string | null;
};

function toSafeString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value === null || value === undefined) return "";
  return String(value);
}

type GetAccountsOptions = {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function getAccounts(
  page = 1,
  pageSize = 20,
  options: GetAccountsOptions = {}
): Promise<{
  success: boolean;
  message: string;
  data?: {
    data: AdminAccount[];
    total: number;
    totalPages: number;
  };
  error?: string;
}> {
  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    const { data, error } = await adminClient.auth.admin.listUsers();

    if (error) {
      console.error("[admin.accounts.getAccounts] listUsers error:", error);
      return { success: false, message: "Failed to fetch accounts", error: error.message };
    }

    const users = data.users ?? [];
    
    // Transform to AdminAccount
    let accounts: AdminAccount[] = users.map((user) => ({
      id: toSafeString(user.id),
      email: toSafeString(user.email),
      name: toSafeString((user.user_metadata?.name as string | undefined) ?? user.email ?? "Unknown"),
      displayName: user.user_metadata?.displayName ? toSafeString(user.user_metadata.displayName) : undefined,
      status: user.banned_until ? "inactive" : "active",
      preferredLanguage: (user.user_metadata?.preferredLanguage as "en" | "th" | undefined) ?? undefined,
      createdAt: user.created_at ? toSafeString(user.created_at) : null,
    }));

    // Apply filters
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      accounts = accounts.filter(
        (account) =>
          account.email.toLowerCase().includes(searchLower) ||
          account.name.toLowerCase().includes(searchLower)
      );
    }

    if (options.status && options.status !== 'all') {
      accounts = accounts.filter((account) => account.status === options.status);
    }

    // Apply sorting
    if (options.sortBy) {
      accounts.sort((a, b) => {
        let aValue: string | null = null;
        let bValue: string | null = null;

        switch (options.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'email':
            aValue = a.email;
            bValue = b.email;
            break;
          case 'createdAt':
            aValue = a.createdAt;
            bValue = b.createdAt;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
        }

        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        const comparison = aValue.localeCompare(bValue);
        return options.sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    // Apply pagination
    const total = accounts.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedAccounts = accounts.slice(startIndex, endIndex);

    return {
      success: true,
      message: "",
      data: {
        data: paginatedAccounts,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("[admin.accounts.getAccounts] unexpected error:", error);
    return {
      success: false,
      message: "Failed to fetch accounts",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAccountStatistics(): Promise<{
  success: boolean;
  data?: {
    totalAccounts: number;
    activeAccounts: number;
    inactiveAccounts: number;
  };
  error?: string;
}> {
  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    const { data, error } = await adminClient.auth.admin.listUsers();

    if (error) {
      console.error("[admin.accounts.getAccountStatistics] listUsers error:", error);
      return { success: false, error: "Failed to fetch account statistics" };
    }

    const users = data.users ?? [];
    
    // Transform to AdminAccount
    const accounts: AdminAccount[] = users.map((user) => ({
      id: toSafeString(user.id),
      email: toSafeString(user.email),
      name: toSafeString((user.user_metadata?.name as string | undefined) ?? user.email ?? "Unknown"),
      status: user.banned_until ? "inactive" : "active",
      createdAt: user.created_at ? toSafeString(user.created_at) : null,
    }));

    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter((account) => account.status === "active").length;
    const inactiveAccounts = totalAccounts - activeAccounts;

    return {
      success: true,
      data: {
        totalAccounts,
        activeAccounts,
        inactiveAccounts,
      },
    };
  } catch (error) {
    console.error("[admin.accounts.getAccountStatistics] unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAccountById(
  accountId: string
): Promise<{ success: boolean; message: string; data: AdminAccount | null }> {
  if (!accountId) {
    return { success: false, message: "Account id is required", data: null };
  }

  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    const { data, error } = await adminClient.auth.admin.getUserById(accountId);

    if (error || !data.user) {
      return { success: false, message: "Account not found", data: null };
    }

    const account: AdminAccount = {
      id: toSafeString(data.user.id),
      email: toSafeString(data.user.email),
      name: toSafeString((data.user.user_metadata?.name as string | undefined) ?? data.user.email ?? "Unknown"),
      displayName: data.user.user_metadata?.displayName ? toSafeString(data.user.user_metadata.displayName) : undefined,
      status: data.user.banned_until ? "inactive" : "active",
      preferredLanguage: (data.user.user_metadata?.preferredLanguage as "en" | "th" | undefined) ?? undefined,
      createdAt: data.user.created_at ? toSafeString(data.user.created_at) : null,
    };

    return { success: true, message: "", data: account };
  } catch (error) {
    console.error("[admin.accounts.getAccountById] unexpected error:", error);
    return { success: false, message: "Failed to fetch account", data: null };
  }
}
