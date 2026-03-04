'use client';

import type { TransactionWithRelations } from '@workspace/core/services/transaction/types';
import { useTranslations } from 'next-intl';
import { RawDataViewer } from '@workspace/ui/components/raw-data-viewer';

interface TransactionRawDataSectionProps {
  transaction: TransactionWithRelations;
}

export function TransactionRawDataSection({ transaction }: TransactionRawDataSectionProps) {
  const t = useTranslations('transactions');

  return (
    <RawDataViewer
      data={transaction}
      title={t('detail.rawData.title')}
      description={t('detail.rawData.description')}
      tableName="transactions"
      recordId={transaction.id}
      useCasesTitle={t('detail.rawData.commonUseCasesTitle')}
      useCases={[
        t('detail.rawData.useCases.debugging'),
        t('detail.rawData.useCases.verify'),
        t('detail.rawData.useCases.inspect'),
        t('detail.rawData.useCases.review'),
      ]}
      note={t('detail.rawData.note')}
      noteLabel={t('detail.rawData.noteLabel')}
    />
  );
}
