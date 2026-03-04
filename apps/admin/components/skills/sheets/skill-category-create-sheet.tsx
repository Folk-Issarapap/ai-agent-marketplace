'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createSkillCategory } from '@/actions/skills';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';

type CategoryStatus = 'active' | 'inactive';

interface SkillCategoryCreateSheetProps {
  lang: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (category: { id: string; name: string; displayName: string; description: string | null; status: CategoryStatus }) => void;
}

export function SkillCategoryCreateSheet({
  lang,
  open,
  onOpenChange,
  onSuccess,
}: SkillCategoryCreateSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<CategoryStatus>('active');

  const resetForm = () => {
    setName('');
    setDisplayName('');
    setDescription('');
    setStatus('active');
  };

  const handleCreate = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('displayName', displayName);
      formData.append('description', description);
      formData.append('status', status);
      formData.append('lang', lang);

      const result = await createSkillCategory(formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const normalizedDisplayName = displayName.trim() || name.trim();
      const normalizedName = (name.trim() || normalizedDisplayName.toLowerCase()).replace(/[^a-z0-9]+/g, '-');
      
      const newCategory = {
        id: crypto.randomUUID(),
        name: normalizedName,
        displayName: normalizedDisplayName,
        description: description.trim() || null,
        status,
      };

      resetForm();
      onOpenChange(false);
      toast.success(result.message);
      
      if (onSuccess) {
        onSuccess(newCategory);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[560px]">
        <SheetHeader>
          <SheetTitle>Create Category</SheetTitle>
          <SheetDescription>Add a new category for skill grouping and filtering.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 py-4">
          <Input
            placeholder="name (slug), e.g. llm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="display name, e.g. LLM"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            placeholder="description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select value={status} onValueChange={(value) => setStatus(value as CategoryStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">active</SelectItem>
              <SelectItem value="inactive">inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            Create Category
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
