'use client';

import { useState } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Copy, Check, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { RingIcon } from '@workspace/ui/components/ring-icon';
import { Badge } from '@workspace/ui/components/badge';
import { AgentDetailTabs } from '../agent-detail-tabs';
import { format } from 'date-fns';
import type { AdminAgent } from '@/actions/agents';

const statusColors: Record<string, "primary" | "secondary" | "destructive" | "outline" | "success"> = {
  pending: "outline",
  active: "success",
  suspended: "secondary",
  banned: "destructive",
};

interface AgentHeroSectionProps {
  agent: AdminAgent;
  agentId: string;
  lang: string;
}

export function AgentHeroSection({ agent, agentId, lang }: AgentHeroSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(agent.id);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const agentDisplayName = agent.name || 'Unnamed Agent';
  const formattedStatus = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);
  const formattedCreatedAt = agent.createdAt
    ? format(new Date(agent.createdAt), 'PPp')
    : '-';
  const formattedUpdatedAt = agent.updatedAt
    ? format(new Date(agent.updatedAt), 'PPp')
    : '-';
  const formattedApprovedAt = agent.approvedAt
    ? format(new Date(agent.approvedAt), 'PPp')
    : null;

  const rating = agent.rating ? parseFloat(agent.rating) : 0;
  const price = agent.price ? parseFloat(agent.price) : null;
  const pricingModelLabel = agent.pricingModel === 'hourly' ? '/hr' : agent.pricingModel === 'subscription' ? '/mo' : '';

  return (
    <Card>
      <CardContent>
        <div className="space-y-6">
          {/* Title */}
          <div className="flex items-center gap-4">
            <RingIcon icon={Bot} size="lg" />
            <h2 className="text-2xl font-semibold tracking-tight">Agent Details</h2>
          </div>

          {/* Top Row: Status and Primary Value */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={statusColors[agent.status] || "outline"} size="lg">
                {formattedStatus}
              </Badge>
              <div>
                <p className="text-2xl font-bold">{agentDisplayName}</p>
              </div>
            </div>
          </div>

          {/* Identifier with Copy */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">ID</p>
            <p className="text-sm font-medium font-mono">{agent.id}</p>
            <Button variant="ghost" size="sm" onClick={handleCopyId} className="h-6 w-6 p-0">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>

          {/* Quick Info Grid */}
          <div className="grid gap-4 border-t pt-4 md:grid-cols-2 lg:grid-cols-4 break-all">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Creator ID</p>
              <p className="text-sm font-medium font-mono">{agent.creatorId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <div>
                <Badge variant={statusColors[agent.status] || "outline"}>
                  {formattedStatus}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="text-sm font-medium">
                {rating > 0 ? `${rating.toFixed(1)} ⭐` : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Jobs</p>
              <p className="text-sm font-medium">
                {agent.completedJobs || 0} / {agent.totalJobs || 0}
              </p>
            </div>
            {price !== null && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-sm font-medium">
                  ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{pricingModelLabel}
                </p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{formattedCreatedAt}</p>
            </div>
            {formattedApprovedAt && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-sm font-medium">{formattedApprovedAt}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium">{formattedUpdatedAt}</p>
            </div>
          </div>

          {/* Tabs - Integrated inside hero */}
          <div className="border-t pt-4">
            <AgentDetailTabs agentId={agentId} lang={lang} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
