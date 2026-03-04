'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Badge } from '@workspace/ui/components/badge';
import { X } from 'lucide-react';

interface ClearFilterProps {
  /**
   * List of query parameter keys to exclude from clearing
   * Useful for preserving pagination or other non-filter params
   */
  excludeKeys?: string[];
  /**
   * Custom label for the clear button
   * @default "Reset"
   */
  label?: string;
}

export function ClearFilter({ excludeKeys = [], label = 'Reset' }: ClearFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if there are any active filters (excluding specified keys)
  const hasActiveFilters = Array.from(searchParams.keys()).some(
    (key) => typeof key === 'string' && !excludeKeys.includes(key)
  );

  const handleClearFilters = () => {
    // Build new URL with only excluded params
    const params = new URLSearchParams();

    excludeKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(newUrl);
  };

  // Don't render if no active filters
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className="cursor-pointer hover:bg-secondary/80 transition-colors px-3 flex items-center gap-1.5"
      onClick={handleClearFilters}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClearFilters();
        }
      }}
    >
      <span className="text-sm">{label}</span>
      <X className="h-3.5 w-3.5" />
    </Badge>
  );
}
