import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUploader } from '../../../src/page-service/domain/upload-page/ImageUploader';

describe('ImageUploader Component', () => {
  const mockOnUploadSuccess = vi.fn();
  const mockOnUploadError = vi.fn();

  beforeEach(() => {
    mockOnUploadSuccess.mockClear();
    mockOnUploadError.mockClear();
  });

  it('should render drop zone', () => {
    render(
      <ImageUploader
        userId="user_123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
  });

  it('should render select file button', () => {
    render(
      <ImageUploader
        userId="user_123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    expect(screen.getByRole('button', { name: /click to select image file/i })).toBeInTheDocument();
  });

  it('should show error for empty file', async () => {
    render(
      <ImageUploader
        userId="user_123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File([], 'empty.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/file is empty/i)).toBeInTheDocument();
    });
  });

  it('should show error for invalid format', async () => {
    render(
      <ImageUploader
        userId="user_123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    // Create a file with at least 1KB of content
    const content = new Uint8Array(1024);
    const file = new File([content], 'test.txt', { type: 'text/plain' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/invalid image format/i)).toBeInTheDocument();
    });
  });

  it('should show error for file too large', async () => {
    render(
      <ImageUploader
        userId="user_123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    // Create a file larger than 10MB
    const largeContent = new Uint8Array(10485761);
    const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/exceeds 10MB/i)).toBeInTheDocument();
    });
  });

  it('should display image preview when valid file is selected', async () => {
    render(
      <ImageUploader
        userId="user_123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    // Create a file with at least 1KB of content
    const content = new Uint8Array(1024);
    const file = new File([content], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
  });

  it('should remove file when remove button is clicked', async () => {
    render(
      <ImageUploader
        userId="user_123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    // Create a file with at least 1KB of content
    const content = new Uint8Array(1024);
    const file = new File([content], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', () => {
    render(
      <ImageUploader
        userId="user_123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const dropZone = screen.getByRole('button', { name: /drag and drop/i });
    expect(dropZone).toHaveAttribute('aria-label');

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
  });

  it('should close error message when close button is clicked', async () => {
    render(
      <ImageUploader
        userId="user_123"
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File([], 'empty.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/file is empty/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close error/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/file is empty/i)).not.toBeInTheDocument();
    });
  });
});
