import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { User } from 'lucide-react';
import { AccountCreateForm } from '@/components/accounts/forms/account-create-form';
import { BackButton } from '@/components/common-back-button';

interface AccountCreatePageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: AccountCreatePageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'Create Account',
    description: 'Create a new admin account',
  };
}

export default async function AccountCreatePage({ params }: AccountCreatePageProps) {
  const { lang } = await params;

  return (
    <div className="space-y-6">
      <BackButton href="/accounts" lang={lang} />

      {/* Hero Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Create New Account</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a new admin account. Fill in the details below to get started.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountCreateForm lang={lang} />
        </CardContent>
      </Card>
    </div>
  );
}
