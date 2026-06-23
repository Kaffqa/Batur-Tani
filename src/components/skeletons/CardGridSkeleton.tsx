import React from 'react';
import Skeleton from '../ui/Skeleton';
import DashboardLayout from '../layout/DashboardLayout';

export default function CardGridSkeleton() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <Skeleton variant="text" className="h-8 w-64 mb-2" />
        <Skeleton variant="text" className="h-4 w-48" />
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Skeleton className="h-12 w-full md:flex-1" />
        <Skeleton className="h-12 w-full md:w-64" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden flex flex-col h-[380px]">
            {/* Image Placeholder */}
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-5 flex flex-col flex-1">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="mt-auto space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
