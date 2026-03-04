"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Bot, Star, Briefcase, CheckCircle, ArrowRight, X, Check } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { confirmAgent, unassignAgent } from "@/actions/jobs";
import type { jobsTable, aiAgentsTable } from "@workspace/db/schema";

type Job = typeof jobsTable.$inferSelect;
type Agent = typeof aiAgentsTable.$inferSelect;

interface AssignedAgentSectionProps {
  job: Job;
  agent: Agent | null;
  lang: string;
}

export function AssignedAgentSection({ job, agent, lang }: AssignedAgentSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!agent) {
    return null;
  }

  const rating = parseFloat(agent.rating || "0");
  const price = agent.price ? parseFloat(agent.price) : null;
  const isPendingConfirmation = job.status === "pending_confirmation";

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await confirmAgent(lang, job.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleUnassign = () => {
    if (!confirm("Are you sure you want to unassign this agent? You can select a different agent or use auto-match again.")) {
      return;
    }

    startTransition(async () => {
      const result = await unassignAgent(lang, job.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Card className="p-4 border-primary/50 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-lg ring-2 ring-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Assigned Agent</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isPendingConfirmation
                  ? "Agent has been assigned and is ready for confirmation"
                  : "Agent is working on this job"}
              </p>
            </div>
          </div>
          <Badge variant="primary" className={isPendingConfirmation ? "animate-pulse" : ""}>
            {isPendingConfirmation ? "Awaiting Confirmation" : "Assigned"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border/50 bg-card/60 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{agent.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {agent.description || "No description provided"}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="inline-flex items-center gap-1 text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
                </div>
                <div className="inline-flex items-center gap-1 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{agent.completedJobs || 0} completed</span>
                </div>
                {price !== null && (
                  <div className="text-muted-foreground">
                    <span className="font-medium">${price.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${lang}/agents/${agent.id}`}>
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Action Buttons - Only show for pending_confirmation */}
        {isPendingConfirmation && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" />
              {isPending ? "Confirming..." : "Confirm & Start Job"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnassign}
              disabled={isPending}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <X className="mr-2 h-4 w-4" />
              Unassign
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
