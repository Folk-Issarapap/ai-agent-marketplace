'use client';

import { TableEmpty } from '@workspace/ui/components/empty';
import { BrainCircuit, Search } from 'lucide-react';
import { ClearFilter } from '@workspace/ui/components/clear-filter';

interface SkillTableEmptyProps {
  type: 'no-skills' | 'no-results';
}

export function SkillTableEmpty({ type }: SkillTableEmptyProps) {
  if (type === 'no-skills') {
    return (
      <TableEmpty
        icon={BrainCircuit}
        title="No skills found"
        description="Get started by creating your first skill."
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
