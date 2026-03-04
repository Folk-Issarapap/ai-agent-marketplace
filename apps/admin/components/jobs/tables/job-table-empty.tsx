'use client';

import { Briefcase, Search } from 'lucide-react';
import { TableEmpty } from '@workspace/ui/components/empty';
import { ClearFilter } from '@workspace/ui/components/clear-filter';

interface JobTableEmptyProps {
  type: 'no-jobs' | 'no-results';
}

export function JobTableEmpty({ type }: JobTableEmptyProps) {
  if (type === 'no-jobs') {
    return (
      <TableEmpty
        icon={Briefcase}
        title="No jobs found"
        description="Get started by creating a new job."
      />
    );
  }

  return (
    <TableEmpty
      icon={Search}
      title="No results found"
      description="Try adjusting your filters to see more results."
      action={<ClearFilter excludeKeys={['page', 'pageSize', 'sort', 'sortOrder']} />}
    />
  );
}
