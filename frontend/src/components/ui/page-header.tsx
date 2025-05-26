import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string;
  subheading?: string;
}

export function PageHeader({
  heading,
  subheading,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn('mb-10', className)} {...props}>
      <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
      {subheading && (
        <p className="mt-2 text-muted-foreground text-lg">{subheading}</p>
      )}
    </div>
  );
}
