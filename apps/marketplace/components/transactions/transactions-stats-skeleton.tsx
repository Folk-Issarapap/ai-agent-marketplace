import { StatisticCardSkeleton } from '@workspace/ui/components/statistic-card-skeleton';

export function TransactionsStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatisticCardSkeleton />
      <StatisticCardSkeleton />
      <StatisticCardSkeleton />
      <StatisticCardSkeleton />
    </div>
  );
}
