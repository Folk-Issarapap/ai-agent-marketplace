'use client';

import type { ColumnDef, HeaderContext, CellContext } from '@tanstack/react-table';
import { DataGridColumnHeader } from '@workspace/ui/components/data-grid-column-header';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Eye, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

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

const statusColors: Record<string, "primary" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  published: "primary",
  matching: "primary",
  pending_confirmation: "primary",
  active: "primary",
  in_review: "primary",
  completed: "secondary",
  cancelled: "destructive",
  rejected: "destructive",
};

export function useJobTableColumns(lang: string): ColumnDef<AdminJob>[] {
  return [
    {
      accessorKey: 'title',
      header: ({ column }: HeaderContext<AdminJob, unknown>) => (
        <DataGridColumnHeader column={column} title="Title" pinnable={true} />
      ),
      enableSorting: true,
      meta: {
        cellClassName: 'truncate',
      },
      cell: ({ row }: CellContext<AdminJob, unknown>) => {
        const title = row.getValue('title') as string;
        const goal = row.original.goal;
        const truncatedGoal = goal.length > 60 ? goal.substring(0, 60) + '...' : goal;

        return (
          <div className="min-w-0 flex-1">
            <Link
              href={`/${lang}/jobs/${row.original.id}`}
              className="font-medium hover:underline truncate block"
              title={title}
              onClick={(e) => e.stopPropagation()}
            >
              {title}
            </Link>
            <p className="text-sm text-muted-foreground truncate" title={goal}>
              {truncatedGoal}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }: HeaderContext<AdminJob, unknown>) => (
        <DataGridColumnHeader column={column} title="Status" pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<AdminJob, unknown>) => {
        const status = row.getValue('status') as string;
        const formattedStatus = status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        
        return (
          <Badge variant={statusColors[status] || "outline"}>
            {formattedStatus}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'budget',
      header: ({ column }: HeaderContext<AdminJob, unknown>) => (
        <DataGridColumnHeader column={column} title="Budget" pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<AdminJob, unknown>) => {
        const budget = parseFloat(row.getValue('budget') as string);
        return (
          <span className="font-medium">
            ${budget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }: HeaderContext<AdminJob, unknown>) => (
        <DataGridColumnHeader column={column} title="Created" pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<AdminJob, unknown>) => {
        const date = row.getValue('createdAt') as string;
        try {
          return (
            <span className="text-sm text-muted-foreground">
              {format(new Date(date), "MMM d, yyyy")}
            </span>
          );
        } catch {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
      },
    },
    {
      id: 'actions',
      header: () => null,
      size: 70,
      minSize: 70,
      maxSize: 70,
      enablePinning: true,
      enableSorting: false,
      cell: ({ row }: CellContext<AdminJob, unknown>) => {
        return <JobTableActions job={row.original} lang={lang} />;
      },
    },
  ];
}

function JobTableActions({ job, lang }: { job: AdminJob; lang: string }) {
  return (
    <div className="flex items-center justify-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Actions"
            data-testid={`job-actions-${job.id}`}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/${lang}/jobs/${job.id}`}
              data-testid={`job-view-action-${job.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="mr-2 h-4 w-4 text-muted-foreground/60" />
              View
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
