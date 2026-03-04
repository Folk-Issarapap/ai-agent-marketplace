import 'server-only';

import { SearchParams } from 'nuqs';
import { getAgents } from '@/actions/agents';
import { agentLoadSearchParams } from './agent-search-params';
import { AgentDataGrid } from './agent-data-grid';

type AgentTableProps = {
  searchParams: Promise<SearchParams>;
  lang: string;
};

export async function AgentTable({ searchParams, lang }: AgentTableProps) {
  const { page, pageSize, sort, sortOrder, search, status } =
    await agentLoadSearchParams(searchParams);

  const result = await getAgents(page, pageSize, {
    search,
    status: status === 'all' ? undefined : status,
    sortBy: sort,
    sortOrder,
  });

  if (!result.success || !result.data) {
    return (
      <div className="border rounded-md p-4">
        <p className="text-muted-foreground">{result.error || 'Failed to load agents'}</p>
      </div>
    );
  }

  const agents = result.data.data ?? [];
  const total = result.data.total ?? 0;
  const totalPages = result.data.totalPages ?? 0;
  const isNoAgents = total === 0 && page === 1 && !search && status === 'all';

  return (
    <AgentDataGrid
      data={agents}
      total={total}
      totalPages={totalPages}
      isNoAgents={isNoAgents}
      lang={lang}
    />
  );
}
