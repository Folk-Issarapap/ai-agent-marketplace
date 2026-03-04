import 'server-only';

import {
  createLoader,
  inferParserType,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

export const skillSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  sort: parseAsStringLiteral(['name', 'displayName', 'category', 'description', 'status', 'createdAt']).withDefault('displayName'),
  sortOrder: parseAsStringLiteral(['asc', 'desc']).withDefault('asc'),
  search: parseAsString.withDefault(''),
  status: parseAsString.withDefault('all'),
};

export const skillLoadSearchParams = createLoader(skillSearchParams);

export type SkillSearchParams = inferParserType<typeof skillSearchParams>;
