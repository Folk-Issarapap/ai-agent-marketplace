'use client';

import { useState, useTransition, useMemo } from 'react';
import { toast } from 'sonner';
import { createSkill } from '@/actions/skills';
import type { AdminSkillCategory } from '@/actions/skills';
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

type SkillStatus = 'active' | 'inactive';

interface SkillCreateSheetProps {
  categories: AdminSkillCategory[];
  lang: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (skill: { id: string; name: string; displayName: string; category: string; description: string | null; status: SkillStatus }) => void;
}

export function SkillCreateSheet({
  categories,
  lang,
  open,
  onOpenChange,
  onSuccess,
}: SkillCreateSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<SkillStatus>('active');

  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>([['general', 'General']]);
    categories
      .filter((item) => item.status === 'active')
      .forEach((item) => map.set(item.name, item.displayName));

    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }));
  }, [categories]);

  const resetForm = () => {
    setName('');
    setDisplayName('');
    setCategory('general');
    setDescription('');
    setStatus('active');
  };

  const handleCreate = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('displayName', displayName);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('status', status);
      formData.append('lang', lang);

      const result = await createSkill(formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const normalizedDisplayName = displayName.trim() || name.trim();
      const normalizedName = (name.trim() || normalizedDisplayName.toLowerCase()).replace(/[^a-z0-9]+/g, '-');
      
      const newSkill = {
        id: crypto.randomUUID(),
        name: normalizedName,
        displayName: normalizedDisplayName,
        category: category.trim() || 'general',
        description: description.trim() || null,
        status,
      };

      resetForm();
      onOpenChange(false);
      toast.success(result.message);
      
      if (onSuccess) {
        onSuccess(newSkill);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[560px]">
        <SheetHeader>
          <SheetTitle>Create Skill</SheetTitle>
          <SheetDescription>Add a new skill to the marketplace catalog.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 py-4">
          <Input
            placeholder="name (slug), e.g. prompt-engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="display name, e.g. Prompt Engineering"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select value={status} onValueChange={(value) => setStatus(value as SkillStatus)}>
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
            Create Skill
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
