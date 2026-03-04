import 'server-only';

import { SearchParams } from 'nuqs';
import { getTransactions } from '@/actions/transactions';
import { getIntegrations } from '@/actions/integrations';
import { transactionLoadSearchParams } from './transaction-search-params';
import { TransactionDataGrid } from './transaction-data-grid';
import type { Integration } from '@workspace/core/services/integration';

type TransactionTableProps = {
  searchParams: Promise<SearchParams>;
};

export const TransactionTable = async ({ searchParams }: TransactionTableProps) => {
  const {
    page,
    pageSize,
    sort,
    sortOrder,
    search,
    integrationId,
    status,
    direction,
    referenceType,
    customerId,
    dateFrom,
    dateTo,
  } = await transactionLoadSearchParams(searchParams);

  // Fetch integrations for filters in parallel with transactions
  const [result, integrationsResult] = await Promise.all([
    getTransactions(page, pageSize, {
      search,
      integrationId: integrationId === 'all' ? undefined : integrationId,
      status: status === 'all' ? undefined : status,
      direction: direction === 'all' ? undefined : direction,
      referenceType: referenceType === 'all' ? undefined : referenceType,
      customerId: customerId === 'all' ? undefined : customerId,
      dateFrom: dateFrom && dateFrom.trim() !== '' ? dateFrom : undefined,
      dateTo: dateTo && dateTo.trim() !== '' ? dateTo : undefined,
      sortBy: sort,
      sortOrder,
    }),
    getIntegrations(1, 1000, { status: 'active' }),
  ]);

  // Extract integrations for filters
  const integrations: Integration[] =
    integrationsResult.success && integrationsResult.data ? integrationsResult.data.data || [] : [];

  if (!result.success || !result.data) {
    return (
      <div className="border rounded-md p-4">
        <p className="text-muted-foreground">{result.error || 'Failed to load transactions'}</p>
      </div>
    );
  }

  const transactions = result.data.data ?? [];
  const total = result.data.total ?? 0;
  const totalPages = result.data.totalPages ?? 0;
  const isNoTransactions =
    total === 0 &&
    page === 1 &&
    !search &&
    integrationId === 'all' &&
    status === 'all' &&
    direction === 'all' &&
    referenceType === 'all' &&
    customerId === 'all' &&
    !dateFrom &&
    !dateTo;

  return (
    <TransactionDataGrid
      data={transactions}
      total={total}
      totalPages={totalPages}
      isNoTransactions={isNoTransactions}
      filterOptions={{
        integrations,
      }}
    />
  );
};
