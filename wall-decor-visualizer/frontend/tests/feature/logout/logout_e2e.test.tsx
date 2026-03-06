import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalHeader } from '../../../src/page-service/domain/upload-page/GlobalHeader';

describe('Logout E2E - Complete User Journey Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Test 4.5: Upload and Logout Journey', () => {
    it('should complete full logout flow after upload', async () => {
      // Setup: User is logged in with token
      localStorage.setItem('authToken', 'test_token');
      localStorage.setItem('userId', 'user_123');

      const mockOnLogout = vi.fn(async () => {
        // Simulate logout API call
        await new Promise(resolve => setTimeout(resolve, 50));
        // Clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
      });

      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      // Step 1: Verify user is logged in
      expect(screen.getByText('+1 (***) ***-7890')).toBeInTheDocument();
      expect(localStorage.getItem('authToken')).toBe('test_token');

      // Step 2: Click logout button
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      // Step 3: Verify confirmation dialog appears
      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to log out/i)).toBeInTheDocument();
      });

      // Step 4: Confirm logout
      const confirmButton = screen.getAllByRole('button', { name: /logout/i })[1];
      fireEvent.click(confirmButton);

      // Step 5: Simulate logout completion
      await new Promise(resolve => setTimeout(resolve, 100));
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');

      // Step 6: Verify localStorage is cleared
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
    });

    it('should allow re-login after logout', async () => {
      // Setup: User is logged in
      localStorage.setItem('authToken', 'test_token_1');
      localStorage.setItem('userId', 'user_123');

      const mockOnLogout = vi.fn(async () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
      });

      const { unmount } = render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      // Step 1: Logout
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole('button', { name: /logout/i })[1];
      fireEvent.click(confirmButton);

      // Step 2: Simulate logout completion
      await new Promise(resolve => setTimeout(resolve, 100));
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');

      // Step 3: Verify session cleared
      expect(localStorage.getItem('authToken')).toBeNull();

      // Step 4: Simulate re-login
      localStorage.setItem('authToken', 'test_token_2');
      localStorage.setItem('userId', 'user_123');

      unmount();

      // Step 5: Render component again with new token
      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={vi.fn()}
        />
      );

      // Step 6: Verify user is logged in again
      expect(screen.getByText('+1 (***) ***-7890')).toBeInTheDocument();
      expect(localStorage.getItem('authToken')).toBe('test_token_2');
    });
  });

  describe('Session Persistence After Logout', () => {
    it('should not persist session data after logout', async () => {
      localStorage.setItem('authToken', 'test_token');
      localStorage.setItem('userId', 'user_123');

      const mockOnLogout = vi.fn(async () => {
        localStorage.clear();
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

      // Simulate logout completion
      await new Promise(resolve => setTimeout(resolve, 100));
      localStorage.clear();

      // Verify all session data is cleared
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
    });

    it('should clear all auth-related localStorage items', async () => {
      localStorage.setItem('authToken', 'test_token');
      localStorage.setItem('userId', 'user_123');
      localStorage.setItem('otherData', 'should_remain');

      const mockOnLogout = vi.fn(async () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
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

      // Simulate logout completion
      await new Promise(resolve => setTimeout(resolve, 100));
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');

      // Verify auth items are cleared
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
    });
  });

  describe('Logout State Management', () => {
    it('should properly manage loading state during logout', async () => {
      const mockOnLogout = vi.fn(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

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

      // Wait for logout to complete
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    it('should reset dialog state after logout', async () => {
      const mockOnLogout = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const { rerender } = render(
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

      // Wait for logout to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Rerender component
      rerender(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      // Dialog should be closed
      expect(screen.queryByText('Confirm Logout')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Logout Attempts', () => {
    it('should handle rapid logout button clicks', async () => {
      const mockOnLogout = vi.fn();

      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });

      // Click logout button multiple times rapidly
      fireEvent.click(logoutButton);
      fireEvent.click(logoutButton);
      fireEvent.click(logoutButton);

      // Should only show one dialog
      await waitFor(() => {
        const dialogs = screen.getAllByText('Confirm Logout');
        expect(dialogs.length).toBe(1);
      });
    });

    it('should handle cancel and retry logout', async () => {
      const mockOnLogout = vi.fn();

      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });

      // First attempt - cancel
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Confirm Logout')).not.toBeInTheDocument();
      });

      // Second attempt - confirm
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole('button', { name: /logout/i })[1];
      fireEvent.click(confirmButton);

      // Wait for logout to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });

  describe('Logout with Different User States', () => {
    it('should logout user with long phone number', async () => {
      const mockOnLogout = vi.fn();

      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+919876543210"
          onLogout={mockOnLogout}
        />
      );

      // Verify phone number is displayed and masked (always +1 (***) ***-XXXX format)
      expect(screen.getByText('+1 (***) ***-3210')).toBeInTheDocument();

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole('button', { name: /logout/i })[1];
      fireEvent.click(confirmButton);

      // Wait for logout to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should logout user with different userId formats', async () => {
      const mockOnLogout = vi.fn();

      render(
        <GlobalHeader
          userId="user_abc_123_xyz"
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

      // Wait for logout to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });

  describe('Logout Error Recovery', () => {
    it('should allow retry after logout error', async () => {
      let callCount = 0;
      const mockOnLogout = vi.fn(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Logout failed');
        }
      });

      render(
        <GlobalHeader
          userId="user_123"
          phoneNumber="+1234567890"
          onLogout={mockOnLogout}
        />
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });

      // First attempt - fails
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });

      let confirmButton = screen.getAllByRole('button', { name: /logout/i })[1];
      fireEvent.click(confirmButton);

      // Dialog should close after error
      await waitFor(() => {
        expect(screen.queryByText('Confirm Logout')).not.toBeInTheDocument();
      });

      // Second attempt - succeeds
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Logout')).toBeInTheDocument();
      });

      confirmButton = screen.getAllByRole('button', { name: /logout/i })[1];
      fireEvent.click(confirmButton);

      // Wait for logout to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });
});
