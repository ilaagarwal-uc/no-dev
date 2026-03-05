import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CameraCapture } from '../../../src/page-service/domain/upload-page/CameraCapture';

describe('CameraCapture Component', () => {
  const mockOnCaptureSuccess = vi.fn();
  const mockOnCaptureError = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnCaptureSuccess.mockClear();
    mockOnCaptureError.mockClear();
    mockOnCancel.mockClear();

    // Mock getUserMedia
    global.navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }]
      })
    } as any;
  });

  it('should render camera button', () => {
    render(
      <CameraCapture
        userId="user_123"
        onCaptureSuccess={mockOnCaptureSuccess}
        onCaptureError={mockOnCaptureError}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('button', { name: /open camera to capture image/i })).toBeInTheDocument();
  });

  it('should show error when camera permission is denied', async () => {
    const error = new DOMException('Permission denied', 'NotAllowedError');
    global.navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(error);

    render(
      <CameraCapture
        userId="user_123"
        onCaptureSuccess={mockOnCaptureSuccess}
        onCaptureError={mockOnCaptureError}
        onCancel={mockOnCancel}
      />
    );

    const cameraButton = screen.getByRole('button', { name: /open camera to capture image/i });
    fireEvent.click(cameraButton);

    await waitFor(() => {
      expect(screen.getByText(/camera permission denied/i)).toBeInTheDocument();
    });
  });

  it('should show error when camera is not found', async () => {
    const error = new DOMException('Camera not found', 'NotFoundError');
    global.navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(error);

    render(
      <CameraCapture
        userId="user_123"
        onCaptureSuccess={mockOnCaptureSuccess}
        onCaptureError={mockOnCaptureError}
        onCancel={mockOnCancel}
      />
    );

    const cameraButton = screen.getByRole('button', { name: /open camera to capture image/i });
    fireEvent.click(cameraButton);

    await waitFor(() => {
      expect(screen.getByText(/no camera found/i)).toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', () => {
    render(
      <CameraCapture
        userId="user_123"
        onCaptureSuccess={mockOnCaptureSuccess}
        onCaptureError={mockOnCaptureError}
        onCancel={mockOnCancel}
      />
    );

    const cameraButton = screen.getByRole('button', { name: /open camera to capture image/i });
    expect(cameraButton).toHaveAttribute('aria-label');
  });

  it('should close error message when close button is clicked', async () => {
    const error = new DOMException('Permission denied', 'NotAllowedError');
    global.navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(error);

    render(
      <CameraCapture
        userId="user_123"
        onCaptureSuccess={mockOnCaptureSuccess}
        onCaptureError={mockOnCaptureError}
        onCancel={mockOnCancel}
      />
    );

    const cameraButton = screen.getByRole('button', { name: /open camera to capture image/i });
    fireEvent.click(cameraButton);

    await waitFor(() => {
      expect(screen.getByText(/camera permission denied/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close error/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/camera permission denied/i)).not.toBeInTheDocument();
    });
  });
});
