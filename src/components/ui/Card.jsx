import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200 text-slate-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
