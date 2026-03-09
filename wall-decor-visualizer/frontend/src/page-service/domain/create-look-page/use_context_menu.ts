import { useState, useCallback, useRef, useEffect } from 'react';

export interface IContextMenuState {
  isVisible: boolean;
  position: { x: number; y: number };
  targetModelId: string | null;
}

export interface IUseContextMenuReturn {
  contextMenuState: IContextMenuState;
  showContextMenu: (modelId: string, x: number, y: number) => void;
  hideContextMenu: () => void;
  handleLongPress: (modelId: string, event: PointerEvent | React.PointerEvent) => void;
  cleanupLongPress: () => void;
}

const LONG_PRESS_DURATION = 1000; // 1 second for long-press

/**
 * Hook for managing context menu state and long-press detection
 * Handles pen/touch long-press (1 second) to show context menu
 */
export const useContextMenu = (): IUseContextMenuReturn => {
  const [contextMenuState, setContextMenuState] = useState<IContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    targetModelId: null,
  });

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Show context menu at specific position
  const showContextMenu = useCallback((modelId: string, x: number, y: number) => {
    setContextMenuState({
      isVisible: true,
      position: { x, y },
      targetModelId: modelId,
    });

    // Provide haptic feedback when context menu opens
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  // Hide context menu
  const hideContextMenu = useCallback(() => {
    setContextMenuState({
      isVisible: false,
      position: { x: 0, y: 0 },
      targetModelId: null,
    });
  }, []);

  // Handle long-press detection
  const handleLongPress = useCallback(
    (modelId: string, event: PointerEvent | React.PointerEvent) => {
      // Only handle pen and touch input
      if (event.pointerType !== 'pen' && event.pointerType !== 'touch') {
        return;
      }

      // Store initial position
      longPressStartPosRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      // Clear any existing timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }

      // Start long-press timer
      longPressTimerRef.current = setTimeout(() => {
        // Check if pointer hasn't moved too much (within 10px threshold)
        if (longPressStartPosRef.current) {
          const deltaX = Math.abs(event.clientX - longPressStartPosRef.current.x);
          const deltaY = Math.abs(event.clientY - longPressStartPosRef.current.y);

          if (deltaX < 10 && deltaY < 10) {
            showContextMenu(modelId, event.clientX, event.clientY);
          }
        }

        longPressTimerRef.current = null;
        longPressStartPosRef.current = null;
      }, LONG_PRESS_DURATION);
    },
    [showContextMenu]
  );

  // Cleanup long-press timer
  const cleanupLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressStartPosRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return {
    contextMenuState,
    showContextMenu,
    hideContextMenu,
    handleLongPress,
    cleanupLongPress,
  };
};
