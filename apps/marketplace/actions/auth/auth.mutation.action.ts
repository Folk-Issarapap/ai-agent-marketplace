"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseServerClient } from "@/utils/supabase/server";
import { createSupabaseAdminClientWithoutCookies } from "@/utils/supabase/server-admin";
import { createAuthSchemas } from "@/schemas/auth.schema";

export interface RegisterState {
  success: boolean;
  message: string;
  redirectTo?: string;
}

export interface LoginState {
  success: boolean;
  message: string;
  redirectTo?: string;
}

export async function register(
  _prevState: RegisterState | null,
  formData: FormData
): Promise<RegisterState> {
  const schemas = createAuthSchemas();
  const validationResult = schemas.registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    terms: formData.get("terms") === "true",
    lang: formData.get("lang") ?? "en",
  });

  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    return {
      success: false,
      message: firstError?.message ?? "Invalid form data",
    };
  }

  const validated = validationResult.data;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Use admin client to create confirmed user (skip email verification)
  // If service role key is not available, fall back to regular signUp
  if (supabaseUrl && serviceRoleKey) {
    const adminClient = createSupabaseAdminClientWithoutCookies();

    // Create confirmed user directly to skip email verification step
    const { error: createError } = await adminClient.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        name: validated.name,
      },
    });

    if (createError) {
      console.error("[marketplace.auth.register] createUser error:", createError);
      if (createError.message.toLowerCase().includes("already")) {
        return { success: false, message: "This email is already registered" };
      }
      return { success: false, message: "Registration failed. Please try again." };
    }

    // Sign in with normal server client to issue session cookies
    const supabase = await createSupabaseServerClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (signInError) {
      console.error("[marketplace.auth.register] auto sign-in error:", {
        message: signInError.message,
        code: signInError.code,
        status: signInError.status,
        email: validated.email,
      });
      return {
        success: false,
        message: `Account created, but automatic sign-in failed: ${signInError.message}. Please sign in manually.`,
        redirectTo: `/${validated.lang}/auth/signin`,
      };
    }

    if (!signInData.user) {
      console.error("[marketplace.auth.register] auto sign-in failed: no user data");
      return {
        success: false,
        message: "Account created, but automatic sign-in failed. Please sign in manually.",
        redirectTo: `/${validated.lang}/auth/signin`,
      };
    }

    revalidatePath("/", "layout");
    return {
      success: true,
      message: "Account created successfully",
      redirectTo: `/${validated.lang}`,
    };
  }

  // Fallback to regular signUp if admin client is not available
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email: validated.email,
    password: validated.password,
    options: {
      data: {
        name: validated.name,
      },
    },
  });

  if (error) {
    console.error("[marketplace.auth.register] supabase signUp error:", {
      message: error.message,
      status: error.status,
      code: error.code,
      name: error.name,
    });

    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
      return {
        success: false,
        message: "Too many sign up attempts. Please wait a few minutes and try again.",
      };
    }

    if (error.message.toLowerCase().includes("already")) {
      return {
        success: false,
        message: "This email is already registered",
      };
    }

    return {
      success: false,
      message: "Registration failed. Please try again.",
    };
  }

  if (!data.user) {
    return {
      success: false,
      message: "Registration failed. Please try again.",
    };
  }

  // App-level account profile should be created by DB trigger on auth.users.

  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Account created successfully",
    redirectTo: `/${validated.lang}`,
  };
}

export async function login(
  _prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const lang = String(formData.get("lang") ?? "en");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[marketplace.auth.login] signIn error:", {
      message: error.message,
      status: error.status,
      code: error.code,
      email: email, // Log email for debugging (not password)
    });

    // Provide more specific error messages
    if (error.code === "invalid_credentials" || error.status === 400) {
      return { 
        success: false, 
        message: "Invalid email or password. Please check your credentials and try again." 
      };
    }

    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { 
        success: false, 
        message: "Please verify your email address before signing in. Check your inbox for a confirmation email." 
      };
    }

    return { success: false, message: "Invalid email or password" };
  }

  if (!data.user) {
    return { success: false, message: "Sign in failed. Please try again." };
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
