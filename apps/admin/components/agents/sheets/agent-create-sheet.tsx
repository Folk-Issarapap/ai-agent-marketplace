'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createAgent } from '@/actions/agents';
import type { AdminAccount } from '@/actions/accounts';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';

type AgentStatus = 'pending' | 'active' | 'suspended' | 'banned';
type PricingModel = 'fixed' | 'hourly' | 'subscription';

interface AgentCreateSheetProps {
  accounts: AdminAccount[];
  lang: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AgentCreateSheet({
  accounts,
  lang,
  open,
  onOpenChange,
  onSuccess,
}: AgentCreateSheetProps) {
  const [isPending, startTransition] = useTransition();
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

  const resetForm = () => {
    setCreatorId('');
    setName('');
    setDescription('');
    setSkills('');
    setCapabilities('');
    setPricingModel('');
    setPrice('');
    setMcpEndpoint('');
    setApiKey('');
    setStatus('pending');
  };

  const handleCreate = () => {
    if (!creatorId) {
      toast.error('Please select a creator');
      return;
    }
    if (!name.trim()) {
      toast.error('Please enter agent name');
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
        toast.error(result.message);
        return;
      }

      resetForm();
      onOpenChange(false);
      toast.success(result.message);
      
      if (onSuccess) {
        onSuccess();
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[560px]">
        <SheetHeader>
          <SheetTitle>Create Agent</SheetTitle>
          <SheetDescription>Add a new AI agent to the marketplace (mock data for now).</SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 py-4">
          <Select value={creatorId} onValueChange={setCreatorId} required>
            <SelectTrigger>
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
          <Input
            placeholder="Agent name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="space-y-2">
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Describe what this agent does. Used for matching with jobs.
            </p>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Skills (comma-separated, e.g. seo, content-writing, data-analysis)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Recommended:</span> List specific skills (e.g., seo, content-writing, python, data-analysis). 
              This helps match agents with relevant jobs.
            </p>
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Capabilities"
              value={capabilities}
              onChange={(e) => setCapabilities(e.target.value)}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Recommended:</span> Describe what this agent can do in detail. 
              Used for better job matching.
            </p>
          </div>
          <Select value={pricingModel} onValueChange={(value) => setPricingModel(value as PricingModel)}>
            <SelectTrigger>
              <SelectValue placeholder="Pricing model (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Price (optional)"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Input
            placeholder="MCP Endpoint URL (optional)"
            value={mcpEndpoint}
            onChange={(e) => setMcpEndpoint(e.target.value)}
          />
          <Input
            placeholder="API Key (optional)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <Select value={status} onValueChange={(value) => setStatus(value as AgentStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isPending || !creatorId || !name.trim()}>
            Create Agent
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
