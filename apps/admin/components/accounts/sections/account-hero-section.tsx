'use client';

import { useState } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Copy, Check, Users } from 'lucide-react';
import { toast } from 'sonner';
import { RingIcon } from '@workspace/ui/components/ring-icon';
import { AccountStatusBadge } from '../account-badges';
import { AccountDetailTabs } from '../account-detail-tabs';
import { format } from 'date-fns';
import type { AdminAccount } from '@/actions/accounts';

interface AccountHeroSectionProps {
  account: AdminAccount;
  accountId: string;
  lang: string;
}

export function AccountHeroSection({ account, accountId, lang }: AccountHeroSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(account.id);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Get account display name (name → email → "Unnamed Account")
  const accountDisplayName = account.name || account.email || 'Unnamed Account';

  // Get preferred language display (from user_metadata if available)
  const preferredLanguageDisplay = account.preferredLanguage === 'en' 
    ? 'English' 
    : account.preferredLanguage === 'th' 
      ? 'Thai' 
      : '-';

  // Format createdAt date
  const formattedCreatedAt = account.createdAt
    ? format(new Date(account.createdAt), 'PPp')
    : '-';

  return (
    <Card>
      <CardContent>
        <div className="space-y-6">
          {/* Title */}
          <div className="flex items-center gap-4">
            <RingIcon icon={Users} size="lg" />
            <h2 className="text-2xl font-semibold tracking-tight">Account Details</h2>
          </div>

          {/* Top Row: Status and Primary Value */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <AccountStatusBadge status={account.status} size="lg" />
              <div>
                <p className="text-2xl font-bold">{accountDisplayName}</p>
              </div>
            </div>
          </div>

          {/* Identifier with Copy */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">ID</p>
            <p className="text-sm font-medium">{account.id}</p>
            <Button variant="ghost" size="sm" onClick={handleCopyId} className="h-6 w-6 p-0">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>

          {/* Quick Info Grid */}
          <div className="grid gap-4 border-t pt-4 md:grid-cols-2 lg:grid-cols-4 break-all">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{account.email || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{account.name || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <div>
                <AccountStatusBadge status={account.status} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{formattedCreatedAt}</p>
            </div>
          </div>

          {/* Tabs - Integrated inside hero */}
          <div className="border-t pt-4">
            <AccountDetailTabs accountId={accountId} lang={lang} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
