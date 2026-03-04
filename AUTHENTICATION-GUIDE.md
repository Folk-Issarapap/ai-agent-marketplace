# Authentication System Guide - Sign Up & Sign In

## 📚 สารบัญ

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Sign Up Flow](#3-sign-up-flow)
4. [Sign In Flow](#4-sign-in-flow)
5. [Database Schema](#5-database-schema)
6. [Server Actions](#6-server-actions)
7. [UI Components](#7-ui-components)
8. [Validation & Security](#8-validation--security)
9. [Error Handling](#9-error-handling)
10. [Implementation Guide](#10-implementation-guide)

---

## 1. Overview

### 1.1 สรุป

ระบบ Authentication ใช้ **Supabase Auth** เป็น authentication provider หลัก โดยมี:

- **Sign Up**: สมัครสมาชิกด้วย email/password
- **Sign In**: ล็อกอินด้วย email/password
- **Email Verification**: ตรวจสอบอีเมลอัตโนมัติ
- **Password Reset**: รีเซ็ตรหัสผ่านผ่านอีเมล
- **Session Management**: จัดการ session อัตโนมัติ

### 1.2 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Auth Provider** | Supabase Auth | Authentication backend |
| **Frontend** | Next.js 16 App Router | UI & Routing |
| **Form Handling** | React Hook Form | Form state management |
| **Validation** | Zod | Schema validation |
| **i18n** | next-intl | Internationalization |
| **UI Components** | shadcn/ui | Form components |

### 1.3 Key Features

- ✅ Email/Password authentication
- ✅ Email verification
- ✅ Password strength validation
- ✅ Rate limiting
- ✅ Operation logging
- ✅ i18n support (TH/EN)
- ✅ Accessible forms
- ✅ Error handling

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  UI Components (React Hook Form)                 │  │
│  │  - LoginForm                                      │  │
│  │  - RegisterForm                                   │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │ FormData                              │
│                 ↓                                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Server Actions (Next.js)                        │  │
│  │  - login()                                        │  │
│  │  - register()                                    │  │
│  └──────────────┬───────────────────────────────────┘  │
└─────────────────┼───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│              Server (Next.js Server Actions)            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  1. Rate Limiting                                │  │
│  │  2. Validation (Zod)                             │  │
│  │  3. Supabase Auth                                │  │
│  │  4. Operation Logging                            │  │
│  │  5. Revalidation                                 │  │
│  └──────────────┬───────────────────────────────────┘  │
└─────────────────┼───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│                  Supabase Auth                          │
│  - User Management                                      │
│  - Session Management                                   │
│  - Email Verification                                  │
│  - Password Reset                                       │
└─────────────────────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│              Database (PostgreSQL)                      │
│  - auth.users (Supabase managed)                       │
│  - public.accounts (Application managed)               │
└─────────────────────────────────────────────────────────┘
```

### 2.2 File Structure

```
apps/marketplace/
├── actions/
│   └── auth/
│       └── auth.mutation.action.ts    # Server Actions (login, register)
├── components/
│   └── auth/
│       ├── login-form.tsx             # Login form component
│       └── register-form.tsx          # Register form component
├── schemas/
│   └── auth.schema.ts                 # Zod validation schemas
├── app/
│   └── [lang]/
│       └── (public)/
│           └── auth/
│               ├── login/
│               │   └── page.tsx      # Login page
│               └── register/
│                   └── page.tsx      # Register page
└── lib/
    └── auth/
        └── get-current-user.ts       # Get current user utility
```

---

## 3. Sign Up Flow

### 3.1 Complete Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Fill Registration Form
     │    - Name
     │    - Email
     │    - Password
     │    - Confirm Password
     │    - Terms & Conditions
     ↓
┌─────────────────┐
│  Client-Side    │
│  Validation     │
│  (React Hook    │
│   Form + Zod)   │
└────┬────────────┘
     │ 2. Submit Form
     ↓
┌─────────────────┐
│  Server Action  │
│  register()     │
└────┬────────────┘
     │ 3. Rate Limiting
     ↓
┌─────────────────┐
│  Server-Side    │
│  Validation     │
│  (Zod Schema)   │
└────┬────────────┘
     │ 4. Supabase Auth
     │    signUp()
     ↓
┌─────────────────┐
│  Supabase Auth  │
│  - Create User  │
│  - Send         │
│    Verification │
│    Email        │
└────┬────────────┘
     │ 5. Database Trigger
     │    (Auto-create account)
     ↓
┌─────────────────┐
│  Operation Log  │
│  (Log success)  │
└────┬────────────┘
     │ 6. Revalidate Path
     ↓
┌─────────────────┐
│  Return Success │
│  - Redirect     │
│  - Show Message │
└─────────────────┘
```

### 3.2 Step-by-Step

#### Step 1: User Fills Form

```typescript
// User enters:
{
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123!",
  confirmPassword: "SecurePass123!",
  terms: true
}
```

#### Step 2: Client-Side Validation

```typescript
// React Hook Form validates using Zod schema
const schemas = createAuthSchemas(tCommon, t);
const form = useForm<RegisterFormValues>({
  resolver: zodResolver(schemas.registerSchema),
  mode: 'onBlur',
});
```

**Validation Rules:**
- Name: Required, min 2 characters
- Email: Required, valid email format
- Password: Required, min 8 characters, must contain uppercase, lowercase, number, special char
- Confirm Password: Must match password
- Terms: Must be checked

#### Step 3: Submit to Server Action

```typescript
// Create FormData
const formData = new FormData();
formData.append('name', data.name);
formData.append('email', data.email);
formData.append('password', data.password);
formData.append('confirmPassword', data.confirmPassword);
formData.append('terms', String(data.terms));

// Call server action
const result = await register(null, formData);
```

#### Step 4: Server Action Processing

```typescript
export async function register(
  prevState: RegisterState | null,
  formData: FormData
): Promise<RegisterState> {
  // 1. Rate Limiting
  await rateLimitAction();

  // 2. Extract & Validate
  const schemas = createAuthSchemas(tCommon, t);
  const validationResult = schemas.registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    // ...
  });

  // 3. Supabase Auth
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: validatedData.email,
    password: validatedData.password,
    options: {
      data: {
        name: validatedData.name,
      },
    },
  });

  // 4. Operation Logging
  await logService.create({ /* ... */ });

  // 5. Revalidate
  revalidatePath('/', 'layout');

  return { success: true, message: t('register.success') };
}
```

#### Step 5: Supabase Auth Processing

- Creates user in `auth.users` table
- Sends verification email (if enabled)
- Returns user data

#### Step 6: Database Trigger

```sql
-- Auto-creates account in public.accounts table
CREATE TRIGGER on_auth_user_created_account
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_account();
```

**Trigger Logic:**
- Extracts name, email from `user_metadata`
- Creates account record in `public.accounts`
- Sets status based on email confirmation

#### Step 7: Response & Redirect

```typescript
// Success response
{
  success: true,
  message: "Registration successful",
  redirectTo: "/"
}
```

---

## 4. Sign In Flow

### 4.1 Complete Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Fill Login Form
     │    - Email
     │    - Password
     │    - (Optional) Redirect URL
     ↓
┌─────────────────┐
│  Client-Side    │
│  Validation     │
│  (React Hook    │
│   Form + Zod)   │
└────┬────────────┘
     │ 2. Submit Form
     ↓
┌─────────────────┐
│  Server Action  │
│  login()        │
└────┬────────────┘
     │ 3. Rate Limiting
     ↓
┌─────────────────┐
│  Server-Side    │
│  Validation     │
│  (Zod Schema)   │
└────┬────────────┘
     │ 4. Supabase Auth
     │    signInWithPassword()
     ↓
┌─────────────────┐
│  Supabase Auth  │
│  - Verify       │
│    Credentials  │
│  - Create       │
│    Session      │
└────┬────────────┘
     │ 5. Check Password Change
     │    Requirement
     ↓
┌─────────────────┐
│  Operation Log  │
│  (Log success/  │
│   failure)      │
└────┬────────────┘
     │ 6. Revalidate Path
     ↓
┌─────────────────┐
│  Return Success │
│  - Redirect     │
│  - Update Auth  │
│    State        │
└─────────────────┘
```

### 4.2 Step-by-Step

#### Step 1: User Fills Form

```typescript
// User enters:
{
  email: "john@example.com",
  password: "SecurePass123!",
  redirectTo: "/dashboard" // Optional
}
```

#### Step 2: Client-Side Validation

```typescript
// React Hook Form validates
const schemas = createAuthSchemas(tCommon, t);
const form = useForm<LoginFormValues>({
  resolver: zodResolver(schemas.loginSchema),
  mode: 'onBlur',
});
```

**Validation Rules:**
- Email: Required, valid email format
- Password: Required

#### Step 3: Submit to Server Action

```typescript
// Create FormData
const formData = new FormData();
formData.append('email', data.email);
formData.append('password', data.password);
if (data.redirectTo) {
  formData.append('redirectTo', data.redirectTo);
}

// Call server action
const result = await login(null, formData);
```

#### Step 4: Server Action Processing

```typescript
export async function login(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  // 1. Rate Limiting
  await rateLimitAction();

  // 2. Extract & Validate
  const schemas = createAuthSchemas(tCommon, t);
  const validationResult = schemas.loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // 3. Supabase Auth
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validatedData.email,
    password: validatedData.password,
  });

  // 4. Check Password Change Requirement
  const requirePasswordChange = data.user?.user_metadata?.require_password_change === true;

  // 5. Operation Logging
  await logService.create({ /* ... */ });

  // 6. Revalidate
  revalidatePath('/', 'layout');

  // 7. Return with redirect
  return {
    success: true,
    redirectTo: requirePasswordChange ? '/change-password' : redirectTo || '/',
  };
}
```

#### Step 5: Supabase Auth Processing

- Verifies email/password
- Creates session (JWT token)
- Stores session in cookies
- Returns user data

#### Step 6: Session Management

```typescript
// Supabase automatically:
// - Stores session in cookies
// - Refreshes token automatically
// - Handles session expiration
```

#### Step 7: Response & Redirect

```typescript
// Success response
{
  success: true,
  redirectTo: "/dashboard"
}

// Client-side: Update auth state
await refreshUser();
router.push(result.redirectTo);
```

---

## 5. Database Schema

### 5.1 Supabase Auth Tables

#### `auth.users` (Supabase Managed)

```sql
-- Managed by Supabase, not directly accessible
-- Contains:
- id (UUID)
- email
- encrypted_password
- email_confirmed_at
- raw_user_meta_data (JSONB)
- created_at
- updated_at
```

### 5.2 Application Tables

#### `public.accounts` (Application Managed)

```typescript
// packages/db/src/schema/accounts.ts
export const accountsTable = pgTable('accounts', {
  id: uuid('id').primaryKey().references(() => authUsersTable.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  preferredLanguage: varchar('preferred_language', { length: 10 }).default('th'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  // 'active' | 'inactive' | 'suspended' | 'banned'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### 5.3 Database Trigger

```sql
-- Auto-creates account when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_account()
RETURNS trigger
AS $$
DECLARE
  user_status public.account_status;
BEGIN
  -- Determine status based on email confirmation
  IF NEW.email_confirmed_at IS NULL THEN
    user_status := 'inactive'::public.account_status;
  ELSE
    user_status := 'active'::public.account_status;
  END IF;

  -- Insert account record
  INSERT INTO public.accounts (
    id,
    name,
    email,
    display_name,
    preferred_language,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.email
    ),
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'preferred_language')::public.language,
      'th'::public.language
    ),
    user_status,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created_account
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_account();
```

---

## 6. Server Actions

### 6.1 Register Action

```typescript
// apps/marketplace/actions/auth/auth.mutation.action.ts

export interface RegisterState {
  success: boolean;
  message: string;
  formData?: FormData;
  redirectTo?: string;
}

export async function register(
  prevState: RegisterState | null,
  formData: FormData
): Promise<RegisterState> {
  // 1. Rate Limiting
  try {
    await rateLimitAction();
  } catch (error) {
    if (error instanceof RateLimitError) {
      const message = await translateError(error, 'common');
      return { success: false, message, formData };
    }
    throw error;
  }

  // 2. Translations
  const t = await getTranslations('auth');
  const tCommon = await getTranslations('common');

  // 3. Extract FormData
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const terms = formData.get('terms') === 'true';

  // 4. Validation
  const schemas = createAuthSchemas(tCommon, t);
  const validationResult = schemas.registerSchema.safeParse({
    email,
    password,
    confirmPassword,
    name,
    terms,
  });

  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    return {
      success: false,
      message: firstError?.message ?? t('errors.serverError'),
      formData,
    };
  }

  const validatedData = validationResult.data;

  // 5. Supabase Auth
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: validatedData.email,
    password: validatedData.password,
    options: {
      data: {
        name: validatedData.name,
      },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return {
        success: false,
        message: t('errors.accountExists'),
        formData,
      };
    }
    return {
      success: false,
      message: t('errors.serverError'),
      formData,
    };
  }

  if (!data.user) {
    return {
      success: false,
      message: t('errors.serverError'),
      formData,
    };
  }

  // 6. Operation Logging
  try {
    const context = await getRequestContext();
    const logService = getOperationLogService();
    await logService.create({
      actorId: data.user.id,
      actorType: 'user',
      actorName: data.user.email!,
      resourceType: 'Auth',
      resourceId: data.user.id,
      resourceName: data.user.email!,
      operationType: 'CREATE',
      operationDescription: `Registered new account ${data.user.email}`,
      status: 'success',
      ipAddress: context.ipAddress ?? undefined,
      userAgent: context.userAgent ?? undefined,
      metadata: {
        source: 'marketplace',
        section: 'auth',
        action: 'register',
        name: validatedData.name,
      },
    });
  } catch (logError) {
    console.error('Failed to log operation:', logError);
  }

  // 7. Revalidate
  revalidatePath('/', 'layout');

  // 8. Return Success
  return {
    success: true,
    message: t('register.success') || 'Registration successful',
    redirectTo: '/',
  };
}
```

### 6.2 Login Action

```typescript
// apps/marketplace/actions/auth/auth.mutation.action.ts

export interface LoginState {
  success: boolean;
  message: string;
  formData?: FormData;
  redirectTo?: string;
}

export async function login(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  // 1. Rate Limiting
  try {
    await rateLimitAction();
  } catch (error) {
    if (error instanceof RateLimitError) {
      const message = await translateError(error, 'common');
      return { success: false, message, formData };
    }
    throw error;
  }

  // 2. Translations
  const t = await getTranslations('auth');
  const tCommon = await getTranslations('common');

  // 3. Extract FormData
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirectTo') as string;

  // 4. Validation
  const schemas = createAuthSchemas(tCommon, t);
  const validationResult = schemas.loginSchema.safeParse({
    email,
    password,
    redirectTo: redirectTo || undefined,
  });

  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    return {
      success: false,
      message: firstError?.message ?? t('errors.invalidCredentials'),
      formData,
    };
  }

  const validatedData = validationResult.data;

  // 5. Supabase Auth
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validatedData.email,
    password: validatedData.password,
  });

  if (error || !data.user) {
    // Log failed login attempt
    try {
      const context = await getRequestContext();
      const logService = getOperationLogService();
      await logService.create({
        actorId: validatedData.email,
        actorType: 'user',
        actorName: validatedData.email,
        resourceType: 'Auth',
        resourceId: validatedData.email,
        resourceName: validatedData.email,
        operationType: 'UPDATE',
        operationDescription: `Failed login attempt for ${validatedData.email}`,
        status: 'failure',
        errorMessage: 'Invalid credentials',
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
        metadata: {
          source: 'marketplace',
          section: 'auth',
          action: 'login',
        },
      });
    } catch (logError) {
      console.error('Failed to log operation:', logError);
    }

    return {
      success: false,
      message: t('errors.invalidCredentials'),
      formData,
    };
  }

  // 6. Check Password Change Requirement
  const requirePasswordChange = data.user.user_metadata?.require_password_change === true;

  // 7. Log Successful Login
  try {
    const context = await getRequestContext();
    const logService = getOperationLogService();
    await logService.create({
      actorId: data.user.id,
      actorType: 'user',
      actorName: data.user.email!,
      resourceType: 'Auth',
      resourceId: data.user.id,
      resourceName: data.user.email!,
      operationType: 'UPDATE',
      operationDescription: `Logged in as ${data.user.email}`,
      status: 'success',
      ipAddress: context.ipAddress ?? undefined,
      userAgent: context.userAgent ?? undefined,
      metadata: {
        source: 'marketplace',
        section: 'auth',
        action: 'login',
      },
    });
  } catch (logError) {
    console.error('Failed to log operation:', logError);
  }

  // 8. Revalidate
  revalidatePath('/', 'layout');

  // 9. Return Success
  return {
    success: true,
    message: '',
    redirectTo: requirePasswordChange
      ? '/change-password'
      : redirectTo || '/',
  };
}
```

---

## 7. UI Components

### 7.1 Register Form Component

```typescript
// apps/marketplace/components/auth/register-form.tsx

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from '@/lib/i18n/navigation';

import { Button } from '@workspace/ui/components/button';
import { Field, FieldContent, FieldError, FieldLabel } from '@workspace/ui/components/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@workspace/ui/components/input-group';
import { PasswordInput } from '@workspace/ui/components/password-input';
import { Checkbox } from '@workspace/ui/components/checkbox';

import { register } from '@/actions/auth';
import { createAuthSchemas, type RegisterFormValues } from '@/schemas/auth.schema';

export function RegisterForm() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();

  // Create schemas with i18n support
  const schemas = createAuthSchemas(tCommon, t);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(schemas.registerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);
      formData.append('terms', String(data.terms));

      // Call server action
      const result = await register(null, formData);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      // Success
      if (result.message) {
        toast.success(result.message);
      }
      form.reset();

      // Redirect if specified
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Field */}
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              {t('fields.name.label')} <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type="text"
                  placeholder={t('fields.name.placeholder')}
                  autoComplete="name"
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

      {/* Email Field */}
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              {t('fields.email.label')} <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder={t('fields.email.placeholder')}
                  autoComplete="email"
                  disabled={form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
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
              {t('fields.password.label')} <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldContent>
              <PasswordInput
                {...field}
                id={field.name}
                placeholder={t('fields.password.placeholder')}
                autoComplete="new-password"
                disabled={form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          </Field>
        )}
      />

      {/* Confirm Password Field */}
      <Controller
        name="confirmPassword"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              {t('fields.confirmPassword.label')} <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldContent>
              <PasswordInput
                {...field}
                id={field.name}
                placeholder={t('fields.confirmPassword.placeholder')}
                autoComplete="new-password"
                disabled={form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          </Field>
        )}
      />

      {/* Terms Checkbox */}
      <Controller
        name="terms"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldContent>
              <div className="flex items-start gap-2">
                <Checkbox
                  id={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
                />
                <Label htmlFor={field.name} className="text-sm">
                  {t('fields.terms.label')}{' '}
                  <Link href="/terms" className="text-primary underline">
                    {t('fields.terms.link')}
                  </Link>
                </Label>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          </Field>
        )}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            {t('register.submitting')}
          </>
        ) : (
          t('register.submit')
        )}
      </Button>
    </form>
  );
}
```

### 7.2 Login Form Component

```typescript
// apps/marketplace/components/auth/login-form.tsx

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from '@/lib/i18n/navigation';

import { Button } from '@workspace/ui/components/button';
import { Field, FieldContent, FieldError, FieldLabel } from '@workspace/ui/components/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@workspace/ui/components/input-group';
import { PasswordInput } from '@workspace/ui/components/password-input';

import { login } from '@/actions/auth';
import { createAuthSchemas, type LoginFormValues } from '@/schemas/auth.schema';
import { useAuth } from '../providers/auth-provider';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Create schemas with i18n support
  const schemas = createAuthSchemas(tCommon, t);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schemas.loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      redirectTo: redirectTo,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      if (data.redirectTo) {
        formData.append('redirectTo', data.redirectTo);
      }

      // Call server action
      const result = await login(null, formData);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      // Success - refresh auth state
      await refreshUser();

      // Redirect if specified
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Field */}
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              {t('fields.email.label')}
            </FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder={t('fields.email.placeholder')}
                  autoComplete="email"
                  disabled={form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
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
              {t('fields.password.label')}
            </FieldLabel>
            <FieldContent>
              <PasswordInput
                {...field}
                id={field.name}
                placeholder={t('fields.password.placeholder')}
                autoComplete="current-password"
                disabled={form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          </Field>
        )}
      />

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <Link href="/auth/forgot-password" className="text-sm text-primary underline">
          {t('login.forgotPassword')}
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            {t('login.submitting')}
          </>
        ) : (
          t('login.submit')
        )}
      </Button>
    </form>
  );
}
```

---

## 8. Validation & Security

### 8.1 Validation Schema

```typescript
// apps/marketplace/schemas/auth.schema.ts

import { z } from 'zod';
import type { TFunction } from 'i18next';

export function createAuthSchemas(tCommon: TFunction, t: TFunction) {
  // Password validation regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

  return {
    registerSchema: z
      .object({
        name: z
          .string()
          .min(2, t('validation.name.min'))
          .max(255, t('validation.name.max')),
        email: z
          .string()
          .email(t('validation.email.invalid'))
          .min(1, t('validation.email.required')),
        password: z
          .string()
          .min(8, t('validation.password.min'))
          .regex(passwordRegex, t('validation.password.pattern')),
        confirmPassword: z.string(),
        terms: z.boolean().refine((val) => val === true, {
          message: t('validation.terms.required'),
        }),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: t('validation.password.mismatch'),
        path: ['confirmPassword'],
      }),

    loginSchema: z.object({
      email: z
        .string()
        .email(t('validation.email.invalid'))
        .min(1, t('validation.email.required')),
      password: z.string().min(1, t('validation.password.required')),
      redirectTo: z.string().optional(),
    }),
  };
}
```

### 8.2 Security Measures

#### Rate Limiting

```typescript
// Prevents brute force attacks
await rateLimitAction();
```

**Configuration:**
- Max requests per time window
- IP-based limiting
- User-based limiting

#### Password Requirements

- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Must contain special character

#### Error Messages

- **Generic errors**: Don't reveal if email exists
- **Rate limit**: Don't reveal rate limit status
- **Invalid credentials**: Generic message

#### Operation Logging

- Log all authentication attempts
- Track IP address and user agent
- Monitor for suspicious activity

---

## 9. Error Handling

### 9.1 Error Types

| Error Type | Cause | User Message |
|------------|-------|--------------|
| **Validation Error** | Invalid input | Field-specific error |
| **Rate Limit** | Too many requests | Generic error message |
| **Invalid Credentials** | Wrong email/password | Generic error message |
| **Account Exists** | Email already registered | "Account already exists" |
| **Server Error** | Supabase error | Generic error message |

### 9.2 Error Handling Pattern

```typescript
// Server Action
if (!validationResult.success) {
  const firstError = validationResult.error.errors[0];
  return {
    success: false,
    message: firstError?.message ?? t('errors.serverError'),
    formData,
  };
}

// Client Component
if (!result.success) {
  toast.error(result.message);
  return;
}
```

### 9.3 Logging Failed Attempts

```typescript
// Log failed login attempts
await logService.create({
  actorId: email,
  actorType: 'user',
  operationType: 'UPDATE',
  operationDescription: `Failed login attempt for ${email}`,
  status: 'failure',
  errorMessage: 'Invalid credentials',
  ipAddress: context.ipAddress,
  userAgent: context.userAgent,
});
```

---

## 10. Implementation Guide

### 10.1 Setup Checklist

- [ ] Install dependencies
  ```bash
  pnpm add @supabase/ssr @supabase/supabase-js
  pnpm add react-hook-form @hookform/resolvers zod
  pnpm add next-intl
  ```

- [ ] Setup Supabase
  - Create Supabase project
  - Get API keys
  - Setup environment variables

- [ ] Create database schema
  - Create `accounts` table
  - Create trigger function
  - Create trigger

- [ ] Create validation schemas
  - `schemas/auth.schema.ts`

- [ ] Create server actions
  - `actions/auth/auth.mutation.action.ts`

- [ ] Create UI components
  - `components/auth/login-form.tsx`
  - `components/auth/register-form.tsx`

- [ ] Create pages
  - `app/[lang]/(public)/auth/login/page.tsx`
  - `app/[lang]/(public)/auth/register/page.tsx`

- [ ] Setup i18n messages
  - `messages/en/auth.json`
  - `messages/th/auth.json`

### 10.2 Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 10.3 Supabase Client Setup

```typescript
// packages/supabase/src/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

### 10.4 Testing

#### Unit Tests

```typescript
// Test validation schemas
describe('Register Schema', () => {
  it('should validate correct input', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      terms: true,
    });
    expect(result.success).toBe(true);
  });
});
```

#### E2E Tests

```typescript
// e2e/tests/auth/register.spec.ts
test('user can register', async ({ page }) => {
  await page.goto('/auth/register');
  await page.fill('[name="name"]', 'John Doe');
  await page.fill('[name="email"]', 'john@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.fill('[name="confirmPassword"]', 'SecurePass123!');
  await page.check('[name="terms"]');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
});
```

---

## 11. Best Practices

### 11.1 Security

- ✅ Always validate on server-side
- ✅ Use rate limiting
- ✅ Don't reveal if email exists
- ✅ Use strong password requirements
- ✅ Log all authentication attempts
- ✅ Use HTTPS only
- ✅ Store passwords securely (Supabase handles this)

### 11.2 UX

- ✅ Show clear error messages
- ✅ Provide loading states
- ✅ Validate on blur (not on every keystroke)
- ✅ Show password strength indicator
- ✅ Remember redirect URL after login
- ✅ Support keyboard navigation
- ✅ Make forms accessible

### 11.3 Code Quality

- ✅ Use TypeScript for type safety
- ✅ Use Zod for validation
- ✅ Use React Hook Form for form state
- ✅ Follow server action patterns
- ✅ Use i18n for all text
- ✅ Follow folder structure conventions

---

## 12. Troubleshooting

### 12.1 Common Issues

#### Issue: "User already registered"

**Cause**: Email already exists in Supabase
**Solution**: Check if user exists before signup, or handle error gracefully

#### Issue: "Email not verified"

**Cause**: Email verification required but not completed
**Solution**: Check `email_confirmed_at` field, resend verification email

#### Issue: "Session not persisting"

**Cause**: Cookie settings incorrect
**Solution**: Check Supabase client configuration, ensure cookies are set correctly

#### Issue: "Rate limit exceeded"

**Cause**: Too many requests
**Solution**: Implement exponential backoff, show user-friendly message

---

## 13. References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [next-intl](https://next-intl-docs.vercel.app/)

---

**Last Updated**: 2026-02-10
**Version**: 1.0
