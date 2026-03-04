"use server";

import { createClient } from "@/utils/supabase/server";
import {
  AgentService,
  JobQueryService,
  PaymentInstructionsService,
  ReviewService,
} from "@workspace/core";

/**
 * Get user's jobs
 */
export async function getUserJobs(userId: string) {
  try {
    const jobs = await JobQueryService.findByHumanId(userId);
    return {
      success: true,
      data: jobs,
    };
  } catch (error) {
    console.error("[marketplace.jobs.getUserJobs] error:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch jobs",
    };
  }
}

/**
 * Get user's jobs with assigned agent names and review ratings (for list cards)
 */
export async function getJobsWithDetails(userId: string) {
  try {
    const jobs = await JobQueryService.findByHumanId(userId);
    const agentIds = [...new Set(jobs.map((j) => j.agentId).filter(Boolean))] as string[];
    const jobIds = jobs.map((j) => j.id);

    const [agents, reviews] = await Promise.all([
      Promise.all(agentIds.map((id) => AgentService.findById(id))),
      ReviewService.findByJobIds(jobIds),
    ]);

    const agentMap: Record<string, { id: string; name: string } | null> = {};
    agentIds.forEach((id, i) => {
      agentMap[id] = agents[i] ? { id: agents[i]!.id, name: agents[i]!.name } : null;
    });

    const reviewMap: Record<string, { rating: number }> = {};
    reviews.forEach((r) => {
      reviewMap[r.jobId] = { rating: r.rating };
    });

    return {
      success: true,
      data: jobs,
      agentMap,
      reviewMap,
    };
  } catch (error) {
    console.error("[marketplace.jobs.getJobsWithDetails] error:", error);
    return {
      success: false,
      data: [],
      agentMap: {},
      reviewMap: {},
      error: error instanceof Error ? error.message : "Failed to fetch jobs",
    };
  }
}

/**
 * Get job by ID (with ownership check)
 */
export async function getJobById(jobId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        data: null,
        error: "Unauthorized. Please sign in.",
      };
    }

    const job = await JobQueryService.findById(jobId);

    if (!job) {
      return {
        success: false,
        data: null,
        error: "Job not found",
      };
    }

    // Check ownership (only job owner can view)
    if (job.humanId !== user.id) {
      return {
        success: false,
        data: null,
        error: "Unauthorized. You do not have permission to view this job.",
      };
    }

    return {
      success: true,
      data: job,
    };
  } catch (error) {
    console.error("[marketplace.jobs.getJobById] error:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch job",
    };
  }
}

/**
 * Get review for a job (only for job owner, used for "Your review" / edit rating)
 */
export async function getReviewByJobId(jobId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, data: null, error: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job || job.humanId !== user.id) {
      return { success: false, data: null, error: "Job not found or access denied." };
    }

    const review = await ReviewService.findByJobId(jobId);
    return { success: true, data: review };
  } catch (error) {
    console.error("[marketplace.jobs.getReviewByJobId] error:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch review",
    };
  }
}

/**
 * Get payment instructions for a job (when status = payment_pending)
 */
export async function getPaymentInstructionsByJobId(jobId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, data: null, error: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job || job.humanId !== user.id) {
      return { success: false, data: null, error: "Job not found or access denied." };
    }

    const instructions = await PaymentInstructionsService.getByJobId(jobId);
    return { success: true, data: instructions };
  } catch (error) {
    console.error("[marketplace.jobs.getPaymentInstructionsByJobId] error:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch payment instructions",
    };
  }
}

/**
 * Get user's job statistics
 */
export async function getUserJobStatistics(userId: string) {
  try {
    const jobs = await JobQueryService.findByHumanId(userId);
    
    const total = jobs.length;
    const draft = jobs.filter((j) => j.status === "draft").length;
    const active = jobs.filter((j) =>
      ["active", "in_review", "payment_pending", "pending_confirmation"].includes(j.status)
    ).length;
    const completed = jobs.filter((j) => j.status === "completed").length;
    
    // Calculate total budget
    const totalBudget = jobs.reduce((sum, job) => {
      const budget = parseFloat(job.budget || "0");
      return sum + budget;
    }, 0);

    return {
      success: true,
      data: {
        total,
        draft,
        active,
        completed,
        totalBudget,
      },
    };
  } catch (error) {
    console.error("[marketplace.jobs.getUserJobStatistics] error:", error);
    return {
      success: false,
      data: {
        total: 0,
        draft: 0,
        active: 0,
        completed: 0,
        totalBudget: 0,
      },
      error: error instanceof Error ? error.message : "Failed to fetch statistics",
    };
  }
}
