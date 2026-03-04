import { StatisticCardSkeleton } from "@workspace/ui/components/statistic-card-skeleton";

export function UserJobsStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatisticCardSkeleton />
      <StatisticCardSkeleton />
      <StatisticCardSkeleton />
      <StatisticCardSkeleton />
    </div>
  );
}
