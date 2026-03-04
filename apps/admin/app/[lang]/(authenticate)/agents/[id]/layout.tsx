import { notFound } from 'next/navigation';
import { BackButton } from '@/components/common-back-button';
import { getAgentById } from '@/actions/agents';
import { AgentHeroSection } from '@/components/agents/sections/agent-hero-section';

interface AgentLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

export default async function AgentLayout({ children, params }: AgentLayoutProps) {
  const { id, lang } = await params;

  // Fetch agent data
  const result = await getAgentById(id);

  // Handle agent not found
  if (!result.success || !result.data) {
    notFound();
  }

  const agent = result.data;

  return (
    <div className="space-y-6">
      <BackButton href="/agents" lang={lang} />

      <AgentHeroSection agent={agent} agentId={id} lang={lang} />

      {children}
    </div>
  );
}
