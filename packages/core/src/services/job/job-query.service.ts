import { eq, and, gte, lte, inArray, desc, asc } from "drizzle-orm";
import { db } from "@workspace/db";
import { jobsTable } from "@workspace/db/schema";
import type { JobQueryFilters, JobStatus } from "./types";

/**
 * Job Query Service
 * Handles query building and data retrieval for jobs
 */
export class JobQueryService {
  /**
   * Find job by ID
   */
  static async findById(jobId: string) {
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1);
    return job || null;
  }

  /**
   * Find jobs by filters
   */
  static async findMany(filters: JobQueryFilters = {}) {
    const conditions = [];

    if (filters.humanId) {
      conditions.push(eq(jobsTable.humanId, filters.humanId));
    }

    if (filters.agentId) {
      conditions.push(eq(jobsTable.agentId, filters.agentId));
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(inArray(jobsTable.status, filters.status));
      } else {
        conditions.push(eq(jobsTable.status, filters.status));
      }
    }

    if (filters.minBudget) {
      conditions.push(gte(jobsTable.budget, filters.minBudget));
    }

    if (filters.maxBudget) {
      conditions.push(lte(jobsTable.budget, filters.maxBudget));
    }

    if (filters.createdAfter) {
      conditions.push(gte(jobsTable.createdAt, filters.createdAfter));
    }

    if (filters.createdBefore) {
      conditions.push(lte(jobsTable.createdAt, filters.createdBefore));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return db.select().from(jobsTable).where(whereClause).orderBy(desc(jobsTable.createdAt));
  }

  /**
   * Find jobs by human ID
   */
  static async findByHumanId(humanId: string) {
    return db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.humanId, humanId))
      .orderBy(desc(jobsTable.createdAt));
  }

  /**
   * Find jobs by agent ID
   */
  static async findByAgentId(agentId: string) {
    return db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.agentId, agentId))
      .orderBy(desc(jobsTable.createdAt));
  }

  /**
   * Find jobs by status
   */
  static async findByStatus(status: JobStatus | JobStatus[]) {
    if (Array.isArray(status)) {
      return db
        .select()
        .from(jobsTable)
        .where(inArray(jobsTable.status, status))
        .orderBy(desc(jobsTable.createdAt));
    }
    return db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.status, status))
      .orderBy(desc(jobsTable.createdAt));
  }
}
