import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { FolderTree } from 'lucide-react';
import { SkillCategoryCreateForm } from '@/components/skills/forms/skill-category-create-form';
import { BackButton } from '@/components/common-back-button';

interface SkillCategoryCreatePageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: SkillCategoryCreatePageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'Create Skill Category',
    description: 'Create a new category for skill grouping and filtering',
  };
}

export default async function SkillCategoryCreatePage({ params }: SkillCategoryCreatePageProps) {
  const { lang } = await params;

  return (
    <div className="space-y-6">
      <BackButton href="/skill-categories" lang={lang} />

      {/* Hero Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <FolderTree className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Create New Category</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a new category for skill grouping and filtering. Fill in the details below to get started.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillCategoryCreateForm lang={lang} />
        </CardContent>
      </Card>
    </div>
  );
}
