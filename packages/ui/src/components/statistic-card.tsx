import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react';

import { cn } from '@workspace/ui/lib/utils';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from './card';
import { RingIcon } from './ring-icon';

const statisticCardVariants = cva('', {
  variants: {
    size: {
      default: '',
      sm: '',
      lg: '',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface StatisticCardProps
  extends
    Omit<React.ComponentProps<typeof Card>, 'title'>,
    VariantProps<typeof statisticCardVariants> {
  title: string;
  value: number | string;
  delta?: number;
  lastPeriodValue?: number | string;
  lastPeriodLabel?: string;
  positive?: boolean;
  prefix?: string;
  suffix?: string;
  format?: (value: number) => string;
  lastFormat?: (value: number | string) => string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  iconPlacement?: 'left' | 'right';
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return n.toLocaleString();
  return n.toString();
}

function StatisticCard({
  className,
  size,
  title,
  value,
  delta,
  lastPeriodValue,
  lastPeriodLabel = 'Vs last month',
  positive = true,
  prefix = '',
  suffix = '',
  format,
  lastFormat,
  action,
  icon: Icon,
  iconPlacement = 'right',
  ...props
}: StatisticCardProps) {
  const formattedValue =
    typeof value === 'number' && format
      ? format(value)
      : typeof value === 'number'
        ? prefix + formatNumber(value) + suffix
        : value;

  const formattedLastPeriod =
    lastPeriodValue !== undefined
      ? lastFormat
        ? lastFormat(lastPeriodValue)
        : typeof lastPeriodValue === 'number'
          ? prefix + formatNumber(lastPeriodValue) + suffix
          : lastPeriodValue
      : undefined;

  return (
    <Card className={cn(statisticCardVariants({ size }), className)} {...props}>
      <CardHeader className="border-0">
        <div className="flex items-center gap-2">
          {Icon && iconPlacement === 'left' && <RingIcon icon={Icon} size="md" />}
          <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        </div>
        {Icon && iconPlacement === 'right' && !action && (
          <CardAction>
            <RingIcon icon={Icon} size="md" />
          </CardAction>
        )}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="space-y-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-medium text-foreground tracking-tight">
            {formattedValue}
          </span>
          {delta !== undefined && (
            <Badge variant={positive ? 'success' : 'destructive'}>
              {delta > 0 ? <ArrowUp /> : <ArrowDown />}
              {Math.abs(delta)}%
            </Badge>
          )}
        </div>
        {formattedLastPeriod !== undefined && (
          <div className="text-xs text-muted-foreground mt-2 border-t pt-2.5">
            {lastPeriodLabel}:{' '}
            <span className="font-medium text-foreground">{formattedLastPeriod}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { StatisticCard, statisticCardVariants };
