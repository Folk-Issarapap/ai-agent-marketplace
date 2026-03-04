import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getAccountById } from '@/actions/accounts';
import { AccountProfileEditSection } from '@/components/accounts/sections/edit/account-profile-edit-section';
import { AccountSettingsEditSection } from '@/components/accounts/sections/edit/account-settings-edit-section';
import { AccountPasswordEditSection } from '@/components/accounts/sections/edit/account-password-edit-section';
import { AccountDangerZone } from '@/components/accounts/sections/account-danger-zone';
import {
  SettingsNavSidebar,
  type SettingsNavSection,
} from '@/components/layouts/settings-nav-sidebar';

interface AccountSettingsPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

// Cache the account fetch to deduplicate calls between generateMetadata and page component
const getCachedAccount = cache(async (id: string) => {
  return getAccountById(id);
});

export async function generateMetadata({ params }: AccountSettingsPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getCachedAccount(id);

  if (!result.success || !result.data) {
    return {
      title: 'Unnamed Account - Settings',
      description: 'Account settings',
    };
  }

  const accountName = result.data.name || result.data.email || 'Unnamed Account';

  return {
    title: `${accountName} - Settings`,
    description: 'Account settings',
  };
}

export const dynamic = 'force-dynamic';

export default async function AccountSettingsPage({ params }: AccountSettingsPageProps) {
  const { id } = await params;

  // Fetch account (cached)
  const result = await getCachedAccount(id);

  // Handle account not found
  if (!result.success || !result.data) {
    notFound();
  }

  const account = result.data;

  // Define settings sections for navigation
  const settingsSections: SettingsNavSection[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: 'user',
    },
    {
      id: 'account-settings',
      label: 'Account Settings',
      icon: 'settings',
    },
    {
      id: 'password',
      label: 'Password',
      icon: 'key-round',
    },
    {
      id: 'danger-zone',
      label: 'Danger Zone',
      icon: 'alert-triangle',
    },
  ];

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <SettingsNavSidebar sections={settingsSections} />

      {/* Content Area */}
      <div className="flex-1 space-y-6 min-w-0">
        <AccountProfileEditSection account={account} />
        <AccountSettingsEditSection account={account} />
        <AccountPasswordEditSection account={account} />
        <AccountDangerZone account={account} />
      </div>
    </div>
  );
}
