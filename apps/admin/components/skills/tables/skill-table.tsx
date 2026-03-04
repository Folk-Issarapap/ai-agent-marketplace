import 'server-only';

import { SearchParams } from 'nuqs';
import { getSkills, getSkillCategories } from '@/actions/skills';
import { SkillDataGrid } from './skill-data-grid';
import type { AdminSkillCategory } from '@/actions/skills';

type SkillTableProps = {
  searchParams: Promise<SearchParams>;
  lang: string;
};

export async function SkillTable({ searchParams, lang }: SkillTableProps) {
  // Fetch skills and categories in parallel
  const [skillsResult, categoriesResult] = await Promise.all([
    getSkills(),
    getSkillCategories(),
  ]);

  const skills = skillsResult.success && skillsResult.data ? skillsResult.data : [];
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];

  if (!skillsResult.success) {
    return (
      <div className="border rounded-md p-4">
        <p className="text-muted-foreground">{skillsResult.error || 'Failed to load skills'}</p>
      </div>
    );
  }

  return (
    <SkillDataGrid
      data={skills}
      categories={categories}
      lang={lang}
    />
  );
}
