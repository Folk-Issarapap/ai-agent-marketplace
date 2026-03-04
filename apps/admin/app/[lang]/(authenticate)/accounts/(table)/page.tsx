import { Suspense } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { AccountsStats } from "@/components/accounts/accounts-stats";
import { AccountsStatsSkeleton } from "@/components/accounts/accounts-stats-skeleton";
import { AccountTable } from "@/components/accounts/tables/account-table";
import { AccountTableSkeleton } from "@/components/accounts/tables/account-table-skeleton";
import { AccountCreateButton } from "@/components/accounts/account-create-button";
import { AccountSyncButton } from "@/components/accounts/account-sync-button";
import { Users } from "lucide-react";
import type { SearchParams } from 'nuqs';

export default async function AccountsTablePage({
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
            <Users className="mr-2 h-3.5 w-3.5" />
            Accounts Management
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground">Simple CRUD inspired by admin-example structure.</p>
        </div>
        <div className="flex items-center gap-2">
          <AccountSyncButton />
          <AccountCreateButton lang={lang} />
        </div>
      </div>

      <Suspense fallback={<AccountsStatsSkeleton />}>
        <AccountsStats />
      </Suspense>

      <Suspense fallback={<AccountTableSkeleton />}>
        <AccountTable searchParams={searchParams} lang={lang} />
      </Suspense>
    </div>
  );
}
