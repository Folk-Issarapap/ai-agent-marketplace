'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { deleteAgent } from '@/actions/agents';
import type { AdminAgent } from '@/actions/agents';
import { useParams } from 'next/navigation';

interface AgentDangerZoneProps {
  agent: AdminAgent;
}

export function AgentDangerZone({ agent }: AgentDangerZoneProps) {
  const router = useRouter();
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang || 'en';
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [nameConfirmation, setNameConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isNameMatch = nameConfirmation === agent.name;

  const handleDelete = async () => {
    if (!isNameMatch) {
      toast.error('Agent name does not match');
      return;
    }

    setIsDeleting(true);
    const result = await deleteAgent(agent.id, lang);

    if (result.success) {
      toast.success('Agent deleted successfully');
      router.push(`/${lang}/agents`);
    } else {
      toast.error(result.message || 'Failed to delete agent');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div id="danger-zone" className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Danger Zone</h3>
        <Card className="border-destructive transition-colors hover:bg-muted/50">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Delete Agent</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete this agent. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Agent
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Agent Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the agent and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="name-confirm" className="text-foreground">
              Type the agent name to confirm: {agent.name}
            </Label>
            <Input
              id="name-confirm"
              type="text"
              placeholder="Enter agent name to confirm"
              value={nameConfirmation}
              onChange={(e) => setNameConfirmation(e.target.value)}
              disabled={isDeleting}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isNameMatch || isDeleting}
            >
              {isDeleting ? 'Deleting...' : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Agent
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
