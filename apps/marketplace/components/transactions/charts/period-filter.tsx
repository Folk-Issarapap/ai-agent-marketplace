'use client';

import { useQueryStates, parseAsString } from 'nuqs';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';

type PeriodFilterProps = {
  fromKey: string;
  toKey: string;
  placeholder?: string;
};

/**
 * Minimal period (date range) filter that syncs startDate/endDate with URL via nuqs.
 */
export function PeriodFilter({ fromKey, toKey, placeholder }: PeriodFilterProps) {
  const [state, setState] = useQueryStates(
    {
      startDate: parseAsString.withDefault(''),
      endDate: parseAsString.withDefault(''),
    },
    { shallow: false }
  );

  const fromValue = state.startDate;
  const toValue = state.endDate;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={`${fromKey}-input`} className="text-xs text-muted-foreground sr-only">
          From
        </Label>
        <Input
          id={`${fromKey}-input`}
          type="date"
          value={fromValue}
          onChange={(e) => setState({ startDate: e.target.value || '' })}
          className="h-8 w-[140px]"
        />
      </div>
      <span className="text-muted-foreground text-sm">–</span>
      <div className="flex items-center gap-1.5">
        <Label htmlFor={`${toKey}-input`} className="text-xs text-muted-foreground sr-only">
          To
        </Label>
        <Input
          id={`${toKey}-input`}
          type="date"
          value={toValue}
          onChange={(e) => setState({ endDate: e.target.value || '' })}
          className="h-8 w-[140px]"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
