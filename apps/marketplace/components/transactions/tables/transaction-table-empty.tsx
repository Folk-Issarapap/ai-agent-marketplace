'use client';

import { useTranslations } from 'next-intl';
import { TableEmpty } from '@workspace/ui/components/empty';
import { Search } from 'lucide-react';
import { ClearFilter } from '@workspace/ui/components/clear-filter';

interface TransactionTableEmptyProps {
  type: 'no-transactions' | 'no-results';
}

export function TransactionTableEmpty({ type }: TransactionTableEmptyProps) {
  const tCommon = useTranslations('common');
  const tTransactions = useTranslations('transactions');

  if (type === 'no-transactions') {
    return (
      <TableEmpty
        icon={Search}
        title={tTransactions('empty.title')}
        description={tTransactions('empty.description')}
      />
    );
  }

  return (
    <TableEmpty
      icon={Search}
      title={tCommon('emptyState.noResults.title')}
      description={tCommon('emptyState.noResults.description')}
      action={<ClearFilter excludeKeys={['page', 'pageSize', 'sort', 'sortOrder']} />}
    />
  );
}
