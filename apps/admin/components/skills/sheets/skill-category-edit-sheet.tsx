'use client';

import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import { updateSkillCategory } from '@/actions/skills';
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

type CategoryStatus = 'active' | 'inactive';

interface SkillCategoryEditSheetProps {
  category: AdminSkillCategory;
  lang: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (category: AdminSkillCategory) => void;
}

export function SkillCategoryEditSheet({
  category,
  lang,
  open,
  onOpenChange,
  onSuccess,
}: SkillCategoryEditSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [editName, setEditName] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<CategoryStatus>('active');

  useEffect(() => {
    if (category) {
      setEditName(category.name);
      setEditDisplayName(category.displayName);
      setEditDescription(category.description || '');
      setEditStatus(category.status);
    }
  }, [category]);

  const saveEdit = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('displayName', editDisplayName);
      formData.append('description', editDescription);
      formData.append('status', editStatus);
      formData.append('lang', lang);

      const result = await updateSkillCategory(category.id, formData);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const updatedCategory: AdminSkillCategory = {
        ...category,
        name: editName,
        displayName: editDisplayName,
        description: editDescription || null,
        status: editStatus,
        updatedAt: new Date().toISOString(),
      };

      onOpenChange(false);
      toast.success(result.message);
      
      if (onSuccess) {
        onSuccess(updatedCategory);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[560px]">
        <SheetHeader>
          <SheetTitle>Edit Category</SheetTitle>
          <SheetDescription>Update category details for consistent taxonomy.</SheetDescription>
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
          <Input
            placeholder="description (optional)"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <Select value={editStatus} onValueChange={(value) => setEditStatus(value as CategoryStatus)}>
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
