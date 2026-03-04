import { Column } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  sortKey?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  sortKey,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [sort, setSort] = useQueryState('sort', parseAsString.withOptions({ shallow: false }));
  const [sortOrder, setSortOrder] = useQueryState(
    'sortOrder',
    parseAsStringLiteral(['asc', 'desc']).withOptions({ shallow: false })
  );

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const columnSortKey = sortKey || column.id;
  const isCurrentSort = sort === columnSortKey;
  const currentOrder = isCurrentSort ? sortOrder : null;

  const handleSort = (order: 'asc' | 'desc') => {
    setSort(columnSortKey);
    setSortOrder(order);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="data-[state=open]:bg-accent -ml-3 h-8">
            <span>{title}</span>
            {currentOrder === 'desc' ? (
              <ArrowDown />
            ) : currentOrder === 'asc' ? (
              <ArrowUp />
            ) : (
              <ChevronsUpDown />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleSort('asc')}>
            <ArrowUp />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort('desc')}>
            <ArrowDown />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
