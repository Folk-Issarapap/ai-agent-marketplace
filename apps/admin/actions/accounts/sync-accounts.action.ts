"use server";

import { createSupabaseAdminClientWithoutCookies } from "@/utils/supabase/server-admin";

/**
 * Server Action to sync all users from Supabase Auth to accounts table
 * 
 * This should be run once to sync existing users, or when needed
 * Uses Supabase client directly to insert into accounts table
 */
export async function syncAccountsFromAuth(): Promise<{
  success: boolean;
  message: string;
  synced?: number;
  failed?: number;
  errors?: string[];
}> {
  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    
    // Fetch all users from Supabase Auth
    const { data, error } = await adminClient.auth.admin.listUsers();

    if (error) {
      console.error("[admin.accounts.syncAccounts] listUsers error:", error);
      return {
        success: false,
        message: "Failed to fetch users from Supabase Auth",
      };
    }

    if (!data?.users || data.users.length === 0) {
      return {
        success: true,
        message: "No users found to sync",
        synced: 0,
        failed: 0,
        errors: [],
      };
    }

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    // Sync each user to accounts table using Supabase client
    for (const user of data.users) {
      try {
        const name = user.user_metadata?.name || user.email?.split("@")[0] || "Unknown";
        const displayName = user.user_metadata?.displayName || null;
        const preferredLanguage = user.user_metadata?.preferredLanguage || "th";
        const status = user.banned_until ? "inactive" : "active";
        const emailVerified = !!user.email_confirmed_at;

        const { error: insertError } = await adminClient
          .from("accounts")
          .upsert({
            id: user.id,
            name,
            email: user.email || "",
            display_name: displayName,
            preferred_language: preferredLanguage,
            status,
            email_verified: emailVerified,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "id"
          });

        if (insertError) {
          console.error(`[admin.accounts.syncAccounts] Error syncing user ${user.email}:`, insertError);
          failed++;
          errors.push(`Failed to sync ${user.email}: ${insertError.message}`);
        } else {
          synced++;
        }
      } catch (error) {
        console.error(`[admin.accounts.syncAccounts] Unexpected error syncing user ${user.email}:`, error);
        failed++;
        errors.push(`Failed to sync ${user.email}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return {
      success: true,
      message: `Successfully synced ${synced} users. ${failed} failed.`,
      synced,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("[admin.accounts.syncAccounts] unexpected error:", error);
    return {
      success: false,
      message: `Failed to sync accounts: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
