"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/utils/supabase/server";
import { createSupabaseAdminClientWithoutCookies } from "@/utils/supabase/server-admin";

export interface AuthActionState {
  success: boolean;
  message: string;
  redirectTo?: string;
}

function validateRegisterPayload(payload: {
  name: FormDataEntryValue | null;
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}) {
  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "");

  if (name.length < 2) return { valid: false, message: "Name must be at least 2 characters" } as const;
  if (!email.includes("@")) return { valid: false, message: "Please enter a valid email" } as const;
  if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters" } as const;

  return { valid: true, name, email, password } as const;
}

export async function register(
  _prevState: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState> {
  const lang = String(formData.get("lang") ?? "en");
  const validated = validateRegisterPayload({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.valid) {
    return { success: false, message: validated.message };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      success: false,
      message:
        "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local to enable signup without email verification.",
    };
  }

  const adminClient = createSupabaseAdminClientWithoutCookies();

  // Create confirmed user directly to skip email verification step.
  const { error: createError } = await adminClient.auth.admin.createUser({
    email: validated.email,
    password: validated.password,
    email_confirm: true,
    user_metadata: {
      name: validated.name,
    },
  });

  if (createError) {
    console.error("[admin.auth.register] createUser error:", createError);
    if (createError.message.toLowerCase().includes("already")) {
      return { success: false, message: "This email is already registered" };
    }
    return { success: false, message: "Registration failed. Please try again." };
  }

  // Sign in with normal server client to issue session cookies.
  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  });

  if (signInError) {
    console.error("[admin.auth.register] auto sign-in error:", signInError);
    return {
      success: false,
      message: "Account created, but automatic sign-in failed. Please sign in manually.",
      redirectTo: `/${lang}/auth/signin`,
    };
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    message: "Account created successfully",
    redirectTo: `/${lang}`,
  };
}

export async function login(
  _prevState: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState> {
  const lang = String(formData.get("lang") ?? "en");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[admin.auth.login] signIn error:", error);
    return { success: false, message: "Invalid email or password" };
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Signed in successfully", redirectTo: `/${lang}` };
}

export async function logout(lang = "en"): Promise<{ redirectTo: string }> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { redirectTo: `/${lang}/auth/signin` };
}

/** Server action for logout form - call with FormData containing lang */
export async function logoutAction(formData: FormData) {
  const lang = String(formData.get("lang") ?? "en");
  const { redirectTo } = await logout(lang);
  redirect(redirectTo);
}
