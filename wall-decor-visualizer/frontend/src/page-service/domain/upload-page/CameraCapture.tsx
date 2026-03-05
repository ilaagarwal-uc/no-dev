import React, { useRef, useState } from 'react';
import styles from './upload_page.module.css';
import { uploadImage } from '../../application/upload';
import { getErrorMessage, formatFileSize } from './index';
import type { ICameraCaptureProps, IUploadError } from './interface';

export function CameraCapture({ userId, onCaptureSuccess, onCaptureError, onCancel }: ICameraCaptureProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<IUploadError | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const startCamera = async (): Promise<void> => {
    setError(null);
    setPermissionDenied(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setPermissionDenied(true);
        setError({
          message: 'Camera permission denied. Please enable camera access in your browser settings.',
          code: 'CAMERA_PERMISSION_DENIED'
        });
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError({
          message: 'No camera found on this device.',
          code: 'CAMERA_NOT_FOUND'
        });
      } else {
        setError({
          message: 'Failed to access camera. Please try again.',
          code: 'CAMERA_ERROR'
        });
      }
      onCaptureError(error?.message || 'Camera error');
    }
  };

  const stopCamera = (): void => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const captureImage = (): void => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const retakeImage = (): void => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmCapture = async (): Promise<void> => {
    if (!capturedImage) return;

    setIsUploading(true);
    setError(null);

    try {
      // Convert data URL to File
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });

      const uploadResponse = await uploadImage(file, userId);

      if (uploadResponse.success) {
        onCaptureSuccess(uploadResponse.imageId, uploadResponse.gcpUrl);
        setCapturedImage(null);
        setIsUploading(false);
      } else {
        setError({
          message: uploadResponse.error.message,
          code: uploadResponse.error.code
        });
        setIsUploading(false);
        onCaptureError(uploadResponse.error.message);
      }
    } catch (err) {
      setError({
        message: 'Failed to process captured image.',
        code: 'CAPTURE_PROCESS_ERROR'
      });
      setIsUploading(false);
      onCaptureError('Failed to process captured image');
    }
  };

  const handleCancel = (): void => {
    stopCamera();
    setCapturedImage(null);
    onCancel();
  };

  if (cameraActive && !capturedImage) {
    return (
      <div className={styles.cameraView} role="region" aria-label="Camera view">
        <video
          ref={videoRef}
          className={styles.cameraVideo}
          autoPlay
          playsInline
          aria-label="Live camera feed"
        />
        <button
          className={styles.closeButton}
          onClick={handleCancel}
          aria-label="Close camera"
        >
          Close
        </button>
        <div className={styles.cameraControls}>
          <button
            className={styles.captureButton}
            onClick={captureImage}
            aria-label="Capture image from camera"
            title="Capture"
          >
            📷
          </button>
        </div>
      </div>
    );
  }

  if (capturedImage) {
    return (
      <div className={styles.capturePreview} role="region" aria-label="Capture preview">
        <img
          src={capturedImage}
          alt="Captured image preview"
          className={styles.previewImage}
        />
        <div className={styles.previewControls}>
          <button
            className={`${styles.previewButton}`}
            onClick={retakeImage}
            disabled={isUploading}
            aria-label="Retake image"
          >
            Retake
          </button>
          <button
            className={`${styles.previewButton} ${styles.confirm}`}
            onClick={confirmCapture}
            disabled={isUploading}
            aria-label="Confirm and upload captured image"
          >
            {isUploading ? 'Uploading...' : 'Confirm'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cameraCapture}>
      {error && (
        <div className={styles.errorMessage} role="alert">
          <span>{error.message}</span>
          <button
            className={styles.errorClose}
            onClick={() => setError(null)}
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}

      {permissionDenied ? (
        <div className={styles.errorMessage} role="alert">
          <span>Camera permission denied. Please enable camera access in your browser settings.</span>
        </div>
      ) : null}

      <button
        className={styles.cameraButton}
        onClick={startCamera}
        disabled={cameraActive}
        aria-label="Open camera to capture image"
      >
        📷 Capture from Camera
      </button>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
