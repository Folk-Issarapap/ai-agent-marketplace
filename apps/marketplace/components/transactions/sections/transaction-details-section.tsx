'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card';
import { ExternalLink } from 'lucide-react';
import type { TransactionWithRelations } from '@workspace/core/services/transaction/types';
import type { Integration, Customer } from '@workspace/core/services/integration';
import { Link } from '@/lib/i18n/navigation';
import { DateTime } from '@/components/common-date-time';
import { formatMetadataValue } from '@/lib/utils/format-metadata-value';

interface TransactionDetailsSectionProps {
  transaction: TransactionWithRelations;
  integrationData: Integration | null;
  customerData: Customer | null;
}

export function TransactionDetailsSection({
  transaction,
  integrationData,
  customerData,
}: TransactionDetailsSectionProps) {
  const t = useTranslations('transactions');

  const formatAmount = (amount: string | null, currency: string | null) => {
    if (!amount) return '0.00';
    const num = parseFloat(amount);
    const curr = currency || 'THB';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('detail.details.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 break-all">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              {t('detail.details.basicInfo') || 'Basic Info'}
            </h3>
            <div className="space-y-3 ">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('detail.info.amount')}</p>
                <p className="text-sm font-medium">
                  {formatAmount(transaction.amount ?? null, transaction.currency ?? null)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('detail.info.currency')}</p>
                <p className="text-sm font-medium">{transaction.currency || 'THB'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('detail.info.status')}</p>
                <p className="text-sm font-medium capitalize">{transaction.status}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('detail.info.direction')}</p>
                <p className="text-sm font-medium capitalize">{transaction.direction}</p>
              </div>
              {transaction.referenceType && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('detail.info.reference')}</p>
                  <p className="text-sm font-medium capitalize">{transaction.referenceType}</p>
                </div>
              )}
            </div>
          </div>

          {/* Integration & Related */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              {t('detail.details.integration') || 'Integration'}
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('detail.details.integration')}</p>
                <Link
                  href={`/integrations/${transaction.integrationId}`}
                  className="text-sm font-medium hover:underline flex items-center gap-1"
                >
                  {integrationData
                    ? integrationData.name || transaction.integrationId
                    : transaction.integrationId}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              {transaction.customerId && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('detail.details.customer')}</p>
                  <Link
                    href={`/customers/${transaction.customerId}`}
                    className="text-sm font-medium  hover:underline flex items-center gap-1"
                  >
                    {customerData
                      ? customerData.businessName ||
                        `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim() ||
                        customerData.id ||
                        transaction.customerId
                      : transaction.customerId}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
              {transaction.providerId && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground ">{t('detail.details.provider')}</p>
                  <p className="text-sm font-medium  ">{transaction.providerId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('detail.details.dates') || 'Dates'}</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground ">{t('detail.info.createdAt')}</p>
                <p className="text-sm font-medium ">
                  <DateTime date={transaction.createdAt} />
                </p>
              </div>
              {transaction.processedAt && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground ">{t('detail.info.processed')}</p>
                  <p className="text-sm font-medium ">
                    <DateTime
                      date={
                        typeof transaction.processedAt === 'string'
                          ? new Date(transaction.processedAt)
                          : transaction.processedAt
                      }
                    />
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <div className="space-y-4 col-span-full pt-4 border-t">
              <h3 className="text-sm font-semibold">{t('detail.details.metadata')}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(transaction.metadata).map(([key, value]) => {
                  // Handle nested objects - display as Key-Value grid
                  // For qrCode, hide base64 string to save space
                  if (
                    typeof value === 'object' &&
                    value !== null &&
                    !Array.isArray(value) &&
                    !(value instanceof Date)
                  ) {
                    return (
                      <div key={key} className="space-y-2 col-span-full">
                        <p className="text-sm font-semibold text-foreground">{key}</p>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 pl-4 border-l-2 border-muted">
                          {Object.entries(value)
                            .filter(([nestedKey]) => nestedKey !== 'base64') // Hide base64 string
                            .map(([nestedKey, nestedValue]) => (
                              <div key={nestedKey} className="space-y-1">
                                <p className="text-xs text-muted-foreground break-all">
                                  {nestedKey}
                                </p>
                                <div className="text-sm font-medium">
                                  {formatMetadataValue(nestedValue)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  }

                  // Handle simple values
                  return (
                    <div key={key} className="space-y-1">
                      <p className="text-sm text-muted-foreground break-all">{key}</p>
                      <div className="text-sm font-medium">{formatMetadataValue(value)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
