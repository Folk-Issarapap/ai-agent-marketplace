import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { BackButton } from '@/components/common-back-button';
import { getJobById } from '@/actions/jobs';
import { JobHeroSection } from '@/components/jobs/sections/job-hero-section';

interface JobDetailLayoutProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
  children: React.ReactNode;
}

// Cache the job fetch to deduplicate calls
const getCachedJob = cache(async (id: string) => {
  return getJobById(id);
});

export async function generateMetadata({ params }: JobDetailLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getCachedJob(id);

  if (!result.success || !result.data) {
    return {
      title: 'Job Not Found',
    };
  }

  const jobTitle = result.data.title || 'Untitled Job';

  return {
    title: `${jobTitle} - Jobs`,
  };
}

export default async function JobDetailLayout({ params, children }: JobDetailLayoutProps) {
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
      <BackButton href="/jobs" lang={lang} />
      <JobHeroSection job={job} jobId={id} lang={lang} />
      {children}
    </div>
  );
}
