import { JobsStatsSkeleton } from "@/components/jobs/jobs-stats-skeleton";
import { JobTableSkeleton } from "@/components/jobs/tables/job-table-skeleton";

export default function JobsTableLoading() {
  return (
    <div className="space-y-6">
      <JobsStatsSkeleton />
      <JobTableSkeleton />
    </div>
  );
}
