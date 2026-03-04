'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createSkill } from '@/actions/skills';
import type { AdminSkillCategory } from '@/actions/skills';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@workspace/ui/components/field';
import { Spinner } from '@workspace/ui/components/spinner';
import { Alert, AlertDescription, AlertIcon } from '@workspace/ui/components/alert';
import { AlertCircle } from 'lucide-react';

type SkillStatus = 'active' | 'inactive';

interface SkillCreateFormProps {
  categories: AdminSkillCategory[];
  lang: string;
}

export function SkillCreateForm({ categories, lang }: SkillCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
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

  const handleCreate = () => {
    setServerError(null);

    if (!name.trim() && !displayName.trim()) {
      setServerError('Please enter name or display name');
      return;
    }

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
        setServerError(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push(`/${lang}/skills`);
      router.refresh();
    });
  };

  return (
    <form
      id="skill-create-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleCreate();
      }}
      className="space-y-6"
    >
      <FieldGroup>
        <FieldSet>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Skill Information</FieldLabel>
            <FieldDescription>Basic skill information</FieldDescription>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">
                Name (Slug) <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldDescription>URL-friendly identifier, e.g. prompt-engineering</FieldDescription>
              <FieldContent>
                <Input
                  id="name"
                  placeholder="name (slug), e.g. prompt-engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="displayName">
                Display Name <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldDescription>Human-readable name, e.g. Prompt Engineering</FieldDescription>
              <FieldContent>
                <Input
                  id="displayName"
                  placeholder="display name, e.g. Prompt Engineering"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isPending}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <FieldContent>
                <Select value={category} onValueChange={setCategory} disabled={isPending}>
                  <SelectTrigger id="category">
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
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <FieldDescription>Optional description for the skill</FieldDescription>
              <FieldContent>
                <Input
                  id="description"
                  placeholder="description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isPending}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <FieldContent>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as SkillStatus)}
                  disabled={isPending}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
          form="skill-create-form"
          disabled={isPending || (!name.trim() && !displayName.trim())}
        >
          {isPending ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Creating...
            </>
          ) : (
            'Create Skill'
          )}
        </Button>
      </div>
    </form>
  );
}
