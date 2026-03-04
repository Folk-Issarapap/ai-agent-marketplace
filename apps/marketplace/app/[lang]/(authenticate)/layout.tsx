import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { Separator } from '@workspace/ui/components/separator';
import { SidebarInset, SidebarTrigger } from '@workspace/ui/components/sidebar';
import { SidebarWrapper } from '@/components/layouts/sidebar-wrapper';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { createClient } from '@/utils/supabase/server';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}

/**
 * Authenticated Layout
 * Protects routes that require authentication and provides sidebar navigation
 */
export default async function AuthenticatedLayout({
  children,
  params,
}: AuthenticatedLayoutProps) {
  const { lang } = await params;

  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/auth/signin`);
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || undefined;

  return (
    <SidebarWrapper userEmail={user?.email} userName={userName}>
      <SidebarInset className="overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          </div>
          <span className="text-sm text-muted-foreground">Marketplace Workspace</span>
          <div className="ml-auto">
            <ThemeSwitcher />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarWrapper>
  );
}
