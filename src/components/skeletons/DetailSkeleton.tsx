import React from 'react';
import Skeleton from '../ui/Skeleton';
import DashboardLayout from '../layout/DashboardLayout';

export default function DetailSkeleton() {
  return (
    <DashboardLayout>
      {/* Back button */}
      <Skeleton className="h-6 w-24 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div className="space-y-6">
          <Skeleton className="h-64 sm:h-96 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="flex flex-col">
          <div className="mb-6">
            <Skeleton className="h-6 w-24 mb-3" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-8 w-1/3 mb-4" />
          </div>

          <div className="mb-8">
            <Skeleton className="h-6 w-32 mb-2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-slate-700/50 mb-8 space-y-4">
            <Skeleton className="h-8 w-48 mb-2" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-700/50 space-y-4">
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
