"use server";

import { createSupabaseAdminClientWithoutCookies } from "@/utils/supabase/server-admin";

export type AdminAgent = {
  id: string;
  creatorId: string;
  name: string;
  description: string | null;
  status: "pending" | "active" | "suspended" | "banned";
  skills: string[] | null;
  capabilities: string | null;
  pricingModel: "fixed" | "hourly" | "subscription" | null;
  price: string | null;
  rating: string | null;
  totalJobs: number | null;
  completedJobs: number | null;
  mcpEndpoint: string | null;
  apiKey: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  approvedAt: string | null;
};

function toSafeString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value === null || value === undefined) return "";
  return String(value);
}

type GetAgentsOptions = {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function getAgents(
  page = 1,
  pageSize = 20,
  options: GetAgentsOptions = {}
): Promise<{
  success: boolean;
  message: string;
  data?: {
    data: AdminAgent[];
    total: number;
    totalPages: number;
  };
  error?: string;
}> {
  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    
    // Build query
    let query = adminClient.from("ai_agents").select("*", { count: "exact" });

    // Apply filters
    if (options.status && options.status !== 'all') {
      query = query.eq("status", options.status);
    }

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    // Apply sorting - map frontend field names to database column names
    let sortBy = options.sortBy || 'created_at';
    const sortByMap: Record<string, string> = {
      name: 'name',
      status: 'status',
      rating: 'rating',
      totalJobs: 'total_jobs',
      createdAt: 'created_at',
    };
    sortBy = sortByMap[sortBy] || sortBy;
    const sortOrder = options.sortOrder === 'asc' ? true : false;
    query = query.order(sortBy, { ascending: sortOrder });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("[admin.agents.getAgents] query error:", error);
      return { success: false, message: "Failed to fetch agents", error: error.message };
    }

    const agents: AdminAgent[] = (data || []).map((agent: any) => ({
      id: toSafeString(agent.id),
      creatorId: toSafeString(agent.creator_id),
      name: toSafeString(agent.name),
      description: agent.description ? toSafeString(agent.description) : null,
      status: agent.status || "pending",
      skills: agent.skills || null,
      capabilities: agent.capabilities ? toSafeString(agent.capabilities) : null,
      pricingModel: agent.pricing_model || null,
      price: agent.price ? toSafeString(agent.price) : null,
      rating: agent.rating ? toSafeString(agent.rating) : null,
      totalJobs: agent.total_jobs || 0,
      completedJobs: agent.completed_jobs || 0,
      mcpEndpoint: agent.mcp_endpoint ? toSafeString(agent.mcp_endpoint) : null,
      apiKey: agent.api_key ? toSafeString(agent.api_key) : null,
      createdAt: agent.created_at ? toSafeString(agent.created_at) : null,
      updatedAt: agent.updated_at ? toSafeString(agent.updated_at) : null,
      approvedAt: agent.approved_at ? toSafeString(agent.approved_at) : null,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      message: "",
      data: {
        data: agents,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("[admin.agents.getAgents] unexpected error:", error);
    return {
      success: false,
      message: "Failed to fetch agents",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAgentById(agentId: string): Promise<{
  success: boolean;
  message: string;
  data?: AdminAgent;
  error?: string;
}> {
  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    const { data, error } = await adminClient
      .from("ai_agents")
      .select("*")
      .eq("id", agentId)
      .single();

    if (error) {
      console.error("[admin.agents.getAgent] query error:", error);
      return { success: false, message: "Failed to fetch agent", error: error.message };
    }

    if (!data) {
      return { success: false, message: "Agent not found", error: "Agent not found" };
    }

    const agent: AdminAgent = {
      id: toSafeString(data.id),
      creatorId: toSafeString(data.creator_id),
      name: toSafeString(data.name),
      description: data.description ? toSafeString(data.description) : null,
      status: data.status || "pending",
      skills: data.skills || null,
      capabilities: data.capabilities ? toSafeString(data.capabilities) : null,
      pricingModel: data.pricing_model || null,
      price: data.price ? toSafeString(data.price) : null,
      rating: data.rating ? toSafeString(data.rating) : null,
      totalJobs: data.total_jobs || 0,
      completedJobs: data.completed_jobs || 0,
      mcpEndpoint: data.mcp_endpoint ? toSafeString(data.mcp_endpoint) : null,
      apiKey: data.api_key ? toSafeString(data.api_key) : null,
      createdAt: data.created_at ? toSafeString(data.created_at) : null,
      updatedAt: data.updated_at ? toSafeString(data.updated_at) : null,
      approvedAt: data.approved_at ? toSafeString(data.approved_at) : null,
    };

    return {
      success: true,
      message: "",
      data: agent,
    };
  } catch (error) {
    console.error("[admin.agents.getAgent] unexpected error:", error);
    return {
      success: false,
      message: "Failed to fetch agent",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
