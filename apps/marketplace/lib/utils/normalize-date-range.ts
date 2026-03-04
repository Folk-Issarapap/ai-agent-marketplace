/**
 * Normalize optional date strings into start/end Date or null.
 * Invalid or empty strings become null.
 */
export function normalizeDateRange(
  dateFrom?: string,
  dateTo?: string
): { startDate: Date | null; endDate: Date | null } {
  const start = dateFrom?.trim() ? new Date(dateFrom) : null;
  const end = dateTo?.trim() ? new Date(dateTo) : null;
  const startValid = start && !Number.isNaN(start.getTime());
  const endValid = end && !Number.isNaN(end.getTime());
  let startDate = startValid ? start : null;
  let endDate = endValid ? end : null;
  if (startDate && endDate && startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
  }
  return { startDate, endDate };
}
