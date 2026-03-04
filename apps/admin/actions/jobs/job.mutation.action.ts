"use server";

import { revalidatePath } from "next/cache";
import { db } from "@workspace/db";
import { jobLogsTable } from "@workspace/db/schema";
import {
  JobService,
  JobQueryService,
  WalletMockService,
  WorkSubmissionService,
  AgentService,
  ReviewService,
} from "@workspace/core";
import { createClient } from "@/utils/supabase/server";

type AdminActionResult = { success: boolean; message: string };

function extractErrorMessage(error: unknown): string {
  function checkCode(err: unknown): string | null {
    if (typeof err === "object" && err !== null) {
      const o = err as Record<string, unknown>;
      if (o.code === "ECONNREFUSED") {
        return "Database connection refused. Ensure PostgreSQL is running and DATABASE_URL is correct.";
      }
      if (o.code === "ETIMEDOUT") {
        return "Database connection timed out. Check DATABASE_URL and network.";
      }
      if ("errors" in o && Array.isArray(o.errors)) {
        for (const e of o.errors) {
          const msg = checkCode(e);
          if (msg) return msg;
        }
      }
      const cause = (err as Error).cause;
      if (cause) return checkCode(cause);
    }
    return null;
  }
  const codeMsg = checkCode(error);
  if (codeMsg) return codeMsg;

  if (error instanceof Error) {
    if (error.message) return error.message;
    if (error.cause instanceof Error && error.cause.message) return error.cause.message;
    if (error.name) return `${error.name}: ${error.message || "(no message)"}`;
  }
  if (typeof error === "object" && error !== null) {
    const o = error as Record<string, unknown>;
    if (typeof o.message === "string" && o.message) return o.message;
    if (typeof o.error === "string" && o.error) return o.error;
    if (typeof o.digest === "string") return `Server error (digest: ${o.digest})`;
    try {
      const str = JSON.stringify(o, null, 0).slice(0, 200);
      if (str && str !== "{}") return str;
    } catch {
      // ignore
    }
  }
  if (typeof error === "string" && error) return error;
  return "Unknown error (check server terminal for stack trace)";
}

async function getAdminUser(): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return error || !user ? null : { id: user.id };
}

async function logAdminAction(
  jobId: string,
  actionType: string,
  summary: string,
  adminId: string,
  payload?: Record<string, unknown>
) {
  await db.insert(jobLogsTable).values({
    jobId,
    actionType,
    summary,
    payload: payload ? { ...payload, performedBy: adminId } : { performedBy: adminId },
  });
}

export async function adminCancelJob(
  lang: string,
  jobId: string,
  reason?: string
): Promise<AdminActionResult> {
  try {
    const admin = await getAdminUser();
    if (!admin) return { success: false, message: "Unauthorized. Please sign in." };

    const job = await JobQueryService.findById(jobId);
    if (!job) return { success: false, message: "Job not found." };

    const cancellable = ["draft", "published", "matching", "pending_confirmation", "active"];
    if (!cancellable.includes(job.status || "")) {
      return {
        success: false,
        message: `Cannot cancel job with status: ${job.status}. Use admin reject for in_review.`,
      };
    }

    if (["active"].includes(job.status || "")) {
      await WalletMockService.releaseLockedBudget(jobId);
    }

    await JobService.updateStatus(jobId, "cancelled", "Job cancelled by admin");
    await logAdminAction(
      jobId,
      "admin_cancelled",
      `Admin cancelled job. Reason: ${reason || "Customer support"}`,
      admin.id,
      { reason }
    );

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    return { success: true, message: "Job cancelled successfully." };
  } catch (error) {
    const msg = extractErrorMessage(error);
    console.error("[adminCancelJob] Error:", msg, "Raw:", error);
    return { success: false, message: msg || "Failed to cancel job" };
  }
}

export async function adminRejectJob(
  lang: string,
  jobId: string,
  reason?: string
): Promise<AdminActionResult> {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      console.error("[adminRejectJob] Unauthorized: no admin user (sign in to admin app)");
      return { success: false, message: "Unauthorized. Please sign in to the admin app." };
    }

    const job = await JobQueryService.findById(jobId);
    if (!job) {
      console.error("[adminRejectJob] Job not found:", jobId);
      return { success: false, message: "Job not found." };
    }

    if (job.status !== "in_review") {
      console.error("[adminRejectJob] Invalid status:", job.status, "expected in_review");
      return {
        success: false,
        message: `Can only reject jobs in review. Current status: ${job.status}`,
      };
    }

    const reasonText = (reason || "").trim() || "Admin rejection (no reason provided)";

    try {
      const releaseResult = await WalletMockService.releaseLockedBudget(jobId);
      if (!releaseResult.success) {
        console.error("[adminRejectJob] Failed to release budget:", releaseResult.error);
      }
    } catch (releaseErr) {
      console.error("[adminRejectJob] releaseLockedBudget threw:", releaseErr);
      throw new Error(`Release budget failed: ${extractErrorMessage(releaseErr)}`);
    }

    try {
      await JobService.updateStatus(
        jobId,
        "rejected",
        `Rejected by admin. Reason: ${reasonText.substring(0, 200)}`
      );
    } catch (statusErr) {
      console.error("[adminRejectJob] updateStatus threw:", statusErr);
      throw new Error(`Update status failed: ${extractErrorMessage(statusErr)}`);
    }

    try {
      await logAdminAction(jobId, "admin_rejected", `Admin rejected job. Reason: ${reasonText}`, admin.id, {
        reason: reasonText,
      });
    } catch (logErr) {
      console.warn("[adminRejectJob] logAdminAction failed (job was rejected):", logErr);
    }

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    return { success: true, message: "Job rejected. Budget released." };
  } catch (error) {
    const msg = extractErrorMessage(error);
    console.error("[adminRejectJob] Error:", msg, "Full error:", error);
    if (error instanceof Error && error.stack) {
      console.error("[adminRejectJob] Stack:", error.stack);
    }
    return {
      success: false,
      message: msg || "Failed to reject job. Check server terminal for details.",
    };
  }
}

export async function adminApproveJob(lang: string, jobId: string): Promise<AdminActionResult> {
  try {
    const admin = await getAdminUser();
    if (!admin) return { success: false, message: "Unauthorized. Please sign in." };

    const job = await JobQueryService.findById(jobId);
    if (!job) return { success: false, message: "Job not found." };

    if (job.status !== "in_review") {
      return {
        success: false,
        message: `Can only approve in_review jobs. Current status: ${job.status}`,
      };
    }

    const paymentResult = await WalletMockService.processPayment(jobId, job.budget);
    if (!paymentResult.success) {
      return {
        success: false,
        message: paymentResult.error || "Payment processing failed.",
      };
    }

    await JobService.updateStatus(jobId, "completed", "Approved by admin");

    // Real DB: Save review + update agent rating & completed jobs (PRD: Approve → deduct payment, update rating)
    if (job.agentId) {
      const rating = 5; // Default when admin approves; can add rating input later
      await ReviewService.create({
        jobId,
        agentId: job.agentId,
        humanId: job.humanId,
        rating,
      });
      await AgentService.updateRating(job.agentId, rating);
      await AgentService.incrementCompletedJobs(job.agentId);
    }

    await logAdminAction(
      jobId,
      "admin_approved",
      "Admin approved job on behalf of customer",
      admin.id
    );

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    return { success: true, message: "Job approved. Payment processed." };
  } catch (error) {
    const msg = extractErrorMessage(error);
    console.error("[adminApproveJob] Error:", msg, "Raw:", error);
    return { success: false, message: msg || "Failed to approve job" };
  }
}

export async function adminReleaseBudget(
  lang: string,
  jobId: string,
  reason?: string
): Promise<AdminActionResult> {
  try {
    const admin = await getAdminUser();
    if (!admin) return { success: false, message: "Unauthorized. Please sign in." };

    const result = await WalletMockService.releaseLockedBudget(jobId);
    if (!result.success) {
      return { success: false, message: result.error || "Failed to release budget." };
    }
    await logAdminAction(
      jobId,
      "admin_released_budget",
      `Admin released locked budget. Reason: ${reason || "Manual release"}`,
      admin.id,
      { reason }
    );
    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    return { success: true, message: "Budget released successfully." };
  } catch (error) {
    const msg = extractErrorMessage(error);
    console.error("[adminReleaseBudget] Error:", msg, "Raw:", error);
    return { success: false, message: msg || "Failed to release budget" };
  }
}

export async function adminUnassignAgent(lang: string, jobId: string): Promise<AdminActionResult> {
  try {
    const admin = await getAdminUser();
    if (!admin) return { success: false, message: "Unauthorized. Please sign in." };

    await JobService.unassignAgent(jobId);
    await logAdminAction(
      jobId,
      "admin_unassigned_agent",
      "Admin unassigned agent from job",
      admin.id
    );
    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    return { success: true, message: "Agent unassigned. Job back to matching." };
  } catch (error) {
    const msg = extractErrorMessage(error);
    console.error("[adminUnassignAgent] Error:", msg, "Raw:", error);
    return { success: false, message: msg || "Failed to unassign agent" };
  }
}

export async function adminAssignAgent(
  lang: string,
  jobId: string,
  agentId: string
): Promise<AdminActionResult> {
  try {
    const admin = await getAdminUser();
    if (!admin) return { success: false, message: "Unauthorized. Please sign in." };

    await JobService.assignAgent(jobId, agentId);
    await logAdminAction(
      jobId,
      "admin_assigned_agent",
      "Admin assigned agent to job",
      admin.id,
      { agentId }
    );
    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    return { success: true, message: "Agent assigned successfully." };
  } catch (error) {
    const msg = extractErrorMessage(error);
    console.error("[adminAssignAgent] Error:", msg, "Raw:", error);
    return { success: false, message: msg || "Failed to assign agent" };
  }
}

export async function adminSubmitWork(
  lang: string,
  jobId: string,
  content: string,
  description?: string
): Promise<AdminActionResult> {
  try {
    const admin = await getAdminUser();
    if (!admin) return { success: false, message: "Unauthorized. Please sign in." };

    const job = await JobQueryService.findById(jobId);
    if (!job) return { success: false, message: "Job not found." };

    if (!job.agentId) {
      return { success: false, message: "No agent assigned. Assign an agent first." };
    }

    const validStatuses = ["active", "revision_requested"];
    if (!validStatuses.includes(job.status || "")) {
      return {
        success: false,
        message: `Can only submit work for active or revision_requested jobs. Current: ${job.status}`,
      };
    }

    if (!content || content.trim().length < 10) {
      return { success: false, message: "Content must be at least 10 characters." };
    }

    await WorkSubmissionService.submitWork({
      jobId,
      agentId: job.agentId,
      content: content.trim(),
      description: description || "Submitted by admin (customer support)",
    });
    await logAdminAction(
      jobId,
      "admin_submitted_work",
      "Admin submitted work on behalf of agent",
      admin.id
    );

    revalidatePath(`/${lang}/jobs`);
    revalidatePath(`/${lang}/jobs/${jobId}`);
    return { success: true, message: "Work submitted. Job now in review." };
  } catch (error) {
    const msg = extractErrorMessage(error);
    console.error("[adminSubmitWork] Error:", msg, "Raw:", error);
    return { success: false, message: msg || "Failed to submit work" };
  }
}
