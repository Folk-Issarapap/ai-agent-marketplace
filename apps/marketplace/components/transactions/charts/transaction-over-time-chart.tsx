'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@workspace/ui/components/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { PeriodFilter } from './period-filter';
import type { TransactionWithRelations } from '@workspace/core/services/transaction/types';
import { normalizeDateRange } from '@/lib/utils/normalize-date-range';

const DEFAULT_RANGE_DAYS = 30;

interface TransactionOverTimeChartProps {
  transactions: TransactionWithRelations[];
  dateFrom?: string;
  dateTo?: string;
}

function resolveDateRange(dateFrom?: string, dateTo?: string): { startDate: Date; endDate: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalized = normalizeDateRange(dateFrom?.trim() || undefined, dateTo?.trim() || undefined);

  let startDate: Date | null = normalized.startDate ?? null;
  let endDate: Date | null = normalized.endDate ?? null;

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

  if (!startDate || !endDate) {
    endDate = new Date(today);
    startDate = new Date(today);
    startDate.setDate(startDate.getDate() - DEFAULT_RANGE_DAYS);
  }

  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}

/** YYYY-MM-DD in local timezone so range keys and transaction keys match */
function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function TransactionOverTimeChart({
  transactions,
  dateFrom,
  dateTo,
}: TransactionOverTimeChartProps) {
  const t = useTranslations('transactions');

  const chartData = useMemo(() => {
    const { startDate, endDate } = resolveDateRange(dateFrom, dateTo);

    const dateMap: Map<string, number> = new Map();
    for (
      let cursor = new Date(startDate);
      cursor <= endDate;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const dateKey = toLocalDateKey(cursor);
      dateMap.set(dateKey, 0);
    }

    transactions.forEach((transaction) => {
      const createdAt = transaction.createdAt;
      if (!createdAt) return;
      const dateKey = toLocalDateKey(new Date(createdAt));
      const currentCount = dateMap.get(dateKey);
      if (currentCount !== undefined) {
        dateMap.set(dateKey, currentCount + 1);
      }
    });

    return Array.from(dateMap.entries())
      .map(([dateKey, count]) => ({
        date: new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        count,
        fullDate: dateKey,
      }))
      .sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [transactions, dateFrom, dateTo]);

  const chartConfig = useMemo(() => {
    return {
      count: {
        label: t('charts.transactionOverTime.count'),
        color: 'var(--chart-1)',
      },
    } satisfies ChartConfig;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Translation function is stable
  }, []);

  // Show chart when there is at least 1 transaction; show "no data" only when none
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="h-auto py-4">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <CardTitle>{t('charts.transactionOverTime.title')}</CardTitle>
                <CardDescription>{t('charts.transactionOverTime.description')}</CardDescription>
              </div>
              <PeriodFilter
                fromKey="startDate"
                toKey="endDate"
                placeholder={t('charts.dateRange.placeholder')}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">{t('charts.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="h-auto py-4">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle>{t('charts.transactionOverTime.title')}</CardTitle>
              <CardDescription>{t('charts.transactionOverTime.description')}</CardDescription>
            </div>
            <PeriodFilter
              fromKey="startDate"
              toKey="endDate"
              placeholder={t('charts.dateRange.placeholder')}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 5, right: 0, top: 10, bottom: 10 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tickLine={false} axisLine={false} width={35} tickMargin={5} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--color-count)"
              strokeWidth={1.5}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
