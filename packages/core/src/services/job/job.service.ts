import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { jobsTable, jobLogsTable } from "@workspace/db/schema";
import { JobQueryService } from "./job-query.service";
import { JobValidationService } from "./job-validation.service";
import type { CreateJobInput, UpdateJobInput, JobStatus } from "./types";

/**
 * Job Service
 * Main service for job operations (atomic operations only)
 */
export class JobService {
  /**
   * Create a new job
   */
  static async create(input: CreateJobInput) {
    // Validate input
    const validation = JobValidationService.validateCreate(input);
    if (!validation.success || !validation.data) {
      throw new Error(validation.error || "Validation failed");
    }

    // Validate budget
    if (!JobValidationService.validateBudget(validation.data.budget)) {
      throw new Error("Budget is out of valid range");
    }

    const data = validation.data;

    // Create job
    const [job] = await db
      .insert(jobsTable)
      .values({
        humanId: data.humanId,
        title: data.title,
        goal: data.goal,
        task: data.task,
        allowedTools: data.allowedTools || [],
        budget: data.budget,
        deadline: data.deadline,
        maxRevisions: data.maxRevisions,
        status: "draft",
      })
      .returning();

    if (!job) {
      throw new Error("Failed to create job");
    }

    // Log creation
    await db.insert(jobLogsTable).values({
      jobId: job.id,
      actionType: "created",
      summary: `Job "${data.title}" created`,
    });

    return job;
  }

  /**
   * Update job
   */
  static async update(jobId: string, input: UpdateJobInput) {
    // Validate input
    const validation = JobValidationService.validateUpdate(input);
    if (!validation.success || !validation.data) {
      throw new Error(validation.error || "Validation failed");
    }

    // Check if job exists
    const existing = await JobQueryService.findById(jobId);
    if (!existing) {
      throw new Error("Job not found");
    }

    // Validate budget if provided
    if (validation.data.budget && !JobValidationService.validateBudget(validation.data.budget)) {
      throw new Error("Budget is out of valid range");
    }

    const data = validation.data;

    // Update job
    const [updated] = await db
      .update(jobsTable)
      .set({
        ...data,
        deadline: data.deadline,
        updatedAt: new Date(),
      })
      .where(eq(jobsTable.id, jobId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update job");
    }

    // Log update
    await db.insert(jobLogsTable).values({
      jobId: updated.id,
      actionType: "updated",
      summary: `Job "${updated.title}" updated`,
    });

    return updated;
  }

  /**
   * Update job status
   */
  static async updateStatus(jobId: string, newStatus: JobStatus, summary?: string) {
    // Check if job exists
    const existing = await JobQueryService.findById(jobId);
    if (!existing) {
      throw new Error("Job not found");
    }

    // Validate status transition
    const validation = JobValidationService.validateStatusTransition(existing.status, newStatus);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid status transition");
    }

    // Prepare update data
    const updateData: Partial<typeof jobsTable.$inferInsert> = {
      status: newStatus,
      updatedAt: new Date(),
    };

    // Set timestamps based on status
    if (newStatus === "published") {
      updateData.publishedAt = new Date();
    } else if (newStatus === "pending_confirmation") {
      updateData.confirmedAt = new Date();
    } else if (newStatus === "completed") {
      updateData.completedAt = new Date();
    }

    // Update job
    const [updated] = await db
      .update(jobsTable)
      .set(updateData)
      .where(eq(jobsTable.id, jobId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update job status");
    }

    // Log status change
    await db.insert(jobLogsTable).values({
      jobId: updated.id,
      actionType: "status_updated",
      summary: summary || `Job status changed to ${newStatus}`,
      payload: {
        from: existing.status,
        to: newStatus,
      },
    });

    return updated;
  }

  /**
   * Publish job
   */
  static async publish(jobId: string) {
    return this.updateStatus(jobId, "published", "Job published");
  }

  /**
   * Cancel job
   */
  static async cancel(jobId: string) {
    return this.updateStatus(jobId, "cancelled", "Job cancelled");
  }

  /**
   * Revert cancelled job back to draft
   */
  static async revertToDraft(jobId: string) {
    return this.updateStatus(jobId, "draft", "Job reverted to draft");
  }

  /**
   * Assign agent to job
   */
  static async assignAgent(jobId: string, agentId: string) {
    // Check if job exists
    const existing = await JobQueryService.findById(jobId);
    if (!existing) {
      throw new Error("Job not found");
    }

    // Update job with agent
    const [updated] = await db
      .update(jobsTable)
      .set({
        agentId,
        status: "pending_confirmation",
        confirmedAt: new Date(), // When agent is assigned = when assignment is "confirmed"
        updatedAt: new Date(),
      })
      .where(eq(jobsTable.id, jobId))
      .returning();

    if (!updated) {
      throw new Error("Failed to assign agent");
    }

    // Log assignment
    await db.insert(jobLogsTable).values({
      jobId: updated.id,
      actionType: "agent_assigned",
      summary: `Agent assigned to job`,
      payload: { agentId },
    });

    return updated;
  }

  /**
   * Request revision for a job (in_review -> revision_requested)
   * Increments revisionCount and validates against maxRevisions
   */
  static async requestRevision(jobId: string, feedback: string) {
    // Check if job exists
    const existing = await JobQueryService.findById(jobId);
    if (!existing) {
      throw new Error("Job not found");
    }

    // Validate status
    if (existing.status !== "in_review") {
      throw new Error(`Cannot request revision for status: ${existing.status}. Only in-review jobs can be revised.`);
    }

    // Validate revision limit
    const currentRevisionCount = existing.revisionCount || 0;
    const maxRevisions = existing.maxRevisions || 2;
    
    if (currentRevisionCount >= maxRevisions) {
      throw new Error(`Maximum revisions (${maxRevisions}) already reached. Cannot request more revisions.`);
    }

    // Validate status transition
    const validation = JobValidationService.validateStatusTransition(existing.status, "revision_requested");
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid status transition");
    }

    // Update job: increment revisionCount and change status
    const [updated] = await db
      .update(jobsTable)
      .set({
        status: "revision_requested",
        revisionCount: currentRevisionCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(jobsTable.id, jobId))
      .returning();

    if (!updated) {
      throw new Error("Failed to request revision");
    }

    // Log revision request
    await db.insert(jobLogsTable).values({
      jobId: updated.id,
      actionType: "revision_requested",
      summary: `Revision requested by human owner (revision ${currentRevisionCount + 1}/${maxRevisions})`,
      payload: {
        from: existing.status,
        to: "revision_requested",
        revisionCount: currentRevisionCount + 1,
        feedback: feedback.substring(0, 500), // Limit feedback length in log
      },
    });

    return updated;
  }

  /**
   * Unassign agent from job (pending_confirmation -> matching)
   * Removes agent assignment and allows job to be matched again
   */
  static async unassignAgent(jobId: string) {
    // Check if job exists
    const existing = await JobQueryService.findById(jobId);
    if (!existing) {
      throw new Error("Job not found");
    }

    // Validate status
    if (existing.status !== "pending_confirmation") {
      throw new Error(`Cannot unassign agent for status: ${existing.status}. Only pending confirmation jobs can have agents unassigned.`);
    }

    // Check if agent is assigned
    if (!existing.agentId) {
      throw new Error("No agent assigned to this job.");
    }

    // Remove agent assignment and change status back to matching
    const [updated] = await db
      .update(jobsTable)
      .set({
        agentId: null,
        status: "matching",
        updatedAt: new Date(),
      })
      .where(eq(jobsTable.id, jobId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update job");
    }

    // Log unassignment
    await db.insert(jobLogsTable).values({
      jobId: updated.id,
      actionType: "agent_unassigned",
      summary: `Agent unassigned from job. Job status changed back to matching.`,
      payload: { previousAgentId: existing.agentId },
    });

    return updated;
  }
}
