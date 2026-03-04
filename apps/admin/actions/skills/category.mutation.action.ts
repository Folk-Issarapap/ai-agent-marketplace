"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClientWithoutCookies } from "@/utils/supabase/server-admin";

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createSkillCategory(formData: FormData): Promise<{ success: boolean; message: string }> {
  const rawName = String(formData.get("name") || "").trim();
  const rawDisplayName = String(formData.get("displayName") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const status = String(formData.get("status") || "active").trim();
  const lang = String(formData.get("lang") || "en");

  const name = toSlug(rawName || rawDisplayName);
  const displayName = rawDisplayName || rawName;
  if (!name || !displayName) {
    return { success: false, message: "Name and display name are required" };
  }

  if (!["active", "inactive"].includes(status)) {
    return { success: false, message: "Invalid status" };
  }

  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    const { error } = await adminClient.from("skill_categories").insert({
      name,
      display_name: displayName,
      description: description || null,
      status,
    });

    if (error) {
      console.error("[admin.skills.createSkillCategory] insert error:", error);
      return { success: false, message: error.message.includes("duplicate") ? "Category already exists" : "Failed to create category" };
    }

    revalidatePath(`/${lang}/skills`);
    return { success: true, message: "Category created successfully" };
  } catch (error) {
    console.error("[admin.skills.createSkillCategory] unexpected error:", error);
    return { success: false, message: "Failed to create category" };
  }
}

export async function updateSkillCategory(categoryId: string, formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!categoryId) return { success: false, message: "Category id is required" };

  const rawName = String(formData.get("name") || "").trim();
  const rawDisplayName = String(formData.get("displayName") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const status = String(formData.get("status") || "active").trim();
  const lang = String(formData.get("lang") || "en");

  const name = toSlug(rawName || rawDisplayName);
  const displayName = rawDisplayName || rawName;
  if (!name || !displayName) {
    return { success: false, message: "Name and display name are required" };
  }

  if (!["active", "inactive"].includes(status)) {
    return { success: false, message: "Invalid status" };
  }

  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    const { error } = await adminClient
      .from("skill_categories")
      .update({
        name,
        display_name: displayName,
        description: description || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId);

    if (error) {
      console.error("[admin.skills.updateSkillCategory] update error:", error);
      return { success: false, message: error.message.includes("duplicate") ? "Category already exists" : "Failed to update category" };
    }

    revalidatePath(`/${lang}/skills`);
    return { success: true, message: "Category updated successfully" };
  } catch (error) {
    console.error("[admin.skills.updateSkillCategory] unexpected error:", error);
    return { success: false, message: "Failed to update category" };
  }
}

export async function deleteSkillCategory(categoryId: string, lang = "en"): Promise<{ success: boolean; message: string }> {
  if (!categoryId) return { success: false, message: "Category id is required" };

  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    const { error } = await adminClient.from("skill_categories").delete().eq("id", categoryId);

    if (error) {
      console.error("[admin.skills.deleteSkillCategory] delete error:", error);
      return { success: false, message: "Failed to delete category" };
    }

    revalidatePath(`/${lang}/skills`);
    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    console.error("[admin.skills.deleteSkillCategory] unexpected error:", error);
    return { success: false, message: "Failed to delete category" };
  }
}
