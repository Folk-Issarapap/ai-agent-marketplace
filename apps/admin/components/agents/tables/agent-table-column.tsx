'use client';

import type { ColumnDef, HeaderContext, CellContext } from '@tanstack/react-table';
import type { AdminAgent } from '@/actions/agents';
import { DataGridColumnHeader } from '@workspace/ui/components/data-grid-column-header';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const statusColors: Record<string, "primary" | "secondary" | "destructive" | "outline" | "success"> = {
  pending: "outline",
  active: "success",
  suspended: "secondary",
  banned: "destructive",
};

export function useAgentTableColumns(
  lang: string,
  onEdit: (agent: AdminAgent) => void,
  onDelete: (agentId: string) => void,
  isPending: boolean
): ColumnDef<AdminAgent>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }: HeaderContext<AdminAgent, unknown>) => (
        <DataGridColumnHeader column={column} title="Name" pinnable={true} />
      ),
      enableSorting: true,
      meta: {
        cellClassName: 'truncate',
      },
      cell: ({ row }: CellContext<AdminAgent, unknown>) => {
        const name = row.getValue('name') as string;
        const description = row.original.description;
        const truncatedDescription = description && description.length > 60 
          ? description.substring(0, 60) + '...' 
          : description;

        return (
          <div className="min-w-0 flex-1">
            <Link
              href={`/${lang}/agents/${row.original.id}`}
              className="font-medium hover:underline truncate block"
              title={name}
              onClick={(e) => e.stopPropagation()}
            >
              {name}
            </Link>
            {truncatedDescription && (
              <p className="text-sm text-muted-foreground truncate" title={description || ''}>
                {truncatedDescription}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }: HeaderContext<AdminAgent, unknown>) => (
        <DataGridColumnHeader column={column} title="Status" pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<AdminAgent, unknown>) => {
        const status = row.getValue('status') as string;
        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        return (
          <Badge variant={statusColors[status] || "outline"}>
            {formattedStatus}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'rating',
      header: ({ column }: HeaderContext<AdminAgent, unknown>) => (
        <DataGridColumnHeader column={column} title="Rating" pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<AdminAgent, unknown>) => {
        const rating = row.original.rating;
        if (!rating || parseFloat(rating) === 0) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
        return (
          <span className="font-medium">
            {parseFloat(rating).toFixed(1)} ⭐
          </span>
        );
      },
    },
    {
      accessorKey: 'totalJobs',
      header: ({ column }: HeaderContext<AdminAgent, unknown>) => (
        <DataGridColumnHeader column={column} title="Jobs" pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<AdminAgent, unknown>) => {
        const totalJobs = row.original.totalJobs || 0;
        const completedJobs = row.original.completedJobs || 0;
        return (
          <div className="text-sm">
            <span className="font-medium">{completedJobs}</span>
            <span className="text-muted-foreground"> / {totalJobs}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }: HeaderContext<AdminAgent, unknown>) => (
        <DataGridColumnHeader column={column} title="Price" pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<AdminAgent, unknown>) => {
        const price = row.original.price;
        const pricingModel = row.original.pricingModel;
        if (!price) return <span className="text-sm text-muted-foreground">-</span>;
        
        const formattedPrice = parseFloat(price).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        
        const modelLabel = pricingModel === 'hourly' ? '/hr' : pricingModel === 'subscription' ? '/mo' : '';
        
        return (
          <span className="font-medium">
            ${formattedPrice}{modelLabel}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }: HeaderContext<AdminAgent, unknown>) => (
        <DataGridColumnHeader column={column} title="Created" pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<AdminAgent, unknown>) => {
        const createdAt = row.getValue('createdAt') as string | null;
        if (!createdAt) return <span className="text-sm text-muted-foreground">-</span>;
        try {
          return (
            <span className="text-sm text-muted-foreground">
              {format(new Date(createdAt), "MMM d, yyyy")}
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
      cell: ({ row }: CellContext<AdminAgent, unknown>) => {
        return (
          <AgentTableActions
            agent={row.original}
            lang={lang}
            isPending={isPending}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original.id)}
          />
        );
      },
    },
  ];
}

function AgentTableActions({
  agent,
  lang,
  isPending,
  onEdit,
  onDelete,
}: {
  agent: AdminAgent;
  lang: string;
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
            data-testid={`agent-actions-${agent.id}`}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/${lang}/agents/${agent.id}`}
              data-testid={`agent-view-action-${agent.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="mr-2 h-4 w-4 text-muted-foreground/60" />
              View
            </Link>
          </DropdownMenuItem>
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
