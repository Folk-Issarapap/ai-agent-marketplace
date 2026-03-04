"use server";

import { revalidatePath } from "next/cache";
import { createAccountSchema } from "@/schemas/account.schema";
import { createSupabaseAdminClientWithoutCookies } from "@/utils/supabase/server-admin";

export async function createAccount(
  _prevState: { success: boolean; message: string } | null,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const requestId = `create-account-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Extract data from FormData
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const displayName = formData.get("displayName") ? String(formData.get("displayName")).trim() : undefined;
  const preferredLanguage = (formData.get("preferredLanguage") as "en" | "th") || "th";

  console.info("[admin.accounts.createAccount] request received", {
    requestId,
    email,
    name,
    hasDisplayName: Boolean(displayName),
    preferredLanguage,
    passwordLength: password.length,
  });

  // Validate using schema
  const validationResult = createAccountSchema.safeParse({
    email,
    password,
    name,
    displayName: displayName || undefined,
    preferredLanguage,
  });

  if (!validationResult.success) {
    // Get first validation error message safely (Zod v4 uses `issues`)
    const firstError = validationResult.error.issues[0];
    console.warn("[admin.accounts.createAccount] validation failed", {
      requestId,
      issueCount: validationResult.error.issues.length,
      firstIssue: firstError,
    });
    if (!firstError) {
      return {
        success: false,
        message: "Invalid form data",
      };
    }
    return {
      success: false,
      message: firstError.message,
    };
  }

  const validated = validationResult.data;

  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    console.info("[admin.accounts.createAccount] creating user via supabase", {
      requestId,
      email: validated.email,
    });
    const { error } = await adminClient.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        name: validated.name,
        displayName: validated.displayName,
        preferredLanguage: validated.preferredLanguage,
      },
    });

    if (error) {
      console.error("[admin.accounts.createAccount] createUser error", {
        requestId,
        error,
      });
      return {
        success: false,
        message: error.message.toLowerCase().includes("already")
          ? "This email is already registered"
          : "Failed to create account",
      };
    }

    revalidatePath("/accounts", "layout");
    console.info("[admin.accounts.createAccount] success", { requestId, email: validated.email });
    return { success: true, message: "Account created successfully" };
  } catch (error) {
    console.error("[admin.accounts.createAccount] unexpected error", {
      requestId,
      error,
    });
    return { success: false, message: `Failed to create account (ref: ${requestId})` };
  }
}

export async function updateAccount(
  accountId: string,
  _prevState: { success: boolean; message: string } | null,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const name = String(formData.get("name") ?? "").trim();
  const displayName = formData.get("displayName") ? String(formData.get("displayName")).trim() : undefined;
  const status = String(formData.get("status") ?? "active");
  const lang = String(formData.get("lang") ?? "en");

  if (!accountId) return { success: false, message: "Account id is required" };
  if (!name) return { success: false, message: "Name is required" };

  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    const isInactive = status === "inactive";

    const userMetadata: Record<string, unknown> = { name };
    if (displayName) {
      userMetadata.displayName = displayName;
    }

    const { error } = await adminClient.auth.admin.updateUserById(accountId, {
      user_metadata: userMetadata,
      ban_duration: isInactive ? "876000h" : "none",
    });

    if (error) {
      console.error("[admin.accounts.updateAccount] updateUserById error:", error);
      return { success: false, message: "Failed to update account" };
    }

    revalidatePath(`/${lang}/accounts`, "layout");
    revalidatePath(`/${lang}/accounts/${accountId}`, "layout");
    return { success: true, message: "Account updated successfully" };
  } catch (error) {
    console.error("[admin.accounts.updateAccount] unexpected error:", error);
    return { success: false, message: "Failed to update account" };
  }
}

export async function deleteAccount(accountId: string, lang = "en"): Promise<{ success: boolean; message: string }> {
  if (!accountId) return { success: false, message: "Account id is required" };

  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    const { error } = await adminClient.auth.admin.deleteUser(accountId);

    if (error) {
      console.error("[admin.accounts.deleteAccount] deleteUser error:", error);
      return { success: false, message: "Failed to delete account" };
    }

    revalidatePath(`/${lang}/accounts`);
    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    console.error("[admin.accounts.deleteAccount] unexpected error:", error);
    return { success: false, message: "Failed to delete account" };
  }
}
