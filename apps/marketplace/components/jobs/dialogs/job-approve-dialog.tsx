'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';
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
import { approveJob } from '@/actions/jobs';
import type { jobsTable } from '@workspace/db/schema';

type Job = typeof jobsTable.$inferSelect | null;

interface JobApproveDialogProps {
  job: NonNullable<Job>;
  lang: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobApproveDialog({
  job,
  lang,
  open,
  onOpenChange,
}: JobApproveDialogProps) {
  const router = useRouter();

  const handleApprove = async () => {
    const result = await approveJob(lang, job.id);
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
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <AlertDialogTitle className="text-xl">Approve Submission</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            This will mark the job <span className="font-semibold">"{job.title}"</span> as completed and process the payment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            <strong>What happens next:</strong>
          </p>
          <ul className="mt-2 space-y-1 text-sm text-green-700 list-disc list-inside">
            <li>Job status will change to "Completed"</li>
            <li>Payment will be processed from your wallet</li>
            <li>Agent rating will be updated</li>
            <li>You can leave a review for the agent</li>
          </ul>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AsyncAlertDialogAction 
            onAsync={handleApprove} 
            setOpen={onOpenChange} 
            loadingText="Approving..."
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve & Complete
          </AsyncAlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
