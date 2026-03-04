import { Suspense } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { FolderTree } from 'lucide-react';
import { SkillsHeaderCreateButton } from '@/components/skills/skills-header-create-button';
import { SkillCategoryTable } from '@/components/skills/tables/skill-category-table';
import { SkillCategoryTableSkeleton } from '@/components/skills/tables/skill-category-table-skeleton';
import type { SearchParams } from 'nuqs';

export default async function SkillCategoriesTablePage({
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
            <FolderTree className="mr-2 h-3.5 w-3.5" />
            Skill Categories Management
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Skill Categories</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage canonical categories for the skills catalog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SkillsHeaderCreateButton target="categories" lang={lang} />
        </div>
      </div>

      <Suspense fallback={<SkillCategoryTableSkeleton />}>
        <SkillCategoryTable searchParams={searchParams} lang={lang} />
      </Suspense>
    </div>
  );
}
