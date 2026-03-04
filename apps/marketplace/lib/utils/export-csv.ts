import type { ExportColumn } from '@/components/common-export/export-button';

export function convertToCSV(
  data: Record<string, string>[],
  columns: ExportColumn[]
): string {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(',');
  const rows = data.map((row) =>
    columns.map((col) => escapeCsvCell(row[col.key] ?? '')).join(',')
  );
  return [header, ...rows].join('\n');
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
