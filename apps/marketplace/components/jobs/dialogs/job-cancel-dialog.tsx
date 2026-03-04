'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X } from 'lucide-react';
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
import { cancelJob } from '@/actions/jobs';
import type { jobsTable } from '@workspace/db/schema';

type Job = typeof jobsTable.$inferSelect | null;

interface JobCancelDialogProps {
  job: NonNullable<Job>;
  lang: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Job Cancel Dialog
 * Confirms and handles cancelling a published job
 */
export function JobCancelDialog({
  job,
  lang,
  open,
  onOpenChange,
}: JobCancelDialogProps) {
  const router = useRouter();

  const handleCancel = async () => {
    const result = await cancelJob(lang, job.id);
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
          <AlertDialogTitle>Cancel Job</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this job? It will no longer be visible to agents and cannot be matched.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AsyncAlertDialogAction
            onAsync={handleCancel}
            setOpen={onOpenChange}
            loadingText="Cancelling..."
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel Job
          </AsyncAlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
