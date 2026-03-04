'use client';

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

import { cn } from '@workspace/ui/lib/utils';
import { buttonVariants } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/spinner';

interface AsyncAlertDialogActionProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> {
  onAsync: () => Promise<void>;
  setOpen: (open: boolean) => void;
  loadingText?: string;
  onLoadingChange?: (loading: boolean) => void;
}

function AsyncAlertDialogAction({
  onAsync,
  setOpen,
  children,
  loadingText,
  onLoadingChange,
  className,
  disabled,
  ...props
}: AsyncAlertDialogActionProps) {
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault(); // 🚫 prevents auto-close behavior
    e.stopPropagation();

    if (loading || disabled) {
      return;
    }

    try {
      setLoading(true);
      await onAsync();
      setOpen(false); // ✅ manually close only when done
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      onClick={handleClick}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Spinner className="h-4 w-4" />
          {loadingText || children}
        </div>
      ) : (
        children
      )}
    </AlertDialogPrimitive.Action>
  );
}

export { AsyncAlertDialogAction };
