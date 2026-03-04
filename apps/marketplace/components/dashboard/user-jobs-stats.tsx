import "server-only";

import { StatisticCard } from "@workspace/ui/components/statistic-card";
import { getUserJobStatistics } from "@/actions/jobs";
import { Briefcase, FileText, CheckCircle, DollarSign } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export async function UserJobsStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const result = await getUserJobStatistics(user.id);

  if (!result.success || !result.data) {
    return null;
  }

  const stats = result.data;

  // Calculate percentages
  const activePercentage =
    stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : "0";
  const completedPercentage =
    stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatisticCard
        title="Total Jobs"
        value={stats.total}
        icon={Briefcase}
        lastPeriodLabel="Draft"
        lastPeriodValue={`${stats.draft}`}
      />
      <StatisticCard
        title="Active Jobs"
        value={stats.active}
        icon={FileText}
        delta={parseFloat(activePercentage)}
        positive={stats.active > 0}
        lastPeriodLabel="of Total"
        lastPeriodValue={stats.total}
      />
      <StatisticCard
        title="Completed Jobs"
        value={stats.completed}
        icon={CheckCircle}
        delta={parseFloat(completedPercentage)}
        positive={stats.completed > 0}
        lastPeriodLabel="of Total"
        lastPeriodValue={stats.total}
      />
      <StatisticCard
        title="Total Budget"
        value={`$${stats.totalBudget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={DollarSign}
        lastPeriodLabel="All Jobs"
        lastPeriodValue={stats.total}
      />
    </div>
  );
}
