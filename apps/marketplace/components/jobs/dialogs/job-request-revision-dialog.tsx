'use client';

import { useState } from 'react';
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
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { requestJobRevision } from '@/actions/jobs';
import type { jobsTable } from '@workspace/db/schema';

type Job = typeof jobsTable.$inferSelect | null;

interface JobRequestRevisionDialogProps {
  job: NonNullable<Job>;
  lang: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobRequestRevisionDialog({
  job,
  lang,
  open,
  onOpenChange,
}: JobRequestRevisionDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleRequestRevision = async () => {
    setIsSubmitting(true);
    try {
      const result = await requestJobRevision(lang, job.id, feedback);
      if (result.success) {
        toast.success(result.message);
        setFeedback('');
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingRevisions = (job.maxRevisions || 2) - (job.revisionCount || 0);
  const canRequestRevision = remainingRevisions > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-orange-100 p-2">
              <RotateCcw className="h-5 w-5 text-orange-600" />
            </div>
            <AlertDialogTitle className="text-xl">Request Revision</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Provide clear feedback so the agent can improve the output.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!canRequestRevision && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-4">
            <p className="text-sm text-red-800 font-medium">
              Maximum revisions reached ({job.revisionCount}/{job.maxRevisions})
            </p>
            <p className="text-xs text-red-700 mt-1">
              You have reached the maximum number of revisions allowed for this job.
            </p>
          </div>
        )}

        {canRequestRevision && (
          <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="text-sm text-orange-800">
              <strong>Revisions remaining:</strong> {remainingRevisions} of {job.maxRevisions}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Revision feedback</p>
            <span className={`text-xs ${feedback.trim().length < 5 ? 'text-muted-foreground' : 'text-green-600'}`}>
              {feedback.trim().length}/5 min characters
            </span>
          </div>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Explain what should be improved, what's missing, or what needs to be changed..."
            rows={6}
            disabled={isSubmitting || !canRequestRevision}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Be specific and constructive. The agent will use this feedback to revise the work.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="outline"
            onClick={handleRequestRevision}
            disabled={isSubmitting || feedback.trim().length < 5 || !canRequestRevision}
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Request Revision'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
