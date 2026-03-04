import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getJobById } from '@/actions/jobs';
import { JobInfoSection } from '@/components/jobs/sections/job-info-section';

interface JobOverviewPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

// Cache the job fetch to deduplicate calls between generateMetadata and page component
const getCachedJob = cache(async (id: string) => {
  return getJobById(id);
});

export async function generateMetadata({ params }: JobOverviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getCachedJob(id);

  if (!result.success || !result.data) {
    return {
      title: 'Job Not Found',
      description: 'Job details',
    };
  }

  const jobTitle = result.data.title || 'Untitled Job';

  return {
    title: `${jobTitle} - Jobs`,
    description: 'Job details',
  };
}

export const dynamic = 'force-dynamic';

export default async function JobOverviewPage({ params }: JobOverviewPageProps) {
  const { id, lang } = await params;

  // Fetch job (cached)
  const result = await getCachedJob(id);

  // Handle job not found
  if (!result.success || !result.data) {
    notFound();
  }

  const job = result.data;

  return (
    <div className="space-y-6">
      <JobInfoSection job={job} lang={lang} />
    </div>
  );
}
