import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useContextMenu } from '../../../../src/page-service/domain/create-look-page/use_context_menu';

// Polyfill PointerEvent for jsdom
if (typeof PointerEvent === 'undefined') {
  global.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId || 0;
      this.width = params.width || 0;
      this.height = params.height || 0;
      this.pressure = params.pressure || 0;
      this.tangentialPressure = params.tangentialPressure || 0;
      this.tiltX = params.tiltX || 0;
      this.tiltY = params.tiltY || 0;
      this.twist = params.twist || 0;
      this.pointerType = params.pointerType || '';
      this.isPrimary = params.isPrimary || false;
    }
    pointerId: number;
    width: number;
    height: number;
    pressure: number;
    tangentialPressure: number;
    tiltX: number;
    tiltY: number;
    twist: number;
    pointerType: string;
    isPrimary: boolean;
  } as any;
}

describe('useContextMenu Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with menu hidden', () => {
      const { result } = renderHook(() => useContextMenu());

      expect(result.current.contextMenuState.isVisible).toBe(false);
      expect(result.current.contextMenuState.position).toEqual({ x: 0, y: 0 });
      expect(result.current.contextMenuState.targetModelId).toBeNull();
    });
  });

  describe('showContextMenu', () => {
    it('should show context menu at specified position', () => {
      const { result } = renderHook(() => useContextMenu());

      act(() => {
        result.current.showContextMenu('model-123', 100, 200);
      });

      expect(result.current.contextMenuState.isVisible).toBe(true);
      expect(result.current.contextMenuState.position).toEqual({ x: 100, y: 200 });
      expect(result.current.contextMenuState.targetModelId).toBe('model-123');
    });

    it('should trigger haptic feedback when showing menu', () => {
      const { result } = renderHook(() => useContextMenu());

      act(() => {
        result.current.showContextMenu('model-123', 100, 200);
      });

      expect(navigator.vibrate).toHaveBeenCalledWith(50);
    });

    it('should not crash if vibrate is not supported', () => {
      Object.defineProperty(navigator, 'vibrate', {
        writable: true,
        value: undefined,
      });

      const { result } = renderHook(() => useContextMenu());

      expect(() => {
        act(() => {
          result.current.showContextMenu('model-123', 100, 200);
        });
      }).not.toThrow();
    });
  });

  describe('hideContextMenu', () => {
    it('should hide context menu', () => {
      const { result } = renderHook(() => useContextMenu());

      act(() => {
        result.current.showContextMenu('model-123', 100, 200);
      });

      expect(result.current.contextMenuState.isVisible).toBe(true);

      act(() => {
        result.current.hideContextMenu();
      });

      expect(result.current.contextMenuState.isVisible).toBe(false);
      expect(result.current.contextMenuState.position).toEqual({ x: 0, y: 0 });
      expect(result.current.contextMenuState.targetModelId).toBeNull();
    });
  });

  describe('handleLongPress', () => {
    const createPointerEvent = (
      type: string,
      pointerType: string,
      clientX: number,
      clientY: number
    ): PointerEvent => {
      return new PointerEvent(type, {
        pointerType,
        clientX,
        clientY,
      } as PointerEventInit);
    };

    it('should show menu after 1 second pen hold', async () => {
      const { result } = renderHook(() => useContextMenu());
      const event = createPointerEvent('pointerdown', 'pen', 150, 250);

      act(() => {
        result.current.handleLongPress('model-123', event);
      });

      expect(result.current.contextMenuState.isVisible).toBe(false);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.contextMenuState.isVisible).toBe(true);
      expect(result.current.contextMenuState.position).toEqual({ x: 150, y: 250 });
      expect(result.current.contextMenuState.targetModelId).toBe('model-123');
    });

    it('should show menu after 1 second touch hold', async () => {
      const { result } = renderHook(() => useContextMenu());
      const event = createPointerEvent('pointerdown', 'touch', 150, 250);

      act(() => {
        result.current.handleLongPress('model-123', event);
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.contextMenuState.isVisible).toBe(true);
    });

    it('should not show menu for mouse input', async () => {
      const { result } = renderHook(() => useContextMenu());
      const event = createPointerEvent('pointerdown', 'mouse', 150, 250);

      act(() => {
        result.current.handleLongPress('model-123', event);
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.contextMenuState.isVisible).toBe(false);
    });

    it('should not show menu if hold is less than 1 second', () => {
      const { result } = renderHook(() => useContextMenu());
      const event = createPointerEvent('pointerdown', 'pen', 150, 250);

      act(() => {
        result.current.handleLongPress('model-123', event);
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.contextMenuState.isVisible).toBe(false);

      act(() => {
        result.current.cleanupLongPress();
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.contextMenuState.isVisible).toBe(false);
    });

    it('should cancel long-press if cleanupLongPress is called', () => {
      const { result } = renderHook(() => useContextMenu());
      const event = createPointerEvent('pointerdown', 'pen', 150, 250);

      act(() => {
        result.current.handleLongPress('model-123', event);
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      act(() => {
        result.current.cleanupLongPress();
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.contextMenuState.isVisible).toBe(false);
    });

    it('should clear previous timer when new long-press starts', () => {
      const { result } = renderHook(() => useContextMenu());
      const event1 = createPointerEvent('pointerdown', 'pen', 100, 100);
      const event2 = createPointerEvent('pointerdown', 'pen', 200, 200);

      act(() => {
        result.current.handleLongPress('model-1', event1);
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      act(() => {
        result.current.handleLongPress('model-2', event2);
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should show menu for second model, not first
      expect(result.current.contextMenuState.targetModelId).toBe('model-2');
      expect(result.current.contextMenuState.position).toEqual({ x: 200, y: 200 });
    });
  });

  describe('cleanupLongPress', () => {
    it('should cancel pending long-press timer', () => {
      const { result } = renderHook(() => useContextMenu());
      const event = new PointerEvent('pointerdown', {
        pointerType: 'pen',
        clientX: 150,
        clientY: 250,
      } as PointerEventInit);

      act(() => {
        result.current.handleLongPress('model-123', event);
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      act(() => {
        result.current.cleanupLongPress();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.contextMenuState.isVisible).toBe(false);
    });

    it('should be safe to call multiple times', () => {
      const { result } = renderHook(() => useContextMenu());

      expect(() => {
        act(() => {
          result.current.cleanupLongPress();
          result.current.cleanupLongPress();
          result.current.cleanupLongPress();
        });
      }).not.toThrow();
    });
  });

  describe('Cleanup on Unmount', () => {
    it('should clear timer on unmount', () => {
      const { result, unmount } = renderHook(() => useContextMenu());
      const event = new PointerEvent('pointerdown', {
        pointerType: 'pen',
        clientX: 150,
        clientY: 250,
      } as PointerEventInit);

      act(() => {
        result.current.handleLongPress('model-123', event);
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Menu should not show after unmount
      expect(result.current.contextMenuState.isVisible).toBe(false);
    });
  });
});
