import "server-only";

import { StatisticCard } from "@workspace/ui/components/statistic-card";
import { getAccountStatistics } from "@/actions/accounts";
import { Users, CheckCircle, AlertCircle } from "lucide-react";

export async function AccountsStats() {
  const result = await getAccountStatistics();

  if (!result.success || !result.data) {
    return null;
  }

  const stats = result.data;

  // Calculate deltas (example: comparing active vs total)
  const activePercentage =
    stats.totalAccounts > 0 ? ((stats.activeAccounts / stats.totalAccounts) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatisticCard
        title="Total Accounts"
        value={stats.totalAccounts}
        icon={Users}
        lastPeriodLabel="Active"
        lastPeriodValue={`${stats.activeAccounts} (${activePercentage}%)`}
      />
      <StatisticCard
        title="Active Accounts"
        value={stats.activeAccounts}
        icon={CheckCircle}
        delta={parseFloat(activePercentage)}
        positive={stats.activeAccounts > stats.totalAccounts / 2}
        lastPeriodLabel="of Total"
        lastPeriodValue={stats.totalAccounts}
      />
      <StatisticCard
        title="Inactive Accounts"
        value={stats.inactiveAccounts}
        icon={AlertCircle}
        lastPeriodLabel="of Total"
        lastPeriodValue={stats.totalAccounts}
      />
    </div>
  );
}
