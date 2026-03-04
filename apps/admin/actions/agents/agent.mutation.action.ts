"use server";

import { createSupabaseAdminClientWithoutCookies } from "@/utils/supabase/server-admin";
import { revalidatePath } from "next/cache";

export async function createAgent(formData: FormData): Promise<{
  success: boolean;
  message: string;
  data?: { id: string };
  error?: string;
}> {
  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    
    const creatorId = formData.get("creatorId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const skills = formData.get("skills") as string;
    const capabilities = formData.get("capabilities") as string;
    const pricingModel = formData.get("pricingModel") as string;
    const price = formData.get("price") as string;
    const mcpEndpoint = formData.get("mcpEndpoint") as string;
    const apiKey = formData.get("apiKey") as string;
    const status = formData.get("status") as string || "pending";

    // Parse skills if provided
    let skillsArray: string[] = [];
    if (skills) {
      try {
        skillsArray = JSON.parse(skills);
      } catch {
        skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const { data, error } = await adminClient
      .from("ai_agents")
      .insert({
        creator_id: creatorId,
        name: name.trim(),
        description: description?.trim() || null,
        status: status,
        skills: skillsArray.length > 0 ? skillsArray : null,
        capabilities: capabilities?.trim() || null,
        pricing_model: pricingModel || null,
        price: price || null,
        mcp_endpoint: mcpEndpoint?.trim() || null,
        api_key: apiKey?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[admin.agents.createAgent] insert error:", error);
      return { success: false, message: "Failed to create agent", error: error.message };
    }

    revalidatePath("/[lang]/(authenticate)/agents", "layout");
    
    return {
      success: true,
      message: "Agent created successfully",
      data: { id: data.id },
    };
  } catch (error) {
    console.error("[admin.agents.createAgent] unexpected error:", error);
    return {
      success: false,
      message: "Failed to create agent",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateAgent(
  agentId: string,
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const skills = formData.get("skills") as string;
    const capabilities = formData.get("capabilities") as string;
    const pricingModel = formData.get("pricingModel") as string;
    const price = formData.get("price") as string;
    const mcpEndpoint = formData.get("mcpEndpoint") as string;
    const apiKey = formData.get("apiKey") as string;
    const status = formData.get("status") as string;

    // Parse skills if provided
    let skillsArray: string[] = [];
    if (skills) {
      try {
        skillsArray = JSON.parse(skills);
      } catch {
        skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const updateData: any = {
      name: name.trim(),
      description: description?.trim() || null,
      capabilities: capabilities?.trim() || null,
      pricing_model: pricingModel || null,
      price: price || null,
      mcp_endpoint: mcpEndpoint?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
      if (status === "active") {
        updateData.approved_at = new Date().toISOString();
      }
    }

    if (skillsArray.length > 0) {
      updateData.skills = skillsArray;
    }

    if (apiKey) {
      updateData.api_key = apiKey.trim();
    }

    const { error } = await adminClient
      .from("ai_agents")
      .update(updateData)
      .eq("id", agentId);

    if (error) {
      console.error("[admin.agents.updateAgent] update error:", error);
      return { success: false, message: "Failed to update agent", error: error.message };
    }

    revalidatePath("/[lang]/(authenticate)/agents", "layout");
    revalidatePath(`/[lang]/(authenticate)/agents/${agentId}`, "page");
    
    return {
      success: true,
      message: "Agent updated successfully",
    };
  } catch (error) {
    console.error("[admin.agents.updateAgent] unexpected error:", error);
    return {
      success: false,
      message: "Failed to update agent",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteAgent(
  agentId: string,
  lang: string
): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    
    const { error } = await adminClient
      .from("ai_agents")
      .delete()
      .eq("id", agentId);

    if (error) {
      console.error("[admin.agents.deleteAgent] delete error:", error);
      return { success: false, message: "Failed to delete agent", error: error.message };
    }

    revalidatePath(`/${lang}/agents`, "layout");
    
    return {
      success: true,
      message: "Agent deleted successfully",
    };
  } catch (error) {
    console.error("[admin.agents.deleteAgent] unexpected error:", error);
    return {
      success: false,
      message: "Failed to delete agent",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
