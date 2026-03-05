import { tool } from 'ai';
import { z } from 'zod';

function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

const ACTIVITY_MULT: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const bodyMetricsTool = tool({
  description: 'Calculate BMI, BMR (Basal Metabolic Rate), and estimated daily calorie needs (TDEE) for a person. Use when user provides weight, height, age, gender, or asks about calories, BMI, metabolism.',
  needsApproval: true,
  inputSchema: z.object({
    weightKg: z.coerce.number().min(20).max(300).describe('Body weight in kilograms'),
    heightCm: z.coerce.number().min(100).max(250).describe('Height in centimeters'),
    age: z.coerce.number().min(10).max(120).describe('Age in years'),
    gender: z.enum(['male', 'female']).describe('Biological sex for BMR formula'),
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional().describe('Daily activity level for TDEE'),
  }),
  async execute({ weightKg, heightCm, age, gender, activityLevel = 'moderate' }) {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const bmiCategory =
      bmi < 18.5 ? 'underweight'
      : bmi < 25 ? 'normal'
      : bmi < 30 ? 'overweight'
      : 'obese';

    const bmr = Math.round(calculateBMR(weightKg, heightCm, age, gender));
    const multiplier = ACTIVITY_MULT[activityLevel] ?? 1.55;
    const tdee = Math.round(bmr * multiplier);

    return {
      bmi: Math.round(bmi * 10) / 10,
      bmiCategory,
      bmr,
      tdee,
      activityLevel,
      suggestion: {
        loseWeight: tdee - 500,
        maintain: tdee,
        gainWeight: tdee + 300,
      },
    };
  },
});
