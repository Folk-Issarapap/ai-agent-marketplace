'use client';

import { useState } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/spinner';
import { Mail, KeyRound } from 'lucide-react';
import { HardResetPasswordDialog } from '../../dialogs/hard-reset-password-dialog';
import type { AdminAccount } from '@/actions/accounts';
import { toast } from 'sonner';

interface AccountPasswordEditSectionProps {
  account: AdminAccount;
}

export function AccountPasswordEditSection({ account }: AccountPasswordEditSectionProps) {
  const [isPending, setIsPending] = useState(false);
  const [showHardResetDialog, setShowHardResetDialog] = useState(false);

  async function handleSendResetEmail() {
    if (!account.email) {
      toast.error('Email is required');
      return;
    }

    setIsPending(true);
    // TODO: Implement sendPasswordResetEmail action
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Placeholder
    setIsPending(false);
    toast.success('Password reset email sent');
  }

  return (
    <>
      <div id="password" className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Password</h3>
        <Card className="transition-colors hover:bg-muted/50">
          <CardContent className="space-y-6">
            {/* Hard Reset Password Option */}
            <div className="space-y-2">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Hard Reset Password</h4>
                <p className="text-sm text-muted-foreground">
                  Immediately reset the password to a new value. The user will need to use the new password to sign in.
                </p>
              </div>
              <Button
                onClick={() => setShowHardResetDialog(true)}
                disabled={!account.email}
                variant="destructive"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
            </div>

            {/* Email Reset Option */}
            <div className="space-y-2">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Send Reset Email</h4>
                <p className="text-sm text-muted-foreground">
                  Send a password reset email to the user. They will receive a link to reset their password.
                </p>
              </div>
              <Button
                onClick={handleSendResetEmail}
                disabled={isPending || !account.email}
                variant="outline"
              >
                {isPending && <Spinner className="mr-2" />}
                <Mail className="h-4 w-4 mr-2" />
                {isPending ? 'Sending...' : 'Send Reset Email'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hard Reset Password Dialog */}
      <HardResetPasswordDialog
        accountId={account.id}
        accountEmail={account.email}
        open={showHardResetDialog}
        onOpenChange={setShowHardResetDialog}
      />
    </>
  );
}
