import type { ExportColumn } from '@/components/common-export/export-button';

/**
 * Stub: Excel export not implemented. Falls back to CSV download.
 * Add a library (e.g. xlsx) when needed.
 */
export async function exportToExcel(
  data: Record<string, string>[],
  columns: ExportColumn[],
  filename: string,
  _sheetName: string
): Promise<void> {
  const header = columns.map((c) => c.label).join(',');
  const rows = data.map((row) =>
    columns.map((col) => (row[col.key] ?? '').replace(/,/g, ' ')).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace(/\.xlsx$/, '.csv');
  a.click();
  URL.revokeObjectURL(url);
}
