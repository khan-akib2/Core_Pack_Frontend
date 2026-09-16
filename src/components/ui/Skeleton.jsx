'use client';

import React from 'react';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`}
      {...props}
    />
  );
}

export function KpiCardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200/80 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-36" />
          </div>
          <Skeleton className="h-3.5 w-24" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full space-y-3 p-4">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center space-x-4 py-2 border-b border-slate-100 last:border-0">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton
              key={cIdx}
              className={`h-4 ${cIdx === 0 ? 'w-24' : cIdx === 1 ? 'w-44 flex-1' : 'w-20'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
