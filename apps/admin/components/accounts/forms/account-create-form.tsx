'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, User, AlertCircle, Plus } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Alert, AlertDescription, AlertIcon } from '@workspace/ui/components/alert';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@workspace/ui/components/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@workspace/ui/components/input-group';
import { PasswordInput } from '@workspace/ui/components/password-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Spinner } from '@workspace/ui/components/spinner';

import { createAccount } from '@/actions/accounts';
import { createAccountSchema, type CreateAccountFormValues } from '@/schemas/account.schema';

interface AccountCreateFormProps {
  lang: string;
}

/**
 * Account Creation Form with React Hook Form
 * Full-width page version
 */
export function AccountCreateForm({ lang }: AccountCreateFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      name: '',
      displayName: '',
      preferredLanguage: 'th',
    },
  });

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

  const onSubmit = async (data: CreateAccountFormValues) => {
    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('name', data.name);
      if (data.displayName) {
        formData.append('displayName', data.displayName);
      }
      formData.append('preferredLanguage', data.preferredLanguage);

      // Call server action
      const result = await createAccount(null, formData);

      if (!result.success) {
        // Set server error state
        const errorMessage = result.message || 'Failed to create account';
        setServerError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Clear server error on success
      setServerError(null);
      toast.success(result.message);
      router.push(`/${lang}/accounts`);
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <form
      id="account-create-form"
      onSubmit={form.handleSubmit(onSubmit)}
      data-testid="account-create-form"
      className="space-y-6"
    >
      <FieldGroup>
        {/* Profile Section */}
        <FieldSet>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Profile Information</FieldLabel>
            <FieldDescription>Basic account information</FieldDescription>
          </div>
          <FieldGroup>
            {/* Email Field */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Email <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type="email"
                        placeholder="admin@example.com"
                        disabled={form.formState.isSubmitting}
                        aria-invalid={fieldState.invalid}
                        data-testid="account-create-email-input"
                      />
                      <InputGroupAddon>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />

            {/* Password Field */}
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Password <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <PasswordInput
                      {...field}
                      id={field.name}
                      placeholder="Enter password"
                      disabled={form.formState.isSubmitting}
                      aria-invalid={fieldState.invalid}
                      showStrengthIndicator={true}
                      showRequirements={true}
                      data-testid="account-create-password-input"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />

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
                        data-testid="account-create-name-input"
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
                        data-testid="account-create-display-name-input"
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

            {/* Preferred Language Field */}
            <Controller
              name="preferredLanguage"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Preferred Language</FieldLabel>
                  <FieldContent>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        data-testid="account-create-language-select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="th">Thai</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      {/* Error Alerts */}
      {(clientError || serverError) && (
        <Alert variant="destructive">
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

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={form.formState.isSubmitting}
          data-testid="account-create-cancel-button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="account-create-form"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
          onClick={(e) => {
            e.preventDefault();
            setServerError(null);
            form.handleSubmit(onSubmit)();
          }}
          data-testid="account-create-submit-button"
        >
          {form.formState.isSubmitting ? (
            <Spinner className="mr-2 h-4 w-4" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {form.formState.isSubmitting ? 'Creating...' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}
