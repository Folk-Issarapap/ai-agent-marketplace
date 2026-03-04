import { format } from "date-fns";
import { Sparkles, Briefcase, Plus, ArrowRight, Calendar, DollarSign, Clock, TrendingUp, Zap, Bot, Star } from "lucide-react";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { createClient } from "@/utils/supabase/server";
import { getJobsWithDetails } from "@/actions/jobs";

const statusColors: Record<string, "primary" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  published: "primary",
  matching: "primary",
  pending_confirmation: "primary",
  active: "primary",
  in_review: "primary",
  completed: "secondary",
  cancelled: "destructive",
  rejected: "destructive",
};

export default async function JobsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const result = await getJobsWithDetails(user.id);

  if (!result.success || !result.data) {
    return null;
  }

  const jobs = result.data.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  const agentMap: Record<string, { id: string; name: string } | null> = result.agentMap ?? {};
  const reviewMap: Record<string, { rating: number }> = result.reviewMap ?? {};

  return (
    <div className="space-y-8 pt-4">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_50%)]" />
        <div className="relative">
          <div className="flex items-center justify-between">
              <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Job Management
          </div>
              <h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Your Jobs
              </h1>
              <p className="text-base text-muted-foreground">
                View and manage all your job postings
              </p>
            </div>
            <Button asChild size="lg" className="shadow-lg">
              <Link href={`/${lang}/jobs/create`}>
                <Plus className="mr-2 h-5 w-5" />
                Create New Job
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {jobs.length === 0 ? (
        <Card className="border-border/50 bg-card/60 overflow-hidden">
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_50%)]" />
            <div className="relative flex flex-col items-center justify-center text-center">
              <div className="mb-6 rounded-full bg-primary/10 p-6">
                <Briefcase className="h-16 w-16 text-primary" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold">No Jobs Yet</h2>
              <p className="mb-8 max-w-md text-muted-foreground">
                You haven't created any jobs yet. Get started by creating your first job posting and let AI agents help you complete it.
              </p>
              <Button asChild size="lg" className="shadow-lg">
                <Link href={`/${lang}/jobs/create`}>
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Job
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Stats Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50 bg-card/60 hover:bg-card/80 transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                    <p className="text-3xl font-bold">{jobs.length}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/60 hover:bg-card/80 transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <p className="text-3xl font-bold">
                      {jobs.filter(j => ['published', 'matching', 'active', 'in_review'].includes(j.status)).length}
                    </p>
                  </div>
                  <div className="rounded-full bg-green-500/10 p-3">
                    <Zap className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/60 hover:bg-card/80 transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold">
                      {jobs.filter(j => j.status === 'completed').length}
                    </p>
                  </div>
                  <div className="rounded-full bg-secondary/10 p-3">
                    <TrendingUp className="h-6 w-6 text-secondary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/60 hover:bg-card/80 transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                    <p className="text-3xl font-bold">
                      ${jobs.reduce((sum, j) => sum + parseFloat(j.budget || "0"), 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-full bg-yellow-500/10 p-3">
                    <DollarSign className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          <div className="grid gap-4">
            {jobs.map((job) => {
              const formattedStatus = job.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
              const budget = parseFloat(job.budget || "0");
              const createdAt = job.createdAt ? new Date(job.createdAt) : null;

              return (
                <Card
                  key={job.id}
                  className="group border-border/50 bg-card/60 hover:bg-card/80 transition-all hover:shadow-lg hover:border-primary/20"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                            <Briefcase className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold truncate group-hover:text-primary transition-colors">
                                {job.title}
                              </h3>
                              <Badge variant={statusColors[job.status] || "outline"} className="shrink-0">
                                {formattedStatus}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {job.goal}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5">
                                <DollarSign className="h-4 w-4 text-primary" />
                                <span className="font-semibold">
                                  ${budget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              {createdAt && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{format(createdAt, "MMM d, yyyy")}</span>
                                </div>
                              )}
                              {job.deadline && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>Due: {format(new Date(job.deadline), "MMM d, yyyy")}</span>
                                </div>
                              )}
                              {job.agentId && agentMap[job.agentId] && (
                                <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5">
                                  <Bot className="h-4 w-4 text-primary" />
                                  <Link
                                    href={`/${lang}/agents/${agentMap[job.agentId]?.id ?? ""}`}
                                    className="font-medium text-primary hover:underline"
                                  >
                                    {agentMap[job.agentId]?.name}
                                  </Link>
                                </div>
                              )}
                              {reviewMap[job.id] !== undefined && (
                                <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="font-medium">{reviewMap[job.id]!.rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild className="shrink-0 group-hover:border-primary group-hover:text-primary transition-colors">
                        <Link href={`/${lang}/jobs/${job.id}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
