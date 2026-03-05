import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUploader } from '../../../src/page-service/domain/upload-page/ImageUploader';
import { CameraCapture } from '../../../src/page-service/domain/upload-page/CameraCapture';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a test file with specified size and type
 */
function createTestFile(
  name: string,
  size: number,
  type: string = 'image/jpeg'
): File {
  const buffer = new Uint8Array(size);
  return new File([buffer], name, { type });
}

/**
 * Creates a valid JPEG file for testing
 */
function createValidJpegFile(name: string = 'test.jpg', size: number = 1024): File {
  // JPEG magic number: FF D8 FF
  const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff]);
  const buffer = new Uint8Array(size);
  buffer.set(jpegHeader, 0);
  return new File([buffer], name, { type: 'image/jpeg' });
}

/**
 * Creates a valid PNG file for testing
 */
function createValidPngFile(name: string = 'test.png', size: number = 1024): File {
  // PNG magic number: 89 50 4E 47
  const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
  const buffer = new Uint8Array(size);
  buffer.set(pngHeader, 0);
  return new File([buffer], name, { type: 'image/png' });
}

/**
 * Creates a valid WebP file for testing
 */
function createValidWebpFile(name: string = 'test.webp', size: number = 1024): File {
  // WebP magic number: 52 49 46 46 ... 57 45 42 50
  const webpHeader = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
  const buffer = new Uint8Array(size);
  buffer.set(webpHeader, 0);
  return new File([buffer], name, { type: 'image/webp' });
}

/**
 * Mocks getUserMedia for camera tests
 */
function mockGetUserMedia(success: boolean = true, error?: string) {
  const mockStream = {
    getTracks: vi.fn().mockReturnValue([
      {
        stop: vi.fn(),
        kind: 'video'
      }
    ])
  };

  if (success) {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream)
      },
      writable: true,
      configurable: true
    });
  } else {
    const errorName = error === 'NotAllowedError' ? 'NotAllowedError' : 'NotFoundError';
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(
          new DOMException('Camera error', errorName)
        )
      },
      writable: true,
      configurable: true
    });
  }
}

// ============================================================================
// IMAGE UPLOADER COMPONENT TESTS (16 tests)
// ============================================================================

describe('ImageUploader Component - Feature Tests', () => {
  const mockOnUploadSuccess = vi.fn();
  const mockOnUploadError = vi.fn();

  beforeEach(() => {
    mockOnUploadSuccess.mockClear();
    mockOnUploadError.mockClear();
    vi.clearAllMocks();
  });

  // ========================================================================
  // 2.1.1 Drag-and-Drop Functionality (5 tests)
  // ========================================================================

  describe('Drag-and-Drop Functionality', () => {
    it('2.1.1.1: should highlight drop zone when file is dragged over', () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const dropZone = screen.getByRole('button', { name: /drag and drop/i });
      fireEvent.dragOver(dropZone);

      expect(dropZone).toHaveClass('dragActive');
    });

    it('2.1.1.2: should remove highlight when file is dragged out of drop zone', () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const dropZone = screen.getByRole('button', { name: /drag and drop/i });
      fireEvent.dragOver(dropZone);
      expect(dropZone).toHaveClass('dragActive');

      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass('dragActive');
    });

    it('2.1.1.3: should select file and show preview when valid file is dropped', async () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const file = createValidJpegFile('test.jpg', 2048);
      const dropZone = screen.getByRole('button', { name: /drag and drop/i });

      fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });
    });

    it('2.1.1.4: should show error when invalid file is dropped', async () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const file = new File(['content'], 'test.bmp', { type: 'image/bmp' });
      const dropZone = screen.getByRole('button', { name: /drag and drop/i });

      fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/invalid image format/i)).toBeInTheDocument();
      });
    });

    it('2.1.1.5: should select only first file when multiple files are dropped', async () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const file1 = createValidJpegFile('test1.jpg', 2048);
      const file2 = createValidJpegFile('test2.jpg', 2048);
      const dropZone = screen.getByRole('button', { name: /drag and drop/i });

      fireEvent.drop(dropZone, { dataTransfer: { files: [file1, file2] } });

      await waitFor(() => {
        expect(screen.getByText('test1.jpg')).toBeInTheDocument();
        expect(screen.queryByText('test2.jpg')).not.toBeInTheDocument();
      });
    });
  });

  // ========================================================================
  // 2.1.2 Click-to-Select Functionality (4 tests)
  // ========================================================================

  describe('Click-to-Select Functionality', () => {
    it('2.1.2.1: should open file browser when drop zone is clicked', () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const fileInput = screen.getByLabelText(/select image file/i) as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      const dropZone = screen.getByRole('button', { name: /drag and drop/i });
      fireEvent.click(dropZone);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('2.1.2.2: should select file from file browser and show preview', async () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const file = createValidJpegFile('selected.jpg', 2048);
      const fileInput = screen.getByLabelText(/select image file/i) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('selected.jpg')).toBeInTheDocument();
      });
    });

    it('2.1.2.3: should not select file when file browser is cancelled', () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const fileInput = screen.getByLabelText(/select image file/i) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [] } });

      expect(screen.queryByText(/\.jpg/)).not.toBeInTheDocument();
    });

    it('2.1.2.4: should filter file browser to image types', () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const fileInput = screen.getByLabelText(/select image file/i) as HTMLInputElement;
      expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    });
  });

  // ========================================================================
  // 2.1.3 Image Preview (4 tests)
  // ========================================================================

  describe('Image Preview', () => {
    it('2.1.3.1: should display image preview after file selection', async () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const file = createValidJpegFile('preview.jpg', 2048);
      const fileInput = screen.getByLabelText(/select image file/i) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        const previewImage = screen.getByAltText(/selected image preview/i);
        expect(previewImage).toBeInTheDocument();
      });
    });

    it('2.1.3.2: should display file name in preview', async () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const file = createValidJpegFile('myimage.jpg', 2048);
      const fileInput = screen.getByLabelText(/select image file/i) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('myimage.jpg')).toBeInTheDocument();
      });
    });

    it('2.1.3.3: should display file size in preview', async () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const file = createValidJpegFile('test.jpg', 2048);
      const fileInput = screen.getByLabelText(/select image file/i) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/2\.0 KB|2 KB/)).toBeInTheDocument();
      });
    });

    it('2.1.3.4: should have remove button in preview', async () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const file = createValidJpegFile('test.jpg', 2048);
      const fileInput = screen.getByLabelText(/select image file/i) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        const removeButton = screen.getByRole('button', { name: /remove/i });
        expect(removeButton).toBeInTheDocument();
      });
    });
  });

  // ========================================================================
  // 2.1.4 Upload Progress (3 tests)
  // ========================================================================

  describe('Upload Progress', () => {
    it('2.1.4.1: should display upload progress bar during upload', async () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const file = createValidJpegFile('test.jpg', 2048);
      const fileInput = screen.getByLabelText(/select image file/i) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload image/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
      });
    });

    it('2.1.4.2: should display upload percentage', async () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const file = createValidJpegFile('test.jpg', 2048);
      const fileInput = screen.getByLabelText(/select image file/i) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload image/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        const percentageText = screen.getByText(/\d+%/);
        expect(percentageText).toBeInTheDocument();
      });
    });

    it('2.1.4.3: should display upload speed and ETA', async () => {
      render(
        <ImageUploader
          userId="user_123"
          onUploadSuccess={mockOnUploadSuccess}
          onUploadError={mockOnUploadError}
        />
      );

      const file = createValidJpegFile('test.jpg', 2048);
      const fileInput = screen.getByLabelText(/select image file/i) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload image/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/\/s/)).toBeInTheDocument();
        expect(screen.getByText(/ETA:/)).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// CAMERA CAPTURE COMPONENT TESTS (16 tests)
// ============================================================================

describe('CameraCapture Component - Feature Tests', () => {
  const mockOnCaptureSuccess = vi.fn();
  const mockOnCaptureError = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnCaptureSuccess.mockClear();
    mockOnCaptureError.mockClear();
    mockOnCancel.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========================================================================
  // 2.2.1 Camera Permission Handling (5 tests)
  // ========================================================================

  describe('Camera Permission Handling', () => {
    it('2.2.1.1: should render camera button', () => {
      mockGetUserMedia(true);
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('button', { name: /capture from camera/i })).toBeInTheDocument();
    });

    it('2.2.1.2: should show error when camera permission is denied', async () => {
      mockGetUserMedia(false, 'NotAllowedError');
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(screen.getByText(/camera permission denied/i)).toBeInTheDocument();
      });
    });

    it('2.2.1.3: should show error when camera is not found', async () => {
      mockGetUserMedia(false, 'NotFoundError');
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(screen.getByText(/no camera found/i)).toBeInTheDocument();
      });
    });

    it('2.2.1.4: should have proper accessibility attributes on camera button', () => {
      mockGetUserMedia(true);
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      expect(cameraButton).toHaveAttribute('aria-label');
    });

    it('2.2.1.5: should close error message when close button is clicked', async () => {
      mockGetUserMedia(false, 'NotAllowedError');
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
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

  // ========================================================================
  // 2.2.2 Camera View UI (4 tests)
  // ========================================================================

  describe('Camera View UI', () => {
    it('2.2.2.1: should display live camera feed when permission is granted', async () => {
      mockGetUserMedia(true);
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      fireEvent.click(cameraButton);

      await waitFor(() => {
        const videoElement = screen.getByLabelText(/live camera feed/i);
        expect(videoElement).toBeInTheDocument();
      });
    });

    it('2.2.2.2: should display capture button in camera view', async () => {
      mockGetUserMedia(true);
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      fireEvent.click(cameraButton);

      await waitFor(() => {
        const captureButton = screen.getByRole('button', { name: /capture image from camera/i });
        expect(captureButton).toBeInTheDocument();
      });
    });

    it('2.2.2.3: should display close button in camera view', async () => {
      mockGetUserMedia(true);
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      fireEvent.click(cameraButton);

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close camera/i });
        expect(closeButton).toBeInTheDocument();
      });
    });

    it('2.2.2.4: should have proper accessibility attributes on camera view', async () => {
      mockGetUserMedia(true);
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      fireEvent.click(cameraButton);

      await waitFor(() => {
        const cameraView = screen.getByRole('region', { name: /camera view/i });
        expect(cameraView).toBeInTheDocument();
      });
    });
  });

  // ========================================================================
  // 2.2.3 Image Capture (4 tests)
  // ========================================================================

  describe('Image Capture', () => {
    it('2.2.3.1: should capture image when capture button is clicked', async () => {
      mockGetUserMedia(true);
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      fireEvent.click(cameraButton);

      await waitFor(() => {
        const captureButton = screen.getByRole('button', { name: /capture image from camera/i });
        fireEvent.click(captureButton);
      });

      await waitFor(() => {
        const previewImage = screen.getByAltText(/captured image preview/i);
        expect(previewImage).toBeInTheDocument();
      });
    });

    it('2.2.3.2: should display capture preview after image capture', async () => {
      mockGetUserMedia(true);
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      fireEvent.click(cameraButton);

      await waitFor(() => {
        const captureButton = screen.getByRole('button', { name: /capture image from camera/i });
        fireEvent.click(captureButton);
      });

      await waitFor(() => {
        const capturePreview = screen.getByRole('region', { name: /capture preview/i });
        expect(capturePreview).toBeInTheDocument();
      });
    });

    it('2.2.3.3: should display confirm button on preview', async () => {
      mockGetUserMedia(true);
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      fireEvent.click(cameraButton);

      await waitFor(() => {
        const captureButton = screen.getByRole('button', { name: /capture image from camera/i });
        fireEvent.click(captureButton);
      });

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm and upload/i });
        expect(confirmButton).toBeInTheDocument();
      });
    });

    it('2.2.3.4: should display retake button on preview', async () => {
      mockGetUserMedia(true);
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      fireEvent.click(cameraButton);

      await waitFor(() => {
        const captureButton = screen.getByRole('button', { name: /capture image from camera/i });
        fireEvent.click(captureButton);
      });

      await waitFor(() => {
        const retakeButton = screen.getByRole('button', { name: /retake image/i });
        expect(retakeButton).toBeInTheDocument();
      });
    });
  });

  // ========================================================================
  // 2.2.4 Capture Actions (3 tests)
  // ========================================================================

  describe('Capture Actions', () => {
    it('2.2.4.1: should return to camera view when retake button is clicked', async () => {
      mockGetUserMedia(true);
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      fireEvent.click(cameraButton);

      await waitFor(() => {
        const captureButton = screen.getByRole('button', { name: /capture image from camera/i });
        fireEvent.click(captureButton);
      });

      await waitFor(() => {
        const retakeButton = screen.getByRole('button', { name: /retake image/i });
        fireEvent.click(retakeButton);
      });

      await waitFor(() => {
        const videoElement = screen.getByLabelText(/live camera feed/i);
        expect(videoElement).toBeInTheDocument();
      });
    });

    it('2.2.4.2: should close camera when cancel button is clicked', async () => {
      mockGetUserMedia(true);
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      fireEvent.click(cameraButton);

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close camera/i });
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        expect(mockOnCancel).toHaveBeenCalled();
      });
    });

    it('2.2.4.3: should call onCaptureSuccess when confirm button is clicked', async () => {
      mockGetUserMedia(true);
      render(
        <CameraCapture
          userId="user_123"
          onCaptureSuccess={mockOnCaptureSuccess}
          onCaptureError={mockOnCaptureError}
          onCancel={mockOnCancel}
        />
      );

      const cameraButton = screen.getByRole('button', { name: /capture from camera/i });
      fireEvent.click(cameraButton);

      await waitFor(() => {
        const captureButton = screen.getByRole('button', { name: /capture image from camera/i });
        fireEvent.click(captureButton);
      });

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm and upload/i });
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockOnCaptureSuccess).toHaveBeenCalled();
      });
    });
  });
});
