import { tool } from 'ai';
import { z } from 'zod';

export const pomodoroTool = tool({
  description:
    'Split a study session into Pomodoro-style focus blocks with short and long breaks. Useful when the user wants a concrete timing schedule.',
  inputSchema: z.object({
    totalMinutes: z
      .coerce.number()
      .min(15)
      .max(12 * 60)
      .describe('Total planned study duration in minutes'),
    focusMinutes: z.coerce.number().min(15).max(60).default(25).describe('Length of each focus block in minutes'),
    shortBreakMinutes: z.coerce.number().min(3).max(30).default(5).describe('Length of short breaks in minutes'),
    longBreakMinutes: z.coerce.number().min(10).max(45).default(15).describe('Length of a longer break after several focus blocks'),
    blocksBeforeLongBreak: z.coerce.number().min(2).max(8).default(4).describe('How many focus blocks before a long break')
  }),
  async execute({ totalMinutes, focusMinutes, shortBreakMinutes, longBreakMinutes, blocksBeforeLongBreak }) {
    const timeline: { index: number; type: 'focus' | 'short_break' | 'long_break'; durationMinutes: number; cumulativeMinutes: number }[] = [];
    let remaining = totalMinutes;
    let cumulative = 0;
    let blocksDone = 0;

    while (remaining > 0) {
      if (remaining < focusMinutes) {
        timeline.push({ index: timeline.length + 1, type: 'focus', durationMinutes: remaining, cumulativeMinutes: cumulative + remaining });
        cumulative += remaining;
        break;
      }
      timeline.push({ index: timeline.length + 1, type: 'focus', durationMinutes: focusMinutes, cumulativeMinutes: cumulative + focusMinutes });
      cumulative += focusMinutes;
      remaining -= focusMinutes;
      blocksDone += 1;
      if (remaining <= 0) break;

      const isLongBreak = blocksDone % blocksBeforeLongBreak === 0 && remaining > longBreakMinutes;
      const breakMinutes = isLongBreak ? longBreakMinutes : shortBreakMinutes;
      if (remaining < breakMinutes) break;

      timeline.push({
        index: timeline.length + 1,
        type: isLongBreak ? 'long_break' : 'short_break',
        durationMinutes: breakMinutes,
        cumulativeMinutes: cumulative + breakMinutes
      });
      cumulative += breakMinutes;
      remaining -= breakMinutes;
    }

    const totalFocus = timeline.filter((b) => b.type === 'focus').reduce((sum, b) => sum + b.durationMinutes, 0);
    const totalBreak = timeline.filter((b) => b.type !== 'focus').reduce((sum, b) => sum + b.durationMinutes, 0);

    return { totalMinutesPlanned: totalMinutes, totalFocusMinutes: totalFocus, totalBreakMinutes: totalBreak, blocks: timeline };
  }
});
