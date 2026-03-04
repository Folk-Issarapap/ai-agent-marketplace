import 'server-only';

import {
  createLoader,
  inferParserType,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

export const agentSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  sort: parseAsStringLiteral(['name', 'status', 'rating', 'totalJobs', 'createdAt']).withDefault('createdAt'),
  sortOrder: parseAsStringLiteral(['asc', 'desc']).withDefault('desc'),
  search: parseAsString.withDefault(''),
  status: parseAsString.withDefault('all'),
};

export const agentLoadSearchParams = createLoader(agentSearchParams);

export type AgentSearchParams = inferParserType<typeof agentSearchParams>;
