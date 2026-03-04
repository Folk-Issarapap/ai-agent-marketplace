'use client';

import { useState } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Edit } from 'lucide-react';
import { AccountProfileEditDialog } from '../../dialogs/account-profile-edit-dialog';
import type { AdminAccount } from '@/actions/accounts';

interface AccountProfileEditSectionProps {
  account: AdminAccount;
}

export function AccountProfileEditSection({ account }: AccountProfileEditSectionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Get initials for avatar fallback
  const initials = account.name
    ? account.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : account.email
      ? account.email[0]?.toUpperCase() || '?'
      : '?';

  return (
    <>
      <div id="profile" className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Profile</h3>
        <Card className="transition-colors hover:bg-muted/50">
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              {/* Content on left */}
              <div className="flex items-start gap-6 flex-1">
                {/* Avatar */}
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>

                {/* Profile Info */}
                <div className="grid gap-4 lg:grid-cols-3 flex-1 break-all">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="text-sm font-medium">
                      {account.name || <span className="text-muted-foreground">Not set</span>}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{account.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Display Name</p>
                    <p className="text-sm font-medium">
                      {account.displayName || <span className="text-muted-foreground">Not set</span>}
                    </p>
                  </div>
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

      <AccountProfileEditDialog account={account} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  );
}
