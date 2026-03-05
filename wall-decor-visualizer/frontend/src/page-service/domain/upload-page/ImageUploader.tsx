import React, { useRef, useState } from 'react';
import styles from './upload_page.module.css';
import { uploadImage } from '../../application/upload';
import { 
  validateImageFormat, 
  validateImageSize, 
  validateImageNotEmpty,
  formatFileSize,
  getErrorMessage 
} from './index';
import type { IImageUploaderProps, IUploadProgress, IUploadError } from './interface';

export function ImageUploader({ userId, onUploadSuccess, onUploadError }: IImageUploaderProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<IUploadProgress>({
    isUploading: false,
    progress: 0
  });
  const [error, setError] = useState<IUploadError | null>(null);
  const [uploadStartTime, setUploadStartTime] = useState<number | null>(null);

  const handleFileSelect = (file: File): void => {
    setError(null);

    // Validate file
    if (!validateImageNotEmpty(file.size)) {
      setError({
        message: getErrorMessage('EMPTY_FILE'),
        code: 'EMPTY_FILE'
      });
      return;
    }

    if (!validateImageFormat(file.type)) {
      setError({
        message: getErrorMessage('INVALID_IMAGE_FORMAT'),
        code: 'INVALID_IMAGE_FORMAT'
      });
      return;
    }

    if (!validateImageSize(file.size)) {
      if (file.size > 10485760) {
        setError({
          message: getErrorMessage('IMAGE_SIZE_EXCEEDS_LIMIT'),
          code: 'IMAGE_SIZE_EXCEEDS_LIMIT'
        });
      } else {
        setError({
          message: getErrorMessage('IMAGE_SIZE_BELOW_MINIMUM'),
          code: 'IMAGE_SIZE_BELOW_MINIMUM'
        });
      }
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.currentTarget.classList.add(styles.dragActive);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.currentTarget.classList.remove(styles.dragActive);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.currentTarget.classList.remove(styles.dragActive);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClickDropZone = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = (): void => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) return;

    console.log('ImageUploader: Starting upload', {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      userId
    });

    setUploadProgress({
      isUploading: true,
      progress: 0,
      fileName: selectedFile.name,
      fileSize: selectedFile.size
    });
    setUploadStartTime(Date.now());
    setError(null);

    const response = await uploadImage(selectedFile, userId, (progress) => {
      setUploadProgress((prev) => ({
        ...prev,
        progress
      }));
    });

    console.log('ImageUploader: Upload response', response);

    if (response.success) {
      console.log('ImageUploader: Upload successful', {
        imageId: response.imageId,
        gcpUrl: response.gcpUrl
      });
      onUploadSuccess(response.imageId, response.gcpUrl);
      handleRemoveFile();
      setUploadProgress({
        isUploading: false,
        progress: 0
      });
    } else {
      console.error('ImageUploader: Upload failed', {
        message: response.error.message,
        code: response.error.code
      });
      setError({
        message: response.error.message,
        code: response.error.code
      });
      setUploadProgress({
        isUploading: false,
        progress: 0
      });
      onUploadError(response.error.message);
    }
  };

  const calculateUploadStats = (): { speed: string; eta: string } => {
    if (!uploadStartTime || uploadProgress.progress === 0 || !uploadProgress.fileSize) {
      return { speed: 'Calculating...', eta: 'Calculating...' };
    }

    const elapsedSeconds = (Date.now() - uploadStartTime) / 1000;
    const uploadedBytes = (uploadProgress.progress / 100) * uploadProgress.fileSize;
    const bytesPerSecond = uploadedBytes / elapsedSeconds;
    const remainingBytes = uploadProgress.fileSize - uploadedBytes;

    const speed = formatFileSize(bytesPerSecond) + '/s';
    const eta = calculateETA(remainingBytes, bytesPerSecond);

    return { speed, eta };
  };

  const calculateETA = (remainingBytes: number, bytesPerSecond: number): string => {
    if (bytesPerSecond === 0) return 'Calculating...';
    const seconds = Math.ceil(remainingBytes / bytesPerSecond);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const { speed, eta } = calculateUploadStats();

  return (
    <div className={styles.imageUploader}>
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

      {!selectedFile ? (
        <>
          <div
            className={styles.dropZone}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClickDropZone}
            role="button"
            tabIndex={0}
            aria-label="Drag and drop zone for image upload"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClickDropZone();
              }
            }}
          >
            <div className={styles.dropZoneIcon}>📁</div>
            <div className={styles.dropZoneText}>Drag and drop your image here</div>
            <div className={styles.dropZoneSubtext}>or click to select a file</div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
            className={styles.fileInput}
            aria-label="Select image file"
          />
          <button
            className={styles.selectFileButton}
            onClick={handleClickDropZone}
            disabled={uploadProgress.isUploading}
            aria-label="Click to select image file"
          >
            Select File
          </button>
        </>
      ) : (
        <>
          <div className={styles.imagePreview}>
            {preview && (
              <img
                src={preview}
                alt="Selected image preview"
                className={styles.previewImage}
              />
            )}
            <div className={styles.previewInfo}>
              <div className={styles.previewFileName}>{selectedFile.name}</div>
              <div className={styles.previewFileSize}>
                {formatFileSize(selectedFile.size)}
              </div>
            </div>
            <button
              className={styles.removeButton}
              onClick={handleRemoveFile}
              disabled={uploadProgress.isUploading}
              aria-label="Remove selected image"
            >
              ✕
            </button>
          </div>

          {uploadProgress.isUploading && (
            <div className={styles.uploadProgress}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${uploadProgress.progress}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(uploadProgress.progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress"
                />
              </div>
              <div className={styles.progressInfo}>
                <span>{Math.round(uploadProgress.progress)}%</span>
                <span>{speed}</span>
                <span>ETA: {eta}</span>
              </div>
            </div>
          )}

          <button
            className={styles.uploadButton}
            onClick={handleUpload}
            disabled={uploadProgress.isUploading}
            aria-label="Upload selected image"
          >
            {uploadProgress.isUploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </>
      )}
    </div>
  );
}
