'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';
import { parseAsString, useQueryState } from 'nuqs';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFilterProps {
  options: SelectOption[];
  placeholder?: string;
  name: string;
  /** Optional label for accessibility */
  label?: string;
  /** Optional className for the select element */
  className?: string;
}

export const SelectFilter = ({
  options,
  placeholder = 'Select...',
  name,
  label,
  className,
}: SelectFilterProps) => {
  const [value, setValue] = useQueryState(name, parseAsString.withOptions({ shallow: false }));

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Select
        value={value ?? ''}
        onValueChange={(newValue) => setValue(newValue || null, { shallow: false })}
      >
        <SelectTrigger
          className={cn('w-full', className)}
          aria-label={label || `Filter by ${name}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
