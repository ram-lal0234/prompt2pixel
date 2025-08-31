'use client';

import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={cn('animate-spin text-current', sizeClasses[size], className)} />
  );
}

interface StatusIndicatorProps {
  status: 'loading' | 'success' | 'error' | 'idle';
  message?: string;
  className?: string;
}

export function StatusIndicator({ status, message, className }: StatusIndicatorProps) {
  const statusConfig = {
    loading: {
      icon: <LoadingSpinner size="sm" className="text-blue-500" />,
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    success: {
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    error: {
      icon: <AlertCircle className="w-4 h-4 text-red-500" />,
      textColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
    },
    idle: {
      icon: null,
      textColor: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      borderColor: 'border-gray-200 dark:border-gray-700',
    },
  };

  const config = statusConfig[status];

  if (status === 'idle' && !message) return null;

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg border',
      config.bgColor,
      config.borderColor,
      className
    )}>
      {config.icon}
      {message && (
        <span className={cn('text-sm font-medium', config.textColor)}>
          {message}
        </span>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2', className)}>
      <div
        className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
