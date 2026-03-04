'use client';

import type { ReactNode } from 'react';
import { SidebarProvider } from '@workspace/ui/components/sidebar';
import { AppSidebar } from '@/components/layouts/app-sidebar';

export function SidebarWrapper({
  children,
  userEmail,
  className,
}: {
  children: ReactNode;
  userEmail?: string;
  className?: string;
}) {
  return (
    <SidebarProvider className={className}>
      <AppSidebar userEmail={userEmail} />
      {children}
    </SidebarProvider>
  );
}
