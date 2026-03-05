import { tool } from 'ai';
import { z } from 'zod';

export const studyPlanTool = tool({
  description:
    'Create a high-level weekly study plan by splitting total hours across topics and weeks until the target exam or goal date.',
  needsApproval: true,
  inputSchema: z.object({
    subject: z.string().min(1).describe('Main subject or exam, e.g. "TOEIC", "Calculus 1", "Frontend development"'),
    topics: z
      .array(z.string().min(1))
      .min(1)
      .describe('List of key topics or chapters to cover'),
    weeks: z.coerce.number().min(1).max(104).describe('Number of weeks available for study'),
    hoursPerWeek: z.coerce.number().min(1).max(80).describe('Number of hours the user can study per week'),
    includeReviewWeek: z
      .boolean()
      .default(true)
      .describe('If true, reserve the final week mainly for review and practice')
  }),
  async execute({ subject, topics, weeks, hoursPerWeek, includeReviewWeek }) {
    const effectiveWeeks = includeReviewWeek && weeks > 1 ? weeks - 1 : weeks;
    const topicCount = topics.length;
    const weeksPerTopic = effectiveWeeks / topicCount;
    const resultWeeks: { weekIndex: number; focusTopics: string[]; plannedHours: number; isReviewWeek: boolean }[] = [];

    for (let i = 0; i < effectiveWeeks; i++) {
      const topicIndex = Math.floor((i / effectiveWeeks) * topicCount);
      resultWeeks.push({
        weekIndex: i + 1,
        focusTopics: [topics[topicIndex]],
        plannedHours: hoursPerWeek,
        isReviewWeek: false
      });
    }

    if (includeReviewWeek && weeks > 1) {
      resultWeeks.push({
        weekIndex: weeks,
        focusTopics: topics,
        plannedHours: hoursPerWeek,
        isReviewWeek: true
      });
    }

    return {
      subject,
      totalWeeks: weeks,
      hoursPerWeek,
      totalPlannedHours: weeks * hoursPerWeek,
      weeksPerTopic,
      schedule: resultWeeks
    };
  }
});
