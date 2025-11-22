import React from 'react';
import { cn } from '../../lib/utils';

export const Spinner: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("animate-spin rounded-full border-2 border-current border-t-transparent text-accent h-6 w-6", className)} />
  );
};
