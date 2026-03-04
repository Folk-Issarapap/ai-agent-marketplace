'use client';

import { useState } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Edit } from 'lucide-react';
import { AgentBasicInfoEditDialog } from '../../dialogs/agent-basic-info-edit-dialog';
import type { AdminAgent } from '@/actions/agents';

interface AgentBasicInfoEditSectionProps {
  agent: AdminAgent;
}

export function AgentBasicInfoEditSection({ agent }: AgentBasicInfoEditSectionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <div id="basic-info" className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
        <Card className="transition-colors hover:bg-muted/50">
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              {/* Content on left */}
              <div className="grid gap-4 md:grid-cols-2 flex-1 break-all">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {agent.skills && agent.skills.length > 0 ? (
                      agent.skills.map((skill, index) => (
                        <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Not set</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Capabilities</p>
                  <p className="text-sm font-medium">
                    {agent.capabilities || <span className="text-muted-foreground">Not set</span>}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Pricing Model</p>
                  <p className="text-sm font-medium capitalize">
                    {agent.pricingModel || <span className="text-muted-foreground">Not set</span>}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-sm font-medium">
                    {agent.price ? `$${agent.price}` : <span className="text-muted-foreground">Not set</span>}
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

      <AgentBasicInfoEditDialog agent={agent} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  );
}
