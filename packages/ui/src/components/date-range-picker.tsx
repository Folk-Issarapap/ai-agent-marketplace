'use client';

import { useEffect, useState, useMemo } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import {
  endOfMonth,
  endOfYear,
  format,
  isEqual,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import type { Locale } from 'react-day-picker';
import { enUS, th as thDateFns } from 'date-fns/locale';
import { enUS as enUSDayPicker, th as thDayPicker } from 'react-day-picker/locale';

export type { DateRange };

// Map locale codes to react-day-picker locales
const getDayPickerLocale = (localeCode: string): Locale => {
  switch (localeCode) {
    case 'th':
      return thDayPicker;
    case 'en':
    default:
      return enUSDayPicker;
  }
};

// Map locale codes to date-fns locales for formatting
const getDateFnsLocale = (localeCode: string) => {
  switch (localeCode) {
    case 'th':
      return thDateFns;
    case 'en':
    default:
      return enUS;
  }
};

export interface DateRangePickerPreset {
  label: string;
  range: { from: Date; to: Date };
}

export interface DateRangePickerMessages {
  placeholder?: string;
  reset?: string;
  apply?: string;
  presets?: {
    today?: string;
    yesterday?: string;
    last7Days?: string;
    last30Days?: string;
    monthToDate?: string;
    lastMonth?: string;
    yearToDate?: string;
    lastYear?: string;
  };
}

const defaultMessages: Required<DateRangePickerMessages> = {
  placeholder: 'Pick a date range',
  reset: 'Reset',
  apply: 'Apply',
  presets: {
    today: 'Today',
    yesterday: 'Yesterday',
    last7Days: 'Last 7 days',
    last30Days: 'Last 30 days',
    monthToDate: 'Month to date',
    lastMonth: 'Last month',
    yearToDate: 'Year to date',
    lastYear: 'Last year',
  },
};

export interface DateRangePickerProps {
  value?: DateRange | undefined;
  onChange?: (range: DateRange | undefined) => void;
  presets?: DateRangePickerPreset[];
  defaultPreset?: DateRangePickerPreset;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  align?: 'start' | 'center' | 'end';
  numberOfMonths?: number;
  messages?: Partial<DateRangePickerMessages>;
  locale?: string; // Locale code (e.g., 'en', 'th')
  calendarLocale?: Locale; // react-day-picker Locale object
}

const createDefaultPresets = (
  messages: Required<Required<DateRangePickerMessages>['presets']>
): DateRangePickerPreset[] => [
  { label: messages.today, range: { from: new Date(), to: new Date() } },
  {
    label: messages.yesterday,
    range: { from: subDays(new Date(), 1), to: subDays(new Date(), 1) },
  },
  { label: messages.last7Days, range: { from: subDays(new Date(), 6), to: new Date() } },
  { label: messages.last30Days, range: { from: subDays(new Date(), 29), to: new Date() } },
  {
    label: messages.monthToDate,
    range: { from: startOfMonth(new Date()), to: new Date() },
  },
  {
    label: messages.lastMonth,
    range: {
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    },
  },
  {
    label: messages.yearToDate,
    range: { from: startOfYear(new Date()), to: new Date() },
  },
  {
    label: messages.lastYear,
    range: {
      from: startOfYear(subYears(new Date(), 1)),
      to: endOfYear(subYears(new Date(), 1)),
    },
  },
];

export function DateRangePicker({
  value,
  onChange,
  presets,
  defaultPreset,
  placeholder,
  disabled = false,
  className,
  align = 'center',
  numberOfMonths = 2,
  messages,
  locale: localeCode = 'en',
  calendarLocale,
}: DateRangePickerProps) {
  const mergedMessages = useMemo(() => {
    const merged: Required<DateRangePickerMessages> = {
      ...defaultMessages,
      ...messages,
      presets: {
        ...defaultMessages.presets,
        ...messages?.presets,
      },
    };
    return merged;
  }, [messages]);

  const defaultPresets = useMemo(
    () =>
      createDefaultPresets(
        mergedMessages.presets as Required<Required<DateRangePickerMessages>['presets']>
      ),
    [mergedMessages.presets]
  );

  const finalPresets = presets || defaultPresets;
  const finalPlaceholder = placeholder || mergedMessages.placeholder;
  const dateFnsLocale = getDateFnsLocale(localeCode);
  const dayPickerLocale = calendarLocale || getDayPickerLocale(localeCode);

  const today = new Date();
  const initialPreset = defaultPreset || finalPresets[2] || finalPresets[0]; // Default: Last 7 days, fallback to first preset
  const [month, setMonth] = useState(today);
  const [date, setDate] = useState<DateRange | undefined>(value || initialPreset?.range);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(initialPreset?.label || null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Sync external value changes
  useEffect(() => {
    if (value !== undefined) {
      setDate(value);
    }
  }, [value]);

  const handleApply = () => {
    if (date) {
      onChange?.(date);
    }
    setIsPopoverOpen(false);
  };

  const handleReset = () => {
    if (!initialPreset) return;
    const resetRange = initialPreset.range;
    setDate(resetRange);
    setSelectedPreset(initialPreset.label);
    onChange?.(resetRange);
    setIsPopoverOpen(false);
  };

  const handleSelect = (selected: DateRange | undefined) => {
    setDate({
      from: selected?.from || undefined,
      to: selected?.to || undefined,
    });
    setSelectedPreset(null); // Clear preset when manually selecting a range
  };

  // Update `selectedPreset` whenever `date` changes
  useEffect(() => {
    const matchedPreset = finalPresets.find(
      (preset) =>
        isEqual(startOfDay(preset.range.from), startOfDay(date?.from || new Date(0))) &&
        isEqual(startOfDay(preset.range.to), startOfDay(date?.to || new Date(0)))
    );
    setSelectedPreset(matchedPreset?.label || null);
  }, [date, finalPresets]);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          mode="input"
          placeholder={!date?.from && !date?.to}
          disabled={disabled}
          className={cn('w-auto justify-start text-left font-normal', className)}
        >
          <CalendarIcon />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'LLL dd, y', { locale: dateFnsLocale })} -{' '}
                {format(date.to, 'LLL dd, y', { locale: dateFnsLocale })}
              </>
            ) : (
              format(date.from, 'LLL dd, y', { locale: dateFnsLocale })
            )
          ) : (
            <span>{finalPlaceholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex max-sm:flex-col">
          <div className="relative border-border max-sm:order-1 max-sm:border-t sm:w-32">
            <div className="h-full border-border sm:border-e py-2">
              <div className="flex flex-col px-2 gap-[2px]">
                {finalPresets.map((preset, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    className={cn(
                      'h-8 w-full justify-start',
                      selectedPreset === preset.label && 'bg-accent'
                    )}
                    onClick={() => {
                      setDate(preset.range);

                      // Update the calendar to show the starting month of the selected range
                      setMonth(preset.range.from || today);

                      setSelectedPreset(preset.label); // Explicitly set the active preset
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <Calendar
            autoFocus
            mode="range"
            month={month}
            onMonthChange={setMonth}
            showOutsideDays={false}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
            locale={dayPickerLocale}
          />
        </div>
        <div className="flex items-center justify-end gap-1.5 border-t border-border p-3">
          <Button variant="outline" onClick={handleReset}>
            {mergedMessages.reset}
          </Button>
          <Button onClick={handleApply}>{mergedMessages.apply}</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
