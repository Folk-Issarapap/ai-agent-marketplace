import { Suspense } from "react";
import Link from 'next/link';
import { Sparkles, Users, Briefcase } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { createClient } from '@/utils/supabase/server';
import { logout } from '@/actions/auth';
import { AccountsStats } from '@/components/accounts/accounts-stats';
import { AccountsStatsSkeleton } from '@/components/accounts/accounts-stats-skeleton';
import { JobsStats } from '@/components/jobs/jobs-stats';
import { JobsStatsSkeleton } from '@/components/jobs/jobs-stats-skeleton';

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/50 bg-primary/10 text-primary">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Admin Console
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {user ? `Signed in as ${user.email}` : 'Signed out'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <form
              action={async () => {
                'use server';
                await logout(lang);
              }}
            >
              <Button variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href={`/${lang}/auth/signin`}>Sign in</Link>
            </Button>
          )}
          <ThemeSwitcher />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Accounts Overview</h2>
          <Suspense fallback={<AccountsStatsSkeleton />}>
            <AccountsStats />
          </Suspense>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Jobs Overview</h2>
          <Suspense fallback={<JobsStatsSkeleton />}>
            <JobsStats />
          </Suspense>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50 bg-card/60">
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>Manage user accounts and permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link href={`/${lang}/accounts`}>
                <Users className="mr-2 h-4 w-4" />
                View Accounts
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60">
          <CardHeader>
            <CardTitle>Jobs</CardTitle>
            <CardDescription>Monitor and manage all job postings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link href={`/${lang}/jobs`}>
                <Briefcase className="mr-2 h-4 w-4" />
                View Jobs
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60">
          <CardHeader>
            <CardTitle>System</CardTitle>
            <CardDescription>Platform settings and configuration.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Coming soon</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
