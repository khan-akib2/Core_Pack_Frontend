import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, variant = 'default', children }) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/90",
    warning: "bg-orange-50 text-orange-700 border-orange-200/90",
    danger: "bg-rose-50 text-rose-700 border-rose-200/90",
    info: "bg-blue-50 text-blue-700 border-blue-200/90"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border shadow-2xs",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
