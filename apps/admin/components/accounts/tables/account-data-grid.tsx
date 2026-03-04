'use client';

import { useMemo } from 'react';
import { useQueryStates, parseAsInteger, parseAsStringLiteral } from 'nuqs';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { DataGrid, DataGridContainer } from '@workspace/ui/components/data-grid';
import { DataGridTable } from '@workspace/ui/components/data-grid-table';
import { DataGridPagination } from '@workspace/ui/components/data-grid-pagination';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import { useAccountTableColumns } from './account-table-column';
import { AccountTableEmpty } from './account-table-empty';
import { AccountFilters } from './account-filters';
import { useRouter } from 'next/navigation';

type AdminAccount = {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string | null;
};

type AccountDataGridProps = {
  data: AdminAccount[];
  total: number;
  totalPages: number;
  isNoAccounts: boolean;
  lang: string;
};

export function AccountDataGrid({
  data,
  total,
  totalPages,
  isNoAccounts,
  lang,
}: AccountDataGridProps) {
  const columns = useAccountTableColumns(lang);
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
      sort: parseAsStringLiteral(['name', 'email', 'createdAt', 'status']).withDefault('createdAt'),
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
        if (sortId && ['name', 'email', 'createdAt', 'status'].includes(sortId)) {
          setSortingState({
            sort: sortId as 'name' | 'email' | 'createdAt' | 'status',
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

  const handleRowClick = (row: AdminAccount) => {
    router.push(`/${lang}/accounts/${row.id}`);
  };

  // Determine empty message based on state
  const emptyMessage = <AccountTableEmpty type={isNoAccounts ? 'no-accounts' : 'no-results'} />;

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
        data-testid="accounts-table"
      >
        <div className="w-full space-y-2.5">
          <DataGridContainer>
            <div className="p-5 border-b border-border" data-testid="accounts-filters-container">
              <AccountFilters />
            </div>
            <ScrollArea>
              <DataGridTable data-testid="accounts-table-body" />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DataGridContainer>
          <DataGridPagination data-testid="accounts-pagination" />
        </div>
      </DataGrid>
    </>
  );
}
