"use client";

import { cn } from "@/lib/utils";

interface SidenavSkeletonProps {
  className?: string;
}

export function SidenavSkeleton({ className }: SidenavSkeletonProps) {
  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700", className)}>
      {/* Header Skeleton */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
          </div>
        </div>
        
        {/* New Chat Button Skeleton */}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>

      {/* Chat List Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Chat Item Skeletons */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
