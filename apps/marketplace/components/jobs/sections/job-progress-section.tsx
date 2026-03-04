"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle, FileText, AlertCircle, Play } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { simulateAgentWork } from "@/actions/jobs";
import type { jobsTable } from "@workspace/db/schema";

type Job = typeof jobsTable.$inferSelect;

interface JobProgressSectionProps {
  job: Job;
  lang?: string;
}

export function JobProgressSection({
  job,
  lang = "en",
}: JobProgressSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSimulateWork = () => {
    startTransition(async () => {
      const result = await simulateAgentWork(lang, job.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };
  // Calculate progress based on status
  const getProgress = () => {
    switch (job.status) {
      case "draft":
        return {
          step: 0,
          label: "Draft",
          description: "Job is being prepared",
        };
      case "published":
      case "matching":
        return {
          step: 1,
          label: "Published",
          description: "Looking for matching agents",
        };
      case "pending_confirmation":
        return {
          step: 2,
          label: "Agent Assigned",
          description: "Awaiting your confirmation",
        };
      case "active":
        return {
          step: 3,
          label: "In Progress",
          description: "Agent is working on the job",
        };
      case "in_review":
        return {
          step: 4,
          label: "Under Review",
          description: "Work submitted, awaiting your review",
        };
      case "completed":
        return {
          step: 5,
          label: "Completed",
          description: "Job has been completed successfully",
        };
      case "revision_requested":
        return {
          step: 3,
          label: "Revision Requested",
          description: "Agent is revising the work",
        };
      default:
        return { step: 0, label: "Unknown", description: "" };
    }
  };

  const progress = getProgress();
  const totalSteps = 5;
  const progressPercentage = (progress.step / totalSteps) * 100;

  return (
    <Card className="p-4 border-primary/50 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-lg ring-2 ring-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Job Progress</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {progress.description}
              </p>
            </div>
          </div>
          <Badge variant="primary">{progress.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Status Steps */}
        <div className="space-y-3 pt-2">
          {[
            {
              step: 1,
              label: "Published",
              icon: CheckCircle,
              status: [
                "published",
                "matching",
                "pending_confirmation",
                "active",
                "in_review",
                "completed",
                "revision_requested",
              ],
            },
            {
              step: 2,
              label: "Agent Assigned",
              icon: CheckCircle,
              status: [
                "pending_confirmation",
                "active",
                "in_review",
                "completed",
                "revision_requested",
              ],
            },
            {
              step: 3,
              label: "In Progress",
              icon: Clock,
              status: [
                "active",
                "in_review",
                "completed",
                "revision_requested",
              ],
            },
            {
              step: 4,
              label: "Under Review",
              icon: FileText,
              status: ["in_review", "completed"],
            },
            {
              step: 5,
              label: "Completed",
              icon: CheckCircle,
              status: ["completed"],
            },
          ].map((stepInfo) => {
            const isCompleted = stepInfo.status.includes(job.status);
            const isCurrent = stepInfo.step === progress.step;
            const Icon = stepInfo.icon;

            return (
              <div
                key={stepInfo.step}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  isCurrent
                    ? "bg-primary/10 border border-primary/30"
                    : isCompleted
                      ? "bg-muted/30"
                      : "opacity-50"
                }`}
              >
                <div
                  className={`rounded-full p-1.5 ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span
                  className={`text-sm ${
                    isCurrent
                      ? "font-semibold text-primary"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {stepInfo.label}
                </span>
                {isCurrent && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    Current
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Info for Active Status */}
        {(job.status === "active" || job.status === "revision_requested") && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">
                  {job.status === "revision_requested"
                    ? "Agent is revising the work"
                    : "Agent is working on your job"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {job.status === "revision_requested"
                    ? "The agent is updating the output based on your feedback."
                    : "The assigned agent is currently processing your job. You will be notified when the work is submitted for review."}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateWork}
              disabled={isPending}
              className="border-dashed border-primary/50 text-primary hover:bg-primary/10"
            >
              <Play className="mr-2 h-4 w-4" />
              {isPending ? "Submitting..." : "Simulate Agent Work (Demo)"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
