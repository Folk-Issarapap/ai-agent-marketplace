'use client';

import { Badge } from '@workspace/ui/components/badge';
import { useTranslations } from 'next-intl';
import {
  CheckCircle2,
  Ban,
  XCircle,
  Loader2,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
} from 'lucide-react';

/**
 * Transaction Status Badge
 * Displays transaction status with appropriate styling
 * Supports both Payment statuses and Transaction ledger statuses
 */
interface TransactionStatusBadgeProps {
  status?: string; // e.g. pending | processing | completed | failed | cancelled | refunded | partially_refunded | reversed
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function TransactionStatusBadge({
  status = 'pending',
  className,
  size = 'md',
}: TransactionStatusBadgeProps) {
  const t = useTranslations('transactions');

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          variant: 'success' as const,
          label: t('enums.status.completed'),
        };
      case 'processing':
        return {
          icon: Loader2,
          variant: 'warning' as const,
          label: t('enums.status.processing'),
        };
      case 'pending':
        return {
          icon: Clock,
          variant: 'secondary' as const,
          label: t('enums.status.pending'),
        };
      case 'failed':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          label: t('enums.status.failed'),
        };
      case 'cancelled':
        return {
          icon: Ban,
          variant: 'secondary' as const,
          label: t('enums.status.cancelled'),
        };
      case 'refunded':
        return {
          icon: RefreshCw,
          variant: 'secondary' as const,
          label: t('enums.status.refunded'),
        };
      case 'partially_refunded':
        return {
          icon: RefreshCw,
          variant: 'warning' as const,
          label: t('enums.status.partiallyRefunded'),
        };
      case 'reversed':
        return {
          icon: RefreshCw,
          variant: 'secondary' as const,
          label: t('enums.status.reversed'),
        };
      default:
        return {
          icon: Clock,
          variant: 'secondary' as const,
          label: t('enums.status.pending'),
        };
    }
  };

  const { icon: Icon, variant, label } = getStatusConfig();

  return (
    <Badge variant={variant} size={size} className={className}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

/**
 * Transaction Stream Type Badge (Direction Badge)
 * Displays transaction direction (Credit/Debit mapped to Inbound/Outbound) with appropriate styling
 */
interface TransactionStreamTypeBadgeProps {
  streamType?: 'credit' | 'debit' | 'inbound' | 'outbound';
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function TransactionStreamTypeBadge({
  streamType = 'credit',
  className,
  size = 'md',
}: TransactionStreamTypeBadgeProps) {
  const t = useTranslations('transactions');

  // Map credit/debit to inbound/outbound for display
  const getDisplayDirection = (direction: string): 'inbound' | 'outbound' => {
    if (direction === 'credit' || direction === 'inbound') return 'inbound';
    if (direction === 'debit' || direction === 'outbound') return 'outbound';
    return 'inbound'; // default
  };

  const displayDirection = getDisplayDirection(streamType);

  const getStreamTypeConfig = () => {
    switch (displayDirection) {
      case 'inbound':
        return {
          icon: ArrowDownCircle,
          variant: 'success' as const,
          label: t('enums.direction.inbound'),
        };
      case 'outbound':
        return {
          icon: ArrowUpCircle,
          variant: 'secondary' as const,
          label: t('enums.direction.outbound'),
        };
      default:
        return {
          icon: ArrowDownCircle,
          variant: 'success' as const,
          label: t('enums.direction.inbound'),
        };
    }
  };

  const { icon: Icon, variant, label } = getStreamTypeConfig();

  return (
    <Badge variant={variant} size={size} className={className}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
