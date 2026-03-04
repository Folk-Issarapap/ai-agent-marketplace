'use client';

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { useQueryStates, parseAsString } from 'nuqs';
import { useTranslations, useLocale } from 'next-intl';
import {
  Filters,
  createFilter,
  type Filter,
  type FilterFieldConfig,
} from '@workspace/ui/components/filters';
import { Search, Shield, FilterIcon, ArrowRightLeft, User, Calendar } from 'lucide-react';
import type { Integration } from '@workspace/core/services/integration';
import { createFilterI18n } from '@workspace/ui/lib/filter-i18n';

type TransactionFiltersProps = {
  integrations?: Integration[];
};

export function TransactionFilters({
  integrations: availableIntegrations = [],
}: TransactionFiltersProps) {
  const t = useTranslations('transactions');
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
      integrationId: parseAsString.withDefault('all'),
      status: parseAsString.withDefault('all'),
      direction: parseAsString.withDefault('all'),
      referenceType: parseAsString.withDefault('all'),
      customerId: parseAsString.withDefault('all'),
      dateFrom: parseAsString.withDefault(''),
      dateTo: parseAsString.withDefault(''),
    },
    { shallow: false }
  );

  // Local state for filters - updates immediately for responsive UI
  const [localFilters, setLocalFilters] = useState<Filter[]>([]);

  // Transform integrations to filter options (pre-populated from server)
  const integrationOptions = useMemo(() => {
    const allOption = { value: 'all', label: t('filters.allIntegrations') };
    if (!availableIntegrations || availableIntegrations.length === 0) {
      return [allOption];
    }
    const integrationOptionsList = availableIntegrations.map((integration) => ({
      value: integration.id,
      label: integration.name || integration.id.slice(0, 8),
    }));
    return [allOption, ...integrationOptionsList];
  }, [availableIntegrations, t]);

  // Define filter fields configuration
  const fields: FilterFieldConfig[] = useMemo(
    () => [
      {
        key: 'search',
        label: t('filters.search'),
        type: 'text',
        icon: <Search className="size-3.5" />,
        operators: [{ value: 'contains', label: filterI18n.operators.contains }],
        defaultOperator: 'contains',
        className: 'w-40',
        placeholder: t('filters.searchPlaceholder'),
      },
      {
        key: 'status',
        label: t('filters.status'),
        type: 'select',
        icon: <FilterIcon className="size-3.5" />,
        searchable: false,
        className: 'w-[160px]',
        options: [
          { value: 'all', label: t('filters.allStatuses') },
          { value: 'pending', label: t('enums.status.pending') },
          { value: 'processing', label: t('enums.status.processing') },
          { value: 'completed', label: t('enums.status.completed') },
          { value: 'failed', label: t('enums.status.failed') },
          { value: 'cancelled', label: t('enums.status.cancelled') },
          { value: 'refunded', label: t('enums.status.refunded') },
          { value: 'reversed', label: t('enums.status.reversed') },
        ],
        operators: [{ value: 'is', label: filterI18n.operators.is }],
        defaultOperator: 'is',
      },
      {
        key: 'direction',
        label: t('filters.direction'),
        type: 'select',
        icon: <ArrowRightLeft className="size-3.5" />,
        searchable: false,
        className: 'w-[140px]',
        options: [
          { value: 'all', label: t('filters.allDirections') },
          { value: 'inbound', label: t('enums.direction.inbound') }, // Maps to credit
          { value: 'outbound', label: t('enums.direction.outbound') }, // Maps to debit
        ],
        operators: [{ value: 'is', label: filterI18n.operators.is }],
        defaultOperator: 'is',
      },
      {
        key: 'referenceType',
        label: t('filters.referenceType'),
        type: 'select',
        icon: <FilterIcon className="size-3.5" />,
        searchable: false,
        className: 'w-[160px]',
        options: [
          { value: 'all', label: t('filters.allReferenceTypes') },
          { value: 'payment', label: t('enums.referenceType.payment') },
          { value: 'withdraw', label: t('enums.referenceType.withdraw') },
          { value: 'refund', label: t('enums.referenceType.refund') },
        ],
        operators: [{ value: 'is', label: filterI18n.operators.is }],
        defaultOperator: 'is',
      },
      {
        key: 'integrationId',
        label: t('filters.integration'),
        type: 'select',
        icon: <Shield className="size-3.5" />,
        searchable: true,
        className: 'w-[200px]',
        options: integrationOptions,
        operators: [{ value: 'is', label: filterI18n.operators.is }],
        defaultOperator: 'is',
      },
      {
        key: 'customerId',
        label: t('filters.customer'),
        type: 'text',
        icon: <User className="size-3.5" />,
        operators: [{ value: 'contains', label: filterI18n.operators.contains }],
        defaultOperator: 'contains',
        className: 'w-40',
        placeholder: 'Customer ID...',
      },
      {
        key: 'dateRange',
        label: t('filters.dateRange'),
        type: 'daterange',
        icon: <Calendar className="size-3.5" />,
        operators: [{ value: 'between', label: filterI18n.operators.between }],
        defaultOperator: 'between',
        className: 'w-[240px]',
      },
    ],
    [t, integrationOptions, filterI18n]
  );

  // Initialize local filters from URL params on mount or when URL params change externally
  const isUpdatingFromUserRef = useRef(false);

  useEffect(() => {
    // Skip sync if we're currently updating from user input
    if (isUpdatingFromUserRef.current) {
      return;
    }

    const result: Filter[] = [];

    // Only include search filter if it has a non-empty value
    if (filterParams.search && filterParams.search.trim() !== '') {
      const searchFilter = createFilter('search', 'contains', [filterParams.search]);
      searchFilter.id = 'search-filter';
      result.push(searchFilter);
    }

    if (filterParams.integrationId && filterParams.integrationId !== 'all') {
      const integrationIdFilter = createFilter('integrationId', 'is', [filterParams.integrationId]);
      integrationIdFilter.id = 'integration-id-filter';
      result.push(integrationIdFilter);
    }

    if (filterParams.status && filterParams.status !== 'all') {
      const statusFilter = createFilter('status', 'is', [filterParams.status]);
      statusFilter.id = 'status-filter';
      result.push(statusFilter);
    }

    if (filterParams.direction && filterParams.direction !== 'all') {
      const directionFilter = createFilter('direction', 'is', [filterParams.direction]);
      directionFilter.id = 'direction-filter';
      result.push(directionFilter);
    }

    if (filterParams.referenceType && filterParams.referenceType !== 'all') {
      const referenceTypeFilter = createFilter('referenceType', 'is', [filterParams.referenceType]);
      referenceTypeFilter.id = 'reference-type-filter';
      result.push(referenceTypeFilter);
    }

    if (
      filterParams.customerId &&
      filterParams.customerId !== 'all' &&
      filterParams.customerId.trim() !== ''
    ) {
      const customerIdFilter = createFilter('customerId', 'contains', [filterParams.customerId]);
      customerIdFilter.id = 'customer-id-filter';
      result.push(customerIdFilter);
    }

    // Handle date range filter
    if (filterParams.dateFrom || filterParams.dateTo) {
      const dateRangeFilter = createFilter('dateRange', 'between', [
        filterParams.dateFrom || '',
        filterParams.dateTo || '',
      ]);
      dateRangeFilter.id = 'dateRange-filter';
      result.push(dateRangeFilter);
    }

    // Merge URL params filters with existing local filters
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

    // Remove filters that don't exist in URL params AND don't have empty values
    const filtersToKeep = mergedFilters.filter((localFilter) => {
      const existsInUrl = result.some(
        (urlFilter) =>
          urlFilter.field === localFilter.field && urlFilter.operator === localFilter.operator
      );
      if (existsInUrl) return true;

      // Keep if it's an empty search filter (user might be typing)
      if (localFilter.field === 'search' && localFilter.operator === 'contains') {
        const value = (localFilter.values[0] as string) || '';
        if (value.trim() === '') return true;
      }

      return false;
    });

    // Only update if different
    const filtersString = JSON.stringify(filtersToKeep);
    const localFiltersString = JSON.stringify(localFilters);
    if (filtersString !== localFiltersString) {
      setLocalFilters(filtersToKeep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterParams.search,
    filterParams.integrationId,
    filterParams.status,
    filterParams.direction,
    filterParams.referenceType,
    filterParams.customerId,
    filterParams.dateFrom,
    filterParams.dateTo,
  ]);

  // Use local filters for rendering (updates immediately, no re-render delay)
  const filters = localFilters;

  // Convert Filter[] back to search/filter strings and update URL with debouncing
  const handleFiltersChange = useCallback(
    (newFilters: Filter[]) => {
      // Mark that we're updating from user input
      isUpdatingFromUserRef.current = true;

      // Update local filters immediately (no re-render delay)
      setLocalFilters(newFilters);

      // Extract filters from Filter array
      const searchFilter = newFilters.find(
        (f) => f.field === 'search' && f.operator === 'contains'
      );
      const integrationIdFilter = newFilters.find(
        (f) => f.field === 'integrationId' && f.operator === 'is'
      );
      const statusFilter = newFilters.find((f) => f.field === 'status' && f.operator === 'is');
      const directionFilter = newFilters.find(
        (f) => f.field === 'direction' && f.operator === 'is'
      );
      const referenceTypeFilter = newFilters.find(
        (f) => f.field === 'referenceType' && f.operator === 'is'
      );
      const customerIdFilter = newFilters.find(
        (f) => f.field === 'customerId' && f.operator === 'contains'
      );
      const dateRangeFilter = newFilters.find(
        (f) => f.field === 'dateRange' && f.operator === 'between'
      );

      // Get values - only keep non-empty trimmed values
      const search = searchFilter
        ? searchFilter.values.length > 0 && (searchFilter.values[0] as string).trim() !== ''
          ? (searchFilter.values[0] as string).trim()
          : null
        : null;
      const integrationId =
        integrationIdFilter && integrationIdFilter.values.length > 0
          ? (integrationIdFilter.values[0] as string)
          : 'all';
      const status =
        statusFilter && statusFilter.values.length > 0 ? (statusFilter.values[0] as string) : 'all';
      const direction =
        directionFilter && directionFilter.values.length > 0
          ? (directionFilter.values[0] as string)
          : 'all';
      const referenceType =
        referenceTypeFilter && referenceTypeFilter.values.length > 0
          ? (referenceTypeFilter.values[0] as string)
          : 'all';
      const customerId = customerIdFilter
        ? customerIdFilter.values.length > 0 && (customerIdFilter.values[0] as string).trim() !== ''
          ? (customerIdFilter.values[0] as string).trim()
          : null
        : null;
      const dateFrom = dateRangeFilter
        ? dateRangeFilter.values.length > 0
          ? (dateRangeFilter.values[0] as string) || ''
          : ''
        : '';
      const dateTo = dateRangeFilter
        ? dateRangeFilter.values.length > 1
          ? (dateRangeFilter.values[1] as string) || ''
          : ''
        : '';

      // Debounce URL updates - this prevents URL/param re-renders on every keystroke
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
      urlDebounceRef.current = setTimeout(() => {
        const newParams = {
          search: search && search.trim() !== '' ? search : null,
          integrationId: integrationId === 'all' ? null : integrationId,
          status: status === 'all' ? null : status,
          direction: direction === 'all' ? null : direction,
          referenceType: referenceType === 'all' ? null : referenceType,
          customerId: customerId && customerId.trim() !== '' ? customerId : null,
          dateFrom: dateFrom && dateFrom.trim() !== '' ? dateFrom : null,
          dateTo: dateTo && dateTo.trim() !== '' ? dateTo : null,
        };
        setFilterParams(newParams);

        // Reset the flag after URL update completes
        setTimeout(() => {
          isUpdatingFromUserRef.current = false;
        }, 500);
      }, 500); // Debounce URL updates to 500ms
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
