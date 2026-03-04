'use client';

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import {
  Filters,
  createFilter,
  type Filter,
  type FilterFieldConfig,
} from '@workspace/ui/components/filters';
import { Briefcase, Search } from 'lucide-react';
import { createFilterI18n } from '@workspace/ui/lib/filter-i18n';
import { useLocale } from 'next-intl';

export function JobFilters() {
  const locale = useLocale();
  const urlDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Create filter i18n configuration using locale
  const filterI18n = useMemo(() => {
    return createFilterI18n(locale as 'en' | 'th');
  }, [locale]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
    };
  }, []);

  // Sync URL params with nuqs for filters
  const [filterParams, setFilterParams] = useQueryStates(
    {
      search: parseAsString.withDefault(''),
      status: parseAsString.withDefault('all'),
    },
    { shallow: false }
  );

  // Local state for filters - updates immediately for responsive UI
  const [localFilters, setLocalFilters] = useState<Filter[]>([]);

  // Define filter fields configuration
  const fields: FilterFieldConfig[] = useMemo(
    () => [
      {
        key: 'search',
        label: 'Search',
        type: 'text',
        icon: <Search className="size-3.5" />,
        operators: [{ value: 'contains', label: filterI18n.operators.contains }],
        defaultOperator: 'contains',
        className: 'w-40',
        placeholder: 'Search by title, goal, or task...',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        icon: <Briefcase className="size-3.5" />,
        searchable: false,
        className: 'w-[140px]',
        options: [
          { value: 'all', label: 'All Statuses' },
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' },
          { value: 'matching', label: 'Matching' },
          { value: 'pending_confirmation', label: 'Pending Confirmation' },
          { value: 'active', label: 'Active' },
          { value: 'in_review', label: 'In Review' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'rejected', label: 'Rejected' },
        ],
        operators: [{ value: 'is', label: filterI18n.operators.is }],
        defaultOperator: 'is',
      },
    ],
    [filterI18n]
  );

  // Initialize local filters from URL params on mount or when URL params change externally
  const isUpdatingFromUserRef = useRef(false);

  useEffect(() => {
    if (isUpdatingFromUserRef.current) {
      return;
    }

    const result: Filter[] = [];

    if (filterParams.search && filterParams.search.trim() !== '') {
      const searchFilter = createFilter('search', 'contains', [filterParams.search]);
      searchFilter.id = 'search-filter';
      result.push(searchFilter);
    }

    if (filterParams.status && filterParams.status !== 'all') {
      const statusFilter = createFilter('status', 'is', [filterParams.status]);
      statusFilter.id = 'status-filter';
      result.push(statusFilter);
    }

    const mergedFilters: Filter[] = [...localFilters];

    result.forEach((urlFilter) => {
      const existingIndex = mergedFilters.findIndex(
        (f) => f.field === urlFilter.field && f.operator === urlFilter.operator
      );
      if (existingIndex >= 0) {
        mergedFilters[existingIndex] = urlFilter;
      } else {
        mergedFilters.push(urlFilter);
      }
    });

    const filtersToKeep = mergedFilters.filter((localFilter) => {
      const existsInUrl = result.some(
        (urlFilter) =>
          urlFilter.field === localFilter.field && urlFilter.operator === urlFilter.operator
      );
      if (existsInUrl) return true;

      if (localFilter.field === 'search' && localFilter.operator === 'contains') {
        const value = (localFilter.values[0] as string) || '';
        if (value.trim() === '') return true;
      }

      return false;
    });

    const filtersString = JSON.stringify(filtersToKeep);
    const localFiltersString = JSON.stringify(localFilters);
    if (filtersString !== localFiltersString) {
      setLocalFilters(filtersToKeep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams.search, filterParams.status]);

  const filters = localFilters;

  // Convert Filter[] back to search/status strings and update URL with debouncing
  const handleFiltersChange = useCallback(
    (newFilters: Filter[]) => {
      isUpdatingFromUserRef.current = true;
      setLocalFilters(newFilters);

      const searchFilter = newFilters.find(
        (f) => f.field === 'search' && f.operator === 'contains'
      );
      const statusFilter = newFilters.find((f) => f.field === 'status' && f.operator === 'is');

      const search = searchFilter
        ? searchFilter.values.length > 0 && (searchFilter.values[0] as string).trim() !== ''
          ? (searchFilter.values[0] as string).trim()
          : null
        : null;
      const status =
        statusFilter && statusFilter.values.length > 0 ? (statusFilter.values[0] as string) : 'all';

      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
      urlDebounceRef.current = setTimeout(() => {
        const newParams = {
          search: search && search.trim() !== '' ? search : null,
          status: status === 'all' ? null : status,
        };
        setFilterParams(newParams);

        setTimeout(() => {
          isUpdatingFromUserRef.current = false;
        }, 500);
      }, 500);
    },
    [setFilterParams]
  );

  return (
    <Filters
      filters={filters}
      fields={fields}
      onChange={handleFiltersChange}
      variant="outline"
      size="md"
      radius="md"
      allowMultiple={true}
      i18n={filterI18n}
    />
  );
}
