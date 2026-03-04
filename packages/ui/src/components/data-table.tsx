'use client';

import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import { useState } from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pinColumns?: {
    left?: string[];
    right?: string[];
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pinColumns,
}: DataTableProps<TData, TValue>) {
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
      columnPinning: {
        left: pinColumns?.left || [],
        right: pinColumns?.right || [],
      },
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onExpandedChange: setExpanded,
    getSubRows: (row) => (row as unknown as { children?: TData[] }).children,
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isFirstColumn = header.column.id === table.getVisibleFlatColumns()[0]?.id;
                const isLastColumn =
                  header.column.id ===
                  table.getVisibleFlatColumns()[table.getVisibleFlatColumns().length - 1]?.id;
                let headerMetaClassName = (
                  header.column.columnDef.meta as { className?: string } | undefined
                )?.className;

                // Remove any pr-* classes from last column to ensure pr-0 takes precedence
                if (isLastColumn && headerMetaClassName) {
                  headerMetaClassName = headerMetaClassName.replace(/\bpr-\d+\b/g, '');
                }

                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      headerMetaClassName,
                      isFirstColumn && 'pl-6',
                      // Use !important to override any pr-* classes from column definitions
                      isLastColumn && '!pr-0'
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => {
                  const isFirstCell = cell.column.id === row.getVisibleCells()[0]?.column.id;
                  const isLastCell =
                    cell.column.id ===
                    row.getVisibleCells()[row.getVisibleCells().length - 1]?.column.id;
                  const isPinned = pinColumns?.right?.includes(cell.column.id);
                  let columnMetaClassName = (
                    cell.column.columnDef.meta as { className?: string } | undefined
                  )?.className;

                  // Remove any pr-* classes from last cell to ensure pr-0 takes precedence
                  if (isLastCell && columnMetaClassName) {
                    columnMetaClassName = columnMetaClassName.replace(/\bpr-\d+\b/g, '');
                  }

                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        columnMetaClassName,
                        isPinned && 'sticky right-0 bg-background/90 z-10',
                        isPinned && 'border-l',
                        isFirstCell && 'pl-6',
                        // Use !important to override any pr-* classes from column definitions
                        isLastCell && '!pr-0'
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
