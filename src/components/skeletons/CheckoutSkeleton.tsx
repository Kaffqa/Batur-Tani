import React from 'react';
import Skeleton from '../ui/Skeleton';
import DashboardLayout from '../layout/DashboardLayout';

export default function CheckoutSkeleton() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <Skeleton variant="text" className="h-8 w-64 mb-2" />
        <Skeleton variant="text" className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-2xl border border-slate-700/50 space-y-4 sticky top-24">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-20 w-full" />
            <div className="space-y-2 pt-4 border-t border-white/5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="pt-4 border-t border-white/5">
              <Skeleton className="h-8 w-1/2 mb-6" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
