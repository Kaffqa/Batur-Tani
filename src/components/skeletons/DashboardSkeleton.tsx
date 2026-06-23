import React from 'react';
import Skeleton from '../ui/Skeleton';
import DashboardLayout from '../layout/DashboardLayout';

export default function DashboardSkeleton() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <Skeleton variant="text" className="h-8 w-64 mb-2" />
        <Skeleton variant="text" className="h-4 w-48" />
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>

      {/* Weather & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>

      {/* Recent Orders Table */}
      <Skeleton className="h-[400px] w-full" />
    </DashboardLayout>
  );
}
