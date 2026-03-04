'use client';

type DateTimeProps = {
  date: string | Date | null | undefined;
  format?: Intl.DateTimeFormatOptions;
};

export function DateTime({ date, format }: DateTimeProps) {
  if (date == null) return <span>—</span>;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return <span>—</span>;
  const opts = format ?? {
    dateStyle: 'medium',
    timeStyle: 'short',
  };
  return <span>{new Intl.DateTimeFormat(undefined, opts).format(d)}</span>;
}
