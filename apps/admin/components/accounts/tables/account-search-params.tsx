import 'server-only';

import {
  createLoader,
  inferParserType,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

export const accountSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  sort: parseAsStringLiteral(['name', 'email', 'createdAt', 'status']).withDefault('createdAt'),
  sortOrder: parseAsStringLiteral(['asc', 'desc']).withDefault('desc'),
  search: parseAsString.withDefault(''),
  status: parseAsString.withDefault('all'),
};

export const accountLoadSearchParams = createLoader(accountSearchParams);

export type AccountSearchParams = inferParserType<typeof accountSearchParams>;
