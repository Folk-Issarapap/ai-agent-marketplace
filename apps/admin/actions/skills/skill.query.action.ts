"use server";

import { createSupabaseAdminClientWithoutCookies } from "@/utils/supabase/server-admin";

export type AdminSkill = {
  id: string;
  name: string;
  displayName: string;
  category: string;
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

export async function getSkills(): Promise<{
  success: boolean;
  message: string;
  data?: AdminSkill[];
  error?: string;
}> {
  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    const { data, error } = await adminClient
      .from("skills")
      .select("*")
      .order("display_name", { ascending: true });

    if (error) {
      console.error("[admin.skills.getSkills] query error:", error);
      return { success: false, message: "Failed to fetch skills", error: error.message };
    }

    const skills: AdminSkill[] = (data || []).map((skill: any) => ({
      id: toSafeString(skill.id),
      name: toSafeString(skill.name),
      displayName: toSafeString(skill.display_name),
      category: toSafeString(skill.category) || "general",
      description: skill.description ? toSafeString(skill.description) : null,
      status: skill.status === "inactive" ? "inactive" : "active",
      createdAt: skill.created_at ? toSafeString(skill.created_at) : null,
      updatedAt: skill.updated_at ? toSafeString(skill.updated_at) : null,
    }));

    return {
      success: true,
      message: "",
      data: skills,
    };
  } catch (error) {
    console.error("[admin.skills.getSkills] unexpected error:", error);
    return {
      success: false,
      message: "Failed to fetch skills",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
