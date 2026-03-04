'use client';

import { SidebarProvider } from '@workspace/ui/components/sidebar';
import { AppSidebar } from './app-sidebar';

interface SidebarWrapperProps {
  children: React.ReactNode;
  userEmail?: string;
  userName?: string;
}

export function SidebarWrapper({ children, userEmail, userName }: SidebarWrapperProps) {
  return (
    <SidebarProvider>
      <AppSidebar userEmail={userEmail} userName={userName} />
      {children}
    </SidebarProvider>
  );
}
