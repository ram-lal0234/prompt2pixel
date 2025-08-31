"use client";

import { cn } from "@/lib/utils";

interface ChatSkeletonProps {
  className?: string;
}

export function ChatSkeleton({ className }: ChatSkeletonProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header Skeleton */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User Message Skeleton */}
        <div className="flex justify-end">
          <div className="max-w-[80%] space-y-2">
            <div className="h-4 bg-blue-200 dark:bg-blue-900/30 rounded-lg animate-pulse w-32" />
            <div className="h-4 bg-blue-200 dark:bg-blue-900/30 rounded-lg animate-pulse w-48" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 ml-auto" />
          </div>
        </div>

        {/* AI Message Skeleton */}
        <div className="flex justify-start">
          <div className="max-w-[80%] space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-40" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-56" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-36" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
          </div>
        </div>

        {/* Thumbnail Skeleton */}
        <div className="flex justify-start">
          <div className="max-w-[80%] space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-32" />
            <div className="w-64 h-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
          </div>
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
