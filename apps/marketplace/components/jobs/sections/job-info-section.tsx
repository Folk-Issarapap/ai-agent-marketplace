"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Bot,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  ExternalLink,
  FileText,
  Check,
  Pencil,
  QrCode,
  Rocket,
  RotateCcw,
  Star,
  Target,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { publishJob, confirmPayment } from "@/actions/jobs";
import { JobApproveDialog } from "../dialogs/job-approve-dialog";
import { JobCancelDialog } from "../dialogs/job-cancel-dialog";
import { JobEditRatingDialog } from "../dialogs/job-edit-rating-dialog";
import { JobRejectDialog } from "../dialogs/job-reject-dialog";
import { JobRevertToDraftDialog } from "../dialogs/job-revert-to-draft-dialog";
import { JobRequestRevisionDialog } from "../dialogs/job-request-revision-dialog";
import { StarRating } from "@/components/style-guide/star-rating";
import { AgentSelectionSection } from "./agent-selection-section";
import { AssignedAgentSection } from "./assigned-agent-section";
import { JobProgressSection } from "./job-progress-section";
import type {
  jobsTable,
  aiAgentsTable,
  reviewsTable,
} from "@workspace/db/schema";

type Job = typeof jobsTable.$inferSelect;
type Review = typeof reviewsTable.$inferSelect;

type LockedBudgetRow = {
  id: string;
  jobId: string;
  humanId: string;
  amount: string;
  usedAmount: string | null;
  status: string;
  lockedAt: Date | null;
  releasedAt: Date | null;
};

type PaymentInstructionRow = {
  id: string;
  jobId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: string;
  referenceNumber: string;
  createdAt: Date | null;
  confirmedAt: Date | null;
};

type JobInfoSectionProps = {
  job: Job;
  agent?: typeof aiAgentsTable.$inferSelect | null;
  review?: Review | null;
  /** True when payment has been processed (e.g. locked_budget status = used). Review only shown when completed + paymentProcessed. */
  paymentProcessed?: boolean;
  /** Locked budget record for completed jobs (payment steps UI) */
  lockedBudget?: LockedBudgetRow | null;
  /** Payment instructions for payment_pending jobs */
  paymentInstructions?: PaymentInstructionRow | null;
  lang: string;
};

const statusColors: Record<
  string,
  "primary" | "secondary" | "destructive" | "outline"
> = {
  draft: "outline",
  published: "primary",
  matching: "primary",
  pending_confirmation: "primary",
  active: "primary",
  in_review: "primary",
  payment_pending: "primary",
  completed: "secondary",
  cancelled: "destructive",
  rejected: "destructive",
};

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-lg border border-border/50 bg-muted/30 p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm font-medium break-all">{value}</div>
    </div>
  );
}

export function JobInfoSection({
  job,
  agent,
  review,
  paymentProcessed = false,
  lockedBudget = null,
  paymentInstructions = null,
  lang,
}: JobInfoSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isEditRatingDialogOpen, setIsEditRatingDialogOpen] = useState(false);

  const formattedStatus = job.status
    .replace("_", " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
  const budget = parseFloat(job.budget || "0");

  const handlePublish = () => {
    startTransition(async () => {
      const result = await publishJob(lang, job.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/60 p-3 shadow-sm backdrop-blur-sm">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${lang}/jobs`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant={statusColors[job.status] || "outline"}>
            {formattedStatus}
          </Badge>

          {job.status === "draft" && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${lang}/jobs/${job.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button size="sm" onClick={handlePublish} disabled={isPending}>
                <Rocket className="mr-2 h-4 w-4" />
                {isPending ? "Publishing..." : "Publish"}
              </Button>
            </>
          )}

          {(job.status === "published" || job.status === "matching") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelDialogOpen(true)}
              disabled={isPending}
            >
              Cancel Job
            </Button>
          )}

          {job.status === "cancelled" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRevertDialogOpen(true)}
              disabled={isPending}
            >
              Revert to Draft
            </Button>
          )}
        </div>
      </div>

      <JobApproveDialog
        job={job}
        lang={lang}
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
      />
      <JobCancelDialog
        job={job}
        lang={lang}
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      />
      <JobRequestRevisionDialog
        job={job}
        lang={lang}
        open={isRevisionDialogOpen}
        onOpenChange={setIsRevisionDialogOpen}
      />
      <JobRejectDialog
        job={job}
        lang={lang}
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      />
      <JobRevertToDraftDialog
        job={job}
        lang={lang}
        open={isRevertDialogOpen}
        onOpenChange={setIsRevertDialogOpen}
      />
      {job.status === "completed" && paymentProcessed && (
        <JobEditRatingDialog
          job={job}
          review={review ?? null}
          lang={lang}
          open={isEditRatingDialogOpen}
          onOpenChange={setIsEditRatingDialogOpen}
        />
      )}

      {agent && (
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Assigned Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
              <p className="font-medium">{agent.name}</p>
              {agent.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {agent.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-foreground">
                    {parseFloat(agent.rating || "0").toFixed(1)}
                  </span>
                  <span>/ 5</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="font-medium text-foreground">
                    {agent.completedJobs ?? 0}
                  </span>
                  <span>completed jobs</span>
                </span>
                {agent.price != null && agent.price !== "" && (
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium text-foreground">
                      ${parseFloat(agent.price).toFixed(2)}
                    </span>
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/${lang}/agents/${agent.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Agent Profile
                  </Link>
                </Button>
                {job.status === "completed" && paymentProcessed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditRatingDialogOpen(true)}
                    disabled={isPending}
                  >
                    <Star className="mr-2 h-4 w-4 text-yellow-500" />
                    Review
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(job.status === "published" || job.status === "matching") &&
        !job.agentId && <AgentSelectionSection job={job} lang={lang} />}

      {(job.status === "pending_confirmation" || job.status === "active") &&
        job.agentId &&
        agent && <AssignedAgentSection job={job} agent={agent} lang={lang} />}

      {job.status === "active" && <JobProgressSection job={job} lang={lang} />}

      {job.status === "revision_requested" && (
        <JobProgressSection job={job} lang={lang} />
      )}

      {job.status === "payment_pending" && paymentInstructions && (
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-background to-amber-500/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-amber-600" />
              Payment Steps
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Transfer according to the details below, then confirm payment
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Bank Transfer
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank</span>
                    <span className="font-medium">{paymentInstructions.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Account No.</span>
                    <span className="font-mono font-medium">{paymentInstructions.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Name</span>
                    <span className="font-medium">{paymentInstructions.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-amber-600">
                      $
                      {parseFloat(paymentInstructions.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-muted-foreground">Ref.</span>
                    <span className="font-mono text-xs">{paymentInstructions.referenceNumber}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  QR PromptPay
                </p>
                <div className="aspect-square max-w-[160px] mx-auto rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30">
                  <div className="text-center">
                    <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">QR Code</p>
                    <p className="text-xs text-muted-foreground">(Mock)</p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const result = await confirmPayment(lang, job.id);
                  if (result.success) {
                    toast.success(result.message);
                    router.refresh();
                  } else {
                    toast.error(result.message);
                  }
                });
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              {isPending ? "Confirming..." : "Confirm Payment"}
            </Button>
          </CardContent>
        </Card>
      )}

      {job.status === "in_review" && (
        <Card className="p-4 border-primary/50 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-lg ring-2 ring-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Review & Approval</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please review the work output and take action
                  </p>
                </div>
              </div>
              <Badge variant="primary" className="animate-pulse">
                In Review
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Revision Status</p>
                <Badge variant="outline" className="bg-background">
                  {job.revisionCount || 0} / {job.maxRevisions || 2} revisions
                  used
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {job.revisionCount === 0
                    ? "Initial submission - first review"
                    : `Revision ${job.revisionCount} - reviewing updated work`}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => setIsApproveDialogOpen(true)}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve & Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRevisionDialogOpen(true)}
                disabled={
                  isPending ||
                  (job.revisionCount || 0) >= (job.maxRevisions || 2)
                }
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Request Revision
                {(job.revisionCount || 0) > 0 && (
                  <span className="ml-1 text-xs">
                    ({(job.maxRevisions || 2) - (job.revisionCount || 0)} left)
                  </span>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsRejectDialogOpen(true)}
                disabled={isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Job Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Job ID" value={job.id} />
            <InfoItem
              label="Status"
              value={
                <Badge variant={statusColors[job.status] || "outline"}>
                  {formattedStatus}
                </Badge>
              }
            />
            <InfoItem
              label="Budget"
              value={`$${budget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
            <InfoItem
              label="Deadline"
              value={
                job.deadline
                  ? format(new Date(job.deadline), "PPpp")
                  : "No deadline"
              }
            />
            <InfoItem
              label="Created At"
              value={
                job.createdAt
                  ? format(new Date(job.createdAt), "PPpp")
                  : "Unknown"
              }
            />
            <InfoItem
              label="Updated At"
              value={
                job.updatedAt
                  ? format(new Date(job.updatedAt), "PPpp")
                  : "Unknown"
              }
            />
            <InfoItem
              label="Revisions"
              value={`${job.revisionCount || 0} / ${job.maxRevisions || 2}`}
            />
            <InfoItem label="Human ID" value={job.humanId} />
            <InfoItem label="Agent ID" value={job.agentId || "-"} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {job.goal}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Task Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {job.task}
          </p>
        </CardContent>
      </Card>

      {job.allowedTools && job.allowedTools.length > 0 && (
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Allowed Tools</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {job.allowedTools.map((tool: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="border-primary/20 bg-primary/5"
              >
                {tool}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {job.output && (
        <Card
          className={`border-border/60 bg-card/60 shadow-sm ${job.status === "in_review" ? "border-primary/50 ring-2 ring-primary/20" : ""}`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Work Output
                {job.status === "in_review" && (
                  <Badge variant="primary" className="ml-2 animate-pulse">
                    Awaiting Review
                  </Badge>
                )}
              </CardTitle>
              {job.status === "in_review" && (job.revisionCount || 0) > 0 && (
                <Badge variant="outline" className="text-xs">
                  Revision {job.revisionCount} of {job.maxRevisions}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`rounded-md border p-4 ${
                job.status === "in_review"
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/50 bg-muted/30"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {job.output}
              </p>
            </div>
            {job.outputFiles && job.outputFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Attached Files:
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.outputFiles.map((file: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-muted/50"
                    >
                      {file}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {job.status === "in_review" && !job.output && (
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Awaiting Output</h3>
            <p className="text-sm text-muted-foreground">
              The agent is preparing the work output. Please check back soon.
            </p>
          </CardContent>
        </Card>
      )}

      {job.status === "completed" && (
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 via-background to-green-500/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-green-600" />
              Payment Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 p-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">1. Budget locked</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Budget locked when agent was confirmed
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    $
                    {parseFloat(String(lockedBudget?.amount ?? job.budget ?? "0")).toLocaleString(
                      "en-US",
                      { minimumFractionDigits: 2 }
                    )}
                  </p>
                  {job.confirmedAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(new Date(job.confirmedAt), "PPpp")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 p-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  {paymentProcessed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    2. {paymentProcessed ? "Payment completed" : "Awaiting payment"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {paymentProcessed
                      ? "Payment transferred to agent"
                      : "Payment will process when you approve the work"}
                  </p>
                  {paymentProcessed && (
                    <>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        $
                        {parseFloat(
                          String(lockedBudget?.usedAmount ?? job.budget ?? "0")
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        paid to agent
                      </p>
                      {(lockedBudget?.releasedAt ?? job.completedAt) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {format(
                            new Date(lockedBudget?.releasedAt ?? job.completedAt!),
                            "PPpp"
                          )}
                        </p>
                      )}
                      {paymentInstructions?.referenceNumber && (
                        <p className="mt-1 text-xs text-muted-foreground font-mono">
                          Ref: {paymentInstructions.referenceNumber}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoItem
              label="Published At"
              value={
                job.publishedAt
                  ? format(new Date(job.publishedAt), "PPpp")
                  : "-"
              }
            />
            <InfoItem
              label="Confirmed At"
              value={
                job.confirmedAt
                  ? format(new Date(job.confirmedAt), "PPpp")
                  : "-"
              }
            />
            <InfoItem
              label="Completed At"
              value={
                job.completedAt
                  ? format(new Date(job.completedAt), "PPpp")
                  : "-"
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
