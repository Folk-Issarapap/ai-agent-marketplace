# Components Usage Guide

## 📦 ใช้ Components จาก `@workspace/ui`

คุณมี components ครบถ้วนอยู่แล้วใน `packages/ui/src/components/` (136 components)!

### ✅ Components ที่มีอยู่แล้ว

ตาม PRD Section 19.2 ที่ต้องการ:

| Component | Path | Status |
|-----------|------|--------|
| **Button** | `@workspace/ui/components/button` | ✅ มีแล้ว |
| **Card** | `@workspace/ui/components/card` | ✅ มีแล้ว |
| **Dialog** | `@workspace/ui/components/dialog` | ✅ มีแล้ว |
| **Table** | `@workspace/ui/components/table` | ✅ มีแล้ว |
| **Badge** | `@workspace/ui/components/badge` | ✅ มีแล้ว |
| **Input** | `@workspace/ui/components/input` | ✅ มีแล้ว |
| **Label** | `@workspace/ui/components/label` | ✅ มีแล้ว |
| **Textarea** | `@workspace/ui/components/textarea` | ✅ มีแล้ว |
| **Select** | `@workspace/ui/components/select` | ✅ มีแล้ว |
| **Skeleton** | `@workspace/ui/components/skeleton` | ✅ มีแล้ว |
| **Separator** | `@workspace/ui/components/separator` | ✅ มีแล้ว |
| **Avatar** | `@workspace/ui/components/avatar` | ✅ มีแล้ว |

---

## 🔧 วิธีใช้งาน

### 1. Import จาก `@workspace/ui`

```typescript
// ✅ ถูกต้อง - ใช้จาก packages/ui
import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Dialog, DialogTrigger, DialogContent } from "@workspace/ui/components/dialog";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Separator } from "@workspace/ui/components/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@workspace/ui/components/avatar";
```

### 2. ตัวอย่างการใช้งาน

```typescript
// app/components/jobs/job-create-dialog.tsx
"use client";

import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";

export function JobCreateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Job</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" placeholder="Enter job title" />
          </div>
          <div>
            <Label htmlFor="goal">Goal</Label>
            <Textarea id="goal" placeholder="Describe the goal" />
          </div>
          <Button type="submit">Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 3. ตัวอย่าง Job Status Badge

```typescript
// app/components/jobs/job-status-badge.tsx
import { Badge } from "@repo/ui/components/badge";

type JobStatus = "draft" | "published" | "active" | "in_review" | "completed";

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const variantMap: Record<JobStatus, "primary" | "secondary" | "success" | "warning"> = {
    draft: "secondary",
    published: "primary",
    active: "primary",
    in_review: "warning",
    completed: "success",
  };

  return <Badge variant={variantMap[status]}>{status}</Badge>;
}
```

### 4. ตัวอย่าง Agent Card

```typescript
// app/components/agents/agent-detail-card.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@repo/ui/components/avatar";

export function AgentDetailCard({ agent }: { agent: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={agent.avatar} />
            <AvatarFallback>{agent.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{agent.name}</CardTitle>
            <Badge variant="primary">{agent.type}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>{agent.description}</p>
        <div className="mt-4 flex items-center gap-2">
          <Badge variant="success">Rating: {agent.rating}</Badge>
          <Badge variant="secondary">{agent.completedJobs} jobs</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📁 โครงสร้าง Component (ตาม PRD Section 19.2)

สร้างเฉพาะ feature-specific components ใน `apps/marketplace/components/`:

```
apps/marketplace/
├── components/
│   ├── jobs/
│   │   ├── job-create-dialog.tsx      # ใช้ Dialog, Input, Label, Textarea
│   │   ├── job-detail-section.tsx      # ใช้ Card, Badge
│   │   ├── job-list-table.tsx          # ใช้ Table, Badge
│   │   └── job-status-badge.tsx        # ใช้ Badge
│   ├── agents/
│   │   ├── agent-marketplace-grid.tsx   # ใช้ Card, Avatar, Badge
│   │   ├── agent-detail-card.tsx        # ใช้ Card, Avatar, Badge
│   │   └── agent-rating-display.tsx     # ใช้ Rating component (ถ้ามี)
│   └── wallet/
│       └── wallet-balance-card.tsx      # ใช้ Card
└── components/ui/                      # ❌ ไม่ต้องสร้าง - ใช้จาก @repo/ui
```

---

## ⚠️ หมายเหตุสำคัญ

1. **ไม่ต้องสร้าง components/ui/** - ใช้จาก `@workspace/ui` แทน
2. **Path ที่ถูกต้อง**: `@workspace/ui/components/<component-name>`
3. **Utils**: Components ใน `@workspace/ui` ใช้ `@workspace/ui/lib/utils`
4. **Feature Components**: สร้างเฉพาะ feature-specific components ใน `apps/marketplace/components/`

---

## ✅ Checklist

- [x] ตรวจสอบ components ใน `packages/ui`
- [x] Components ครบถ้วนตาม PRD
- [ ] สร้าง feature-specific components
- [ ] ทดสอบการใช้งาน components

---

## 📚 Components ที่มีใน `@workspace/ui`

มีทั้งหมด **136 components** รวมถึง:
- Form components (Input, Textarea, Select, Checkbox, Radio, etc.)
- Layout components (Card, Separator, Sheet, Sidebar, etc.)
- Data display (Table, DataTable, DataGrid, Chart, etc.)
- Feedback (Dialog, Toast, Sonner, Skeleton, etc.)
- Navigation (Breadcrumb, Tabs, Pagination, etc.)
- และอื่นๆ อีกมากมาย

ดูรายการทั้งหมดได้ที่: `packages/ui/src/components/`
