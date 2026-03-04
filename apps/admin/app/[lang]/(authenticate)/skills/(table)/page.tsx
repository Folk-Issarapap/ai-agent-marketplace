import { Suspense } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { BrainCircuit } from 'lucide-react';
import { SkillsHeaderCreateButton } from '@/components/skills/skills-header-create-button';
import { SkillTable } from '@/components/skills/tables/skill-table';
import { SkillTableSkeleton } from '@/components/skills/tables/skill-table-skeleton';
import type { SearchParams } from 'nuqs';

export default async function SkillsTablePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="outline" className="mb-3">
            <BrainCircuit className="mr-2 h-3.5 w-3.5" />
            Skills Management
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
          <p className="text-sm text-muted-foreground">Create and manage the canonical skills catalog.</p>
        </div>
        <div className="flex items-center gap-2">
          <SkillsHeaderCreateButton target="skills" lang={lang} />
        </div>
      </div>

      <Suspense fallback={<SkillTableSkeleton />}>
        <SkillTable searchParams={searchParams} lang={lang} />
      </Suspense>
    </div>
  );
}
