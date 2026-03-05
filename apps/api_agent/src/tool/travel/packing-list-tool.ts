import { tool } from 'ai';
import { z } from 'zod';

export const packingListTool = tool({
  description:
    'Generate a structured packing list (clothing, documents, electronics, health, extras) based on trip length, climate, and activities. Does not access real-time weather.',
  needsApproval: true,
  inputSchema: z.object({
    days: z.coerce.number().min(1).max(60).describe('Number of days of the trip'),
    climate: z.enum(['hot', 'mild', 'cold', 'variable']).describe('Expected general climate at the destination'),
    activities: z
      .array(z.enum(['city_walk', 'beach', 'hiking', 'business', 'nightlife', 'temple', 'casual']))
      .min(1)
      .describe('Main activities user plans to do')
  }),
  async execute({ days, climate, activities }) {
    const baseClothes = Math.max(Math.ceil(days / 2), 3);
    const clothing: string[] = [
      `${baseClothes}–${baseClothes + 2} tops`,
      `${Math.max(Math.ceil(days / 2), 2)} bottoms`,
      `${days} underwear`,
      `${Math.min(days, 7)} pairs of socks`
    ];
    if (climate === 'hot' || climate === 'variable') clothing.push('1–2 lightweight long-sleeve layers for sun / AC');
    if (climate === 'cold' || climate === 'variable') {
      clothing.push('1 warm jacket or coat', '1–2 sweaters or hoodies');
    }
    if (activities.includes('beach')) clothing.push('1–2 swimwear', 'light cover-up or beach shirt');
    if (activities.includes('hiking')) clothing.push('hiking shoes', 'quick-dry clothing');
    if (activities.includes('business')) clothing.push('1–2 business outfits', 'formal shoes');

    const documents = ['Passport / ID', 'Flight / train tickets and reservations (digital or printed)', 'Hotel / accommodation details', 'Travel insurance info', 'Local currency / cards'];
    const electronics = ['Phone + charger', 'Power bank', 'Travel adapter (if needed)'];
    const health = ['Personal medications', 'Basic first aid (plasters, pain reliever, etc.)', 'Hand sanitizer', 'Face masks (if desired)'];
    if (climate === 'hot' || activities.includes('beach') || activities.includes('hiking')) health.push('Sunscreen', 'After-sun lotion or aloe');

    const extras: string[] = [];
    if (activities.includes('temple')) extras.push('Clothing that covers shoulders and knees for temples');
    if (activities.includes('city_walk') || activities.includes('hiking')) extras.push('Comfortable walking shoes');
    if (activities.includes('nightlife')) extras.push('1–2 outfits for going out at night');

    return { days, climate, activities, categories: { clothing, documents, electronics, health, extras } };
  }
});
