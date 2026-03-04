'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@workspace/ui/components/dropdown-menu';
import { Download } from 'lucide-react';

export type ExportColumn = { key: string; label: string };
export type ExportFormat = 'csv' | 'xlsx';

type ExportButtonProps = {
  columns: ExportColumn[];
  onExport: (format: ExportFormat, selectedColumns: string[]) => Promise<void>;
  defaultColumns?: string[];
};

export function ExportButton({
  columns,
  onExport,
  defaultColumns = columns.map((c) => c.key),
}: ExportButtonProps) {
  const [selected, setSelected] = useState<string[]>(defaultColumns);
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setLoading(true);
    try {
      await onExport(format, selected);
    } finally {
      setLoading(false);
    }
  };

  const toggleColumn = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          {loading ? 'Exporting…' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {columns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.key}
            checked={selected.includes(col.key)}
            onCheckedChange={() => toggleColumn(col.key)}
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('xlsx')}>
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
