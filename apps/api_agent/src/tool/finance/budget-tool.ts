import { tool } from 'ai';
import { z } from 'zod';

export const budgetTool = tool({
  description:
    'Split monthly net income into categories (needs, wants, savings/debt) using a rule like 50/30/20, and summarize the result. Use when user asks how to divide their money each month.',
  inputSchema: z.object({
    netIncome: z.coerce.number().min(0).describe('Monthly net income after tax in the user currency'),
    needsPercent: z
      .coerce.number()
      .min(0)
      .max(100)
      .default(50)
      .describe('Percent of income for needs (housing, food, utilities, transport, minimum debt payment)'),
    wantsPercent: z
      .coerce.number()
      .min(0)
      .max(100)
      .default(30)
      .describe('Percent of income for wants (eating out, travel, shopping, entertainment)'),
    savingsPercent: z
      .coerce.number()
      .min(0)
      .max(100)
      .default(20)
      .describe('Percent of income for savings, investments, and extra debt payments')
  }),
  async execute({ netIncome, needsPercent, wantsPercent, savingsPercent }) {
    const totalPercent = needsPercent + wantsPercent + savingsPercent;
    const factor = totalPercent === 0 ? 0 : 100 / totalPercent;

    const normalizedNeeds = needsPercent * factor;
    const normalizedWants = wantsPercent * factor;
    const normalizedSavings = savingsPercent * factor;

    const needsAmount = Math.round((netIncome * normalizedNeeds) / 100);
    const wantsAmount = Math.round((netIncome * normalizedWants) / 100);
    const savingsAmount = Math.round((netIncome * normalizedSavings) / 100);

    return {
      netIncome,
      rule: {
        needsPercent: Math.round(normalizedNeeds * 10) / 10,
        wantsPercent: Math.round(normalizedWants * 10) / 10,
        savingsPercent: Math.round(normalizedSavings * 10) / 10
      },
      allocation: {
        needsAmount,
        wantsAmount,
        savingsAmount
      }
    };
  }
});
