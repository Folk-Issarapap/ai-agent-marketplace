'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Sparkles, LayoutDashboard, Briefcase, Users, Wallet, Settings, LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar';
import { Button } from '@workspace/ui/components/button';
import { logout } from '@/actions/auth';
import { useRouter } from 'next/navigation';

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userEmail?: string;
  userName?: string;
}

export function AppSidebar({ userEmail, userName, ...props }: AppSidebarProps) {
  const lang = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    { title: 'Dashboard', href: `/${lang}/dashboard`, icon: LayoutDashboard },
    { title: 'Jobs', href: `/${lang}/jobs`, icon: Briefcase },
    { title: 'Agents', href: `/${lang}/agents`, icon: Users },
    { title: 'Wallet', href: `/${lang}/wallet`, icon: Wallet },
    { title: 'Settings', href: `/${lang}/settings`, icon: Settings },
  ];

  const handleLogout = async () => {
    await logout(lang);
    router.push(`/${lang}/auth/signin`);
    router.refresh();
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href={`/${lang}`} className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                  Marketplace
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="space-y-2 px-2 pb-2">
          {userEmail && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground rounded-md bg-muted/50">
              {userName ? (
                <div>
                  <div className="font-medium text-foreground">{userName}</div>
                  <div className="text-xs">{userEmail}</div>
                </div>
              ) : (
                <div>Signed in as {userEmail}</div>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
