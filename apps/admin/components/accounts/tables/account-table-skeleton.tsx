'use client';

import { useMemo } from 'react';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { DataGrid, DataGridContainer } from '@workspace/ui/components/data-grid';
import { DataGridTable } from '@workspace/ui/components/data-grid-table';
import { DataGridPagination } from '@workspace/ui/components/data-grid-pagination';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import { AccountFilters } from './account-filters';
import { useAccountTableColumns } from './account-table-column';

export function AccountTableSkeleton() {
  const columns = useAccountTableColumns('en');

  // Create a minimal table instance with empty data for skeleton
  const table = useReactTable({
    data: useMemo(() => [], []),
    columns,
    state: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
      columnPinning: {
        right: ['actions'],
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
        columnsResizable: true,
      }}
    >
      <div className="w-full space-y-2.5">
        <DataGridContainer>
          <div className="p-5 border-b border-border">
            <AccountFilters />
          </div>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
