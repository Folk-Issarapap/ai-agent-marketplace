'use client';

import { useState } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Copy, Check, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { RingIcon } from '@workspace/ui/components/ring-icon';
import { Badge } from '@workspace/ui/components/badge';
import { JobDetailTabs } from '../job-detail-tabs';
import { format } from 'date-fns';
import type { AdminJob } from '@/actions/jobs';

const statusColors: Record<
  string,
  'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
> = {
  draft: 'outline',
  published: 'primary',
  matching: 'primary',
  pending_confirmation: 'primary',
  active: 'primary',
  in_review: 'warning',
  completed: 'success',
  cancelled: 'destructive',
  rejected: 'destructive',
};

interface JobHeroSectionProps {
  job: AdminJob;
  jobId: string;
  lang: string;
}

export function JobHeroSection({ job, jobId, lang }: JobHeroSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(job.id);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const formattedStatus = job.status
    .replace('_', ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const budget = parseFloat(job.budget);
  const formattedCreatedAt = job.createdAt
    ? format(new Date(job.createdAt), 'PPp')
    : '-';
  const formattedDeadline = job.deadline
    ? format(new Date(job.deadline), 'PP')
    : '-';

  return (
    <Card>
      <CardContent>
        <div className="space-y-6">
          {/* Title */}
          <div className="flex items-center gap-4">
            <RingIcon icon={Briefcase} size="lg" />
            <h2 className="text-2xl font-semibold tracking-tight">Job Details</h2>
          </div>

          {/* Top Row: Status and Primary Value */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={statusColors[job.status] || 'outline'} size="lg">
                {formattedStatus}
              </Badge>
              <div>
                <p className="text-2xl font-bold">{job.title}</p>
              </div>
            </div>
          </div>

          {/* Identifier with Copy */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">ID</p>
            <p className="text-sm font-medium font-mono">{job.id}</p>
            <Button variant="ghost" size="sm" onClick={handleCopyId} className="h-6 w-6 p-0">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>

          {/* Quick Info Grid */}
          <div className="grid gap-4 border-t pt-4 md:grid-cols-2 lg:grid-cols-4 break-all">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="text-sm font-medium">
                ${budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Deadline</p>
              <p className="text-sm font-medium">{formattedDeadline}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={statusColors[job.status] || 'outline'} size="sm">
                {formattedStatus}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{formattedCreatedAt}</p>
            </div>
          </div>

          {/* Tabs - Integrated inside hero */}
          <div className="border-t pt-4">
            <JobDetailTabs jobId={jobId} lang={lang} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
