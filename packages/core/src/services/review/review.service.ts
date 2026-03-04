import { eq, desc, inArray } from "drizzle-orm";
import { db } from "@workspace/db";
import { reviewsTable } from "@workspace/db/schema";

export type CreateReviewInput = {
  jobId: string;
  agentId: string;
  humanId: string;
  rating: number; // 1-5
  comment?: string | null;
};

/**
 * Review Service - writes to real DB (reviews table)
 */
export class ReviewService {
  /**
   * Create a review record (real DB)
   */
  static async create(input: CreateReviewInput) {
    const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
    const [row] = await db
      .insert(reviewsTable)
      .values({
        jobId: input.jobId,
        agentId: input.agentId,
        humanId: input.humanId,
        rating,
        comment: input.comment ?? null,
      })
      .returning();
    return row;
  }

  /**
   * Find reviews by agent ID (for agent detail: list of ratings per job)
   */
  static async findByAgentId(agentId: string) {
    return db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.agentId, agentId))
      .orderBy(desc(reviewsTable.createdAt));
  }

  /**
   * Find reviews by multiple job IDs (for list views). Returns one review per job at most.
   */
  static async findByJobIds(jobIds: string[]) {
    if (jobIds.length === 0) return [];
    return db
      .select()
      .from(reviewsTable)
      .where(inArray(reviewsTable.jobId, jobIds));
  }

  /**
   * Find review by job ID (one review per job)
   */
  static async findByJobId(jobId: string) {
    const [row] = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.jobId, jobId))
      .limit(1);
    return row ?? null;
  }

  /**
   * Update review rating and/or comment (for edit rating)
   */
  static async update(
    reviewId: string,
    data: { rating?: number; comment?: string | null }
  ) {
    const updates: { rating?: number; comment?: string | null } = {};
    if (data.rating !== undefined) {
      updates.rating = Math.min(5, Math.max(1, Math.round(data.rating)));
    }
    if (data.comment !== undefined) {
      updates.comment = data.comment;
    }
    if (Object.keys(updates).length === 0) return null;
    const [row] = await db
      .update(reviewsTable)
      .set(updates as Record<string, unknown>)
      .where(eq(reviewsTable.id, reviewId))
      .returning();
    return row ?? null;
  }
}
