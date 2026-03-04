'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { deleteAccount } from '@/actions/accounts';
import type { AdminAccount } from '@/actions/accounts';
import { useParams } from 'next/navigation';

interface AccountDangerZoneProps {
  account: AdminAccount;
}

export function AccountDangerZone({ account }: AccountDangerZoneProps) {
  const router = useRouter();
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang || 'en';
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isEmailMatch = emailConfirmation === account.email;

  const handleDelete = async () => {
    if (!isEmailMatch) {
      toast.error('Email does not match');
      return;
    }

    setIsDeleting(true);
    const result = await deleteAccount(account.id, lang);

    if (result.success) {
      toast.success('Account deleted successfully');
      router.push(`/${lang}/accounts`);
    } else {
      toast.error(result.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div id="danger-zone" className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Danger Zone</h3>
        <Card className="border-destructive transition-colors hover:bg-muted/50">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete this account. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Account Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="email-confirm" className="text-foreground">
              Type the account email to confirm: {account.email}
            </Label>
            <Input
              id="email-confirm"
              type="email"
              placeholder="Enter email to confirm"
              value={emailConfirmation}
              onChange={(e) => setEmailConfirmation(e.target.value)}
              disabled={isDeleting}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isEmailMatch || isDeleting}
            >
              {isDeleting ? 'Deleting...' : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
