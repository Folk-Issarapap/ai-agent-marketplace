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
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Eye, MoreHorizontal, Settings } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

type AdminAccount = {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string | null;
};

export function useAccountTableColumns(lang: string): ColumnDef<AdminAccount>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }: HeaderContext<AdminAccount, unknown>) => (
        <DataGridColumnHeader column={column} title="Name" pinnable={true} />
      ),
      enableSorting: true,
      meta: {
        cellClassName: 'truncate',
      },
      cell: ({ row }: CellContext<AdminAccount, unknown>) => {
        const name = row.getValue('name') as string | null;
        const email = row.original.email;
        const displayName = name || 'Unnamed Account';

        // Get initials for avatar fallback
        const initials = name
          ? name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : email
            ? email[0]?.toUpperCase()
            : '?';

        return (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Link
                href={`/${lang}/accounts/${row.original.id}`}
                className="font-medium hover:underline truncate block"
                title={displayName}
                onClick={(e) => e.stopPropagation()}
              >
                {displayName}
              </Link>
              {email && (
                <p className="text-sm text-muted-foreground truncate" title={email}>
                  {email}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }: HeaderContext<AdminAccount, unknown>) => (
        <DataGridColumnHeader column={column} title="Email" pinnable={true} />
      ),
      enableSorting: true,
      meta: {
        cellClassName: 'truncate',
      },
      cell: ({ row }: CellContext<AdminAccount, unknown>) => {
        const email = row.getValue('email') as string | null;
        const displayEmail = email || 'No email';
        return (
          <div className="text-sm truncate" title={displayEmail}>
            {displayEmail}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: () => <div>Status</div>,
      cell: ({ row }: CellContext<AdminAccount, unknown>) => {
        const status = row.original.status;
        return (
          <Badge
            variant={status === 'active' ? 'success' : 'destructive'}
            size="sm"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }: HeaderContext<AdminAccount, unknown>) => (
        <DataGridColumnHeader column={column} title="Created" pinnable={true} />
      ),
      enableSorting: true,
      cell: ({ row }: CellContext<AdminAccount, unknown>) => {
        const createdAt = row.getValue('createdAt') as string | null;
        if (!createdAt) return <div className="text-sm text-muted-foreground">-</div>;
        try {
          const date = new Date(createdAt);
          return (
            <div className="text-sm text-muted-foreground">
              {format(date, 'PPp')}
            </div>
          );
        } catch {
          return <div className="text-sm text-muted-foreground">-</div>;
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
      cell: ({ row }: CellContext<AdminAccount, unknown>) => {
        return <AccountTableActions account={row.original} lang={lang} />;
      },
    },
  ];
}

/**
 * Account table actions component
 */
function AccountTableActions({ account, lang }: { account: AdminAccount; lang: string }) {
  return (
    <div className="flex items-center justify-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Actions"
            data-testid={`account-actions-${account.id}`}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/${lang}/accounts/${account.id}`}
              data-testid={`account-view-action-${account.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="mr-2 h-4 w-4 text-muted-foreground/60" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/${lang}/accounts/${account.id}/settings`}
              data-testid={`account-settings-action-${account.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Settings className="mr-2 h-4 w-4 text-muted-foreground/60" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
