import { AccountsStatsSkeleton } from "@/components/accounts/accounts-stats-skeleton";
import { AccountTableSkeleton } from "@/components/accounts/tables/account-table-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <AccountsStatsSkeleton />
      <AccountTableSkeleton />
    </div>
  );
}
