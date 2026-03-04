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

export async function createSkill(formData: FormData): Promise<{ success: boolean; message: string }> {
  const rawName = String(formData.get("name") || "").trim();
  const rawDisplayName = String(formData.get("displayName") || "").trim();
  const category = String(formData.get("category") || "general").trim() || "general";
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
    const { error } = await adminClient.from("skills").insert({
      name,
      display_name: displayName,
      category,
      description: description || null,
      status,
    });

    if (error) {
      console.error("[admin.skills.createSkill] insert error:", error);
      return { success: false, message: error.message.includes("duplicate") ? "Skill already exists" : "Failed to create skill" };
    }

    revalidatePath(`/${lang}/skills`);
    return { success: true, message: "Skill created successfully" };
  } catch (error) {
    console.error("[admin.skills.createSkill] unexpected error:", error);
    return { success: false, message: "Failed to create skill" };
  }
}

export async function updateSkill(skillId: string, formData: FormData): Promise<{ success: boolean; message: string }> {
  if (!skillId) return { success: false, message: "Skill id is required" };

  const rawName = String(formData.get("name") || "").trim();
  const rawDisplayName = String(formData.get("displayName") || "").trim();
  const category = String(formData.get("category") || "general").trim() || "general";
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
      .from("skills")
      .update({
        name,
        display_name: displayName,
        category,
        description: description || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", skillId);

    if (error) {
      console.error("[admin.skills.updateSkill] update error:", error);
      return { success: false, message: error.message.includes("duplicate") ? "Skill already exists" : "Failed to update skill" };
    }

    revalidatePath(`/${lang}/skills`);
    return { success: true, message: "Skill updated successfully" };
  } catch (error) {
    console.error("[admin.skills.updateSkill] unexpected error:", error);
    return { success: false, message: "Failed to update skill" };
  }
}

export async function deleteSkill(skillId: string, lang = "en"): Promise<{ success: boolean; message: string }> {
  if (!skillId) return { success: false, message: "Skill id is required" };

  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    const { error } = await adminClient.from("skills").delete().eq("id", skillId);

    if (error) {
      console.error("[admin.skills.deleteSkill] delete error:", error);
      return { success: false, message: "Failed to delete skill" };
    }

    revalidatePath(`/${lang}/skills`);
    return { success: true, message: "Skill deleted successfully" };
  } catch (error) {
    console.error("[admin.skills.deleteSkill] unexpected error:", error);
    return { success: false, message: "Failed to delete skill" };
  }
}
