'use client';

import { useState } from 'react';
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
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { rejectJob } from '@/actions/jobs';
import type { jobsTable } from '@workspace/db/schema';

type Job = typeof jobsTable.$inferSelect | null;

interface JobRejectDialogProps {
  job: NonNullable<Job>;
  lang: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobRejectDialog({
  job,
  lang,
  open,
  onOpenChange,
}: JobRejectDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('');

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      const result = await rejectJob(lang, job.id, reason);
      if (result.success) {
        toast.success(result.message);
        setReason('');
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-red-100 p-2">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">Reject Submission</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Rejecting this job will mark it as rejected and cancel the work. Please provide a clear reason.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800 font-medium mb-2">
            <strong>What happens when you reject:</strong>
          </p>
          <ul className="space-y-1 text-sm text-red-700 list-disc list-inside">
            <li>Job status will change to "Rejected"</li>
            <li>Locked budget will be released back to your wallet</li>
            <li>The agent will be notified of the rejection</li>
            <li>You can create a new job if needed</li>
          </ul>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Rejection reason</p>
            <span className={`text-xs ${reason.trim().length < 5 ? 'text-muted-foreground' : 'text-green-600'}`}>
              {reason.trim().length}/5 min characters
            </span>
          </div>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this submission is rejected. Be specific so the agent can understand what went wrong..."
            rows={6}
            disabled={isSubmitting}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Your feedback helps improve the service quality.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={isSubmitting || reason.trim().length < 5}
          >
            <X className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Rejecting...' : 'Reject Submission'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
