import { LucideIcon } from 'lucide-react';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from './empty';

type TableEmptyProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
};

/**
 * TableEmpty component
 * Reusable empty state for data tables
 * Displays icon, title, description, and optional action button
 */
export function TableEmpty({ icon: Icon, title, description, action }: TableEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
