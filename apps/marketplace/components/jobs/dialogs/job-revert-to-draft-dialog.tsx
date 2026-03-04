'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { AsyncAlertDialogAction } from '@workspace/ui/components/async-alert-dialog-action';
import { revertToDraft } from '@/actions/jobs';
import type { jobsTable } from '@workspace/db/schema';

type Job = typeof jobsTable.$inferSelect | null;

interface JobRevertToDraftDialogProps {
  job: NonNullable<Job>;
  lang: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Job Revert to Draft Dialog
 * Confirms and handles reverting a cancelled job back to draft
 */
export function JobRevertToDraftDialog({
  job,
  lang,
  open,
  onOpenChange,
}: JobRevertToDraftDialogProps) {
  const router = useRouter();

  const handleRevert = async () => {
    const result = await revertToDraft(lang, job.id);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
      throw new Error(result.message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revert to Draft</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to revert this job to draft? You will be able to edit and publish it again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AsyncAlertDialogAction
            onAsync={handleRevert}
            setOpen={onOpenChange}
            loadingText="Reverting..."
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Revert to Draft
          </AsyncAlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
