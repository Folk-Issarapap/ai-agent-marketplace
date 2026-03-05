import { tool } from 'ai';
import { z } from 'zod';

function calcMonthlyPayment(principal: number, annualRatePercent: number, months: number): number {
  const r = annualRatePercent / 100 / 12;
  if (r === 0) {
    return principal / months;
  }
  const numerator = principal * r * Math.pow(1 + r, months);
  const denominator = Math.pow(1 + r, months) - 1;
  return numerator / denominator;
}

export const loanCalculatorTool = tool({
  description:
    'Given principal, annual interest rate, and term in months, calculate approximate monthly payment and total interest for an amortized loan.',
  needsApproval: true,
  inputSchema: z.object({
    principal: z.coerce.number().min(0).describe('Loan principal amount in the user currency'),
    annualRatePercent: z
      .coerce.number()
      .min(0)
      .max(100)
      .describe('Annual interest rate as percent, e.g. 12 for 12%'),
    months: z.coerce.number().min(1).max(600).describe('Loan term in months')
  }),
  async execute({ principal, annualRatePercent, months }) {
    const monthlyPaymentRaw = calcMonthlyPayment(principal, annualRatePercent, months);
    const monthlyPayment = Math.round(monthlyPaymentRaw * 100) / 100;
    const totalPaid = Math.round(monthlyPaymentRaw * months * 100) / 100;
    const totalInterest = Math.round((totalPaid - principal) * 100) / 100;

    return {
      principal,
      annualRatePercent,
      months,
      monthlyPayment,
      totalPaid,
      totalInterest
    };
  }
});
