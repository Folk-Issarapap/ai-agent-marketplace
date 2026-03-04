'use client';

import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface AccountCreateButtonProps {
  lang: string;
}

export function AccountCreateButton({ lang }: AccountCreateButtonProps) {
  return (
    <Link href={`/${lang}/accounts/create`}>
      <Button data-testid="create-account-button">
        <Plus className="mr-2 h-4 w-4" />
        Create Account
      </Button>
    </Link>
  );
}
