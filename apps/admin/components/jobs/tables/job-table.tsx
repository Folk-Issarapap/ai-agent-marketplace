import 'server-only';

import { SearchParams } from 'nuqs';
import { getJobs } from '@/actions/jobs';
import { jobLoadSearchParams } from './job-search-params';
import { JobDataGrid } from './job-data-grid';

type JobTableProps = {
  searchParams: Promise<SearchParams>;
  lang: string;
};

export async function JobTable({ searchParams, lang }: JobTableProps) {
  const { page, pageSize, sort, sortOrder, search, status } =
    await jobLoadSearchParams(searchParams);

  const result = await getJobs(page, pageSize, {
    search,
    status,
    sortBy: sort,
    sortOrder,
  });

  if (!result.success || !result.data) {
    return (
      <div className="border rounded-md p-4">
        <p className="text-muted-foreground">{result.error || 'Failed to load jobs'}</p>
      </div>
    );
  }

  const jobs = result.data.data ?? [];
  const total = result.data.total ?? 0;
  const totalPages = result.data.totalPages ?? 0;
  const isNoJobs = total === 0 && page === 1 && !search && status === 'all';

  return (
    <JobDataGrid
      data={jobs}
      total={total}
      totalPages={totalPages}
      isNoJobs={isNoJobs}
      lang={lang}
    />
  );
}
