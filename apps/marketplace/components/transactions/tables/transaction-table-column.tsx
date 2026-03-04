'use client';

import type { ColumnDef, HeaderContext, CellContext } from '@tanstack/react-table';
import type { TransactionWithRelations } from '@workspace/core/services/transaction/types';
import { DataGridColumnHeader } from '@workspace/ui/components/data-grid-column-header';
import { Button } from '@workspace/ui/components/button';
import { TransactionStatusBadge, TransactionStreamTypeBadge } from '../transaction-badges';
import { DateTime } from '@/components/common-date-time';
import { Eye, ExternalLink } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCan } from '@/lib/hooks/use-can';

export function useTransactionTableColumns(): ColumnDef<TransactionWithRelations>[] {
  const t = useTranslations('transactions');

  return [
    {
      accessorKey: 'id',
      header: ({ column }: HeaderContext<TransactionWithRelations, unknown>) => (
        <DataGridColumnHeader column={column} title={t('table.id')} pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<TransactionWithRelations, unknown>) => {
        const id = row.getValue('id') as string;
        return (
          <div className=" text-sm">
            <Link href={`/transactions/${id}`} className="hover:underline">
              {id.slice(0, 8)}...
            </Link>
          </div>
        );
      },
    },
    {
      id: 'integration',
      header: () => <div>{t('table.integration')}</div>,
      cell: ({ row }: CellContext<TransactionWithRelations, unknown>) => {
        const transaction = row.original;
        const integrationId = transaction.integrationId;
        const integrationName = transaction.integration?.name;
        return (
          <Link
            href={`/integrations/${integrationId}`}
            className="text-sm text-muted-foreground hover:underline flex items-center gap-1"
          >
            {integrationName || (integrationId ? `${integrationId.slice(0, 8)}...` : '—')}
            <ExternalLink className="h-3 w-3" />
          </Link>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }: HeaderContext<TransactionWithRelations, unknown>) => (
        <DataGridColumnHeader column={column} title={t('table.amount')} pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<TransactionWithRelations, unknown>) => {
        const amount = row.getValue('amount') as string | null;
        const currency = row.original.currency || 'THB';
        const direction = row.original.direction;
        if (!amount) return <div className="text-sm">-</div>;
        const formattedAmount = new Intl.NumberFormat('th-TH', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(parseFloat(amount));
        // Map credit/debit to inbound/outbound for display
        const isInbound = direction === 'credit';
        const prefix = isInbound ? '+' : '-';
        return (
          <div className="font-medium">
            {prefix} {formattedAmount}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: () => <div>{t('table.status')}</div>,
      cell: ({ row }: CellContext<TransactionWithRelations, unknown>) => {
        const status = row.original.status;
        return <TransactionStatusBadge status={status ?? undefined} />;
      },
    },
    {
      id: 'direction',
      header: () => <div>{t('table.direction')}</div>,
      cell: ({ row }: CellContext<TransactionWithRelations, unknown>) => {
        const direction = row.original.direction;
        return (
          <TransactionStreamTypeBadge
            streamType={(direction ?? undefined) as 'credit' | 'debit' | undefined}
          />
        );
      },
    },
    {
      id: 'referenceType',
      header: () => <div>{t('table.referenceType')}</div>,
      cell: ({ row }: CellContext<TransactionWithRelations, unknown>) => {
        const referenceType = row.original.referenceType;
        return <div className="text-sm capitalize">{referenceType}</div>;
      },
    },
    {
      id: 'customerId',
      header: () => <div>{t('table.customerId')}</div>,
      cell: ({ row }: CellContext<TransactionWithRelations, unknown>) => {
        const transaction = row.original;
        const customerId = transaction.customerId;
        if (!customerId) return <div className="text-sm text-muted-foreground">-</div>;
        const customer = transaction.customer;
        const customerName = customer
          ? customer.businessName ||
            `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
            customer.id
          : null;
        return (
          <Link
            href={`/customers/${customerId}`}
            className="text-sm text-muted-foreground  hover:underline flex items-center gap-1"
          >
            {customerName || `${customerId.slice(0, 8)}...`}
            <ExternalLink className="h-3 w-3" />
          </Link>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }: HeaderContext<TransactionWithRelations, unknown>) => (
        <DataGridColumnHeader column={column} title={t('table.createdAt')} pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<TransactionWithRelations, unknown>) => {
        const createdAt = row.getValue('createdAt') as Date | string | null;
        if (!createdAt) return <div className="text-sm text-muted-foreground">-</div>;
        const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
        return (
          <div className="text-sm text-muted-foreground">
            <DateTime date={date} />
          </div>
        );
      },
    },
    {
      accessorKey: 'processedAt',
      header: ({ column }: HeaderContext<TransactionWithRelations, unknown>) => (
        <DataGridColumnHeader column={column} title={t('table.processedAt')} pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<TransactionWithRelations, unknown>) => {
        const processedAt = row.original.processedAt;
        if (!processedAt) return <div className="text-sm text-muted-foreground">-</div>;
        const date = typeof processedAt === 'string' ? new Date(processedAt) : processedAt;
        return (
          <div className="text-sm text-muted-foreground">
            <DateTime date={date} />
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => null,
      size: 70,
      minSize: 70,
      maxSize: 70,
      enablePinning: true,
      enableSorting: false,
      cell: ({ row }: CellContext<TransactionWithRelations, unknown>) => {
        return <TransactionTableActions transaction={row.original} />;
      },
    },
  ];
}

/**
 * Transaction table actions component with authorization checks
 */
function TransactionTableActions({ transaction }: { transaction: TransactionWithRelations }) {
  const t = useTranslations('transactions');
  const canRead = useCan('read', 'Transaction', transaction);

  // Don't render if user has no permissions
  if (!canRead) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-1 w-full">
      {canRead && (
        <Link href={`/transactions/${transaction.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">{t('table.viewTransaction')}</span>
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}
