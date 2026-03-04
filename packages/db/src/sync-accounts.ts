/**
 * Sync Accounts from Supabase Auth to accounts table
 * 
 * This function can be used to:
 * 1. Sync existing users from auth.users to accounts table
 * 2. Manually sync a specific user
 * 
 * Usage:
 * - Run this once to sync all existing users
 * - Or call syncUser() when needed
 */

import { db } from "./client";
import { accountsTable } from "./schema";
import { eq } from "drizzle-orm";

export interface AuthUser {
  id: string;
  email: string;
  raw_user_meta_data?: {
    name?: string;
    displayName?: string;
    preferredLanguage?: "en" | "th";
  };
  email_confirmed_at?: string | null;
  created_at?: string;
  banned_until?: string | null;
}

/**
 * Sync a single user from auth.users to accounts table
 */
export async function syncUser(authUser: AuthUser) {
  const name = authUser.raw_user_meta_data?.name || authUser.email.split("@")[0];
  const displayName = authUser.raw_user_meta_data?.displayName;
  const preferredLanguage = authUser.raw_user_meta_data?.preferredLanguage || "th";
  const status = authUser.banned_until ? "inactive" : "active";
  const emailVerified = !!authUser.email_confirmed_at;

  try {
    const insertValues: Record<string, unknown> = {
      id: authUser.id,
      name,
      email: authUser.email,
      preferredLanguage,
      status,
      emailVerified,
      createdAt: authUser.created_at ? new Date(authUser.created_at) : new Date(),
      updatedAt: new Date(),
    };

    if (displayName) {
      insertValues.displayName = displayName;
    }

    await db.insert(accountsTable).values(insertValues as typeof accountsTable.$inferInsert)
      .onConflictDoUpdate({
        target: accountsTable.id,
        set: {
          name,
          email: authUser.email,
          ...(displayName && { displayName }),
          preferredLanguage,
          status,
          emailVerified,
          updatedAt: new Date(),
        },
      });

    return { success: true, message: `Synced user ${authUser.email}` };
  } catch (error) {
    console.error("[sync-accounts] Error syncing user:", error);
    return { success: false, message: `Failed to sync user ${authUser.email}`, error };
  }
}

/**
 * Sync all users from Supabase Auth (requires Supabase Admin Client)
 * 
 * This should be called from a server action or API route
 * that has access to Supabase Admin Client
 */
export async function syncAllUsers(
  getAuthUsers: () => Promise<AuthUser[]>
): Promise<{ success: boolean; synced: number; failed: number; errors: string[] }> {
  try {
    const authUsers = await getAuthUsers();
    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const user of authUsers) {
      const result = await syncUser(user);
      if (result.success) {
        synced++;
      } else {
        failed++;
        errors.push(result.message || "Unknown error");
      }
    }

    return {
      success: true,
      synced,
      failed,
      errors,
    };
  } catch (error) {
    console.error("[sync-accounts] Error syncing all users:", error);
    return {
      success: false,
      synced: 0,
      failed: 0,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}
