import { and, asc, eq, ilike } from "drizzle-orm";
import { db } from "@workspace/db";
import { skillsTable } from "@workspace/db/schema";
import { createSkillSchema, type CreateSkillInput, type SkillStatus, type UpdateSkillInput } from "./types";

/**
 * Skill service
 * Handles canonical CRUD operations for skills.
 */
export class SkillService {
  static async create(input: CreateSkillInput) {
    const parsed = createSkillSchema.parse(input);
    const [skill] = await db.insert(skillsTable).values(parsed).returning();
    return skill;
  }

  static async list(status?: SkillStatus, search?: string) {
    const conditions = [];

    if (status) {
      conditions.push(eq(skillsTable.status, status));
    }

    if (search) {
      conditions.push(
        ilike(skillsTable.displayName, `%${search}%`)
      );
    }

    if (conditions.length === 0) {
      return db.select().from(skillsTable).orderBy(asc(skillsTable.displayName));
    }

    return db
      .select()
      .from(skillsTable)
      .where(and(...conditions))
      .orderBy(asc(skillsTable.displayName));
  }

  static async findById(skillId: string) {
    const [skill] = await db.select().from(skillsTable).where(eq(skillsTable.id, skillId)).limit(1);
    return skill || null;
  }

  static async update(skillId: string, input: UpdateSkillInput) {
    const payload = {
      ...input,
      updatedAt: new Date(),
    };

    const [updated] = await db
      .update(skillsTable)
      .set(payload)
      .where(eq(skillsTable.id, skillId))
      .returning();

    return updated || null;
  }

  static async delete(skillId: string) {
    const [deleted] = await db.delete(skillsTable).where(eq(skillsTable.id, skillId)).returning();
    return deleted || null;
  }
}
