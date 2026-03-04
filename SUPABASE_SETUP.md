# Supabase Setup Guide

## 📍 ตำแหน่งที่ต้องมี Supabase Utilities

**คำตอบ: ไม่จำเป็นต้องมีทุก project** 

ตาม PRD และโครงสร้าง Monorepo:

### ✅ ต้องมี Supabase Utilities

1. **`apps/marketplace`** - ✅ **ต้องมี**
   - Next.js app สำหรับ Human (ผู้จ้าง AI)
   - ใช้ Supabase Auth สำหรับ authentication
   - มี `utils/supabase/server.ts`, `client.ts`, และ `middleware.ts`

### ❌ ไม่ต้องมี Supabase Utilities

2. **`apps/web`** - ❌ ไม่ต้องมี
   - เป็น starter template
   - ไม่ใช้ Supabase

3. **`apps/docs`** - ❌ ไม่ต้องมี
   - เป็น documentation site
   - ไม่ใช้ Supabase

4. **`apps/api`** - ⚠️ อาจต้องการ (Phase 1+)
   - Elysia backend API
   - อาจใช้ Supabase Service Role Key สำหรับ server-side operations
   - แต่ไม่ต้องใช้ client utilities เหมือน Next.js

---

## 📁 โครงสร้าง Supabase Utilities ใน `apps/marketplace`

```
apps/marketplace/
├── utils/
│   └── supabase/
│       ├── server.ts      # Server Components & Server Actions
│       └── client.ts      # Client Components
├── middleware.ts          # Auth middleware
└── app/
    └── page.tsx           # Example usage
```

---

## 🔧 การใช้งาน

### Server Components (เช่น `app/page.tsx`)

```typescript
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return <div>Welcome {user?.email}</div>;
}
```

### Client Components

```typescript
"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function UserProfile() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return <div>{user?.email}</div>;
}
```

### Server Actions

```typescript
"use server";

import { createClient } from "@/utils/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
```

---

## 🔐 Environment Variables

**ตำแหน่ง:** `apps/marketplace/.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://gdnuhplqnwuyoieiyqco.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_r3HSKGXhOE0KAA5BaCEclA_Ilqfxmmt
```

---

## ✅ Checklist

- [x] สร้าง `apps/marketplace/utils/supabase/server.ts`
- [x] สร้าง `apps/marketplace/utils/supabase/client.ts`
- [x] สร้าง `apps/marketplace/middleware.ts`
- [x] สร้าง `apps/marketplace/.env.local` พร้อม Supabase credentials
- [ ] ติดตั้ง dependencies (`@supabase/ssr`)
- [ ] ทดสอบ authentication flow

---

## 📚 References

- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Next.js App Router with Supabase](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
