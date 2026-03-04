import { notFound } from 'next/navigation';
import { BackButton } from '@/components/common-back-button';
import { getAccountById } from '@/actions/accounts';
import { AccountHeroSection } from '@/components/accounts/sections/account-hero-section';

interface AccountLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

export default async function AccountLayout({ children, params }: AccountLayoutProps) {
  const { id, lang } = await params;

  // Fetch account data
  const result = await getAccountById(id);

  // Handle account not found
  if (!result.success || !result.data) {
    notFound();
  }

  const account = result.data;

  return (
    <div className="space-y-6">
      <BackButton href="/accounts" lang={lang} />

      <AccountHeroSection account={account} accountId={id} lang={lang} />

      {children}
    </div>
  );
}
