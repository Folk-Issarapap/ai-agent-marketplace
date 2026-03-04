import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { type LucideIcon } from 'lucide-react';

import { cn } from '@workspace/ui/lib/utils';

const ringIconVariants = cva('rounded-full bg-primary/10 flex items-center justify-center', {
  variants: {
    size: {
      sm: 'p-1 ring-2 ring-primary/5',
      md: 'p-1.5 ring-3 ring-primary/5',
      lg: 'p-3 ring-6 ring-primary/5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const iconSizeVariants = cva('text-primary', {
  variants: {
    size: {
      sm: 'h-3 w-3',
      md: 'h-3.5 w-3.5',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface RingIconProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof ringIconVariants> {
  icon: LucideIcon;
  /**
   * Custom icon className. Overrides default icon size and color.
   * Default: Icon size matches container size variant.
   */
  iconClassName?: string;
}

/**
 * RingIcon - A reusable icon component with a circular ring background.
 * Works in both server and client components.
 *
 * @example
 * ```tsx
 * import { RingIcon } from '@workspace/ui/components/ring-icon';
 * import { Plug } from 'lucide-react';
 *
 * // Server component - icon size matches container size
 * export default function Page() {
 *   return <RingIcon icon={Plug} size="lg" />;
 * }
 *
 * // Client component - custom icon size via className
 * 'use client';
 * export function Component() {
 *   return <RingIcon icon={Plug} size="lg" iconClassName="h-4 w-4" />;
 * }
 * ```
 */
function RingIcon({ icon: Icon, size = 'md', className, iconClassName, ...props }: RingIconProps) {
  return (
    <div className={cn(ringIconVariants({ size }), className)} {...props}>
      <Icon className={iconClassName || cn(iconSizeVariants({ size }), 'text-primary')} />
    </div>
  );
}

export { RingIcon, ringIconVariants };
