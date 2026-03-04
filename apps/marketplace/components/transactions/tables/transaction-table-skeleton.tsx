'use client';

import { useMemo } from 'react';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { DataGrid, DataGridContainer } from '@workspace/ui/components/data-grid';
import { DataGridTable } from '@workspace/ui/components/data-grid-table';
import { DataGridPagination } from '@workspace/ui/components/data-grid-pagination';
import { useTransactionTableColumns } from './transaction-table-column';
import { TransactionFilters } from './transaction-filters';

export function TransactionTableSkeleton() {
  const columns = useTransactionTableColumns();

  // Create a minimal table instance with empty data for skeleton
  // Use fewer rows (5) for skeleton to avoid dense appearance when table is empty
  const table = useReactTable({
    data: useMemo(() => [], []),
    columns,
    state: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
    manualPagination: true,
    pageCount: 0,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={0}
      isLoading={true}
      loadingMode="skeleton"
      tableLayout={{
        columnsPinnable: true,
        rowBorder: true,
        headerBackground: true,
        headerBorder: true,
        width: 'fixed',
      }}
    >
      <div className="w-full space-y-2.5">
        <DataGridContainer>
          <div className="p-5 border-b border-border">
            <TransactionFilters />
          </div>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
