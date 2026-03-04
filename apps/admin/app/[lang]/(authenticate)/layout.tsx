import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { Separator } from '@workspace/ui/components/separator';
import { SidebarInset, SidebarTrigger } from '@workspace/ui/components/sidebar';
import { SidebarWrapper } from '@/components/layouts/sidebar-wrapper';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { createClient } from '@/utils/supabase/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default async function AuthenticateLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/auth/signin`);
  }

  return (
    <SidebarWrapper
      userEmail={user?.email}
      className="h-svh max-h-svh overflow-hidden"
    >
      <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          </div>
          <span className="text-sm text-muted-foreground">Admin Workspace</span>
          <div className="ml-auto">
            <ThemeSwitcher />
          </div>
        </header>
        <NuqsAdapter>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 pt-0">
            {children}
          </div>
        </NuqsAdapter>
      </SidebarInset>
    </SidebarWrapper>
  );
}
