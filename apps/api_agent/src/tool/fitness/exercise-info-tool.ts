import { tool } from 'ai';
import { z } from 'zod';

type ExerciseRecord = {
  name: string;
  nameTh: string;
  category: string;
  muscles: string[];
  form: string[];
  equipment: string[];
  alternatives?: string[];
};

const EXERCISE_DB: ExerciseRecord[] = [
  { name: 'squat', nameTh: 'สควอต', category: 'lower', muscles: ['quadriceps', 'glutes', 'hamstrings', 'core'], form: ['เท้าชิดช่วงไหล่ ปลายเท้าชี้ออกเล็กน้อย', 'ย่อลงจนต้นขาขนานพื้น หลังตรง', 'เข่าตามแนวปลายเท้า ไม่ปิดเข้าใน'], equipment: ['bodyweight', 'barbell', 'dumbbell', 'kettlebell'], alternatives: ['goblet squat', 'front squat', 'box squat'] },
  { name: 'push-up', nameTh: 'วิดพื้น', category: 'upper', muscles: ['chest', 'triceps', 'shoulders', 'core'], form: ['มือวางกว้างช่วงไหล่ ลำตัวตรงเป็นเส้น', 'ลงจนหน้าอกเกือบแตะพื้น แล้วดันขึ้น', 'เกร็ง core ไม่ให้สะโพกยกหรือจม'], equipment: ['bodyweight'], alternatives: ['knee push-up', 'diamond push-up', 'pike push-up'] },
  { name: 'deadlift', nameTh: 'เดดลิฟต์', category: 'lower', muscles: ['hamstrings', 'glutes', 'lower back', 'core'], form: ['ยืนเท้าชิดช่วงสะโพก บาร์อยู่เหนือกลางเท้า', 'งอสะโพกหลังตรง ดึงบาร์ชิดขา', 'ล็อคที่สะโพก ไม่แอ่นหลังเกิน'], equipment: ['barbell', 'dumbbell', 'kettlebell'], alternatives: ['romanian deadlift', 'sumo deadlift'] },
  { name: 'plank', nameTh: 'แพลงก์', category: 'core', muscles: ['core', 'shoulders', 'glutes'], form: ['ข้อศอกใต้ไหล่ ปลายเท้าชิด', 'ลำตัวตรงเป็นเส้น ไม่ยกหรือจมสะโพก', 'เกร็งท้องและก้น ค้างตามเวลาที่กำหนด'], equipment: ['bodyweight'], alternatives: ['side plank', 'plank with shoulder tap'] },
  { name: 'lunge', nameTh: 'ลันจ์', category: 'lower', muscles: ['quadriceps', 'glutes', 'hamstrings'], form: ['ก้าวเท้าหนึ่งไปข้างหน้า หลังตรง', 'ย่อจนเข่าหลังเกือบแตะพื้น', 'ดันกลับด้วยเท้าหน้า'], equipment: ['bodyweight', 'dumbbell', 'kettlebell'], alternatives: ['reverse lunge', 'walking lunge', 'curtsy lunge'] },
  { name: 'burpee', nameTh: 'เบอร์พี', category: 'hiit', muscles: ['full body'], form: ['ยืนตรง → หมอบมือแตะพื้น → กระโดดเท้าออกเป็น plank', 'วิดพื้น 1 ครั้ง → กระโดดเท้าเข้า → กระโดดขึ้นพร้อมตบมือเหนือศีรษะ'], equipment: ['bodyweight'], alternatives: ['half burpee', 'burpee with push-up'] },
  { name: 'jumping jack', nameTh: 'กระโดดตบมือ', category: 'cardio', muscles: ['full body'], form: ['ยืนตรง กระโดดแยกเท้าและยกแขนขึ้นเหนือศีรษะ', 'กระโดดกลับเท้าชิด แขนลงข้างตัว', 'ทำต่อเนื่องให้จังหวะสม่ำเสมอ'], equipment: ['bodyweight'], alternatives: ['low impact jacks', 'seal jacks'] },
  { name: 'rowing', nameTh: 'พายเรือ/ร้องดึง', category: 'upper', muscles: ['back', 'biceps', 'shoulders', 'core'], form: ['นั่งหลังตรง ดึงมือมาที่ท้อง/ซี่โครง', 'บีบสะบักตอนดึง ค่อยๆ ปล่อยกลับ'], equipment: ['cable', 'resistance band', 'dumbbell', 'barbell'], alternatives: ['bent over row', 'single arm row'] },
  { name: 'glute bridge', nameTh: 'สะพานก้น', category: 'lower', muscles: ['glutes', 'hamstrings', 'core'], form: ['นอนหงาย เท้าวางราบ เข่างอ 90 องศา', 'ดันสะโพกขึ้นจนลำตัวเป็นเส้นจากไหล่ถึงเข่า', 'บีบก้นที่จุดบนสุด ค้างแล้วค่อยลง'], equipment: ['bodyweight', 'resistance band', 'barbell'], alternatives: ['hip thrust', 'single leg bridge'] },
  { name: 'mountain climber', nameTh: 'ไต่เขา', category: 'hiit', muscles: ['core', 'shoulders', 'hip flexors'], form: ['ท่า high plank มืออยู่ใต้ไหล่', 'สลับดึงเข่าเข้าไปทางอกเร็วและสม่ำเสมอ', 'หลังตรง ไม่ยกสะโพก'], equipment: ['bodyweight'], alternatives: ['cross body mountain climber', 'slow mountain climber'] },
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

export const exerciseInfoTool = tool({
  description: 'Get detailed exercise information: correct form, muscles used, equipment, and alternative exercises. Use when user asks how to do an exercise, form tips, or which muscles it targets.',
  inputSchema: z.object({
    query: z.string().describe('Exercise name in English or Thai (e.g. squat, สควอต, push-up, แพลงก์)'),
  }),
  async execute({ query }) {
    const q = normalize(query);
    const byName = EXERCISE_DB.find(
      (e) =>
        normalize(e.name).includes(q) ||
        normalize(e.nameTh).includes(q) ||
        q.includes(normalize(e.name)) ||
        q.includes(normalize(e.nameTh))
    );
    if (byName) {
      return { found: true, exercise: byName };
    }
    const byCategory = EXERCISE_DB.filter(
      (e) =>
        normalize(e.category).includes(q) ||
        normalize(e.name).includes(q) ||
        e.muscles.some((m) => normalize(m).includes(q))
    );
    if (byCategory.length > 0) {
      return {
        found: true,
        matches: byCategory.map((e) => ({ name: e.name, nameTh: e.nameTh, category: e.category, muscles: e.muscles })),
        message: 'Use the exact exercise name with this tool to get full form and details.',
      };
    }
    return {
      found: false,
      message: 'No exercise found. Try: squat, push-up, deadlift, plank, lunge, burpee, jumping jack, rowing, glute bridge, mountain climber.',
      available: EXERCISE_DB.map((e) => e.name),
    };
  },
});
