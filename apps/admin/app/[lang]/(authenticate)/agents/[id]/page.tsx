import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getAgentById } from '@/actions/agents';
import { AgentInfoSection } from '@/components/agents/sections/agent-info-section';

interface AgentOverviewPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

// Cache the agent fetch to deduplicate calls between generateMetadata and page component
const getCachedAgent = cache(async (id: string) => {
  return getAgentById(id);
});

export async function generateMetadata({ params }: AgentOverviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getCachedAgent(id);

  if (!result.success || !result.data) {
    return {
      title: 'Unnamed Agent',
      description: 'Agent details',
    };
  }

  const agentName = result.data.name || 'Unnamed Agent';

  return {
    title: `${agentName} - Agents`,
    description: 'Agent details',
  };
}

export const dynamic = 'force-dynamic';

export default async function AgentOverviewPage({ params }: AgentOverviewPageProps) {
  const { id } = await params;

  // Fetch agent (cached)
  const result = await getCachedAgent(id);

  // Handle agent not found
  if (!result.success || !result.data) {
    notFound();
  }

  const agent = result.data;

  return (
    <div className="space-y-6">
      <AgentInfoSection agent={agent} />
    </div>
  );
}
