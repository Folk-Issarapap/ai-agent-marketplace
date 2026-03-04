'use client';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Button, Group, Input, NumberField as NumberFieldPrimitive } from 'react-aria-components';
import { cn } from '@workspace/ui/lib/utils';

export interface NumberFieldProps extends Omit<
  React.ComponentProps<typeof NumberFieldPrimitive>,
  'value' | 'onChange' | 'minValue' | 'maxValue' | 'isDisabled' | 'isInvalid'
> {
  value?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  'aria-invalid'?: boolean;
  className?: string;
}

export function NumberField({
  value,
  onChange,
  min,
  max,
  step,
  placeholder,
  disabled,
  'aria-invalid': ariaInvalid,
  className,
  id,
  ...props
}: NumberFieldProps) {
  const handleChange = (val: number | null) => {
    onChange?.(val);
  };

  return (
    <NumberFieldPrimitive
      id={id}
      value={value ?? undefined}
      onChange={handleChange}
      minValue={min}
      maxValue={max}
      step={step}
      isDisabled={disabled}
      isInvalid={ariaInvalid}
      className={cn('w-full', className)}
      {...props}
    >
      <Group className="relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border border-input text-sm shadow-xs outline-none transition-[color,box-shadow] data-[focus-within=true]:border-ring data-[disabled=true]:opacity-50 data-[focus-within=true]:ring-[3px] data-[focus-within=true]:ring-ring/50 data-[focus-within=true]:has-aria-invalid:border-destructive data-[focus-within=true]:has-aria-invalid:ring-destructive/20 dark:data-[focus-within=true]:has-aria-invalid:ring-destructive/40">
        <Input
          placeholder={placeholder}
          className="flex-1 bg-background px-3 py-2 text-foreground tabular-nums outline-none"
        />
        <div className="flex h-[calc(100%+2px)] flex-col">
          <Button
            className="-me-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-muted-foreground/80 text-sm transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            slot="increment"
          >
            <ChevronUpIcon aria-hidden="true" size={12} />
          </Button>
          <Button
            className="-me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-muted-foreground/80 text-sm transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            slot="decrement"
          >
            <ChevronDownIcon aria-hidden="true" size={12} />
          </Button>
        </div>
      </Group>
    </NumberFieldPrimitive>
  );
}
