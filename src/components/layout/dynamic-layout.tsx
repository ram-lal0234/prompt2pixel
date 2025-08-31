'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LayoutState } from '@/hooks/use-layout-state';

interface DynamicLayoutProps {
  children: ReactNode;
  layoutState: LayoutState;
  isConfigCollapsed?: boolean;
  className?: string;
}

export function DynamicLayout({ children, layoutState, isConfigCollapsed = false, className }: DynamicLayoutProps) {
  return (
    <div 
      className={cn(
        "h-full transition-all duration-300 ease-in-out",
        // 2-column layout (config-only): sidebar + config
        layoutState === 'config-only' && "grid grid-cols-[280px_1fr]",
        // 3-column layout (config-with-chat): sidebar + chat + config
        layoutState === 'config-with-chat' && isConfigCollapsed && "grid grid-cols-[280px_1fr_60px]",
        layoutState === 'config-with-chat' && !isConfigCollapsed && "grid grid-cols-[280px_1fr_400px]",
        // Mobile: single column
        "lg:grid",
        className
      )}
    >
      {children}
    </div>
  );
} 
