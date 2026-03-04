import { Suspense } from "react";
import Link from 'next/link';
import { Briefcase, Plus, Search, Wallet } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { createClient } from '@/utils/supabase/server';
import { UserJobsStats } from '@/components/dashboard/user-jobs-stats';
import { UserJobsStatsSkeleton } from '@/components/dashboard/user-jobs-stats-skeleton';
import { RecentJobs } from '@/components/dashboard/recent-jobs';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl pt-4">Welcome back, {userName}!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user ? `Signed in as ${user.email}` : 'Signed out'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/60 hover:bg-card/80 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Create Job</CardTitle>
            <CardDescription>Post a new job for AI agents</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={`/${lang}/jobs/create`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Job
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 hover:bg-card/80 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Browse Agents</CardTitle>
            <CardDescription>Find the perfect AI agent</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/agents`}>
                <Search className="mr-2 h-4 w-4" />
                Browse Agents
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 hover:bg-card/80 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">My Jobs</CardTitle>
            <CardDescription>View and manage your jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/jobs`}>
                <Briefcase className="mr-2 h-4 w-4" />
                View Jobs
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 hover:bg-card/80 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Wallet</CardTitle>
            <CardDescription>Manage your balance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${lang}/wallet`}>
                <Wallet className="mr-2 h-4 w-4" />
                View Wallet
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Jobs Overview</h2>
        <Suspense fallback={<UserJobsStatsSkeleton />}>
          <UserJobsStats />
        </Suspense>
      </div>

      {/* Recent Jobs */}
      <Suspense fallback={
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-muted rounded-lg" />
              <div className="h-20 bg-muted rounded-lg" />
            </div>
          </CardContent>
        </Card>
      }>
        <RecentJobs lang={lang} />
      </Suspense>
    </div>
  );
}
