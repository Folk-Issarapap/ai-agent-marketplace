import { tool } from 'ai';
import { z } from 'zod';

const FOCUS_OPTIONS = ['strength', 'cardio', 'hiit', 'flexibility', 'full_body', 'upper', 'lower'] as const;
const LEVEL_OPTIONS = ['beginner', 'intermediate', 'advanced'] as const;

export const workoutPlanTool = tool({
  description: 'Generate a structured workout plan for the day or session. Use when user wants a workout routine, plan, or session based on goal, level, duration, and focus (e.g. strength, cardio, HIIT).',
  needsApproval: true,
  inputSchema: z.object({
    focus: z.enum(FOCUS_OPTIONS).describe('Primary focus of the workout'),
    level: z.enum(LEVEL_OPTIONS).describe('Fitness level of the user'),
    durationMinutes: z.coerce.number().min(15).max(120).describe('Total workout duration in minutes'),
    equipment: z.enum(['none', 'minimal', 'full_gym']).optional().describe('Equipment available'),
    restrictions: z.string().optional().describe('Injuries or limitations to avoid'),
  }),
  async execute({ focus, level, durationMinutes, equipment = 'minimal', restrictions }) {
    const warmUp = 5;
    const coolDown = 5;
    const mainBlock = Math.max(10, durationMinutes - warmUp - coolDown);

    const setsReps =
      level === 'beginner' ? '2–3 sets, 10–12 reps'
      : level === 'intermediate' ? '3–4 sets, 8–12 reps'
      : '4–5 sets, 6–12 reps';

    const structure = {
      warmUp: `${warmUp} min — dynamic stretch, light cardio`,
      main: `${mainBlock} min — main exercises (${setsReps})`,
      coolDown: `${coolDown} min — static stretch, breathing`,
    };

    const focusLabel =
      focus === 'strength' ? 'Strength / กล้ามเนื้อ'
      : focus === 'cardio' ? 'Cardio / หัวใจ-หลอดเลือด'
      : focus === 'hiit' ? 'HIIT / เผาผลาญสูง'
      : focus === 'flexibility' ? 'Flexibility / ความยืดหยุ่น'
      : focus === 'full_body' ? 'Full body / ทั้งตัว'
      : focus === 'upper' ? 'Upper body / ครึ่งบน'
      : 'Lower body / ครึ่งล่าง';

    return {
      focus: focusLabel,
      level,
      durationMinutes,
      equipment,
      restrictions: restrictions ?? 'none',
      structure,
      tips: [
        'ดื่มน้ำก่อน-ระหว่าง-หลังออกกำลังกาย',
        'หายใจออกตอนออกแรง หายใจเข้าตอนคลาย',
        'ถ้าเจ็บหรือเวียนหัว ให้หยุดและพัก',
      ],
      note: 'Use getExerciseInfo tool to get detailed form and exercise suggestions for each part.',
    };
  },
});
