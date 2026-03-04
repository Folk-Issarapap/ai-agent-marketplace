import 'server-only';

import { Suspense } from 'react';
import type { SearchParams } from 'nuqs';
import { getTransactions } from '@/actions/transactions';
import { transactionLoadSearchParams } from '@/components/transactions/tables/transaction-search-params';
import { TransactionOverTimeChart } from './transaction-over-time-chart';
import { TransactionChartsSkeleton } from './transaction-charts-skeleton';

const DEFAULT_RANGE_DAYS = 30;

type TransactionChartsSectionProps = {
  searchParams: Promise<SearchParams>;
  suspenseKey?: string;
};

function resolveChartRange(
  startDateInput: string,
  endDateInput: string
): {
  chartDateFrom: string;
  chartDateTo: string;
} {
  const hasStartDate = startDateInput.trim() !== '';
  const hasEndDate = endDateInput.trim() !== '';

  if (hasStartDate && hasEndDate) {
    return { chartDateFrom: startDateInput, chartDateTo: endDateInput };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate = hasStartDate ? new Date(startDateInput) : null;
  let endDate = hasEndDate ? new Date(endDateInput) : null;

  if (startDate && Number.isNaN(startDate.getTime())) {
    startDate = null;
  }
  if (endDate && Number.isNaN(endDate.getTime())) {
    endDate = null;
  }

  if (!startDate && !endDate) {
    endDate = new Date(today);
    startDate = new Date(today);
    startDate.setDate(startDate.getDate() - DEFAULT_RANGE_DAYS);
  } else if (startDate && !endDate) {
    endDate = new Date(today);
  } else if (!startDate && endDate) {
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - DEFAULT_RANGE_DAYS);
  }

  if (startDate && endDate && startDate > endDate) {
    const temp = startDate;
    startDate = endDate;
    endDate = temp;
  }

  return {
    chartDateFrom: startDate?.toISOString() ?? startDateInput,
    chartDateTo: endDate?.toISOString() ?? endDateInput,
  };
}

async function ChartsContent({ searchParams }: TransactionChartsSectionProps) {
  const {
    search,
    integrationId,
    status,
    direction,
    referenceType,
    customerId,
    startDate,
    endDate,
  } = await transactionLoadSearchParams(searchParams);

  // Use startDate/endDate for chart, convert to dateFrom/dateTo for DB
  const { chartDateFrom, chartDateTo } = resolveChartRange(startDate, endDate);

  const result = await getTransactions(1, 10000, {
    search: search || undefined,
    integrationId: integrationId === 'all' ? undefined : integrationId,
    status: status === 'all' ? undefined : status,
    direction: direction === 'all' ? undefined : direction,
    referenceType: referenceType === 'all' ? undefined : referenceType,
    customerId: customerId === 'all' ? undefined : customerId,
    dateFrom: chartDateFrom,
    dateTo: chartDateTo,
  });

  const transactions = result.success && result.data ? result.data.data : [];

  return (
    <TransactionOverTimeChart
      transactions={transactions}
      dateFrom={chartDateFrom}
      dateTo={chartDateTo}
    />
  );
}

export function TransactionChartsSection({
  searchParams,
  suspenseKey,
}: TransactionChartsSectionProps) {
  return (
    <Suspense key={suspenseKey} fallback={<TransactionChartsSkeleton />}>
      <ChartsContent searchParams={searchParams} />
    </Suspense>
  );
}
