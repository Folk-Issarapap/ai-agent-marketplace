import { asc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { skillsTable } from "@workspace/db/schema";

/**
 * Read-focused queries for skills
 */
export class SkillQueryService {
  static async getActiveSkills() {
    return db
      .select()
      .from(skillsTable)
      .where(eq(skillsTable.status, "active"))
      .orderBy(asc(skillsTable.displayName));
  }
}
