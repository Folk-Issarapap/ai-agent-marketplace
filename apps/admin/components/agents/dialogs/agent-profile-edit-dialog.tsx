'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, AlertCircle } from 'lucide-react';
import type { AdminAgent } from '@/actions/agents';

import { Button } from '@workspace/ui/components/button';
import { Alert, AlertDescription, AlertIcon } from '@workspace/ui/components/alert';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from '@workspace/ui/components/field';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Spinner } from '@workspace/ui/components/spinner';

import { updateAgent } from '@/actions/agents';
import { useParams } from 'next/navigation';

interface AgentProfileEditDialogProps {
  agent: AdminAgent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentProfileEditDialog({
  agent,
  open,
  onOpenChange,
}: AgentProfileEditDialogProps) {
  const router = useRouter();
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang || 'en';
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState(agent.name || '');
  const [description, setDescription] = useState(agent.description || '');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(agent.name || '');
      setDescription(agent.description || '');
      setServerError(null);
    }
  }, [open, agent]);

  const handleSubmit = async () => {
    setServerError(null);

    if (!name.trim()) {
      setServerError('Agent name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('skills', agent.skills ? JSON.stringify(agent.skills) : '');
      formData.append('capabilities', agent.capabilities || '');
      formData.append('pricingModel', agent.pricingModel || '');
      formData.append('price', agent.price || '');
      formData.append('mcpEndpoint', '');
      formData.append('apiKey', '');
      formData.append('status', agent.status);

      const result = await updateAgent(agent.id, formData);

      if (!result.success) {
        setServerError(result.message || 'Failed to update agent');
        toast.error(result.message || 'Failed to update agent');
        setIsSubmitting(false);
        return;
      }

      toast.success('Agent profile updated successfully');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update agent';
      setServerError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Agent Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">
                Name <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Agent name"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <FieldContent>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Agent description"
                  rows={3}
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          {serverError && (
            <Alert variant="destructive">
              <AlertIcon>
                <AlertCircle className="h-4 w-4" />
              </AlertIcon>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
