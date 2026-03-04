'use client';

import { TableEmpty } from '@workspace/ui/components/empty';
import { FolderTree, Search } from 'lucide-react';
import { ClearFilter } from '@workspace/ui/components/clear-filter';

interface SkillCategoryTableEmptyProps {
  type: 'no-categories' | 'no-results';
}

export function SkillCategoryTableEmpty({ type }: SkillCategoryTableEmptyProps) {
  if (type === 'no-categories') {
    return (
      <TableEmpty
        icon={FolderTree}
        title="No categories found"
        description="Get started by creating your first category."
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
