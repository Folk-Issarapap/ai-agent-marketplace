'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { format } from 'date-fns';
import type { AdminAgent } from '@/actions/agents';

interface AgentInfoSectionProps {
  agent: AdminAgent;
}

const statusColors: Record<string, "primary" | "secondary" | "destructive" | "outline" | "success"> = {
  pending: "outline",
  active: "success",
  suspended: "secondary",
  banned: "destructive",
};

export function AgentInfoSection({ agent }: AgentInfoSectionProps) {
  const formattedStatus = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);
  const rating = agent.rating ? parseFloat(agent.rating) : 0;
  const price = agent.price ? parseFloat(agent.price) : null;
  const pricingModelLabel = agent.pricingModel === 'hourly' ? '/hr' : agent.pricingModel === 'subscription' ? '/mo' : '';
  
  const formattedCreatedAt = agent.createdAt
    ? format(new Date(agent.createdAt), 'PPp')
    : '-';
  const formattedUpdatedAt = agent.updatedAt
    ? format(new Date(agent.updatedAt), 'PPp')
    : '-';
  const formattedApprovedAt = agent.approvedAt
    ? format(new Date(agent.approvedAt), 'PPp')
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{agent.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created {formattedCreatedAt}
              </p>
            </div>
            <Badge variant={statusColors[agent.status] || "outline"}>
              {formattedStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {agent.description && (
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{agent.description}</p>
            </div>
          )}

          {agent.capabilities && (
            <div>
              <h3 className="text-sm font-medium mb-2">Capabilities</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{agent.capabilities}</p>
            </div>
          )}

          {agent.skills && agent.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {agent.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Creator ID</h3>
              <p className="text-sm text-muted-foreground font-mono">{agent.creatorId}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Status</h3>
              <div>
                <Badge variant={statusColors[agent.status] || "outline"}>
                  {formattedStatus}
                </Badge>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Rating</h3>
              <p className="text-sm font-medium">
                {rating > 0 ? `${rating.toFixed(1)} ⭐` : 'No rating yet'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Jobs</h3>
              <p className="text-sm font-medium">
                {agent.completedJobs || 0} completed / {agent.totalJobs || 0} total
              </p>
            </div>
            {price !== null && (
              <div>
                <h3 className="text-sm font-medium mb-2">Price</h3>
                <p className="text-sm font-medium">
                  ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{pricingModelLabel}
                </p>
              </div>
            )}
            {agent.pricingModel && (
              <div>
                <h3 className="text-sm font-medium mb-2">Pricing Model</h3>
                <p className="text-sm font-medium capitalize">{agent.pricingModel}</p>
              </div>
            )}
          </div>

          {(agent.mcpEndpoint || agent.apiKey) && (
            <div className="grid grid-cols-1 gap-4 pt-4 border-t">
              {agent.mcpEndpoint && (
                <div>
                  <h3 className="text-sm font-medium mb-2">MCP Endpoint</h3>
                  <p className="text-sm text-muted-foreground font-mono break-all">{agent.mcpEndpoint}</p>
                </div>
              )}
              {agent.apiKey && (
                <div>
                  <h3 className="text-sm font-medium mb-2">API Key</h3>
                  <p className="text-sm text-muted-foreground font-mono break-all">
                    {agent.apiKey.substring(0, 20)}...
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h3 className="text-sm font-medium mb-1">Created</h3>
              <p className="text-sm text-muted-foreground">{formattedCreatedAt}</p>
            </div>
            {formattedApprovedAt && (
              <div>
                <h3 className="text-sm font-medium mb-1">Approved</h3>
                <p className="text-sm text-muted-foreground">{formattedApprovedAt}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium mb-1">Last Updated</h3>
              <p className="text-sm text-muted-foreground">{formattedUpdatedAt}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
