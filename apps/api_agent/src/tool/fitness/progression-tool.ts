import { tool } from 'ai';
import { z } from 'zod';

export const progressionTool = tool({
  description: 'Get advice on when and how to progress in training: add weight, add reps, or change difficulty. Use when user asks "เมื่อไหร่ควรเพิ่มน้ำหนัก", "เพิ่ม reps ไหม", "โปรเกรสยังไง", or shares current sets/reps/weight.',
  needsApproval: true,
  inputSchema: z.object({
    currentReps: z.coerce.number().min(1).max(50).optional().describe('Current reps per set'),
    currentSets: z.coerce.number().min(1).max(10).optional().describe('Current number of sets'),
    canCompleteAllReps: z.boolean().optional().describe('Whether user can complete all reps with good form'),
    goal: z.enum(['strength', 'hypertrophy', 'endurance']).optional().describe('Primary goal'),
  }),
  async execute({ currentReps, currentSets, canCompleteAllReps, goal = 'hypertrophy' }) {
    const tips: string[] = [];
    if (currentReps != null && currentSets != null) {
      if (canCompleteAllReps) {
        tips.push('เมื่อทำครบทุก rep ทุก set ได้สบาย 2–3 session ติด → เพิ่มน้ำหนักเล็กน้อย (2.5–5%) หรือเพิ่ม 1–2 reps ต่อ set');
        tips.push('ถ้าเพิ่มน้ำหนักแล้วทำไม่ครบ ให้ลด reps ลงแล้วค่อยๆ สร้างกลับ');
      } else {
        tips.push('ยังไม่ต้องเพิ่มน้ำหนัก รักษา reps และ sets นี้ไว้จนทำครบได้ด้วยฟอร์มดีก่อน');
        tips.push('เน้นคุณภาพการเคลื่อนไหวมากกว่าจำนวน');
      }
    }
    if (goal === 'strength') {
      tips.push('Strength: ใช้ช่วง 3–6 reps หนักๆ พักนาน 2–3 นาที');
    } else if (goal === 'hypertrophy') {
      tips.push('Hypertrophy (สร้างกล้าม): ใช้ช่วง 8–12 reps พัก 60–90 วินาที');
    } else {
      tips.push('Endurance: ใช้ช่วง 15+ reps พักสั้น 30–45 วินาที');
    }
    tips.push('พักผ่อนและนอนพอ การโหลดเกินไปจะทำให้ไม่พัฒนา');
    return {
      tips,
      rule: 'Progressive overload: ค่อยๆ เพิ่มโหลด (น้ำหนัก/ reps / ความยาก) เมื่อร่างกายปรับตัวแล้ว',
    };
  },
});
