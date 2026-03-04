"use server";

import { revalidatePath } from "next/cache";
import {
  JobService,
  JobQueryService,
  WalletMockService,
  PaymentInstructionsService,
  WorkSubmissionService,
  AgentService,
  ReviewService,
} from "@workspace/core";
import { createClient } from "@/utils/supabase/server";
import { createJobSchema, type CreateJobFormValues } from "@/schemas/job.schema";

/**
 * Create Job Server Action
 * Creates a new job in draft status
 */
export async function createJob(
  lang: string,
  formData: FormData
): Promise<{ success: boolean; message: string; data?: { jobId: string } }> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    // Parse form data
    const title = formData.get("title") as string;
    const goal = formData.get("goal") as string;
    const task = formData.get("task") as string;
    const budget = formData.get("budget") as string;
    const deadline = formData.get("deadline") as string | null;
    const maxRevisions = formData.get("maxRevisions")
      ? parseInt(formData.get("maxRevisions") as string, 10)
      : 2;

    // Parse allowed tools (comma-separated or JSON array)
    let allowedTools: string[] = [];
    const allowedToolsStr = formData.get("allowedTools") as string | null;
    if (allowedToolsStr) {
      try {
        allowedTools = JSON.parse(allowedToolsStr);
      } catch {
        // If not JSON, treat as comma-separated
        allowedTools = allowedToolsStr
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
      }
    }

    // Validate form data with schema
    const validationResult = createJobSchema.safeParse({
      title,
      goal,
      task,
      budget,
      deadline: deadline || undefined,
      maxRevisions,
      allowedTools: allowedTools.length > 0 ? allowedTools : [],
    });

    if (!validationResult.success) {
      console.error("[marketplace.jobs.createJob] Validation errors:", validationResult.error.errors);
      const firstError = validationResult.error.errors[0];
      return {
        success: false,
        message: firstError?.message || "Validation failed. Please check your input.",
      };
    }

    const validatedData = validationResult.data;

    // Prepare job input for JobService
    // JobService expects deadline as Date object, not string
    let deadlineDate: Date | undefined;
    if (validatedData.deadline) {
      try {
        // Parse the date string (format: yyyy-MM-dd)
        deadlineDate = new Date(validatedData.deadline);
        // Validate the date
        if (isNaN(deadlineDate.getTime())) {
          console.error("[marketplace.jobs.createJob] Invalid date format:", validatedData.deadline);
          return { success: false, message: "Invalid deadline date format." };
        }
      } catch (error) {
        console.error("[marketplace.jobs.createJob] Date parsing error:", error);
        return { success: false, message: "Failed to parse deadline date." };
      }
    }

    const jobInput = {
      humanId: user.id,
      title: validatedData.title,
      goal: validatedData.goal,
      task: validatedData.task,
      allowedTools: validatedData.allowedTools && validatedData.allowedTools.length > 0 
        ? validatedData.allowedTools 
        : undefined,
      budget: validatedData.budget,
      deadline: deadlineDate,
      maxRevisions: validatedData.maxRevisions,
    };

    // Create job using JobService
    const job = await JobService.create(jobInput);

    if (!job) {
      return { success: false, message: "Failed to create job." };
    }

    // Revalidate jobs pages
    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/dashboard`);

    return {
      success: true,
      message: "Job created successfully. You can now publish it to start matching with agents.",
      data: { jobId: job.id },
    };
  } catch (error) {
    console.error("[marketplace.jobs.createJob] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create job";
    return { success: false, message: errorMessage };
  }
}

/**
 * Auto-match and assign best agent to job (published/matching -> pending_confirmation)
 */
export async function autoMatchAgent(
  lang: string,
  jobId: string
): Promise<{ success: boolean; message: string; data?: { agentId: string; agentName: string } }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }

    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    // Only allow auto-matching for published or matching jobs
    if (!["published", "matching"].includes(job.status)) {
      return {
        success: false,
        message: `Cannot auto-match agent for job with status: ${job.status}. Only published or matching jobs can be auto-matched.`,
      };
    }

    // Import AgentMatchingService from core
    const coreServices = await import("@workspace/core");
    const { AgentMatchingService } = coreServices;

    // Prepare job input for matching
    const jobInput = {
      id: job.id,
      humanId: job.humanId,
      title: job.title,
      goal: job.goal,
      task: job.task,
      allowedTools: job.allowedTools || [],
      budget: job.budget,
      deadline: job.deadline || undefined,
      maxRevisions: job.maxRevisions || 2,
    };

    // Find best matching agent
    const matchedAgent = await AgentMatchingService.autoAssignAgent(jobInput);

    if (!matchedAgent) {
      // Get all active agents to check if any exist
      const { AgentService } = coreServices;
      const activeAgents = await AgentService.findActive();
      
      if (activeAgents.length === 0) {
        return {
          success: false,
          message: "No active agents available in the marketplace. Please check back later or contact support.",
        };
      }
      
      // Agents exist but none meet the quality threshold
      return {
        success: false,
        message: "No agents found that match your job requirements well enough. Please try selecting an agent manually from the marketplace, or adjust your job requirements (budget, tools, description) to find better matches.",
      };
    }

    // Assign the matched agent
    await JobService.assignAgent(jobId, matchedAgent.id);

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/dashboard`);

    return {
      success: true,
      message: `Best matching agent "${matchedAgent.name}" has been assigned to your job. Please confirm to start the work.`,
      data: {
        agentId: matchedAgent.id,
        agentName: matchedAgent.name,
      },
    };
  } catch (error) {
    console.error("[marketplace.jobs.autoMatchAgent] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to auto-match agent";
    return { success: false, message: errorMessage };
  }
}

/**
 * Assign agent to job (published/matching -> pending_confirmation)
 */
export async function assignAgentToJob(
  lang: string,
  jobId: string,
  agentId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }

    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    // Only allow assignment for published or matching jobs
    if (job.status && !["published", "matching"].includes(job.status)) {
      return {
        success: false,
        message: `Cannot assign agent to job with status: ${job.status}. Only published or matching jobs can have agents assigned.`,
      };
    }

    // Assign agent using JobService
    await JobService.assignAgent(jobId, agentId);

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/dashboard`);

    return {
      success: true,
      message: "Agent assigned successfully. Please confirm to start the work.",
    };
  } catch (error) {
    console.error("[marketplace.jobs.assignAgentToJob] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to assign agent";
    return { success: false, message: errorMessage };
  }
}

/**
 * Get top matching agents for a job (without auto-assigning)
 * Returns top N agents with their scores for user selection
 */
export async function getTopMatchingAgents(
  lang: string,
  jobId: string,
  limit: number = 5
): Promise<{
  success: boolean;
  message: string;
  data?: Array<{
    agent: {
      id: string;
      name: string;
      description: string | null;
      skills: string[] | null;
      capabilities: string | null;
      rating: string | null;
      price: string | null;
      totalJobs: number | null;
      completedJobs: number | null;
      pricingModel: string | null;
    };
    score: number;
    hasMatchingData: boolean;
    perfectMatches: number;
  }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }

    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    // Import AgentMatchingService from core
    const coreServices = await import("@workspace/core");
    const { AgentMatchingService } = coreServices;

    // Prepare job input for matching
    const jobInput = {
      id: job.id,
      humanId: job.humanId,
      title: job.title,
      goal: job.goal,
      task: job.task,
      allowedTools: job.allowedTools || [],
      budget: job.budget,
      deadline: job.deadline || undefined,
      maxRevisions: job.maxRevisions || 2,
    };

    // Get matching agents with scores
    const matchingResults = await AgentMatchingService.findMatchingAgentsWithScores(jobInput);

    if (matchingResults.length === 0) {
      return {
        success: false,
        message: "No matching agents found. Please try adjusting your job requirements or browse agents manually.",
      };
    }

    // Take top N agents
    const topAgents = matchingResults.slice(0, limit).map((result) => ({
      agent: {
        id: result.agent.id,
        name: result.agent.name,
        description: result.agent.description,
        skills: result.agent.skills,
        capabilities: result.agent.capabilities,
        rating: result.agent.rating,
        price: result.agent.price,
        totalJobs: result.agent.totalJobs,
        completedJobs: result.agent.completedJobs,
        pricingModel: result.agent.pricingModel,
      },
      score: Math.round(result.score * 100) / 100, // Round to 2 decimal places
      hasMatchingData: result.hasMatchingData,
      perfectMatches: result.perfectMatches,
    }));

    return {
      success: true,
      message: `Found ${topAgents.length} matching agent${topAgents.length > 1 ? "s" : ""}`,
      data: topAgents,
    };
  } catch (error) {
    console.error("[marketplace.jobs.getTopMatchingAgents] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get matching agents";
    return { success: false, message: errorMessage };
  }
}

/**
 * Approve job submission (in_review -> completed)
 */
export async function approveJob(
  lang: string,
  jobId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }

    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    // Only allow approval for in_review jobs
    if (job.status !== "in_review") {
      return {
        success: false,
        message: `Cannot approve job with status: ${job.status}. Only in-review jobs can be approved.`,
      };
    }

    // Create payment instructions (bank transfer + reference)
    await PaymentInstructionsService.create(jobId, job.budget);

    // Update job status to payment_pending (user must confirm payment before completed)
    await JobService.updateStatus(jobId, "payment_pending", "Job approved, awaiting payment confirmation");

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/dashboard`);

    return {
      success: true,
      message: "Job approved. Please complete the payment and confirm.",
    };
  } catch (error) {
    console.error("[marketplace.jobs.approveJob] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to approve job";
    return { success: false, message: errorMessage };
  }
}

/**
 * Confirm payment (payment_pending -> completed)
 * Mock: User has "paid" (bank/QR), clicks confirm -> process payment, complete job
 */
export async function confirmPayment(
  lang: string,
  jobId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }

    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    if (job.status !== "payment_pending") {
      return {
        success: false,
        message: `Cannot confirm payment for job with status: ${job.status}. Only payment_pending jobs can be confirmed.`,
      };
    }

    const paymentResult = await WalletMockService.processPayment(jobId, job.budget);
    if (!paymentResult.success) {
      return {
        success: false,
        message: paymentResult.error || "Payment processing failed. Please try again.",
      };
    }

    await PaymentInstructionsService.markConfirmed(jobId);
    await JobService.updateStatus(jobId, "completed", "Payment confirmed and job completed");

    if (job.agentId) {
      const rating = 5;
      await ReviewService.create({
        jobId,
        agentId: job.agentId,
        humanId: user.id,
        rating,
      });
      await AgentService.updateRating(job.agentId, rating);
      await AgentService.incrementCompletedJobs(job.agentId);
    }

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/dashboard`);

    return { success: true, message: "Payment confirmed. Job completed successfully." };
  } catch (error) {
    console.error("[marketplace.jobs.confirmPayment] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to confirm payment";
    return { success: false, message: errorMessage };
  }
}

/**
 * Reject job submission (in_review -> rejected)
 */
export async function rejectJob(
  lang: string,
  jobId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }

    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    // Only allow rejection for in_review jobs
    if (job.status !== "in_review") {
      return {
        success: false,
        message: `Cannot reject job with status: ${job.status}. Only in-review jobs can be rejected.`,
      };
    }

    // Mock: Release locked budget back to wallet (BroPay integration point)
    await WalletMockService.releaseLockedBudget(jobId);

    // Validate reason
    if (!reason || reason.trim().length < 5) {
      return {
        success: false,
        message: "Rejection reason must be at least 5 characters long.",
      };
    }

    // Update job status to rejected
    await JobService.updateStatus(
      jobId,
      "rejected",
      `Job rejected by human owner. Reason: ${reason.substring(0, 200)}`
    );

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/dashboard`);

    return {
      success: true,
      message: "Job rejected successfully. Budget will be released back to your wallet.",
    };
  } catch (error) {
    console.error("[marketplace.jobs.rejectJob] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to reject job";
    return { success: false, message: errorMessage };
  }
}

/**
 * Create review for a completed job (when one doesn't exist yet). Recalculates agent average rating.
 */
export async function createJobReview(
  lang: string,
  jobId: string,
  rating: number,
  comment?: string | null
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }
    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }
    if (job.status !== "completed") {
      return { success: false, message: "Only completed jobs can be rated." };
    }
    if (!job.agentId) {
      return { success: false, message: "No agent assigned to this job." };
    }

    const existing = await ReviewService.findByJobId(jobId);
    if (existing) {
      return { success: false, message: "This job already has a rating. Use Edit rating to change it." };
    }

    await ReviewService.create({
      jobId,
      agentId: job.agentId,
      humanId: user.id,
      rating,
      comment: comment ?? null,
    });
    await AgentService.recalculateRatingFromReviews(job.agentId);

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/agents/${job.agentId}`);

    return { success: true, message: "Rating added successfully." };
  } catch (error) {
    console.error("[marketplace.jobs.createJobReview] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to add rating.";
    return { success: false, message: errorMessage };
  }
}

/**
 * Update review (rating and/or comment) for a completed job. Recalculates agent average rating.
 */
export async function updateJobReview(
  lang: string,
  jobId: string,
  rating: number,
  comment?: string | null
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }
    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    const review = await ReviewService.findByJobId(jobId);
    if (!review) {
      return { success: false, message: "No review found for this job. You can only edit a rating after the job is completed." };
    }

    await ReviewService.update(review.id, { rating, comment });
    if (job.agentId) {
      await AgentService.recalculateRatingFromReviews(job.agentId);
    }

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/agents/${job.agentId ?? ""}`);

    return { success: true, message: "Rating updated successfully." };
  } catch (error) {
    console.error("[marketplace.jobs.updateJobReview] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update rating.";
    return { success: false, message: errorMessage };
  }
}

/**
 * Request revision for job (in_review -> revision_requested)
 */
export async function requestJobRevision(
  lang: string,
  jobId: string,
  feedback: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }

    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    // Validate feedback
    if (!feedback || feedback.trim().length < 5) {
      return {
        success: false,
        message: "Revision feedback must be at least 5 characters long.",
      };
    }

    // Request revision using JobService
    await JobService.requestRevision(jobId, feedback);

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/dashboard`);

    const remainingRevisions = (job.maxRevisions || 2) - ((job.revisionCount || 0) + 1);
    return {
      success: true,
      message: `Revision requested successfully. ${remainingRevisions} revision${remainingRevisions !== 1 ? "s" : ""} remaining.`,
    };
  } catch (error) {
    console.error("[marketplace.jobs.requestJobRevision] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to request revision";
    return { success: false, message: errorMessage };
  }
}

/**
 * Cancel job (draft/published/matching -> cancelled)
 */
export async function cancelJob(
  lang: string,
  jobId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }

    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    // Only allow cancellation for draft, published, or matching jobs
    if (!["draft", "published", "matching"].includes(job.status || "")) {
      return {
        success: false,
        message: `Cannot cancel job with status: ${job.status}. Only draft, published, or matching jobs can be cancelled.`,
      };
    }

    // Cancel job using JobService
    await JobService.cancel(jobId);

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/dashboard`);

    return {
      success: true,
      message: "Job cancelled successfully. You can revert it to draft if needed.",
    };
  } catch (error) {
    console.error("[marketplace.jobs.cancelJob] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to cancel job";
    return { success: false, message: errorMessage };
  }
}

/**
 * Publish job (draft -> published)
 */
export async function publishJob(
  lang: string,
  jobId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }

    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    // Only allow publishing for draft jobs
    if (job.status !== "draft") {
      return {
        success: false,
        message: `Cannot publish job with status: ${job.status}. Only draft jobs can be published.`,
      };
    }

    // Publish job using JobService
    await JobService.publish(jobId);

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/dashboard`);

    return {
      success: true,
      message: "Job published successfully. Agents can now see and match with your job.",
    };
  } catch (error) {
    console.error("[marketplace.jobs.publishJob] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to publish job";
    return { success: false, message: errorMessage };
  }
}

/**
 * Revert cancelled job back to draft (cancelled -> draft)
 */
export async function revertToDraft(
  lang: string,
  jobId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }

    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    // Only allow reverting for cancelled jobs
    if (job.status !== "cancelled") {
      return {
        success: false,
        message: `Cannot revert job with status: ${job.status}. Only cancelled jobs can be reverted to draft.`,
      };
    }

    // Revert to draft using JobService
    await JobService.revertToDraft(jobId);

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/dashboard`);

    return {
      success: true,
      message: "Job reverted to draft successfully. You can now edit and publish it again.",
    };
  } catch (error) {
    console.error("[marketplace.jobs.revertToDraft] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to revert job to draft";
    return { success: false, message: errorMessage };
  }
}

/**
 * Confirm assigned agent and start job (pending_confirmation -> active)
 */
export async function confirmAgent(
  lang: string,
  jobId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }

    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    // Only allow confirmation for pending_confirmation jobs
    if (job.status !== "pending_confirmation") {
      return {
        success: false,
        message: `Cannot confirm agent for job with status: ${job.status}. Only pending confirmation jobs can be confirmed.`,
      };
    }

    // Check if agent is assigned
    if (!job.agentId) {
      return {
        success: false,
        message: "No agent assigned to this job. Please assign an agent first.",
      };
    }

    // Mock: Check wallet balance and lock budget (BroPay integration point)
    const hasBalance = await WalletMockService.hasSufficientBalance(user.id, job.budget);
    if (!hasBalance) {
      return {
        success: false,
        message: "Insufficient wallet balance. Please deposit funds before confirming.",
      };
    }

    const lockResult = await WalletMockService.lockBudget(jobId, user.id, job.budget);
    if (!lockResult.success) {
      return {
        success: false,
        message: lockResult.error || "Failed to lock budget. Please try again.",
      };
    }

    // Update job status to active
    await JobService.updateStatus(jobId, "active", "Agent confirmed and job started");

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/dashboard`);

    return {
      success: true,
      message: "Agent confirmed successfully. The job is now active and the agent will start working.",
    };
  } catch (error) {
    console.error("[marketplace.jobs.confirmAgent] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to confirm agent";
    return { success: false, message: errorMessage };
  }
}

/**
 * Unassign agent from job (pending_confirmation -> matching)
 * Removes agent assignment and allows job to be matched again
 */
export async function unassignAgent(
  lang: string,
  jobId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }

    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    // Only allow unassigning for pending_confirmation jobs
    if (job.status !== "pending_confirmation") {
      return {
        success: false,
        message: `Cannot unassign agent for job with status: ${job.status}. Only pending confirmation jobs can have agents unassigned.`,
      };
    }

    // Check if agent is assigned
    if (!job.agentId) {
      return {
        success: false,
        message: "No agent assigned to this job.",
      };
    }

    // Unassign agent using JobService
    await JobService.unassignAgent(jobId);

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/dashboard`);

    return {
      success: true,
      message: "Agent unassigned successfully. You can now select a different agent or use auto-match again.",
    };
  } catch (error) {
    console.error("[marketplace.jobs.unassignAgent] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to unassign agent";
    return { success: false, message: errorMessage };
  }
}

/**
 * Mock: Simulate agent submitting work (for demo/development)
 * Use when job is active - submits mock output and transitions to in_review
 */
export async function simulateAgentWork(
  lang: string,
  jobId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      return { success: false, message: "Job not found." };
    }

    if (job.humanId !== user.id) {
      return { success: false, message: "Unauthorized: You do not own this job." };
    }

    if (!["active", "revision_requested"].includes(job.status || "")) {
      return {
        success: false,
        message: `Cannot simulate work for job with status: ${job.status}. Job must be active or revision_requested.`,
      };
    }

    if (!job.agentId) {
      return { success: false, message: "No agent assigned to this job." };
    }

    const mockOutput = `[MOCK] Completed work for: ${job.title}\n\nGoal: ${job.goal}\nTask: ${job.task}\n\n---\nMock output generated for demo purposes. In production, the AI agent would produce real output here.\n\nSubmitted at: ${new Date().toISOString()}`;

    await WorkSubmissionService.submitWork({
      jobId,
      agentId: job.agentId,
      content: mockOutput,
      description: "Mock submission - simulate agent work for demo",
    });

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    revalidatePath(`/${lang}/dashboard`);

    return {
      success: true,
      message: "Mock work submitted successfully. Job is now in review.",
    };
  } catch (error) {
    console.error("[marketplace.jobs.simulateAgentWork] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to simulate agent work";
    return { success: false, message: errorMessage };
  }
}
