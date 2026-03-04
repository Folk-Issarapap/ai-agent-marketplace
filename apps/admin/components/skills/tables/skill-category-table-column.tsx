'use client';

import type { ColumnDef, HeaderContext, CellContext } from '@tanstack/react-table';
import type { AdminSkillCategory } from '@/actions/skills';
import { DataGridColumnHeader } from '@workspace/ui/components/data-grid-column-header';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

export function useSkillCategoryTableColumns(
  onEdit: (category: AdminSkillCategory) => void,
  onDelete: (categoryId: string) => void,
  isPending: boolean
): ColumnDef<AdminSkillCategory>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }: HeaderContext<AdminSkillCategory, unknown>) => (
        <DataGridColumnHeader column={column} title="Name" pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<AdminSkillCategory, unknown>) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'displayName',
      header: ({ column }: HeaderContext<AdminSkillCategory, unknown>) => (
        <DataGridColumnHeader column={column} title="Display Name" pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<AdminSkillCategory, unknown>) => row.original.displayName,
    },
    {
      accessorKey: 'description',
      header: ({ column }: HeaderContext<AdminSkillCategory, unknown>) => (
        <DataGridColumnHeader column={column} title="Description" pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<AdminSkillCategory, unknown>) => row.original.description || '-',
    },
    {
      accessorKey: 'status',
      header: ({ column }: HeaderContext<AdminSkillCategory, unknown>) => (
        <DataGridColumnHeader column={column} title="Status" pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<AdminSkillCategory, unknown>) => (
        <Badge variant={row.original.status === 'active' ? 'success' : 'secondary'} size="sm">
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => null,
      size: 70,
      minSize: 70,
      maxSize: 70,
      enableSorting: false,
      enablePinning: true,
      cell: ({ row }: CellContext<AdminSkillCategory, unknown>) => (
        <SkillCategoryTableActions
          category={row.original}
          isPending={isPending}
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original.id)}
        />
      ),
    },
  ];
}

function SkillCategoryTableActions({
  category,
  isPending,
  onEdit,
  onDelete,
}: {
  category: AdminSkillCategory;
  isPending: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Actions"
            data-testid={`skill-category-actions-${category.id}`}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            disabled={isPending}
          >
            <Pencil className="mr-2 h-4 w-4 text-muted-foreground/60" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isPending}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4 text-destructive/80" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
