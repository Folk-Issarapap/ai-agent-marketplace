/**
 * Work Submission Service
 * Handles agent work submissions (output) that transition job to in_review
 */

import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { jobsTable, jobLogsTable, workSubmissionsTable } from "@workspace/db/schema";
import { JobQueryService } from "../job/job-query.service";
import { JobValidationService } from "../job/job-validation.service";
import type { SubmitWorkInput } from "./types";

export class WorkSubmissionService {
  /**
   * Submit work from agent - updates job with output and status in_review
   */
  static async submitWork(input: SubmitWorkInput) {
    const { jobId, agentId, content, files, description } = input;

    const existing = await JobQueryService.findById(jobId);
    if (!existing) {
      throw new Error("Job not found");
    }

    if (existing.agentId !== agentId) {
      throw new Error("Agent is not assigned to this job");
    }

    const validStatuses = ["active", "revision_requested"];
    if (!validStatuses.includes(existing.status)) {
      throw new Error(
        `Cannot submit work for job with status: ${existing.status}. Job must be active or revision_requested.`
      );
    }

    const validation = JobValidationService.validateStatusTransition(existing.status, "in_review");
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid status transition");
    }

    // Create work submission record
    await db.insert(workSubmissionsTable).values({
      jobId,
      agentId,
      content,
      files: files || [],
      description: description || null,
      status: "submitted",
    });

    // Update job with output and status
    const [updated] = await db
      .update(jobsTable)
      .set({
        output: content,
        outputFiles: files && files.length > 0 ? files : null,
        status: "in_review",
        updatedAt: new Date(),
      })
      .where(eq(jobsTable.id, jobId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update job with work submission");
    }

    await db.insert(jobLogsTable).values({
      jobId: updated.id,
      actionType: "work_submitted",
      summary: `Agent submitted work output`,
      payload: { agentId, contentLength: content.length },
    });

    return updated;
  }
}
