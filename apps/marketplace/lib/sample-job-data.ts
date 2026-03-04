import { format, addDays } from 'date-fns';
import type { CreateJobFormValues } from '@/schemas/job.schema';

/** Get deadline 7 days from now (yyyy-MM-dd) */
function nextWeek(): string {
  return format(addDays(new Date(), 7), 'yyyy-MM-dd');
}

/**
 * Sample job data for testing the Create Job form.
 * Use "Fill with sample" button to populate the form quickly.
 */
export const SAMPLE_JOBS: CreateJobFormValues[] = [
  {
    title: 'SEO Blog Post - AI Marketing Trends 2025',
    goal: 'Create an SEO-optimized blog post that attracts organic traffic and positions our brand as thought leaders in AI marketing.',
    task: `1. Research current AI marketing trends and statistics for 2025
2. Write a 1,500-2,000 word blog post with engaging headlines
3. Include 3-5 relevant internal link opportunities
4. Add meta title and description (under 60 and 155 chars)
5. Suggest 2-3 featured image concepts`,
    budget: '150.00',
    deadline: '', // Optional - leave empty or set future date
    maxRevisions: 2,
    allowedTools: ['web_search', 'notion'],
  },
  {
    title: 'Data Analysis - Weekly Sales Report',
    goal: 'Analyze weekly sales data and generate actionable insights for the sales team.',
    task: `1. Aggregate sales data from the past 7 days
2. Identify top-performing products and regions
3. Compare week-over-week growth rates
4. Create a summary with 3-5 key recommendations
5. Format output as a presentation-ready report`,
    budget: '200.00',
    deadline: '',
    maxRevisions: 2,
    allowedTools: ['sql', 'excel', 'bigquery'],
  },
  {
    title: 'Customer Support FAQ Generation',
    goal: 'Reduce support ticket volume by creating a comprehensive FAQ from common customer questions.',
    task: `1. Review past 100 support tickets for patterns
2. Extract and categorize common questions
3. Write clear, helpful answers for each (20-30 FAQs)
4. Organize by topic with table of contents
5. Use simple language suitable for non-technical users`,
    budget: '95.00',
    deadline: '',
    maxRevisions: 3,
    allowedTools: ['intercom', 'notion'],
  },
  {
    title: 'Product Landing Page Copy',
    goal: 'Create high-converting copy for our new AI writing assistant landing page.',
    task: `1. Write hero headline and sub-headline (max 15 words each)
2. Create 4 feature benefit sections with headlines
3. Write social proof / testimonial placeholder sections
4. Craft 2 CTA buttons with compelling copy
5. Include a clear value proposition statement`,
    budget: '120.00',
    deadline: nextWeek(),
    maxRevisions: 2,
    allowedTools: ['google-docs', 'notion'],
  },
  {
    title: 'Market Research - Competitor Analysis',
    goal: 'Understand competitor positioning and pricing to inform our go-to-market strategy.',
    task: `1. Research top 5 competitors in our space
2. Compare features, pricing, and target audiences
3. Identify their strengths and weaknesses
4. Create a SWOT analysis for each
5. Summarize key opportunities and recommendations`,
    budget: '250.00',
    deadline: '',
    maxRevisions: 2,
    allowedTools: ['web_search', 'spreadsheet'],
  },
];

/** Get a random sample job for testing */
export function getRandomSampleJob(): CreateJobFormValues {
  const idx = Math.floor(Math.random() * SAMPLE_JOBS.length);
  return SAMPLE_JOBS[idx] as CreateJobFormValues;
}
