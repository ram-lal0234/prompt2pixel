import { useState, useCallback } from 'react';

export type LayoutState = 'config-only' | 'config-with-chat';

export interface LayoutStateHook {
  layoutState: LayoutState;
  setLayoutState: (state: LayoutState) => void;
  showChat: () => void;
  hideChat: () => void;
  isChatVisible: boolean;
  isConfigCollapsed: boolean;
  toggleConfig: () => void;
  expandConfig: () => void;
  collapseConfig: () => void;
}

export function useLayoutState(): LayoutStateHook {
  const [layoutState, setLayoutState] = useState<LayoutState>('config-only');
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);

  const showChat = useCallback(() => {
    setLayoutState('config-with-chat');
  }, []);

  const hideChat = useCallback(() => {
    setLayoutState('config-only');
  }, []);

  const isChatVisible = layoutState === 'config-with-chat';

  const toggleConfig = useCallback(() => {
    setIsConfigCollapsed(prev => !prev);
  }, []);

  const expandConfig = useCallback(() => {
    setIsConfigCollapsed(false);
  }, []);

  const collapseConfig = useCallback(() => {
    setIsConfigCollapsed(true);
  }, []);

  return {
    layoutState,
    setLayoutState,
    showChat,
    hideChat,
    isChatVisible,
    isConfigCollapsed,
    toggleConfig,
    expandConfig,
    collapseConfig,
  };
} 
