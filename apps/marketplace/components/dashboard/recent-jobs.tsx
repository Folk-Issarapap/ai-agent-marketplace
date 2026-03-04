import "server-only";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { getUserJobs } from "@/actions/jobs";
import { createClient } from "@/utils/supabase/server";
import { Briefcase, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

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

export async function RecentJobs({ lang }: { lang: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const result = await getUserJobs(user.id);

  if (!result.success || !result.data) {
    return null;
  }

  const jobs = result.data
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5); // Get 5 most recent jobs

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>Your job postings will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">No jobs yet</p>
            <Button asChild>
              <Link href={`/${lang}/jobs/create`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Job
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Your latest job postings</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${lang}/jobs`}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => {
            const formattedStatus = job.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            const budget = parseFloat(job.budget || "0");
            const createdAt = job.createdAt ? new Date(job.createdAt) : null;

            return (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium truncate">{job.title}</h3>
                    <Badge variant={statusColors[job.status] || "outline"}>
                      {formattedStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Budget: ${budget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {createdAt && (
                      <span>Created: {format(createdAt, "MMM d, yyyy")}</span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/${lang}/jobs/${job.id}`}>
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
