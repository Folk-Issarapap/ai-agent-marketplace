'use client';

import { Badge } from '@workspace/ui/components/badge';
import { CheckCircle2, Ban } from 'lucide-react';

/**
 * Account Status Badge
 * Displays account status (Active/Inactive) with appropriate styling
 */
interface AccountStatusBadgeProps {
  status?: 'active' | 'inactive';
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function AccountStatusBadge({
  status = 'active',
  className,
  size = 'md',
}: AccountStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle2,
          variant: 'success' as const,
          label: 'Active',
        };
      case 'inactive':
        return {
          icon: Ban,
          variant: 'destructive' as const,
          label: 'Inactive',
        };
      default:
        return {
          icon: CheckCircle2,
          variant: 'success' as const,
          label: 'Active',
        };
    }
  };

  const { icon: Icon, variant, label } = getStatusConfig();

  return (
    <Badge variant={variant} size={size} className={className}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
