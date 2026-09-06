import React from "react";

export function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`bg-slate-200/80 border border-slate-200 animate-pulse rounded-xl ${className}`}
    />
  );
}

export function MobilePageSkeleton({
  title = "Loading...",
}: {
  title?: string;
}) {
  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 bg-white">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Main Banner Skeleton */}
      <Skeleton className="h-28 w-full rounded-card" />

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 w-full rounded-card" />
        <Skeleton className="h-20 w-full rounded-card" />
      </div>

      {/* List Items Skeleton */}
      <div className="space-y-2.5 pt-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-16 w-full rounded-card" />
        <Skeleton className="h-16 w-full rounded-card" />
        <Skeleton className="h-16 w-full rounded-card" />
      </div>
    </div>
  );
}

export function DesktopPageSkeleton() {
  return (
    <div className="space-y-6 p-2 bg-white">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-28 w-full rounded-card" />
      </div>

      {/* Big Chart Skeleton */}
      <Skeleton className="h-72 w-full rounded-card" />

      {/* Table Skeleton */}
      <Skeleton className="h-64 w-full rounded-card" />
    </div>
  );
}
