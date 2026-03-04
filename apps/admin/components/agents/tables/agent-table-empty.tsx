'use client';

import { TableEmpty } from '@workspace/ui/components/empty';
import { Bot, Search } from 'lucide-react';
import { ClearFilter } from '@workspace/ui/components/clear-filter';

interface AgentTableEmptyProps {
  type: 'no-agents' | 'no-results';
}

export function AgentTableEmpty({ type }: AgentTableEmptyProps) {
  if (type === 'no-agents') {
    return (
      <TableEmpty
        icon={Bot}
        title="No agents found"
        description="Get started by creating your first agent."
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
