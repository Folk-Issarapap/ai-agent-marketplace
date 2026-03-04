import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getJobById } from '@/actions/jobs';
import { JobLogsSection } from '@/components/jobs/sections/job-logs-section';

interface JobLogsPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

// Cache the job fetch to deduplicate calls
const getCachedJob = cache(async (id: string) => {
  return getJobById(id);
});

export async function generateMetadata({ params }: JobLogsPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getCachedJob(id);

  if (!result.success || !result.data) {
    return {
      title: 'Job Not Found',
      description: 'Job logs',
    };
  }

  const jobTitle = result.data.title || 'Untitled Job';

  return {
    title: `${jobTitle} - Logs`,
    description: 'Job logs',
  };
}

export const dynamic = 'force-dynamic';

export default async function JobLogsPage({ params }: JobLogsPageProps) {
  const { id } = await params;

  // Fetch job (cached)
  const result = await getCachedJob(id);

  // Handle job not found
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <JobLogsSection jobId={id} />
    </div>
  );
}
