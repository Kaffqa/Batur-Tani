import React from 'react';
import Skeleton from '../ui/Skeleton';
import DashboardLayout from '../layout/DashboardLayout';

export default function WeatherSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Skeleton variant="text" className="h-8 w-64 mb-2" />
          <Skeleton variant="text" className="h-4 w-48" />
        </div>

        {/* 2 Risk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>

        {/* Chart Section */}
        <Skeleton className="h-[400px] w-full" />

        {/* 7-Day Forecast */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <Skeleton variant="text" className="h-6 w-64 mb-6" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-32 w-40 flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
