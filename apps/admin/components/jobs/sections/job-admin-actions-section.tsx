'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { toast } from 'sonner';
import {
  Shield,
  X,
  Check,
  RotateCcw,
  UserMinus,
  UserPlus,
  FileOutput,
  DollarSign,
} from 'lucide-react';
import {
  adminCancelJob,
  adminRejectJob,
  adminApproveJob,
  adminReleaseBudget,
  adminUnassignAgent,
  adminAssignAgent,
  adminSubmitWork,
} from '@/actions/jobs';
import { getAgents } from '@/actions/agents';
import type { AdminJob } from '@/actions/jobs';
import { useEffect } from 'react';

type JobAdminActionsSectionProps = {
  job: AdminJob;
  lang: string;
};

export function JobAdminActionsSection({ job, lang }: JobAdminActionsSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [submitContent, setSubmitContent] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [agents, setAgents] = useState<Array<{ id: string; name: string; status: string }>>([]);

  useEffect(() => {
    getAgents(1, 100, { status: 'active' }).then((res) => {
      if (res.success && res.data?.data) {
        setAgents(
          res.data.data.map((a) => ({ id: a.id, name: a.name || a.id, status: a.status }))
        );
      }
    });
  }, []);

  const runAction = (
    fn: () => Promise<{ success: boolean; message?: string }>,
    successMsg?: string
  ) => {
    startTransition(async () => {
      try {
        const result = await fn();
        if (result.success) {
          toast.success(successMsg || result.message || 'Done.');
          router.refresh();
          setCancelDialogOpen(false);
          setRejectDialogOpen(false);
          setSubmitDialogOpen(false);
          setAssignDialogOpen(false);
          setCancelReason('');
          setRejectReason('');
          setSubmitContent('');
          setSelectedAgentId('');
        } else {
          console.error('[Admin Job Action] Failed:', result.message || result);
          toast.error(result.message || 'Action failed. See browser console for details.');
        }
      } catch (err) {
        console.error('[Admin Job Action] Error:', err);
        const msg =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'message' in err
              ? String((err as { message: unknown }).message)
              : 'Unexpected error (see console)';
        toast.error(msg || 'Action failed. See browser console (F12) for details.');
      }
    });
  };

  const cancellable = ['draft', 'published', 'matching', 'pending_confirmation', 'active'].includes(
    job.status || ''
  );
  const canReject = job.status === 'in_review';
  const canApprove = job.status === 'in_review';
  const canUnassign = job.status === 'pending_confirmation' && job.agentId;
  const canAssign = ['published', 'matching'].includes(job.status || '');
  const canSubmitWork = ['active', 'revision_requested'].includes(job.status || '') && job.agentId;

  return (
    <>
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-amber-600" />
            Admin Actions
          </CardTitle>
          <CardDescription>
            Support customer when they cannot use the marketplace. All actions are logged.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {cancellable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelDialogOpen(true)}
              disabled={isPending}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel Job
            </Button>
          )}
          {canReject && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectDialogOpen(true)}
              disabled={isPending}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <X className="mr-2 h-4 w-4" />
              Reject (Release Budget)
            </Button>
          )}
          {canApprove && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setApproveDialogOpen(true)}
              disabled={isPending}
              className="border-green-500/50 text-green-600 hover:bg-green-500/10"
            >
              <Check className="mr-2 h-4 w-4" />
              Approve Job
            </Button>
          )}
          {canUnassign && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                runAction(() => adminUnassignAgent(lang, job.id), 'Agent unassigned.')
              }
              disabled={isPending}
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Unassign Agent
            </Button>
          )}
          {canAssign && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignDialogOpen(true)}
              disabled={isPending || agents.length === 0}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Agent
            </Button>
          )}
          {canSubmitWork && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmitDialogOpen(true)}
              disabled={isPending}
            >
              <FileOutput className="mr-2 h-4 w-4" />
              Submit Work
            </Button>
          )}
          {(job.status === 'active' || job.status === 'in_review') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                runAction(
                  () => adminReleaseBudget(lang, job.id),
                  'Budget released.'
                )
              }
              disabled={isPending}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Release Budget
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Job (Admin)</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the work and process payment from the customer&apos;s wallet. Budget
              will be deducted. This action is logged for audit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                runAction(() => adminApproveJob(lang, job.id), 'Job approved. Payment processed.')
              }
              disabled={isPending}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isPending ? 'Approving...' : 'Approve & Process Payment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Job (Admin)</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the job. If budget was locked, it will be released. This action is
              logged for audit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="cancel-reason">Reason (optional)</Label>
            <Textarea
              id="cancel-reason"
              placeholder="e.g. Customer support request"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={2}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                runAction(
                  () => adminCancelJob(lang, job.id, cancelReason || undefined),
                  'Job cancelled.'
                )
              }
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Cancelling...' : 'Cancel Job'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Job (Admin)</AlertDialogTitle>
            <AlertDialogDescription>
              Reject the work and release locked budget back to the customer. This action is logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="reject-reason">Reason (optional)</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Customer requested rejection via support"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                runAction(
                  () => adminRejectJob(lang, job.id, rejectReason.trim() || undefined),
                  'Job rejected. Budget released.'
                )
              }
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Rejecting...' : 'Reject Job'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Work Dialog */}
      <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Work (Admin)</AlertDialogTitle>
            <AlertDialogDescription>
              Submit work on behalf of the agent. Job will move to in_review for customer to
              approve. Use when agent failed to submit or for manual resolution.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="submit-content">Work output (required, min 10 chars)</Label>
            <Textarea
              id="submit-content"
              placeholder="Enter the work output/content to submit..."
              value={submitContent}
              onChange={(e) => setSubmitContent(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (submitContent.trim().length < 10) {
                  toast.error('Content must be at least 10 characters');
                  return;
                }
                runAction(
                  () => adminSubmitWork(lang, job.id, submitContent),
                  'Work submitted. Job in review.'
                );
              }}
              disabled={isPending || submitContent.trim().length < 10}
            >
              {isPending ? 'Submitting...' : 'Submit Work'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Agent Dialog */}
      <AlertDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Agent (Admin)</AlertDialogTitle>
            <AlertDialogDescription>
              Assign an agent to this job. Job will move to pending_confirmation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="agent-select">Select Agent</Label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger id="agent-select">
                <SelectValue placeholder="Choose an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!selectedAgentId) {
                  toast.error('Please select an agent');
                  return;
                }
                runAction(
                  () => adminAssignAgent(lang, job.id, selectedAgentId),
                  'Agent assigned.'
                );
              }}
              disabled={isPending || !selectedAgentId}
            >
              {isPending ? 'Assigning...' : 'Assign Agent'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
