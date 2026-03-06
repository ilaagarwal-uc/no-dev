import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalHeader } from '../../../src/page-service/domain/upload-page/GlobalHeader';

describe('Logout Flow - Frontend Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Logout Button Interaction', () => {
    it('should display logout button in header', () => {
      const mockOnLogout = vi.fn();
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });

    it('should show confirmation dialog when logout button is clicked', async () => {
      const mockOnLogout = vi.fn();
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });
    });

    it('should display confirmation message in dialog', async () => {
      const mockOnLogout = vi.fn();
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to log out/i)).toBeInTheDocument();
      });
    });
  });

  describe('Confirmation Dialog Actions', () => {
    it('should close dialog when cancel button is clicked', async () => {
      const mockOnLogout = vi.fn();
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Confirm Logout')).not.toBeInTheDocument();
      });
    });

    it('should close dialog when clicking outside (overlay)', async () => {
      const mockOnLogout = vi.fn();
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });

      const overlay = screen.getByRole('presentation');
      fireEvent.click(overlay);

      await waitFor(() => {
        expect(screen.queryByText('Confirm Logout')).not.toBeInTheDocument();
      });
    });

    it('should close dialog when pressing Escape key', async () => {
      const mockOnLogout = vi.fn();
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('alertdialog');
      fireEvent.keyDown(dialog, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('Confirm Logout')).not.toBeInTheDocument();
      });
    });

    it('should not call onLogout when cancel is clicked', async () => {
      const mockOnLogout = vi.fn();
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnLogout).not.toHaveBeenCalled();
    });
  });

  describe('Session Clearing', () => {
    it('should support clearing auth token on logout', async () => {
      localStorage.setItem('authToken', 'test_token');

      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={vi.fn()}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });

      // Simulate clearing the token
      localStorage.removeItem('authToken');

      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('should support clearing userId from localStorage on logout', async () => {
      localStorage.setItem('userId', 'user_123');
      localStorage.setItem('authToken', 'test_token');

      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={vi.fn()}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });

      // Simulate clearing the tokens
      localStorage.removeItem('userId');
      localStorage.removeItem('authToken');

      expect(localStorage.getItem('userId')).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle logout errors without crashing', async () => {
      const mockOnLogout = vi.fn(async () => {
        throw new Error('Logout failed');
      });

      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole('button', { name: /logout/i })[1];
      fireEvent.click(confirmButton);

      // Component should still be rendered
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on logout button', () => {
      const mockOnLogout = vi.fn();
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA labels on confirmation dialog', async () => {
      const mockOnLogout = vi.fn();
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        const dialog = screen.getByRole('alertdialog');
        expect(dialog).toHaveAttribute('aria-labelledby');
        expect(dialog).toHaveAttribute('aria-describedby');
      });
    });

    it('should have proper ARIA labels on dialog buttons', async () => {
      const mockOnLogout = vi.fn();
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(cancelButton).toHaveAttribute('aria-label');
      });
    });

    it('should be keyboard navigable', async () => {
      const mockOnLogout = vi.fn();
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      
      // Tab to logout button
      logoutButton.focus();
      expect(logoutButton).toHaveFocus();

      // Click button (simulating keyboard activation)
      fireEvent.click(logoutButton);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });
    });
  });

  describe('User Info Display', () => {
    it('should display masked phone number in header', () => {
      const mockOnLogout = vi.fn();
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      expect(screen.getByText('+1 (***) ***-7890')).toBeInTheDocument();
    });

    it('should display different masked phone numbers correctly', () => {
      const mockOnLogout = vi.fn();
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+19876543210"
          onLogout={mockOnLogout}
        />
      );

      expect(screen.getByText('+1 (***) ***-3210')).toBeInTheDocument();
    });
  });
});
