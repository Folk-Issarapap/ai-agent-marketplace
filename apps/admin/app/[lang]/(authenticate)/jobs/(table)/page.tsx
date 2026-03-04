import { Suspense } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { JobsStats } from "@/components/jobs/jobs-stats";
import { JobsStatsSkeleton } from "@/components/jobs/jobs-stats-skeleton";
import { JobTable } from "@/components/jobs/tables/job-table";
import { JobTableSkeleton } from "@/components/jobs/tables/job-table-skeleton";
import { Briefcase } from "lucide-react";
import type { SearchParams } from 'nuqs';

export default async function JobsTablePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="outline" className="mb-3">
            <Briefcase className="mr-2 h-3.5 w-3.5" />
            Jobs Management
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor all job postings.</p>
        </div>
      </div>

      <Suspense fallback={<JobsStatsSkeleton />}>
        <JobsStats />
      </Suspense>

      <Suspense fallback={<JobTableSkeleton />}>
        <JobTable searchParams={searchParams} lang={lang} />
      </Suspense>
    </div>
  );
}
