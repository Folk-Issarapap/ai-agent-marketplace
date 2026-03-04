'use client';

import { useMemo, useState, useTransition } from 'react';
import { useQueryStates, parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table';
import { DataGrid, DataGridContainer } from '@workspace/ui/components/data-grid';
import { DataGridTable } from '@workspace/ui/components/data-grid-table';
import { DataGridPagination } from '@workspace/ui/components/data-grid-pagination';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import type { AdminSkill, AdminSkillCategory } from '@/actions/skills';
import { useSkillTableColumns } from './skill-table-column';
import { SkillTableEmpty } from './skill-table-empty';
import { SkillFilters } from './skill-filters';
import { deleteSkill } from '@/actions/skills';
import { toast } from 'sonner';
import { SkillEditSheet } from '../sheets/skill-edit-sheet';

type SkillDataGridProps = {
  data: AdminSkill[];
  categories: AdminSkillCategory[];
  lang: string;
};

export function SkillDataGrid({ data, categories, lang }: SkillDataGridProps) {
  const [skills, setSkills] = useState<AdminSkill[]>(data);
  const [isPending, startTransition] = useTransition();
  const [editingSkill, setEditingSkill] = useState<AdminSkill | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Sync URL params with nuqs for filters
  const [filterParams] = useQueryStates(
    {
      search: parseAsString.withDefault(''),
      status: parseAsStringLiteral(['all', 'active', 'inactive']).withDefault('all'),
    },
    { shallow: false }
  );

  const search = filterParams.search || '';
  const statusFilter = filterParams.status || 'all';

  // Client-side filtering
  const filteredSkills = useMemo(() => {
    const query = search.trim().toLowerCase();
    return skills.filter((skill) => {
      const statusPass = statusFilter === 'all' || skill.status === statusFilter;
      if (!statusPass) return false;
      if (!query) return true;
      const haystack = `${skill.name} ${skill.displayName} ${skill.category} ${skill.description || ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [skills, search, statusFilter]);

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
      sort: parseAsStringLiteral(['name', 'displayName', 'category', 'description', 'status', 'createdAt']).withDefault('displayName'),
      sortOrder: parseAsStringLiteral(['asc', 'desc']).withDefault('asc'),
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

  const handleEdit = (skill: AdminSkill) => {
    setEditingSkill(skill);
    setIsEditSheetOpen(true);
  };

  const handleDelete = (skillId: string) => {
    if (!window.confirm('Delete this skill?')) return;
    startTransition(async () => {
      const result = await deleteSkill(skillId, lang);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setSkills((prev) => prev.filter((skill) => skill.id !== skillId));
      toast.success(result.message);
    });
  };

  const handleSkillUpdated = (updatedSkill: AdminSkill) => {
    setSkills((prev) =>
      prev.map((skill) => (skill.id === updatedSkill.id ? updatedSkill : skill))
    );
    setIsEditSheetOpen(false);
    setEditingSkill(null);
  };

  const columns = useSkillTableColumns(handleEdit, handleDelete, isPending);

  // Create table instance
  const table = useReactTable({
    data: filteredSkills,
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
          ['name', 'displayName', 'category', 'description', 'status', 'createdAt'].includes(sortId)
        ) {
          setSortingState({
            sort: sortId as 'name' | 'displayName' | 'category' | 'description' | 'status' | 'createdAt',
            sortOrder: newState[0].desc ? 'desc' : 'asc',
          });
        }
      } else {
        // Clear sorting - reset to default
        setSortingState({
          sort: 'displayName',
          sortOrder: 'asc',
        });
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Calculate pagination
  const total = filteredSkills.length;
  const totalPages = Math.ceil(total / paginationState.pageSize);
  const isNoSkills = total === 0 && paginationState.page === 1 && !search && statusFilter === 'all';

  // Determine empty message based on state
  const emptyMessage = <SkillTableEmpty type={isNoSkills ? 'no-skills' : 'no-results'} />;

  return (
    <>
      <DataGrid
        table={table}
        recordCount={total}
        emptyMessage={emptyMessage}
        tableLayout={{
          columnsPinnable: true,
          columnsResizable: true,
        }}
      >
        <div className="w-full space-y-2.5">
          <DataGridContainer>
            <div className="p-5 border-b border-border">
              <SkillFilters />
            </div>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DataGridContainer>
          {filteredSkills.length > 0 && <DataGridPagination />}
        </div>
      </DataGrid>

      {editingSkill && (
        <SkillEditSheet
          skill={editingSkill}
          categories={categories}
          lang={lang}
          open={isEditSheetOpen}
          onOpenChange={(open) => {
            setIsEditSheetOpen(open);
            if (!open) {
              setEditingSkill(null);
            }
          }}
          onSuccess={handleSkillUpdated}
        />
      )}
    </>
  );
}
