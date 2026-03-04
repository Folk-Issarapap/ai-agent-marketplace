'use client';

import { useState } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { AccountStatusBadge } from '../../account-badges';
import { Edit } from 'lucide-react';
import { AccountSettingsEditDialog } from '../../dialogs/account-settings-edit-dialog';
import type { AdminAccount } from '@/actions/accounts';

interface AccountSettingsEditSectionProps {
  account: AdminAccount;
}

export function AccountSettingsEditSection({ account }: AccountSettingsEditSectionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Get status from account (defaults to 'active' if not set)
  const status = account.status || 'active';

  return (
    <>
      <div id="account-settings" className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Account Settings</h3>
        <Card className="transition-colors hover:bg-muted/50">
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              {/* Content on left */}
              <div className="grid gap-4 md:grid-cols-2 flex-1">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <AccountStatusBadge status={status} />
                </div>
              </div>
              {/* Edit button on right */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="shrink-0"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AccountSettingsEditDialog account={account} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  );
}
