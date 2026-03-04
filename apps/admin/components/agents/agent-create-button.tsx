'use client';

import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface AgentCreateButtonProps {
  lang: string;
}

export function AgentCreateButton({ lang }: AgentCreateButtonProps) {
  return (
    <Button asChild data-testid="create-agent-button">
      <Link href={`/${lang}/agents/create`}>
        <Plus className="mr-2 h-4 w-4" />
        Create Agent
      </Link>
    </Button>
  );
}
