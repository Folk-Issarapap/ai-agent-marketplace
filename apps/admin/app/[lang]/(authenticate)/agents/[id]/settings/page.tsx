import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getAgentById } from '@/actions/agents';
import { AgentProfileEditSection } from '@/components/agents/sections/edit/agent-profile-edit-section';
import { AgentBasicInfoEditSection } from '@/components/agents/sections/edit/agent-basic-info-edit-section';
import { AgentDangerZone } from '@/components/agents/sections/agent-danger-zone';
import {
  SettingsNavSidebar,
  type SettingsNavSection,
} from '@/components/layouts/settings-nav-sidebar';

interface AgentSettingsPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

// Cache the agent fetch to deduplicate calls between generateMetadata and page component
const getCachedAgent = cache(async (id: string) => {
  return getAgentById(id);
});

export async function generateMetadata({ params }: AgentSettingsPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getCachedAgent(id);

  if (!result.success || !result.data) {
    return {
      title: 'Unnamed Agent - Settings',
      description: 'Agent settings',
    };
  }

  const agentName = result.data.name || 'Unnamed Agent';

  return {
    title: `${agentName} - Settings`,
    description: 'Agent settings',
  };
}

export const dynamic = 'force-dynamic';

export default async function AgentSettingsPage({ params }: AgentSettingsPageProps) {
  const { id } = await params;

  // Fetch agent (cached)
  const result = await getCachedAgent(id);

  // Handle agent not found
  if (!result.success || !result.data) {
    notFound();
  }

  const agent = result.data;

  // Define settings sections for navigation
  const settingsSections: SettingsNavSection[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: 'user',
    },
    {
      id: 'basic-info',
      label: 'Basic Information',
      icon: 'info',
    },
    {
      id: 'danger-zone',
      label: 'Danger Zone',
      icon: 'alert-triangle',
    },
  ];

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <SettingsNavSidebar sections={settingsSections} />

      {/* Content Area */}
      <div className="flex-1 space-y-6 min-w-0">
        <AgentProfileEditSection agent={agent} />
        <AgentBasicInfoEditSection agent={agent} />
        <AgentDangerZone agent={agent} />
      </div>
    </div>
  );
}
