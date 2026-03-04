import { Suspense } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Bot } from 'lucide-react';
import { AgentTable } from '@/components/agents/tables/agent-table';
import { AgentTableSkeleton } from '@/components/agents/tables/agent-table-skeleton';
import { AgentCreateButton } from '@/components/agents/agent-create-button';
import type { SearchParams } from 'nuqs';

export default async function AgentsTablePage({
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
            <Bot className="mr-2 h-3.5 w-3.5" />
            Agents Management
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-sm text-muted-foreground">
            Manage AI agents in the marketplace (mock data for now).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AgentCreateButton lang={lang} />
        </div>
      </div>

      <Suspense fallback={<AgentTableSkeleton />}>
        <AgentTable searchParams={searchParams} lang={lang} />
      </Suspense>
    </div>
  );
}
