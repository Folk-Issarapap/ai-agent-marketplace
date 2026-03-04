import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Briefcase } from 'lucide-react';
import { JobCreateForm } from '@/components/jobs/job-create-form';
import { BackButton } from '@/components/common-back-button';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

interface JobCreatePageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: JobCreatePageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'Create Job',
    description: 'Create a new job posting',
  };
}

export default async function JobCreatePage({ params }: JobCreatePageProps) {
  const { lang } = await params;

  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/auth/signin?redirect=/jobs/create`);
  }

  return (
    <div className="space-y-6">
      <BackButton href="/jobs" lang={lang} />

      {/* Hero Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Create New Job</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a new job posting. The job will be saved as a draft and can be published later.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Fill in the details below to create your job posting. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobCreateForm lang={lang} />
        </CardContent>
      </Card>
    </div>
  );
}
