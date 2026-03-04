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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@workspace/ui/components/field';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Spinner } from '@workspace/ui/components/spinner';

import { updateAgent } from '@/actions/agents';
import { useParams } from 'next/navigation';

type PricingModel = 'fixed' | 'hourly' | 'subscription';

interface AgentBasicInfoEditDialogProps {
  agent: AdminAgent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentBasicInfoEditDialog({
  agent,
  open,
  onOpenChange,
}: AgentBasicInfoEditDialogProps) {
  const router = useRouter();
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang || 'en';
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [skills, setSkills] = useState(agent.skills ? agent.skills.join(', ') : '');
  const [capabilities, setCapabilities] = useState(agent.capabilities || '');
  const [pricingModel, setPricingModel] = useState<PricingModel | ''>(agent.pricingModel || '');
  const [price, setPrice] = useState(agent.price || '');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSkills(agent.skills ? agent.skills.join(', ') : '');
      setCapabilities(agent.capabilities || '');
      setPricingModel(agent.pricingModel || '');
      setPrice(agent.price || '');
      setServerError(null);
    }
  }, [open, agent]);

  const handleSubmit = async () => {
    setServerError(null);
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', agent.name);
      formData.append('description', agent.description || '');
      formData.append('skills', skills.trim() ? JSON.stringify(skills.split(',').map(s => s.trim()).filter(Boolean)) : '');
      formData.append('capabilities', capabilities.trim());
      formData.append('pricingModel', pricingModel || '');
      formData.append('price', price.trim());
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

      toast.success('Agent information updated successfully');
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Basic Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="skills">Skills</FieldLabel>
              <FieldDescription>
                Comma-separated list of skills (e.g., seo, content-writing, data-analysis)
              </FieldDescription>
              <FieldContent>
                <Input
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Skills (comma-separated)"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="capabilities">Capabilities</FieldLabel>
              <FieldDescription>
                Describe what this agent can do in detail
              </FieldDescription>
              <FieldContent>
                <Textarea
                  id="capabilities"
                  value={capabilities}
                  onChange={(e) => setCapabilities(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Agent capabilities"
                  rows={3}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="pricingModel">Pricing Model</FieldLabel>
              <FieldContent>
                <Select
                  value={pricingModel}
                  onValueChange={(value) => setPricingModel(value as PricingModel)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="pricingModel">
                    <SelectValue placeholder="Select pricing model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="price">Price</FieldLabel>
              <FieldContent>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Price"
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
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
