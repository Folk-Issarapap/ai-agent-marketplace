'use client';

import { useMemo } from 'react';
import { useQueryStates, parseAsInteger, parseAsStringLiteral } from 'nuqs';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { DataGrid, DataGridContainer } from '@workspace/ui/components/data-grid';
import { DataGridTable } from '@workspace/ui/components/data-grid-table';
import { DataGridPagination } from '@workspace/ui/components/data-grid-pagination';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import type { AdminAgent } from '@/actions/agents';
import { useAgentTableColumns } from './agent-table-column';
import { AgentTableEmpty } from './agent-table-empty';
import { AgentFilters } from './agent-filters';
import { useRouter } from 'next/navigation';
import { deleteAgent } from '@/actions/agents';
import { toast } from 'sonner';
import { useTransition, useState } from 'react';
import { AgentEditSheet } from '../sheets/agent-edit-sheet';

type AgentDataGridProps = {
  data: AdminAgent[];
  total: number;
  totalPages: number;
  isNoAgents: boolean;
  lang: string;
};

export function AgentDataGrid({
  data,
  total,
  totalPages,
  isNoAgents,
  lang,
}: AgentDataGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingAgent, setEditingAgent] = useState<AdminAgent | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const handleEdit = (agent: AdminAgent) => {
    setEditingAgent(agent);
    setIsEditSheetOpen(true);
  };

  const handleDelete = (agentId: string) => {
    if (!window.confirm('Delete this agent?')) return;
    startTransition(async () => {
      const result = await deleteAgent(agentId, lang);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  };

  const columns = useAgentTableColumns(lang, handleEdit, handleDelete, isPending);

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
      sort: parseAsStringLiteral(['name', 'status', 'rating', 'totalJobs', 'createdAt']).withDefault('createdAt'),
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
          ['name', 'status', 'rating', 'totalJobs', 'createdAt'].includes(sortId)
        ) {
          setSortingState({
            sort: sortId as 'name' | 'status' | 'rating' | 'totalJobs' | 'createdAt',
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

  const handleRowClick = (row: AdminAgent) => {
    router.push(`/${lang}/agents/${row.id}`);
  };

  const handleAgentUpdated = () => {
    setIsEditSheetOpen(false);
    setEditingAgent(null);
    router.refresh();
  };

  // Determine empty message based on state
  const emptyMessage = <AgentTableEmpty type={isNoAgents ? 'no-agents' : 'no-results'} />;

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
              <AgentFilters />
            </div>
            {isNoAgents ? (
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
          {!isNoAgents && <DataGridPagination />}
        </div>
      </DataGrid>

      {editingAgent && (
        <AgentEditSheet
          agent={editingAgent}
          lang={lang}
          open={isEditSheetOpen}
          onOpenChange={(open) => {
            setIsEditSheetOpen(open);
            if (!open) {
              setEditingAgent(null);
            }
          }}
          onSuccess={handleAgentUpdated}
        />
      )}
    </>
  );
}
