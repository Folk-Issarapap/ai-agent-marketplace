'use client';

import { useMemo, useState, useTransition } from 'react';
import { useQueryStates, parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table';
import { DataGrid, DataGridContainer } from '@workspace/ui/components/data-grid';
import { DataGridTable } from '@workspace/ui/components/data-grid-table';
import { DataGridPagination } from '@workspace/ui/components/data-grid-pagination';
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import type { AdminSkillCategory } from '@/actions/skills';
import { useSkillCategoryTableColumns } from './skill-category-table-column';
import { SkillCategoryTableEmpty } from './skill-category-table-empty';
import { SkillCategoryFilters } from './skill-category-filters';
import { deleteSkillCategory } from '@/actions/skills';
import { toast } from 'sonner';
import { SkillCategoryEditSheet } from '../sheets/skill-category-edit-sheet';

type SkillCategoryDataGridProps = {
  data: AdminSkillCategory[];
  lang: string;
};

export function SkillCategoryDataGrid({ data, lang }: SkillCategoryDataGridProps) {
  const [categories, setCategories] = useState<AdminSkillCategory[]>(data);
  const [isPending, startTransition] = useTransition();
  const [editingCategory, setEditingCategory] = useState<AdminSkillCategory | null>(null);
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
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories.filter((category) => {
      const statusPass = statusFilter === 'all' || category.status === statusFilter;
      if (!statusPass) return false;
      if (!query) return true;
      const haystack = `${category.name} ${category.displayName} ${category.description || ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [categories, search, statusFilter]);

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
      sort: parseAsStringLiteral(['name', 'displayName', 'description', 'status', 'createdAt']).withDefault('displayName'),
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

  const handleEdit = (category: AdminSkillCategory) => {
    setEditingCategory(category);
    setIsEditSheetOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    if (!window.confirm('Delete this category?')) return;
    startTransition(async () => {
      const result = await deleteSkillCategory(categoryId, lang);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setCategories((prev) => prev.filter((category) => category.id !== categoryId));
      toast.success(result.message);
    });
  };

  const handleCategoryUpdated = (updatedCategory: AdminSkillCategory) => {
    setCategories((prev) =>
      prev.map((category) => (category.id === updatedCategory.id ? updatedCategory : category))
    );
    setIsEditSheetOpen(false);
    setEditingCategory(null);
  };

  const columns = useSkillCategoryTableColumns(handleEdit, handleDelete, isPending);

  // Create table instance
  const table = useReactTable({
    data: filteredCategories,
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
          ['name', 'displayName', 'description', 'status', 'createdAt'].includes(sortId)
        ) {
          setSortingState({
            sort: sortId as 'name' | 'displayName' | 'description' | 'status' | 'createdAt',
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
  const total = filteredCategories.length;
  const totalPages = Math.ceil(total / paginationState.pageSize);
  const isNoCategories = total === 0 && paginationState.page === 1 && !search && statusFilter === 'all';

  // Determine empty message based on state
  const emptyMessage = <SkillCategoryTableEmpty type={isNoCategories ? 'no-categories' : 'no-results'} />;

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
              <SkillCategoryFilters />
            </div>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DataGridContainer>
          {filteredCategories.length > 0 && <DataGridPagination />}
        </div>
      </DataGrid>

      {editingCategory && (
        <SkillCategoryEditSheet
          category={editingCategory}
          lang={lang}
          open={isEditSheetOpen}
          onOpenChange={(open) => {
            setIsEditSheetOpen(open);
            if (!open) {
              setEditingCategory(null);
            }
          }}
          onSuccess={handleCategoryUpdated}
        />
      )}
    </>
  );
}
