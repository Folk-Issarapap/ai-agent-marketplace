'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import {
  User,
  Settings,
  KeyRound,
  AlertTriangle,
  Info,
  type LucideIcon,
} from 'lucide-react';

// Icon mapping - all icons defined in client component
const iconMap: Record<string, LucideIcon> = {
  user: User,
  settings: Settings,
  'key-round': KeyRound,
  'alert-triangle': AlertTriangle,
  info: Info,
};

interface SettingsNavContextValue {
  activeSection: string;
  setActiveSection: (id: string) => void;
}

const SettingsNavContext = createContext<SettingsNavContextValue | undefined>(undefined);

function useSettingsNav() {
  const context = useContext(SettingsNavContext);
  if (!context) {
    throw new Error('SettingsNavItem must be used within SettingsNavSidebar');
  }
  return context;
}

export interface SettingsNavSection {
  id: string;
  label: string;
  icon?: string; // Icon identifier as string
}

interface SettingsNavSidebarProps {
  sections: SettingsNavSection[];
  className?: string;
  children?: React.ReactNode;
}

export function SettingsNavSidebar({ sections, className, children }: SettingsNavSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for better UX

      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionData = sections[i];
        if (!sectionData) continue;
        const section = document.getElementById(sectionData.id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sectionData.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const contextValue: SettingsNavContextValue = {
    activeSection,
    setActiveSection,
  };

  return (
    <SettingsNavContext.Provider value={contextValue}>
      <aside className={cn('w-64 shrink-0 hidden lg:block', 'sticky top-6 self-start', className)}>
        <nav className="space-y-1">
          {children ||
            sections.map((section) => (
              <SettingsNavItem key={section.id} id={section.id} icon={section.icon}>
                {section.label}
              </SettingsNavItem>
            ))}
        </nav>
      </aside>
    </SettingsNavContext.Provider>
  );
}

interface SettingsNavItemProps {
  id: string;
  icon?: string;
  children: React.ReactNode;
}

function SettingsNavItem({ id, icon, children }: SettingsNavItemProps) {
  const { activeSection, setActiveSection } = useSettingsNav();
  const isActive = activeSection === id;

  const IconComponent = icon && icon in iconMap ? iconMap[icon] : undefined;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <a
      href={`#${id}`}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
      )}
    >
      {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground/60" />}
      <span>{children}</span>
    </a>
  );
}

SettingsNavSidebar.Item = SettingsNavItem;

export { SettingsNavItem };
