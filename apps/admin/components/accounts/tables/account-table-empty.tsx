'use client';

import { Button } from '@workspace/ui/components/button';
import { TableEmpty } from '@workspace/ui/components/empty';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { AccountCreateSheet } from '../sheets/account-create-sheet';
import { ClearFilter } from '@workspace/ui/components/clear-filter';

interface AccountTableEmptyProps {
  type: 'no-accounts' | 'no-results';
}

export function AccountTableEmpty({ type }: AccountTableEmptyProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (type === 'no-accounts') {
    return (
      <>
        <TableEmpty
          icon={Plus}
          title="No accounts found"
          description="Get started by creating your first account"
          action={
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              data-testid="create-account-empty-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          }
          data-testid="accounts-empty-state"
        />
        <AccountCreateSheet open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
      </>
    );
  }

  return (
    <TableEmpty
      icon={Search}
      title="No results found"
      description="Try adjusting your filters to see more results"
      action={<ClearFilter excludeKeys={['page', 'pageSize', 'sort', 'sortOrder']} />}
      data-testid="accounts-empty-state"
    />
  );
}
