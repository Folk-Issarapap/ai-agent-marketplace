import 'server-only';

import { SearchParams } from 'nuqs';
import { getSkillCategories } from '@/actions/skills';
import { SkillCategoryDataGrid } from './skill-category-data-grid';

type SkillCategoryTableProps = {
  searchParams: Promise<SearchParams>;
  lang: string;
};

export async function SkillCategoryTable({ searchParams, lang }: SkillCategoryTableProps) {
  // Fetch categories
  const categoriesResult = await getSkillCategories();

  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];

  if (!categoriesResult.success) {
    return (
      <div className="border rounded-md p-4">
        <p className="text-muted-foreground">{categoriesResult.error || 'Failed to load categories'}</p>
      </div>
    );
  }

  return (
    <SkillCategoryDataGrid
      data={categories}
      lang={lang}
    />
  );
}
