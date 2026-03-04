'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  Users,
  Briefcase,
  Activity,
  UserPlus,
  LogIn,
  LogOut,
  BrainCircuit,
  Bot,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@workspace/ui/components/sidebar';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import { logoutAction } from '@/actions/auth';

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userEmail?: string;
}

export function AppSidebar({ userEmail, ...props }: AppSidebarProps) {
  const lang = useLocale() as string;
  const pathname = usePathname();
  const isChatActive = pathname === `/${lang}/chat`;

  const topNavItems: NavItem[] = [
    { title: 'Dashboard', href: `/${lang}`, icon: LayoutDashboard },
    { title: 'Accounts', href: `/${lang}/accounts`, icon: Users },
    { title: 'Jobs', href: `/${lang}/jobs`, icon: Briefcase },
    { title: 'System', href: `/${lang}/system`, icon: Activity },
    { title: 'Agents', href: `/${lang}/agents`, icon: Bot },
    { title: 'Sign In', href: `/${lang}/auth/signin`, icon: LogIn },
    { title: 'Sign Up', href: `/${lang}/auth/signup`, icon: UserPlus },
  ];

  const skillBaseHref = `/${lang}/skills`;
  const skillCategoriesHref = `/${lang}/skill-categories`;
  const isSkillGroupActive =
    pathname === skillBaseHref ||
    pathname.startsWith(`${skillBaseHref}/`) ||
    pathname === skillCategoriesHref ||
    pathname.startsWith(`${skillCategoriesHref}/`);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href={`/${lang}`} className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-semibold">Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform AI</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isChatActive}
                  className={cn(
                    isChatActive &&
                      'bg-primary/10 text-primary dark:bg-primary/15',
                  )}
                >
                  <Link
                    href={`/${lang}/chat`}
                    className="group flex items-center gap-2"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary transition-colors group-hover:from-primary/30 group-hover:to-primary/10">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <span className="flex-1 font-medium">
                      Platform Assistant
                    </span>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-primary/30 bg-primary/5 px-1.5 py-0 text-[10px] font-medium text-primary"
                    >
                      <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                      AI
                    </Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {topNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

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

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isSkillGroupActive}>
                  <Link href={skillBaseHref}>
                    <BrainCircuit className="h-4 w-4" />
                    <span>Skills</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={pathname === skillBaseHref}>
                      <Link href={skillBaseHref}>
                        <span>Skills</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={pathname === skillCategoriesHref}>
                      <Link href={skillCategoriesHref}>
                        <span>Skill Categories</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-2 px-2 pb-2">
          <div className="text-xs text-muted-foreground">
            {userEmail ? `Signed in as ${userEmail}` : 'Guest mode'}
          </div>
          {userEmail && (
            <form action={logoutAction}>
              <input type="hidden" name="lang" value={lang} />
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
