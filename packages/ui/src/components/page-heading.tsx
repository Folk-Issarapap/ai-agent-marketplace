'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@workspace/ui/lib/utils';

const pageHeadingVariants = cva('flex items-start justify-between gap-4', {
  variants: {
    size: {
      sm: 'pb-4',
      md: 'pb-6',
      lg: 'pb-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const pageHeadingContentVariants = cva('flex-1 space-y-1', {
  variants: {
    hasBack: {
      true: 'ml-2',
      false: '',
    },
  },
  defaultVariants: {
    hasBack: false,
  },
});

const pageHeadingTitleVariants = cva('font-semibold tracking-tight text-foreground', {
  variants: {
    size: {
      sm: 'text-xl',
      md: 'text-2xl',
      lg: 'text-3xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const pageHeadingDescriptionVariants = cva('text-muted-foreground', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const pageHeadingBackVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 shrink-0',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// Context for size and back state sharing
const PageHeadingContext = React.createContext<{
  size?: 'sm' | 'md' | 'lg';
  hasBack?: boolean;
}>({
  size: 'md',
  hasBack: false,
});

// Root PageHeading component
type PageHeadingProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof pageHeadingVariants>;

function PageHeading({ className, size = 'md', children, ...props }: PageHeadingProps) {
  // Check if children includes PageHeadingBack
  const hasBack = React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === PageHeadingBack
  );

  return (
    <PageHeadingContext.Provider value={{ size: size ?? 'md', hasBack }}>
      <div className={cn(pageHeadingVariants({ size }), className)} {...props}>
        {children}
      </div>
    </PageHeadingContext.Provider>
  );
}

// Back button component
interface PageHeadingBackProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ComponentType<{ className?: string }>;
}

function PageHeadingBack({ className, icon: Icon = ArrowLeft, ...props }: PageHeadingBackProps) {
  const { size } = React.useContext(PageHeadingContext);

  return (
    <button className={cn(pageHeadingBackVariants({ size: size ?? 'md' }), className)} {...props}>
      <Icon className="h-4 w-4" />
    </button>
  );
}

// Content wrapper for title and description
type PageHeadingContentProps = React.HTMLAttributes<HTMLDivElement>;

function PageHeadingContent({ className, ...props }: PageHeadingContentProps) {
  const { hasBack } = React.useContext(PageHeadingContext);

  return <div className={cn(pageHeadingContentVariants({ hasBack }), className)} {...props} />;
}

// Title component
interface PageHeadingTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

function PageHeadingTitle({ className, as: Component = 'h1', ...props }: PageHeadingTitleProps) {
  const { size } = React.useContext(PageHeadingContext);

  return (
    <Component
      className={cn(pageHeadingTitleVariants({ size: size ?? 'md' }), className)}
      {...props}
    />
  );
}

// Description component
type PageHeadingDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

function PageHeadingDescription({ className, ...props }: PageHeadingDescriptionProps) {
  const { size } = React.useContext(PageHeadingContext);

  return (
    <p
      className={cn(pageHeadingDescriptionVariants({ size: size ?? 'md' }), className)}
      {...props}
    />
  );
}

// Actions wrapper for right-side actions
type PageHeadingActionsProps = React.HTMLAttributes<HTMLDivElement>;

function PageHeadingActions({ className, ...props }: PageHeadingActionsProps) {
  return <div className={cn('flex items-center gap-2 shrink-0', className)} {...props} />;
}

// ============================================================================
// Page Sub Heading Components
// ============================================================================

const pageSubHeadingVariants = cva('flex items-start justify-between gap-4', {
  variants: {
    size: {
      sm: 'pb-2',
      md: 'pb-3',
      lg: 'pb-4',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const pageSubHeadingContentVariants = cva('flex-1 space-y-0.5', {
  variants: {
    hasBack: {
      true: 'ml-2',
      false: '',
    },
  },
  defaultVariants: {
    hasBack: false,
  },
});

const pageSubHeadingTitleVariants = cva('font-medium tracking-tight text-foreground', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-xl',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const pageSubHeadingDescriptionVariants = cva('text-muted-foreground', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const pageSubHeadingBackVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground shrink-0',
  {
    variants: {
      size: {
        sm: 'h-7 w-7',
        md: 'h-8 w-8',
        lg: 'h-9 w-9',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// Context for sub heading size and back state sharing
const PageSubHeadingContext = React.createContext<{
  size?: 'sm' | 'md' | 'lg';
  hasBack?: boolean;
}>({
  size: 'md',
  hasBack: false,
});

// Root PageSubHeading component
type PageSubHeadingProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof pageSubHeadingVariants>;

function PageSubHeading({ className, size = 'md', children, ...props }: PageSubHeadingProps) {
  // Check if children includes PageSubHeadingBack
  const hasBack = React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === PageSubHeadingBack
  );

  return (
    <PageSubHeadingContext.Provider value={{ size: size ?? 'md', hasBack }}>
      <div className={cn(pageSubHeadingVariants({ size }), className)} {...props}>
        {children}
      </div>
    </PageSubHeadingContext.Provider>
  );
}

// Back button component for sub heading
interface PageSubHeadingBackProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ComponentType<{ className?: string }>;
}

function PageSubHeadingBack({
  className,
  icon: Icon = ArrowLeft,
  ...props
}: PageSubHeadingBackProps) {
  const { size } = React.useContext(PageSubHeadingContext);

  return (
    <button
      className={cn(pageSubHeadingBackVariants({ size: size ?? 'md' }), className)}
      {...props}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

// Content wrapper for sub heading title and description
type PageSubHeadingContentProps = React.HTMLAttributes<HTMLDivElement>;

function PageSubHeadingContent({ className, ...props }: PageSubHeadingContentProps) {
  const { hasBack } = React.useContext(PageSubHeadingContext);

  return <div className={cn(pageSubHeadingContentVariants({ hasBack }), className)} {...props} />;
}

// Title component for sub heading
interface PageSubHeadingTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

function PageSubHeadingTitle({
  className,
  as: Component = 'h2',
  ...props
}: PageSubHeadingTitleProps) {
  const { size } = React.useContext(PageSubHeadingContext);

  return (
    <Component
      className={cn(pageSubHeadingTitleVariants({ size: size ?? 'md' }), className)}
      {...props}
    />
  );
}

// Description component for sub heading
type PageSubHeadingDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

function PageSubHeadingDescription({ className, ...props }: PageSubHeadingDescriptionProps) {
  const { size } = React.useContext(PageSubHeadingContext);

  return (
    <p
      className={cn(pageSubHeadingDescriptionVariants({ size: size ?? 'md' }), className)}
      {...props}
    />
  );
}

// Actions wrapper for right-side actions in sub heading
type PageSubHeadingActionsProps = React.HTMLAttributes<HTMLDivElement>;

function PageSubHeadingActions({ className, ...props }: PageSubHeadingActionsProps) {
  return <div className={cn('flex items-center gap-2 shrink-0', className)} {...props} />;
}

export {
  PageHeading,
  PageHeadingBack,
  PageHeadingContent,
  PageHeadingTitle,
  PageHeadingDescription,
  PageHeadingActions,
  PageSubHeading,
  PageSubHeadingBack,
  PageSubHeadingContent,
  PageSubHeadingTitle,
  PageSubHeadingDescription,
  PageSubHeadingActions,
};
