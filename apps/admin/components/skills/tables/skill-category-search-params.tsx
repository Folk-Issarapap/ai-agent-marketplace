import 'server-only';

import {
  createLoader,
  inferParserType,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

export const skillCategorySearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  sort: parseAsStringLiteral(['name', 'displayName', 'description', 'status', 'createdAt']).withDefault('displayName'),
  sortOrder: parseAsStringLiteral(['asc', 'desc']).withDefault('asc'),
  search: parseAsString.withDefault(''),
  status: parseAsString.withDefault('all'),
};

export const skillCategoryLoadSearchParams = createLoader(skillCategorySearchParams);

export type SkillCategorySearchParams = inferParserType<typeof skillCategorySearchParams>;
