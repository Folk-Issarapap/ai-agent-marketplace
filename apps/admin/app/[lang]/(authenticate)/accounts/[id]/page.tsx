import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getAccountById } from '@/actions/accounts';
import { AccountInfoSection } from '@/components/accounts/sections/account-info-section';

interface AccountOverviewPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

// Cache the account fetch to deduplicate calls between generateMetadata and page component
const getCachedAccount = cache(async (id: string) => {
  return getAccountById(id);
});

export async function generateMetadata({ params }: AccountOverviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getCachedAccount(id);

  if (!result.success || !result.data) {
    return {
      title: 'Unnamed Account',
      description: 'Account details',
    };
  }

  const accountName = result.data.name || result.data.email || 'Unnamed Account';

  return {
    title: `${accountName} - Accounts`,
    description: 'Account details',
  };
}

export const dynamic = 'force-dynamic';

export default async function AccountOverviewPage({ params }: AccountOverviewPageProps) {
  const { id } = await params;

  // Fetch account (cached)
  const result = await getCachedAccount(id);

  // Handle account not found
  if (!result.success || !result.data) {
    notFound();
  }

  const account = result.data;

  return (
    <div className="space-y-6">
      <AccountInfoSection account={account} />
    </div>
  );
}
