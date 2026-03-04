'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { TransactionStatusBadge, TransactionStreamTypeBadge } from '../transaction-badges';
import { DateTime } from '@/components/common-date-time';
import { Currency } from '@/components/common-currency';
import type { TransactionWithRelations } from '@workspace/core/services/transaction/types';

interface TransactionInfoSectionProps {
  transaction: TransactionWithRelations;
}

export function TransactionInfoSection({ transaction }: TransactionInfoSectionProps) {
  const t = useTranslations('transactions');
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id);
      setCopied(true);
      toast.success(t('detail.copySuccess') || 'Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('detail.copyFailed') || 'Failed to copy');
    }
  };

  const amount = parseFloat(transaction.amount || '0');
  // Map credit/debit to inbound/outbound for display
  const isInbound = transaction.direction === 'credit';
  const prefix = isInbound ? '+' : '-';
  const displayAmount = Math.abs(amount);

  return (
    <Card>
      <CardContent>
        <div className="space-y-6 break-all">
          {/* Title */}
          <h2 className="text-2xl font-semibold tracking-tight">{t('detail.title')}</h2>

          {/* Top Row: Status, Direction, and Amount */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full break-all">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 ">
              <TransactionStatusBadge status={transaction.status ?? undefined} size="lg" />
              <TransactionStreamTypeBadge
                streamType={(transaction.direction ?? undefined) as 'credit' | 'debit' | undefined}
                size="lg"
              />
              <div className="">
                <p className="text-2xl font-bold">
                  {prefix}{' '}
                  <Currency amount={displayAmount} currency={transaction.currency || 'THB'} />
                </p>
                <p className="text-sm text-muted-foreground">{transaction.currency || 'THB'}</p>
              </div>
            </div>
          </div>

          {/* Transaction ID with Copy */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground ">{t('detail.info.id')}</p>
            <p className="text-sm  font-medium ">{transaction.id}</p>
            <Button variant="ghost" size="sm" onClick={handleCopyId} className="h-6 w-6 p-0">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>

          {/* Quick Info Grid */}
          <div className="grid gap-4 border-t pt-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground ">{t('detail.info.status')}</p>
              <div>
                <TransactionStatusBadge status={transaction.status ?? undefined} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground ">{t('detail.info.direction')}</p>
              <div>
                <TransactionStreamTypeBadge
                  streamType={(transaction.direction ?? undefined) as 'credit' | 'debit' | undefined}
                />
              </div>
            </div>
            {transaction.referenceType && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground ">{t('detail.info.reference')}</p>
                <p className="text-sm font-medium capitalize ">{transaction.referenceType}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground ">{t('detail.info.createdAt')}</p>
              <p className="text-sm font-medium ">
                <DateTime date={transaction.createdAt} />
              </p>
            </div>
            {transaction.processedAt && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground ">{t('detail.info.processed')}</p>
                <p className="text-sm font-medium ">
                  <DateTime
                    date={
                      typeof transaction.processedAt === 'string'
                        ? new Date(transaction.processedAt)
                        : transaction.processedAt
                    }
                  />
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
