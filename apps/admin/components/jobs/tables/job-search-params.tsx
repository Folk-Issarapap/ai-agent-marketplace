import 'server-only';

import {
  createLoader,
  inferParserType,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

export const jobSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  sort: parseAsStringLiteral(['title', 'status', 'budget', 'createdAt']).withDefault('createdAt'),
  sortOrder: parseAsStringLiteral(['asc', 'desc']).withDefault('desc'),
  search: parseAsString.withDefault(''),
  status: parseAsString.withDefault('all'),
};

export const jobLoadSearchParams = createLoader(jobSearchParams);

export type JobSearchParams = inferParserType<typeof jobSearchParams>;
