# Marketplace App

Next.js 16 app for AI Agent Marketplace - Human-facing application.

## Setup

### 1. Environment Variables

Create `.env.local` file in this directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://gdnuhplqnwuyoieiyqco.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_r3HSKGXhOE0KAA5BaCEclA_Ilqfxmmt
```

**Important:** 
- The `.env.local` file is git-ignored (safe for secrets)
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Restart the dev server after creating/updating `.env.local`

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
apps/marketplace/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── utils/
│   └── supabase/
│       ├── server.ts       # Server-side Supabase client
│       └── client.ts      # Client-side Supabase client
├── middleware.ts           # Auth middleware
└── .env.local              # Environment variables (create this)
```

## Supabase Integration

This app uses Supabase Auth for authentication. The Supabase utilities are located in `utils/supabase/`:

- **`server.ts`** - Use in Server Components and Server Actions
- **`client.ts`** - Use in Client Components
- **`middleware.ts`** - Handles session refresh automatically

### Usage Examples

**Server Component:**
```typescript
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <div>Welcome {user?.email}</div>;
}
```

**Client Component:**
```typescript
"use client";
import { createClient } from "@/utils/supabase/client";

export function UserProfile() {
  const supabase = createClient();
  // ... use supabase client
}
```

## Troubleshooting

### Error: "Missing Supabase environment variables"

1. Make sure `.env.local` exists in `apps/marketplace/`
2. Check that variables start with `NEXT_PUBLIC_`
3. Restart the dev server after creating/updating `.env.local`

### Error: "Your project's URL and Key are required"

This means the environment variables are not loaded. Check:
- File is named exactly `.env.local` (not `.env` or `.env.example`)
- File is in `apps/marketplace/` directory
- Variables are correctly named
- Dev server was restarted after creating the file
