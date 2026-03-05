import { stepCountIs, tool } from "ai";
import { z } from "zod";

export const savingsGoalTool = tool({
  description:
    "Calculate how much a user needs to save per month to reach a goal amount by a target date or within a given number of months. Assumes no interest for simplicity.",
  needsApproval: true,
  inputSchema: z.object({
    currentAmount: z.coerce
      .number()
      .min(0)
      .default(0)
      .describe("Current saved amount in the user currency"),
    goalAmount: z.coerce
      .number()
      .min(0)
      .describe("Total desired savings in the user currency"),
    months: z.coerce
      .number()
      .min(1)
      .max(600)
      .describe("Number of months from now to reach the goal"),
    allowRounding: z
      .boolean()
      .default(true)
      .describe(
        "If true, round suggested monthly saving to nearest whole unit",
      ),
  }),

  async execute({ currentAmount, goalAmount, months, allowRounding }) {
    const remaining = Math.max(goalAmount - currentAmount, 0);
    const rawPerMonth = remaining / months;
    const perMonth = allowRounding ? Math.ceil(rawPerMonth) : rawPerMonth;

    return {
      currentAmount,
      goalAmount,
      remaining,
      months,
      requiredMonthlySaving: perMonth,
      rawMonthlySaving: rawPerMonth,
    };
  },
});
