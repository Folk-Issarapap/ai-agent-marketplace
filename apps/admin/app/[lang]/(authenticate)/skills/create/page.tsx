import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { BookOpen } from 'lucide-react';
import { SkillCreateForm } from '@/components/skills/forms/skill-create-form';
import { BackButton } from '@/components/common-back-button';
import { getSkillCategories } from '@/actions/skills';

interface SkillCreatePageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: SkillCreatePageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'Create Skill',
    description: 'Create a new skill for the marketplace catalog',
  };
}

export default async function SkillCreatePage({ params }: SkillCreatePageProps) {
  const { lang } = await params;

  // Fetch categories for the form
  const categoriesResult = await getSkillCategories();
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];

  return (
    <div className="space-y-6">
      <BackButton href="/skills" lang={lang} />

      {/* Hero Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Create New Skill</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a new skill to the marketplace catalog. Fill in the details below to get started.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Details</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillCreateForm categories={categories} lang={lang} />
        </CardContent>
      </Card>
    </div>
  );
}
