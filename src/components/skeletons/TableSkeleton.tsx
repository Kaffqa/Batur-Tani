import React from 'react';
import Skeleton from '../ui/Skeleton';
import DashboardLayout from '../layout/DashboardLayout';

interface TableSkeletonProps {
  title?: boolean;
}

export default function TableSkeleton({ title = true }: TableSkeletonProps) {
  return (
    <DashboardLayout>
      {title && (
        <div className="mb-8">
          <Skeleton variant="text" className="h-8 w-64 mb-2" />
          <Skeleton variant="text" className="h-4 w-48" />
        </div>
      )}

      {/* Top filters/actions */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 w-full md:w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
        {/* Header Row */}
        <div className="px-6 py-4 border-b border-white/5 flex gap-4">
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
        </div>
        {/* Rows */}
        <div className="divide-y divide-white/5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="px-6 py-4 flex gap-4 items-center">
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-1/6 rounded-full" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
