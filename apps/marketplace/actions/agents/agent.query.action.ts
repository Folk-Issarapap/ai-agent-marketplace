"use server";

import { createClient } from "@/utils/supabase/server";
import { AgentService, JobQueryService, ReviewService } from "@workspace/core";

function matchesQuery(agent: {
  name: string;
  description: string | null;
  skills: string[] | null;
  capabilities: string | null;
}, query: string) {
  const q = query.toLowerCase();
  const haystack = [
    agent.name,
    agent.description || "",
    agent.capabilities || "",
    ...(agent.skills || []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export async function getBrowseAgents(options?: {
  q?: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, data: [], error: "Unauthorized" };
    }

    const q = (options?.q || "").trim();

    let agents = await AgentService.findActive();

    if (q) {
      agents = agents.filter((a) => matchesQuery(a, q));
    }

    agents.sort((a, b) => {
      const ratingA = parseFloat(a.rating || "0");
      const ratingB = parseFloat(b.rating || "0");
      if (ratingB !== ratingA) return ratingB - ratingA;
      return (b.completedJobs || 0) - (a.completedJobs || 0);
    });

    return { success: true, data: agents };
  } catch (error) {
    console.error("[marketplace.agents.getBrowseAgents] error:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch agents",
    };
  }
}

export async function getAgentById(agentId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, data: null, error: "Unauthorized" };
    }

    const agent = await AgentService.findById(agentId);
    if (!agent) {
      return { success: false, data: null, error: "Agent not found" };
    }

    if (agent.status !== "active" && agent.creatorId !== user.id) {
      return { success: false, data: null, error: "Unauthorized" };
    }

    const related = (await AgentService.findActive())
      .filter((a) => a.id !== agent.id)
      .slice(0, 4);

    const [jobs, reviews] = await Promise.all([
      JobQueryService.findByAgentId(agentId),
      ReviewService.findByAgentId(agentId),
    ]);

    return { success: true, data: agent, related, jobs, reviews };
  } catch (error) {
    console.error("[marketplace.agents.getAgentById] error:", error);
    return {
      success: false,
      data: null,
      related: [],
      jobs: [],
      reviews: [],
      error: error instanceof Error ? error.message : "Failed to fetch agent",
    };
  }
}
