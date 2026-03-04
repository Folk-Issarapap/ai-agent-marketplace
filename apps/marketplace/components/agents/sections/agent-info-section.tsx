import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ArrowLeft, Briefcase, DollarSign, MessageSquare, Star, Wrench } from "lucide-react";
import { StarRating } from "@/components/style-guide/star-rating";
import type { aiAgentsTable, jobsTable, reviewsTable } from "@workspace/db/schema";

type Agent = typeof aiAgentsTable.$inferSelect;
type Job = typeof jobsTable.$inferSelect;
type Review = typeof reviewsTable.$inferSelect;

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-lg border border-border/50 bg-muted/30 p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm font-medium break-all">{value}</div>
    </div>
  );
}

export function AgentInfoSection({
  agent,
  related,
  jobs = [],
  reviews = [],
  lang,
}: {
  agent: Agent;
  related: Agent[];
  jobs?: Job[];
  reviews?: Review[];
  lang: string;
}) {
  const rating = parseFloat(agent.rating || "0");
  const price = agent.price ? parseFloat(agent.price) : null;
  const reviewByJobId = new Map(reviews.map((r) => [r.jobId, r]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/60 p-3 shadow-sm backdrop-blur-sm">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${lang}/agents`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Link>
        </Button>

        <Button asChild>
          <Link href={`/${lang}/jobs/create?agentId=${agent.id}`}>Create Job With This Agent</Link>
        </Button>
      </div>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Agent Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Agent ID" value={agent.id} />
            <InfoItem
              label="Status"
              value={<Badge variant={agent.status === "active" ? "primary" : "outline"}>{agent.status}</Badge>}
            />
            <InfoItem
              label="Creator ID"
              value={<span className="text-xs font-mono">{agent.creatorId}</span>}
            />
            <InfoItem
              label="Rating"
              value={
                <span title="Average of all job ratings">
                  {rating.toFixed(2)}
                  {reviews.length > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">({reviews.length} reviews)</span>
                  )}
                </span>
              }
            />
            <InfoItem label="Total Jobs" value={agent.totalJobs || 0} />
            <InfoItem label="Completed Jobs" value={agent.completedJobs || 0} />
            <InfoItem label="Pricing Model" value={agent.pricingModel || "custom"} />
            <InfoItem label="Price" value={price !== null ? `$${price.toFixed(2)}` : "Custom"} />
            <InfoItem
              label="Created At"
              value={agent.createdAt ? format(new Date(agent.createdAt), "PPpp") : "Unknown"}
            />
          </div>
        </CardContent>
      </Card>

      {(reviews.length > 0 || rating > 0) && (
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Reviews
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Average rating from completed jobs. Each review is from a job owner after the job was completed.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/50 bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <StarRating rating={rating} size="lg" />
                <span className="text-2xl font-bold tabular-nums">{rating.toFixed(1)}</span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
              {reviews.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  from {reviews.length} reviews
                </span>
              )}
            </div>
            {reviews.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Recent reviews</p>
                <ul className="space-y-3">
                  {reviews.slice(0, 10).map((r) => (
                    <li
                      key={r.id}
                      className="rounded-lg border border-border/50 bg-muted/10 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <StarRating rating={r.rating} size="sm" />
                          <span className="text-sm font-medium">{r.rating}/5</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {r.createdAt ? format(new Date(r.createdAt), "PP") : ""}
                        </span>
                      </div>
                      {r.comment && (
                        <p className="mt-2 text-sm text-muted-foreground flex items-start gap-1.5">
                          <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                          <span className="whitespace-pre-wrap">{r.comment}</span>
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
                {reviews.length > 10 && (
                  <p className="text-xs text-muted-foreground">
                    Showing latest 10 of {reviews.length} reviews
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {agent.description || "No description provided."}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {agent.capabilities || "No capabilities provided."}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Skills</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {agent.skills && agent.skills.length > 0 ? (
            agent.skills.map((skill, i) => (
              <Badge key={i} variant="outline" className="border-primary/20 bg-primary/5">
                <Wrench className="mr-1 h-3 w-3" />
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No skills listed.</p>
          )}
        </CardContent>
      </Card>

      {jobs.length > 0 && (
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Jobs</CardTitle>
            <p className="text-sm text-muted-foreground">
              Jobs this agent has worked on. Each rating is from the job review; the overall agent rating above is the
              average of these.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {jobs.map((job) => {
                const review = reviewByJobId.get(job.id);
                return (
                  <li key={job.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{job.title || job.goal || job.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {job.status}
                        {job.completedAt
                          ? ` • Completed ${format(new Date(job.completedAt), "PP")}`
                          : job.updatedAt
                            ? ` • Updated ${format(new Date(job.updatedAt), "PP")}`
                            : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {review != null ? (
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {review.rating}/5
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">No rating</span>
                      )}
                      <Button asChild variant="ghost" size="sm" className="h-8 px-2">
                        <Link href={`/${lang}/jobs/${job.id}`}>View</Link>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {related.length > 0 && (
        <Card className="border-border/60 bg-card/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Related Agents</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {related.map((r) => (
              <div key={r.id} className="rounded-lg border border-border/50 bg-muted/20 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{r.description || "No description"}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500" />
                    {parseFloat(r.rating || "0").toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {r.completedJobs || 0}
                  </span>
                  <Button asChild variant="ghost" size="sm" className="h-7 px-2">
                    <Link href={`/${lang}/agents/${r.id}`}>Open</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
