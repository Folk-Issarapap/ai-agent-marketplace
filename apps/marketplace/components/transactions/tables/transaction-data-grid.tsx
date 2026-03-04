'use client';

import { useMemo } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useQueryStates, parseAsInteger, parseAsStringLiteral } from 'nuqs';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { DataGrid, DataGridContainer } from '@workspace/ui/components/data-grid';
import { DataGridTable } from '@workspace/ui/components/data-grid-table';
import { DataGridPagination } from '@workspace/ui/components/data-grid-pagination';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import type { TransactionWithRelations } from '@workspace/core/services/transaction/types';
import { useTransactionTableColumns } from './transaction-table-column';
import { TransactionTableEmpty } from './transaction-table-empty';
import { TransactionFilters } from './transaction-filters';
import type { Integration } from '@workspace/core/services/integration';

type TransactionDataGridProps = {
  data: TransactionWithRelations[];
  total: number;
  totalPages: number;
  isNoTransactions: boolean;
  filterOptions: {
    integrations?: Integration[];
  };
};

export function TransactionDataGrid({
  data,
  total,
  totalPages,
  isNoTransactions,
  filterOptions,
}: TransactionDataGridProps) {
  const columns = useTransactionTableColumns();
  const router = useRouter();

  // Sync URL params with nuqs for pagination
  const [paginationState, setPaginationState] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(20),
    },
    { shallow: false }
  );

  // Sync URL params with nuqs for sorting
  const [sortingState, setSortingState] = useQueryStates(
    {
      sort: parseAsStringLiteral([
        'amount',
        'status',
        'createdAt',
        'processedAt',
        'referenceId',
      ]).withDefault('createdAt'),
      sortOrder: parseAsStringLiteral(['asc', 'desc']).withDefault('desc'),
    },
    { shallow: false }
  );

  // Convert sorting state to TanStack Table format
  const sorting = useMemo(() => {
    return sortingState.sort
      ? [
          {
            id: sortingState.sort,
            desc: sortingState.sortOrder === 'desc',
          },
        ]
      : [];
  }, [sortingState.sort, sortingState.sortOrder]);

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex: paginationState.page - 1, // Convert 1-based to 0-based
        pageSize: paginationState.pageSize,
      },
      sorting,
      columnPinning: {
        right: ['actions'],
      },
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === 'function'
          ? updater({
              pageIndex: paginationState.page - 1,
              pageSize: paginationState.pageSize,
            })
          : updater;
      setPaginationState({
        page: newState.pageIndex + 1, // Convert back to 1-based
        pageSize: newState.pageSize,
      });
    },
    onSortingChange: (updater) => {
      const newState = typeof updater === 'function' ? updater(sorting) : updater;
      if (newState.length > 0 && newState[0]) {
        const sortId = newState[0].id;
        if (
          sortId &&
          ['amount', 'status', 'createdAt', 'processedAt', 'referenceId'].includes(sortId)
        ) {
          setSortingState({
            sort: sortId as 'amount' | 'status' | 'createdAt' | 'processedAt' | 'referenceId',
            sortOrder: newState[0].desc ? 'desc' : 'asc',
          });
        }
      } else {
        // Clear sorting - reset to default
        setSortingState({
          sort: 'createdAt',
          sortOrder: 'desc',
        });
      }
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = (row: TransactionWithRelations) => {
    router.push(`/transactions/${row.id}`);
  };

  // Determine empty message based on state
  const emptyMessage = (
    <TransactionTableEmpty type={isNoTransactions ? 'no-transactions' : 'no-results'} />
  );

  return (
    <>
      <DataGrid
        table={table}
        recordCount={total}
        onRowClick={handleRowClick}
        emptyMessage={emptyMessage}
        tableLayout={{
          columnsPinnable: true,
          columnsResizable: true,
        }}
      >
        <div className="w-full space-y-2.5">
          <DataGridContainer>
            <div className="p-5 border-b border-border">
              <TransactionFilters integrations={filterOptions.integrations || []} />
            </div>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DataGridContainer>
          <DataGridPagination />
        </div>
      </DataGrid>
    </>
  );
}
