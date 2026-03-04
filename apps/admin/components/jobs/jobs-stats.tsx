import "server-only";

import { StatisticCard } from "@workspace/ui/components/statistic-card";
import { getJobStatistics } from "@/actions/jobs";
import { Briefcase, FileText, CheckCircle, DollarSign, Lock } from "lucide-react";

export async function JobsStats() {
  const result = await getJobStatistics();

  if (!result.success || !result.data) {
    return null;
  }

  const stats = result.data;

  // Calculate percentages
  const activePercentage =
    stats.totalJobs > 0 ? ((stats.activeJobs / stats.totalJobs) * 100).toFixed(1) : "0";
  const completedPercentage =
    stats.totalJobs > 0 ? ((stats.completedJobs / stats.totalJobs) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
      <StatisticCard
        title="Total Jobs"
        value={stats.totalJobs}
        icon={Briefcase}
        lastPeriodLabel="Draft"
        lastPeriodValue={`${stats.draftJobs}`}
      />
      <StatisticCard
        title="Active Jobs"
        value={stats.activeJobs}
        icon={FileText}
        delta={parseFloat(activePercentage)}
        positive={stats.activeJobs > 0}
        lastPeriodLabel="of Total"
        lastPeriodValue={stats.totalJobs}
      />
      <StatisticCard
        title="Completed Jobs"
        value={stats.completedJobs}
        icon={CheckCircle}
        delta={parseFloat(completedPercentage)}
        positive={stats.completedJobs > 0}
        lastPeriodLabel="of Total"
        lastPeriodValue={stats.totalJobs}
      />
      <StatisticCard
        title="Total Budget"
        value={`$${stats.totalBudget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={DollarSign}
        lastPeriodLabel="Locked"
        lastPeriodValue={`$${stats.lockedBudget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      />
      <StatisticCard
        title="Locked Budget"
        value={`$${stats.lockedBudget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={Lock}
        lastPeriodLabel="of Total"
        lastPeriodValue={`$${stats.totalBudget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      />
    </div>
  );
}
