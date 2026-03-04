'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card';
import { format } from 'date-fns';
import type { AdminAccount } from '@/actions/accounts';

interface AccountInfoSectionProps {
  account: AdminAccount;
}

export function AccountInfoSection({ account }: AccountInfoSectionProps) {
  const formattedCreatedAt = account.createdAt
    ? format(new Date(account.createdAt), 'PPp')
    : '-';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 break-all">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{account.email || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="text-sm font-medium">{formattedCreatedAt}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-sm font-medium">{account.status}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
