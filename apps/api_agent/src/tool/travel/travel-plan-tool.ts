import { tool } from 'ai';
import { z } from 'zod';

const budgetLevels = ['low', 'medium', 'high'] as const;
type BudgetLevel = (typeof budgetLevels)[number];

export const travelPlanTool = tool({
  description:
    'Generate a simple per-day structure for a trip (morning/afternoon/evening focus) based on destination type, days, and budget level. Does not use real-time data.',
  inputSchema: z.object({
    destination: z.string().min(1).describe('City or region name, e.g. "Bangkok", "Chiang Mai", "Tokyo"'),
    days: z.coerce.number().min(1).max(30).describe('Number of full days at the destination'),
    budgetLevel: z.enum(budgetLevels).default('medium').describe('Approximate budget level: low / medium / high'),
    style: z.array(z.enum(['food', 'culture', 'nightlife', 'shopping', 'nature', 'relax', 'mixed'])).min(1).describe('Preferred travel styles')
  }),
  async execute({ destination, days, budgetLevel, style }) {
    const styleCycle = style.length ? style : ['mixed'];
    const pickStyle = (index: number) => styleCycle[index % styleCycle.length];

    const dayPlans: { day: number; morningFocus: string; afternoonFocus: string; eveningFocus: string }[] = [];
    for (let i = 0; i < days; i++) {
      const baseIndex = i * 3;
      dayPlans.push({
        day: i + 1,
        morningFocus: pickStyle(baseIndex),
        afternoonFocus: pickStyle(baseIndex + 1),
        eveningFocus: pickStyle(baseIndex + 2)
      });
    }

    const budgetNote: Record<BudgetLevel, string> = {
      low: 'Focus on street food, public transport, and free/low-cost attractions.',
      medium: 'Mix of local restaurants, some paid attractions, and comfortable stays.',
      high: 'More flexibility for fine dining, private tours, and premium stays.'
    };

    return { destination, days, budgetLevel, budgetGuideline: budgetNote[budgetLevel], stylesUsed: styleCycle, dayPlans };
  }
});
