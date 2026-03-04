'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import Link from 'next/link';

interface AccountDetailTabsProps {
  accountId: string;
  lang: string;
}

export function AccountDetailTabs({ accountId, lang }: AccountDetailTabsProps) {
  const pathname = usePathname();

  // Determine active tab based on pathname
  const isSettingsPage = pathname.endsWith('/settings');
  const isOperationLogsPage = pathname.endsWith('/operation-logs');
  const activeTab = isSettingsPage
    ? 'settings'
    : isOperationLogsPage
      ? 'operation-logs'
      : 'overview';

  return (
    <Tabs value={activeTab} className="w-full">
      <div className="w-full overflow-x-auto">
        <div className="w-fit">
          <TabsList className="min-w-fit">
            <TabsTrigger asChild value="overview">
              <Link href={`/${lang}/accounts/${accountId}`}>
                <LayoutDashboard className="h-4 w-4 text-muted-foreground/60" />
                Overview
              </Link>
            </TabsTrigger>
            <TabsTrigger asChild value="operation-logs">
              <Link href={`/${lang}/accounts/${accountId}/operation-logs`}>
                <FileText className="h-4 w-4 text-muted-foreground/60" />
                Operation Logs
              </Link>
            </TabsTrigger>
            <TabsTrigger asChild value="settings">
              <Link href={`/${lang}/accounts/${accountId}/settings`}>
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
