'use client';

import { useTranslations } from 'next-intl';
import {
  ExportButton,
  type ExportColumn,
  type ExportFormat,
} from '@/components/common-export/export-button';
import { convertToCSV, downloadCSV } from '@/lib/utils/export-csv';
import { exportToExcel } from '@/lib/utils/export-excel';
import { getTransactions } from '@/actions/transactions';
import type { TransactionWithRelations } from '@workspace/core/services/transaction/types';
import { format } from 'date-fns';

export function TransactionExportButton() {
  const t = useTranslations('transactions');
  const tCommon = useTranslations('common');

  // Define export columns based on table columns
  const exportColumns: ExportColumn[] = [
    { key: 'id', label: t('table.id') },
    { key: 'integrationName', label: t('table.integration') },
    { key: 'amount', label: t('table.amount') },
    { key: 'status', label: t('table.status') },
    { key: 'direction', label: t('table.direction') },
    { key: 'referenceType', label: t('table.referenceType') },
    { key: 'customerName', label: t('table.customerId') },
    { key: 'createdAt', label: t('table.createdAt') },
    { key: 'processedAt', label: t('table.processedAt') },
  ];

  const handleExport = async (exportFormat: ExportFormat, selectedColumns: string[]) => {
    // Fetch all transactions (no pagination for export)
    const result = await getTransactions(1, 10000, {});

    if (!result.success || !result.data) {
      throw new Error(result.error || tCommon('export.errors.failed'));
    }

    const transactions =
      (result.data as { data: TransactionWithRelations[]; total: number }).data || [];

    // Map transactions to export format
    const exportData = transactions.map((transaction: TransactionWithRelations) => {
      // Translate status values (from transactions namespace)
      const statusValue = transaction.status;
      let translatedStatus: string = statusValue || '';
      if (statusValue) {
        try {
          const statusKey = `enums.status.${statusValue}` as
            | 'enums.status.completed'
            | 'enums.status.processing'
            | 'enums.status.pending'
            | 'enums.status.failed'
            | 'enums.status.cancelled'
            | 'enums.status.refunded'
            | 'enums.status.partiallyRefunded'
            | 'enums.status.reversed';
          const translated = t(statusKey);
          if (translated !== statusKey) {
            translatedStatus = String(translated);
          }
        } catch {
          // Keep original if translation fails
        }
      }

      // Translate direction values (from transactions namespace)
      const directionValue = transaction.direction;
      let translatedDirection: string = directionValue || '';
      if (directionValue) {
        try {
          const directionKey = `enums.direction.${directionValue}` as
            | 'enums.direction.inbound'
            | 'enums.direction.outbound';
          const translated = t(directionKey);
          if (translated !== directionKey) {
            translatedDirection = String(translated);
          }
        } catch {
          // Keep original if translation fails
        }
      }

      // Get customer name
      const customerName =
        transaction.customer?.businessName ||
        [transaction.customer?.firstName, transaction.customer?.lastName]
          .filter(Boolean)
          .join(' ') ||
        transaction.customerId ||
        '';

      return {
        id: transaction.id,
        integrationName: transaction.integration?.name || transaction.integrationId || '',
        amount: transaction.amount || '0',
        status: translatedStatus,
        direction: translatedDirection,
        referenceType: transaction.referenceType || '',
        customerName,
        createdAt: transaction.createdAt
          ? format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm:ss')
          : '',
        processedAt: transaction.processedAt
          ? format(new Date(transaction.processedAt), 'yyyy-MM-dd HH:mm:ss')
          : '',
      };
    });

    // Filter columns based on selection
    const filteredColumns = exportColumns.filter((col) => selectedColumns.includes(col.key));
    const filteredData = exportData.map((row) => {
      const filteredRow: Record<string, string> = {};
      filteredColumns.forEach((col) => {
        const value = row[col.key as keyof typeof row];
        filteredRow[col.key] = value ? String(value) : '';
      });
      return filteredRow;
    });

    // Generate filename with timestamp
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const filename = `transactions_${timestamp}`;

    // Export based on format
    if (exportFormat === 'csv') {
      const csvContent = convertToCSV(filteredData, filteredColumns);
      downloadCSV(csvContent, `${filename}.csv`);
    } else {
      await exportToExcel(filteredData, filteredColumns, `${filename}.xlsx`, 'Transactions');
    }
  };

  return (
    <ExportButton
      columns={exportColumns}
      onExport={handleExport}
      defaultColumns={exportColumns.map((col) => col.key)}
    />
  );
}
