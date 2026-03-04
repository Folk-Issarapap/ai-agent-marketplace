'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createAgent } from '@/actions/agents';
import type { AdminAccount } from '@/actions/accounts';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@workspace/ui/components/field';
import { Spinner } from '@workspace/ui/components/spinner';
import { Alert, AlertDescription, AlertIcon } from '@workspace/ui/components/alert';
import { AlertCircle } from 'lucide-react';

type AgentStatus = 'pending' | 'active' | 'suspended' | 'banned';
type PricingModel = 'fixed' | 'hourly' | 'subscription';

interface AgentCreateFormProps {
  accounts: AdminAccount[];
  lang: string;
}

export function AgentCreateForm({ accounts, lang }: AgentCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  
  const [creatorId, setCreatorId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [capabilities, setCapabilities] = useState('');
  const [pricingModel, setPricingModel] = useState<PricingModel | ''>('');
  const [price, setPrice] = useState('');
  const [mcpEndpoint, setMcpEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<AgentStatus>('pending');

  const handleCreate = () => {
    setServerError(null);

    if (!creatorId) {
      setServerError('Please select a creator');
      return;
    }
    if (!name.trim()) {
      setServerError('Please enter agent name');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('creatorId', creatorId);
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('skills', skills.trim() ? JSON.stringify(skills.split(',').map(s => s.trim()).filter(Boolean)) : '');
      formData.append('capabilities', capabilities.trim());
      formData.append('pricingModel', pricingModel || '');
      formData.append('price', price.trim());
      formData.append('mcpEndpoint', mcpEndpoint.trim());
      formData.append('apiKey', apiKey.trim());
      formData.append('status', status);

      const result = await createAgent(formData);
      if (!result.success) {
        setServerError(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push(`/${lang}/agents`);
      router.refresh();
    });
  };

  return (
    <form
      id="agent-create-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleCreate();
      }}
      className="space-y-6"
    >
      <FieldGroup>
        {/* Basic Information */}
        <FieldSet>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Basic Information</FieldLabel>
            <FieldDescription>Provide basic information about the agent</FieldDescription>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="creatorId">
                Creator (Account) <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Select value={creatorId} onValueChange={setCreatorId} required>
                  <SelectTrigger id="creatorId">
                    <SelectValue placeholder="Select creator (account)" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name || account.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="name">
                Agent Name <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  placeholder="Agent name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isPending}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <FieldDescription>
                Describe what this agent does. Used for matching with jobs.
              </FieldDescription>
              <FieldContent>
                <Textarea
                  id="description"
                  placeholder="Describe what this agent does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={isPending}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>

        {/* Capabilities */}
        <FieldSet>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Capabilities</FieldLabel>
            <FieldDescription>Define agent capabilities for better job matching</FieldDescription>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="skills">Skills</FieldLabel>
              <FieldDescription>
                <span className="font-medium">Recommended:</span> List specific skills (e.g., seo, content-writing, python, data-analysis). 
                This helps match agents with relevant jobs.
              </FieldDescription>
              <FieldContent>
                <Input
                  id="skills"
                  placeholder="Skills (comma-separated, e.g. seo, content-writing, data-analysis)"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  disabled={isPending}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="capabilities">Capabilities</FieldLabel>
              <FieldDescription>
                <span className="font-medium">Recommended:</span> Describe what this agent can do in detail. 
                Used for better job matching.
              </FieldDescription>
              <FieldContent>
                <Textarea
                  id="capabilities"
                  placeholder="Describe agent capabilities in detail..."
                  value={capabilities}
                  onChange={(e) => setCapabilities(e.target.value)}
                  rows={3}
                  disabled={isPending}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>

        {/* Pricing */}
        <FieldSet>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Pricing</FieldLabel>
            <FieldDescription>Set pricing model and price for the agent</FieldDescription>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="pricingModel">Pricing Model</FieldLabel>
              <FieldContent>
                <Select value={pricingModel} onValueChange={(value) => setPricingModel(value as PricingModel)}>
                  <SelectTrigger id="pricingModel">
                    <SelectValue placeholder="Select pricing model (optional)" />
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
                  placeholder="Price (optional)"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isPending}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>

        {/* Integration */}
        <FieldSet>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Integration</FieldLabel>
            <FieldDescription>Configure agent integration settings (optional for mock data)</FieldDescription>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="mcpEndpoint">MCP Endpoint URL</FieldLabel>
              <FieldContent>
                <Input
                  id="mcpEndpoint"
                  placeholder="MCP Endpoint URL (optional)"
                  value={mcpEndpoint}
                  onChange={(e) => setMcpEndpoint(e.target.value)}
                  disabled={isPending}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="apiKey">API Key</FieldLabel>
              <FieldContent>
                <Input
                  id="apiKey"
                  placeholder="API Key (optional)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isPending}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>

        {/* Status */}
        <FieldSet>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Status</FieldLabel>
            <FieldDescription>Set the initial status of the agent</FieldDescription>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <FieldContent>
                <Select value={status} onValueChange={(value) => setStatus(value as AgentStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      {/* Error Alert */}
      {serverError && (
        <Alert variant="destructive">
          <AlertIcon>
            <AlertCircle className="h-4 w-4" />
          </AlertIcon>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="agent-create-form"
          disabled={isPending || !creatorId || !name.trim()}
        >
          {isPending ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Creating...
            </>
          ) : (
            'Create Agent'
          )}
        </Button>
      </div>
    </form>
  );
}
