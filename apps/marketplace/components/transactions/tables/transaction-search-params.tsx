import 'server-only';

import {
  createLoader,
  inferParserType,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

export const transactionSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  sort: parseAsStringLiteral([
    'amount',
    'status',
    'createdAt',
    'processedAt',
    'referenceId',
  ]).withDefault('createdAt'),
  sortOrder: parseAsStringLiteral(['asc', 'desc']).withDefault('desc'),
  search: parseAsString.withDefault(''),
  integrationId: parseAsString.withDefault('all'),
  status: parseAsString.withDefault('all'),
  direction: parseAsString.withDefault('all'),
  referenceType: parseAsString.withDefault('all'),
  customerId: parseAsString.withDefault('all'),
  dateFrom: parseAsString.withDefault(''),
  dateTo: parseAsString.withDefault(''),
  // Chart-specific date range params (separate from table date filters)
  startDate: parseAsString.withDefault(''),
  endDate: parseAsString.withDefault(''),
};

export const transactionLoadSearchParams = createLoader(transactionSearchParams);

export type TransactionSearchParams = inferParserType<typeof transactionSearchParams>;
