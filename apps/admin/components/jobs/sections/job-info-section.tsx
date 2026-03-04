'use client';

import Link from 'next/link';
import {
  Calendar,
  DollarSign,
  FileText,
  Target,
  User,
  Bot,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { format } from 'date-fns';
import { JobAdminActionsSection } from './job-admin-actions-section';
import type { AdminJob } from '@/actions/jobs';

type JobInfoSectionProps = {
  job: AdminJob;
  lang?: string;
};

function truncateId(id: string, length = 8) {
  if (id.length <= length) return id;
  return `${id.slice(0, length)}…`;
}

export function JobInfoSection({ job, lang = 'en' }: JobInfoSectionProps) {
  const budget = parseFloat(job.budget);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-muted-foreground" />
              Goal
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {job.goal}
            </p>
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Task
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {job.task}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Details Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1 rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                Budget
              </p>
              <p className="text-sm font-semibold">
                ${budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-1 rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Deadline
              </p>
              <p className="text-sm font-medium">
                {job.deadline
                  ? format(new Date(job.deadline), 'PP')
                  : 'No deadline'}
              </p>
            </div>
            <div className="space-y-1 rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Hirer
              </p>
              <Link
                href={`/${lang}/accounts/${job.humanId}`}
                className="font-mono text-xs text-primary hover:underline"
              >
                {truncateId(job.humanId)}…
              </Link>
            </div>
            {job.agentId && (
              <div className="space-y-1 rounded-lg border border-border/50 bg-muted/30 p-3">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Bot className="h-3.5 w-3.5" />
                  Agent
                </p>
                <Link
                  href={`/${lang}/agents/${job.agentId}`}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  {truncateId(job.agentId)}…
                </Link>
              </div>
            )}
          </div>
          {(job.revisionCount !== null || (job.allowedTools && job.allowedTools.length > 0)) && (
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4">
              {job.revisionCount !== null && (
                <div>
                  <span className="text-xs text-muted-foreground">Revisions: </span>
                  <span className="text-sm font-medium">
                    {job.revisionCount} / {job.maxRevisions || 2}
                  </span>
                </div>
              )}
              {job.allowedTools && job.allowedTools.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Tools:</span>
                  {job.allowedTools.map((tool, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {tool}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Card */}
      {job.output && (
        <Card
          className={
            job.status === 'in_review'
              ? 'border-primary/50 ring-2 ring-primary/20'
              : ''
          }
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Work Output
                {job.status === 'in_review' && (
                  <Badge variant="warning" size="sm" className="animate-pulse">
                    Awaiting Review
                  </Badge>
                )}
              </CardTitle>
              {job.status === 'in_review' && (job.revisionCount || 0) > 0 && (
                <Badge variant="outline" size="sm">
                  Revision {job.revisionCount} of {job.maxRevisions}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`rounded-md border p-4 ${
                job.status === 'in_review'
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border/50 bg-muted/30'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{job.output}</p>
            </div>
            {job.outputFiles && job.outputFiles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Files:</span>
                {job.outputFiles.map((file, index) => (
                  <Badge key={index} variant="outline" size="sm">
                    {file}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {job.publishedAt && (
              <div className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
                <CheckCircle className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Published</p>
                  <p className="text-sm font-medium">
                    {format(new Date(job.publishedAt), 'PPp')}
                  </p>
                </div>
              </div>
            )}
            {job.confirmedAt && (
              <div className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
                <CheckCircle className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Confirmed</p>
                  <p className="text-sm font-medium">
                    {format(new Date(job.confirmedAt), 'PPp')}
                  </p>
                </div>
              </div>
            )}
            {job.completedAt && (
              <div className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
                <CheckCircle className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-sm font-medium">
                    {format(new Date(job.completedAt), 'PPp')}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
              <Clock className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {job.updatedAt
                    ? format(new Date(job.updatedAt), 'PPp')
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {job.status !== 'completed' && (
        <JobAdminActionsSection job={job} lang={lang} />
      )}
    </div>
  );
}
