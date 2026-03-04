'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertCircle, Save } from 'lucide-react';
import type { AdminAccount } from '@/actions/accounts';

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
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@workspace/ui/components/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Spinner } from '@workspace/ui/components/spinner';

import { updateAccount } from '@/actions/accounts';
import {
  updateAccountSettingsSchema,
  type UpdateAccountSettingsFormValues,
} from '@/schemas/account.schema';
import { useParams } from 'next/navigation';

interface AccountSettingsEditDialogProps {
  account: AdminAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountSettingsEditDialog({
  account,
  open,
  onOpenChange,
}: AccountSettingsEditDialogProps) {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang || 'en';
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdateAccountSettingsFormValues>({
    resolver: zodResolver(updateAccountSettingsSchema),
    mode: 'onChange',
    defaultValues: {
      status: (account.status || 'active') as 'active' | 'inactive',
    },
  });

  // Reset form and clear errors when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        status: (account.status || 'active') as 'active' | 'inactive',
      });
    } else {
      setServerError(null);
    }
  }, [open, account, form]);

  // Get first client-side validation error
  const getFirstFormError = (): string | null => {
    const errors = form.formState.errors;
    const errorKeys = Object.keys(errors) as Array<keyof typeof errors>;
    const firstErrorKey = errorKeys[0];
    if (firstErrorKey && errors[firstErrorKey]) {
      const error = errors[firstErrorKey];
      return error?.message || 'Please fix the form errors';
    }
    return null;
  };

  const clientError = getFirstFormError();

  const onSubmit = async (data: UpdateAccountSettingsFormValues) => {
    try {
      const formData = new FormData();
      formData.append('name', account.name); // Keep existing name
      formData.append('status', data.status);
      formData.append('lang', lang);

      const result = await updateAccount(account.id, null, formData);

      if (!result.success) {
        const errorMessage = result.message || 'Failed to update settings';
        setServerError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      setServerError(null);
      toast.success(result.message);
      form.reset();
      onOpenChange(false);
      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Account Settings</DialogTitle>
        </DialogHeader>

        <form id="account-settings-edit-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Status Field */}
            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Status <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                    >
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        {/* Error Alerts */}
        {(clientError || serverError) && (
          <Alert variant="destructive" className="mt-4">
            <AlertIcon>
              <AlertCircle className="h-4 w-4" />
            </AlertIcon>
            <AlertDescription>
              {serverError ? (
                <div className="space-y-1">
                  <div className="font-medium">Server Error</div>
                  <div>{serverError}</div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-medium">Validation Error</div>
                  <div>{clientError}</div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="account-settings-edit-form"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            onClick={(e) => {
              e.preventDefault();
              setServerError(null);
              form.handleSubmit(onSubmit)();
            }}
          >
            {form.formState.isSubmitting ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
