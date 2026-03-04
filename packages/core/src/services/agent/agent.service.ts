import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { aiAgentsTable } from "@workspace/db/schema";
import type { CreateAgentInput, AgentStatus } from "./types";

/**
 * Agent Service
 * Main service for agent operations (atomic operations only)
 */
export class AgentService {
  /**
   * Create a new agent (Third-party only)
   */
  static async create(input: CreateAgentInput) {
    const [agent] = await db
      .insert(aiAgentsTable)
      .values({
        creatorId: input.creatorId,
        name: input.name,
        description: input.description,
        status: "pending", // All new agents start as pending (require approval)
        skills: input.skills || [],
        capabilities: input.capabilities,
        pricingModel: input.pricingModel,
        price: input.price,
        mcpEndpoint: input.mcpEndpoint,
        apiKey: input.apiKey,
      })
      .returning();

    return agent;
  }

  /**
   * Find agent by ID
   */
  static async findById(agentId: string) {
    const [agent] = await db.select().from(aiAgentsTable).where(eq(aiAgentsTable.id, agentId)).limit(1);
    return agent || null;
  }

  /**
   * Find all active agents
   */
  static async findActive() {
    return db
      .select()
      .from(aiAgentsTable)
      .where(eq(aiAgentsTable.status, "active"))
      .orderBy(aiAgentsTable.name);
  }

  /**
   * Find agents by creator
   */
  static async findByCreator(creatorId: string) {
    return db
      .select()
      .from(aiAgentsTable)
      .where(eq(aiAgentsTable.creatorId, creatorId))
      .orderBy(aiAgentsTable.name);
  }

  /**
   * Update agent status
   */
  static async updateStatus(agentId: string, status: AgentStatus) {
    const [updated] = await db
      .update(aiAgentsTable)
      .set({
        status,
        updatedAt: new Date(),
        ...(status === "active" ? { approvedAt: new Date() } : {}),
      })
      .where(eq(aiAgentsTable.id, agentId))
      .returning();

    return updated;
  }

  /**
   * Update agent rating
   */
  static async updateRating(agentId: string, newRating: number) {
    const agent = await this.findById(agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Calculate new average rating
    const totalRatings = agent.totalJobs ?? 0;
    const currentRating = parseFloat(agent.rating || "0");
    const newAverage = totalRatings > 0
      ? ((currentRating * totalRatings) + newRating) / (totalRatings + 1)
      : newRating;

    const [updated] = await db
      .update(aiAgentsTable)
      .set({
        rating: newAverage.toFixed(2),
        totalJobs: (agent.totalJobs || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(aiAgentsTable.id, agentId))
      .returning();

    return updated;
  }

  /**
   * Recalculate agent rating from all reviews (e.g. after editing a review)
   */
  static async recalculateRatingFromReviews(agentId: string) {
    const { ReviewService } = await import("../review/review.service");
    const reviews = await ReviewService.findByAgentId(agentId);
    const agent = await this.findById(agentId);
    if (!agent) throw new Error("Agent not found");
    if (reviews.length === 0) {
      const [updated] = await db
        .update(aiAgentsTable)
        .set({ rating: "0", totalJobs: 0, updatedAt: new Date() })
        .where(eq(aiAgentsTable.id, agentId))
        .returning();
      return updated;
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / reviews.length;
    const [updated] = await db
      .update(aiAgentsTable)
      .set({
        rating: average.toFixed(2),
        totalJobs: reviews.length,
        updatedAt: new Date(),
      })
      .where(eq(aiAgentsTable.id, agentId))
      .returning();
    return updated;
  }

  /**
   * Increment completed jobs
   */
  static async incrementCompletedJobs(agentId: string) {
    const agent = await this.findById(agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    const [updated] = await db
      .update(aiAgentsTable)
      .set({
        completedJobs: (agent.completedJobs || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(aiAgentsTable.id, agentId))
      .returning();

    return updated;
  }
}
