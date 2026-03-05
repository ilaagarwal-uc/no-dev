import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalHeader } from '../../../src/page-service/domain/upload-page/GlobalHeader';

describe('GlobalHeader Component', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    mockOnLogout.mockClear();
  });

  it('should render header with user info', () => {
    render(
      <GlobalHeader
        userId="user_123"
        phoneNumber="+1234567890"
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('Wall Decor Visualizer')).toBeInTheDocument();
    expect(screen.getByText('+1 (***) ***-7890')).toBeInTheDocument();
  });

  it('should render logout button', () => {
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

  it('should close confirmation dialog when cancel is clicked', async () => {
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

  it('should call onLogout when confirm is clicked', async () => {
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

    await waitFor(() => {
      expect(mockOnLogout).toHaveBeenCalled();
    });
  });

  it('should mask phone number correctly', () => {
    render(
      <GlobalHeader
        userId="user_123"
        phoneNumber="+19876543210"
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('+1 (***) ***-3210')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <GlobalHeader
        userId="user_123"
        phoneNumber="+1234567890"
        onLogout={mockOnLogout}
      />
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveAttribute('aria-label', 'Application header');

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toHaveAttribute('aria-label');
  });
});
