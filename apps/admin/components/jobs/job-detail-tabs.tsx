'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { LayoutDashboard, FileText, History } from 'lucide-react';

type JobDetailTabsProps = {
  jobId: string;
  lang: string;
};

export function JobDetailTabs({ jobId, lang }: JobDetailTabsProps) {
  const pathname = usePathname();
  const basePath = `/${lang}/jobs/${jobId}`;

  // Determine active tab based on pathname
  const activeTab = pathname === basePath ? 'overview' : pathname.includes('/logs') ? 'logs' : 'overview';

  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList>
        <TabsTrigger value="overview" asChild>
          <Link href={basePath}>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground/60" />
            Overview
          </Link>
        </TabsTrigger>
        <TabsTrigger value="logs" asChild>
          <Link href={`${basePath}/logs`}>
            <History className="h-4 w-4 text-muted-foreground/60" />
            Logs
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
