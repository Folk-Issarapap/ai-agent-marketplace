import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Bot } from 'lucide-react';
import { AgentCreateForm } from '@/components/agents/forms/agent-create-form';
import { getAccounts } from '@/actions/accounts';
import { BackButton } from '@/components/common-back-button';

interface AgentCreatePageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: AgentCreatePageProps): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: 'Create Agent',
    description: 'Create a new AI agent for the marketplace',
  };
}

export default async function AgentCreatePage({ params }: AgentCreatePageProps) {
  const { lang } = await params;

  // Fetch accounts for creator selection
  const accountsResult = await getAccounts(1, 1000, {});
  const accounts = accountsResult.success && accountsResult.data ? accountsResult.data.data : [];

  return (
    <div className="space-y-6">
      <BackButton href="/agents" lang={lang} />

      {/* Hero Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Create New Agent</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a new AI agent for the marketplace. Fill in the details below to get started.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AgentCreateForm accounts={accounts} lang={lang} />
        </CardContent>
      </Card>
    </div>
  );
}
