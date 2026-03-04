"use server";

import { createSupabaseAdminClientWithoutCookies } from "@/utils/supabase/server-admin";

export type AdminSkillCategory = {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  status: "active" | "inactive";
  createdAt: string | null;
  updatedAt: string | null;
};

function toSafeString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value === null || value === undefined) return "";
  return String(value);
}

export async function getSkillCategories(): Promise<{
  success: boolean;
  message: string;
  data?: AdminSkillCategory[];
  error?: string;
}> {
  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    const { data, error } = await adminClient
      .from("skill_categories")
      .select("*")
      .order("display_name", { ascending: true });

    if (error) {
      console.error("[admin.skills.getSkillCategories] query error:", error);
      return { success: false, message: "Failed to fetch categories", error: error.message };
    }

    const categories: AdminSkillCategory[] = (data || []).map((category: any) => ({
      id: toSafeString(category.id),
      name: toSafeString(category.name),
      displayName: toSafeString(category.display_name),
      description: category.description ? toSafeString(category.description) : null,
      status: category.status === "inactive" ? "inactive" : "active",
      createdAt: category.created_at ? toSafeString(category.created_at) : null,
      updatedAt: category.updated_at ? toSafeString(category.updated_at) : null,
    }));

    return { success: true, message: "", data: categories };
  } catch (error) {
    console.error("[admin.skills.getSkillCategories] unexpected error:", error);
    return {
      success: false,
      message: "Failed to fetch categories",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
