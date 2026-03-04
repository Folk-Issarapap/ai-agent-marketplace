'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { StatisticCard } from '@workspace/ui/components/statistic-card';
import { getTransactions } from '@/actions/transactions';
import { CheckCircle2, XCircle, RotateCcw, DollarSign } from 'lucide-react';
import { TransactionsStatsSkeleton } from './transactions-stats-skeleton';

export function TransactionsStats() {
  const t = useTranslations('transactions');
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [failed, setFailed] = useState(0);
  const [reversed, setReversed] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        // Ledger statuses: completed | failed | reversed
        const [totalResult, completedResult, failedResult, reversedResult] = await Promise.all([
          getTransactions(1, 1),
          getTransactions(1, 1, { status: 'completed' }),
          getTransactions(1, 1, { status: 'failed' }),
          getTransactions(1, 1, { status: 'reversed' }),
        ]);

        setTotal(totalResult.success && totalResult.data ? totalResult.data.total : 0);
        setCompleted(
          completedResult.success && completedResult.data ? completedResult.data.total : 0
        );
        setFailed(failedResult.success && failedResult.data ? failedResult.data.total : 0);
        setReversed(reversedResult.success && reversedResult.data ? reversedResult.data.total : 0);
      } catch (error) {
        console.error('Failed to load transaction stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return <TransactionsStatsSkeleton />;
  }

  // Calculate percentages
  const completedPercentage = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
  const failedPercentage = total > 0 ? ((failed / total) * 100).toFixed(1) : '0';
  const reversedPercentage = total > 0 ? ((reversed / total) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatisticCard
        title={t('stats.total')}
        value={total}
        icon={DollarSign}
        lastPeriodLabel={t('stats.completed')}
        lastPeriodValue={`${completed} (${completedPercentage}%)`}
      />
      <StatisticCard
        title={t('stats.completed')}
        value={completed}
        icon={CheckCircle2}
        delta={parseFloat(completedPercentage)}
        positive={completed > total / 2}
        lastPeriodLabel={t('stats.ofTotal')}
        lastPeriodValue={total}
      />
      <StatisticCard
        title={t('stats.failed')}
        value={failed}
        icon={XCircle}
        delta={parseFloat(failedPercentage)}
        positive={false}
        lastPeriodLabel={t('stats.ofTotal')}
        lastPeriodValue={total}
      />
      <StatisticCard
        title={t('stats.reversed')}
        value={reversed}
        icon={RotateCcw}
        delta={parseFloat(reversedPercentage)}
        positive={false}
        lastPeriodLabel={t('stats.ofTotal')}
        lastPeriodValue={total}
      />
    </div>
  );
}
