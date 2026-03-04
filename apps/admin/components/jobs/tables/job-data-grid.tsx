'use client';

import { useMemo } from 'react';
import { useQueryStates, parseAsInteger, parseAsStringLiteral } from 'nuqs';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { DataGrid, DataGridContainer } from '@workspace/ui/components/data-grid';
import { DataGridTable } from '@workspace/ui/components/data-grid-table';
import { DataGridPagination } from '@workspace/ui/components/data-grid-pagination';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import { useJobTableColumns } from './job-table-column';
import { JobTableEmpty } from './job-table-empty';
import { JobFilters } from './job-filters';
import { useRouter } from 'next/navigation';

type AdminJob = {
  id: string;
  humanId: string;
  agentId: string | null;
  title: string;
  goal: string;
  task: string;
  budget: string;
  status: string;
  createdAt: string;
};

type JobDataGridProps = {
  data: AdminJob[];
  total: number;
  totalPages: number;
  isNoJobs: boolean;
  lang: string;
};

export function JobDataGrid({
  data,
  total,
  totalPages,
  isNoJobs,
  lang,
}: JobDataGridProps) {
  const columns = useJobTableColumns(lang);
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
      sort: parseAsStringLiteral(['title', 'status', 'budget', 'createdAt']).withDefault('createdAt'),
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
        if (sortId && ['title', 'status', 'budget', 'createdAt'].includes(sortId)) {
          setSortingState({
            sort: sortId as 'title' | 'status' | 'budget' | 'createdAt',
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
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
  });

  const handleRowClick = (row: AdminJob) => {
    router.push(`/${lang}/jobs/${row.id}`);
  };

  // Determine empty message based on state
  const emptyMessage = <JobTableEmpty type={isNoJobs ? 'no-jobs' : 'no-results'} />;

  return (
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
            <JobFilters />
          </div>
          {isNoJobs ? (
            <div className="p-5">
              {emptyMessage}
            </div>
          ) : (
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </DataGridContainer>
        {!isNoJobs && (
          <DataGridPagination />
        )}
      </div>
    </DataGrid>
  );
}
