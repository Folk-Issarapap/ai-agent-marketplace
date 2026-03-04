import 'server-only';

import { SearchParams } from 'nuqs';
import { getAccounts } from '@/actions/accounts';
import { accountLoadSearchParams } from './account-search-params';
import { AccountDataGrid } from './account-data-grid';

type AccountTableProps = {
  searchParams: Promise<SearchParams>;
  lang: string;
};

export async function AccountTable({ searchParams, lang }: AccountTableProps) {
  const { page, pageSize, sort, sortOrder, search, status } =
    await accountLoadSearchParams(searchParams);

  const result = await getAccounts(page, pageSize, {
    search,
    status,
    sortBy: sort,
    sortOrder,
  });

  if (!result.success || !result.data) {
    return (
      <div className="border rounded-md p-4">
        <p className="text-muted-foreground">{result.error || 'Failed to load accounts'}</p>
      </div>
    );
  }

  const accounts = result.data.data ?? [];
  const total = result.data.total ?? 0;
  const totalPages = result.data.totalPages ?? 0;
  const isNoAccounts = total === 0 && page === 1 && !search && status === 'all';

  return (
    <AccountDataGrid
      data={accounts}
      total={total}
      totalPages={totalPages}
      isNoAccounts={isNoAccounts}
      lang={lang}
    />
  );
}
