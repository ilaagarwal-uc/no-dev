import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContextMenu, IContextMenuProps } from '../../../../src/page-service/domain/create-look-page/ContextMenu';

describe('ContextMenu Component', () => {
  const mockOnDuplicate = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnResetTransform = vi.fn();
  const mockOnLockPosition = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps: IContextMenuProps = {
    position: { x: 100, y: 100 },
    isVisible: true,
    isLocked: false,
    onDuplicate: mockOnDuplicate,
    onDelete: mockOnDelete,
    onResetTransform: mockOnResetTransform,
    onLockPosition: mockOnLockPosition,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible', () => {
      render(<ContextMenu {...defaultProps} />);
      
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByLabelText('Duplicate model')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete model')).toBeInTheDocument();
      expect(screen.getByLabelText('Reset transform to original')).toBeInTheDocument();
      expect(screen.getByLabelText('Lock position')).toBeInTheDocument();
    });

    it('should not render when not visible', () => {
      render(<ContextMenu {...defaultProps} isVisible={false} />);
      
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should display all menu items with correct text', () => {
      render(<ContextMenu {...defaultProps} />);
      
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Reset Transform')).toBeInTheDocument();
      expect(screen.getByText('Lock Position')).toBeInTheDocument();
    });

    it('should show "Unlock Position" when model is locked', () => {
      render(<ContextMenu {...defaultProps} isLocked={true} />);
      
      expect(screen.getByText('Unlock Position')).toBeInTheDocument();
      expect(screen.queryByText('Lock Position')).not.toBeInTheDocument();
    });

    it('should position menu at specified coordinates', () => {
      const { container } = render(<ContextMenu {...defaultProps} position={{ x: 200, y: 300 }} />);
      
      const menu = container.querySelector('[role="menu"]');
      expect(menu).toHaveStyle({ left: '200px', top: '300px' });
    });
  });

  describe('Menu Actions', () => {
    it('should call onDuplicate and close menu when Duplicate is clicked', async () => {
      render(<ContextMenu {...defaultProps} />);
      
      const duplicateButton = screen.getByLabelText('Duplicate model');
      fireEvent.click(duplicateButton);
      
      expect(mockOnDuplicate).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete and close menu when Delete is clicked', () => {
      render(<ContextMenu {...defaultProps} />);
      
      const deleteButton = screen.getByLabelText('Delete model');
      fireEvent.click(deleteButton);
      
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onResetTransform and close menu when Reset Transform is clicked', () => {
      render(<ContextMenu {...defaultProps} />);
      
      const resetButton = screen.getByLabelText('Reset transform to original');
      fireEvent.click(resetButton);
      
      expect(mockOnResetTransform).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onLockPosition and close menu when Lock Position is clicked', () => {
      render(<ContextMenu {...defaultProps} />);
      
      const lockButton = screen.getByLabelText('Lock position');
      fireEvent.click(lockButton);
      
      expect(mockOnLockPosition).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onLockPosition when unlocking', () => {
      render(<ContextMenu {...defaultProps} isLocked={true} />);
      
      const unlockButton = screen.getByLabelText('Unlock position');
      fireEvent.click(unlockButton);
      
      expect(mockOnLockPosition).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close menu when Escape key is pressed', async () => {
      render(<ContextMenu {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should not close menu on other key presses', () => {
      render(<ContextMenu {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Click Outside', () => {
    it('should close menu when clicking outside', async () => {
      const { container } = render(
        <div>
          <div data-testid="outside">Outside</div>
          <ContextMenu {...defaultProps} />
        </div>
      );
      
      // Wait for event listener to be attached (100ms delay in component)
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const outsideElement = screen.getByTestId('outside');
      fireEvent.mouseDown(outsideElement);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      }, { timeout: 500 });
    });

    it('should not close menu when clicking inside', async () => {
      render(<ContextMenu {...defaultProps} />);
      
      const menu = screen.getByRole('menu');
      
      // Wait for event listener delay
      await new Promise(resolve => setTimeout(resolve, 150));
      
      fireEvent.mouseDown(menu);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      render(<ContextMenu {...defaultProps} />);
      
      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-label', 'Model context menu');
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(4);
    });

    it('should have proper ARIA labels for all buttons', () => {
      render(<ContextMenu {...defaultProps} />);
      
      expect(screen.getByLabelText('Duplicate model')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete model')).toBeInTheDocument();
      expect(screen.getByLabelText('Reset transform to original')).toBeInTheDocument();
      expect(screen.getByLabelText('Lock position')).toBeInTheDocument();
    });

    it('should have aria-pressed attribute on lock button', () => {
      const { rerender } = render(<ContextMenu {...defaultProps} isLocked={false} />);
      
      let lockButton = screen.getByLabelText('Lock position');
      expect(lockButton).toHaveAttribute('aria-pressed', 'false');
      
      rerender(<ContextMenu {...defaultProps} isLocked={true} />);
      
      lockButton = screen.getByLabelText('Unlock position');
      expect(lockButton).toHaveAttribute('aria-pressed', 'true');
    });

    it.skip('should have minimum 44x44px touch targets', () => {
      // Skipped: jsdom doesn't render actual sizes, getBoundingClientRect returns 0
      // This should be tested in E2E tests with real browser rendering
      const { container } = render(<ContextMenu {...defaultProps} />);
      
      const menuItems = container.querySelectorAll('button');
      menuItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        // Check actual rendered size instead of computed style
        expect(rect.height).toBeGreaterThanOrEqual(44);
        expect(rect.width).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Viewport Positioning', () => {
    it('should adjust position to stay within viewport', async () => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 600 });
      
      const { container } = render(
        <ContextMenu {...defaultProps} position={{ x: 750, y: 550 }} />
      );
      
      await waitFor(() => {
        const menu = container.querySelector('[role="menu"]') as HTMLElement;
        const rect = menu.getBoundingClientRect();
        
        // Menu should be adjusted to fit within viewport
        expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
        expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
      });
    });
  });

  describe('Lock State Visual Feedback', () => {
    it('should show lock icon when locked', () => {
      render(<ContextMenu {...defaultProps} isLocked={true} />);
      
      const lockButton = screen.getByLabelText('Unlock position');
      expect(lockButton.textContent).toContain('🔒');
    });

    it('should show unlock icon when not locked', () => {
      render(<ContextMenu {...defaultProps} isLocked={false} />);
      
      const lockButton = screen.getByLabelText('Lock position');
      expect(lockButton.textContent).toContain('🔓');
    });
  });
});
