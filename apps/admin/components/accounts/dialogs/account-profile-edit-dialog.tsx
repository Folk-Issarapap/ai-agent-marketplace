'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User, AlertCircle, Save } from 'lucide-react';
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
import { InputGroup, InputGroupAddon, InputGroupInput } from '@workspace/ui/components/input-group';
import { Spinner } from '@workspace/ui/components/spinner';

import { updateAccount } from '@/actions/accounts';
import {
  updateAccountProfileSchema,
  type UpdateAccountProfileFormValues,
} from '@/schemas/account.schema';
import { useParams } from 'next/navigation';

interface AccountProfileEditDialogProps {
  account: AdminAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountProfileEditDialog({
  account,
  open,
  onOpenChange,
}: AccountProfileEditDialogProps) {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang || 'en';
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdateAccountProfileFormValues>({
    resolver: zodResolver(updateAccountProfileSchema),
    mode: 'onChange',
    defaultValues: {
      name: account.name ?? '',
      displayName: account.displayName ?? '',
    },
  });

  // Reset form and clear errors when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        name: account.name ?? '',
        displayName: account.displayName ?? '',
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

  const onSubmit = async (data: UpdateAccountProfileFormValues) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.displayName) {
        formData.append('displayName', data.displayName);
      }
      formData.append('lang', lang);

      const result = await updateAccount(account.id, null, formData);

      if (!result.success) {
        const errorMessage = result.message || 'Failed to update profile';
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form id="account-profile-edit-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Name Field */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type="text"
                        placeholder="John Doe"
                        disabled={form.formState.isSubmitting}
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon>
                        <User className="h-4 w-4 text-muted-foreground" />
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />

            {/* Display Name Field */}
            <Controller
              name="displayName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Display Name</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type="text"
                        placeholder="John"
                        disabled={form.formState.isSubmitting}
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon>
                        <User className="h-4 w-4 text-muted-foreground" />
                      </InputGroupAddon>
                    </InputGroup>
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
            form="account-profile-edit-form"
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
