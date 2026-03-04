'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertCircle, KeyRound } from 'lucide-react';

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
import { PasswordInput } from '@workspace/ui/components/password-input';
import { Spinner } from '@workspace/ui/components/spinner';
import { z } from 'zod';

const hardResetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

type HardResetPasswordFormValues = z.infer<typeof hardResetPasswordSchema>;

interface HardResetPasswordDialogProps {
  accountId: string;
  accountEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HardResetPasswordDialog({
  accountId,
  accountEmail,
  open,
  onOpenChange,
}: HardResetPasswordDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<HardResetPasswordFormValues>({
    resolver: zodResolver(hardResetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      newPassword: '',
    },
  });

  // Reset form and clear errors when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        newPassword: '',
      });
    } else {
      setServerError(null);
    }
  }, [open, form]);

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

  const onSubmit = async (data: HardResetPasswordFormValues) => {
    try {
      // TODO: Implement hardResetPassword action
      // For now, just show success message
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setServerError(null);
      toast.success('Password reset successfully');
      form.reset();
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Hard Reset Password</DialogTitle>
        </DialogHeader>

        <form id="hard-reset-password-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <p className="text-sm text-muted-foreground mb-4">
              Reset password for <strong>{accountEmail}</strong>. The user will need to use the new password to sign in.
            </p>

            {/* New Password Field */}
            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    New Password <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <PasswordInput
                      {...field}
                      id={field.name}
                      placeholder="Enter new password"
                      disabled={form.formState.isSubmitting}
                      aria-invalid={fieldState.invalid}
                      showStrengthIndicator={true}
                      showRequirements={true}
                    />
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
            form="hard-reset-password-form"
            variant="destructive"
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
              <KeyRound className="mr-2 h-4 w-4" />
            )}
            {form.formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
