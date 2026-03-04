'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { updateSkill } from '@/actions/skills';
import type { AdminSkill, AdminSkillCategory } from '@/actions/skills';
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

interface SkillEditSheetProps {
  skill: AdminSkill;
  categories: AdminSkillCategory[];
  lang: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (skill: AdminSkill) => void;
}

export function SkillEditSheet({
  skill,
  categories,
  lang,
  open,
  onOpenChange,
  onSuccess,
}: SkillEditSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [editName, setEditName] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editCategory, setEditCategory] = useState('general');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<SkillStatus>('active');

  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>([['general', 'General']]);
    categories
      .filter((item) => item.status === 'active')
      .forEach((item) => map.set(item.name, item.displayName));

    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }));
  }, [categories]);

  const editCategoryOptions = useMemo(() => {
    const map = new Map(categoryOptions.map((item) => [item.value, item.label]));
    if (editCategory && !map.has(editCategory)) map.set(editCategory, editCategory);
    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }));
  }, [categoryOptions, editCategory]);

  useEffect(() => {
    if (skill) {
      setEditName(skill.name);
      setEditDisplayName(skill.displayName);
      setEditCategory(skill.category);
      setEditDescription(skill.description || '');
      setEditStatus(skill.status);
    }
  }, [skill]);

  const saveEdit = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('displayName', editDisplayName);
      formData.append('category', editCategory);
      formData.append('description', editDescription);
      formData.append('status', editStatus);
      formData.append('lang', lang);

      const result = await updateSkill(skill.id, formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const updatedSkill: AdminSkill = {
        ...skill,
        name: editName,
        displayName: editDisplayName,
        category: editCategory,
        description: editDescription || null,
        status: editStatus,
        updatedAt: new Date().toISOString(),
      };

      onOpenChange(false);
      toast.success(result.message);
      
      if (onSuccess) {
        onSuccess(updatedSkill);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[560px]">
        <SheetHeader>
          <SheetTitle>Edit Skill</SheetTitle>
          <SheetDescription>Update skill details for matching and catalog quality.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 py-4">
          <Input
            placeholder="name (slug)"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <Input
            placeholder="display name"
            value={editDisplayName}
            onChange={(e) => setEditDisplayName(e.target.value)}
          />
          <Select value={editCategory} onValueChange={setEditCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {editCategoryOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="description (optional)"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <Select value={editStatus} onValueChange={(value) => setEditStatus(value as SkillStatus)}>
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
          <Button onClick={saveEdit} disabled={isPending}>
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
