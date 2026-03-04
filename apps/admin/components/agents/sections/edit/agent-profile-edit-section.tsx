'use client';

import { useState } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Edit } from 'lucide-react';
import { AgentProfileEditDialog } from '../../dialogs/agent-profile-edit-dialog';
import type { AdminAgent } from '@/actions/agents';

interface AgentProfileEditSectionProps {
  agent: AdminAgent;
}

export function AgentProfileEditSection({ agent }: AgentProfileEditSectionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <div id="profile" className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Profile</h3>
        <Card className="transition-colors hover:bg-muted/50">
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              {/* Content on left */}
              <div className="grid gap-4 lg:grid-cols-2 flex-1 break-all">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">
                    {agent.name || <span className="text-muted-foreground">Not set</span>}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm font-medium">
                    {agent.description || <span className="text-muted-foreground">Not set</span>}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Creator ID</p>
                  <p className="text-sm font-medium font-mono">
                    {agent.creatorId || <span className="text-muted-foreground">Not set</span>}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-sm font-medium capitalize">
                    {agent.status || <span className="text-muted-foreground">Not set</span>}
                  </p>
                </div>
              </div>
              {/* Edit button on right */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="shrink-0"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AgentProfileEditDialog agent={agent} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  );
}
