'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import Link from 'next/link';

interface AgentDetailTabsProps {
  agentId: string;
  lang: string;
}

export function AgentDetailTabs({ agentId, lang }: AgentDetailTabsProps) {
  const pathname = usePathname();

  // Determine active tab based on pathname
  const isSettingsPage = pathname.endsWith('/settings');
  const activeTab = isSettingsPage ? 'settings' : 'overview';

  return (
    <Tabs value={activeTab} className="w-full">
      <div className="w-full overflow-x-auto">
        <div className="w-fit">
          <TabsList className="min-w-fit">
            <TabsTrigger asChild value="overview">
              <Link href={`/${lang}/agents/${agentId}`}>
                <LayoutDashboard className="h-4 w-4 text-muted-foreground/60" />
                Overview
              </Link>
            </TabsTrigger>
            <TabsTrigger asChild value="settings">
              <Link href={`/${lang}/agents/${agentId}/settings`}>
                <Settings className="h-4 w-4 text-muted-foreground/60" />
                Settings
              </Link>
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
    </Tabs>
  );
}
