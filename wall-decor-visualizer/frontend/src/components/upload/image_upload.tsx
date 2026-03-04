import React, { useState, useRef } from 'react';
import styles from './image_upload.module.css';
import { API_CONSTANTS } from '@constants/api_constants';

interface IImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
}

export const ImageUpload: React.FC<IImageUploadProps> = ({ onUpload, isLoading = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > API_CONSTANTS.MAX_IMAGE_SIZE) {
      return { valid: false, error: `File size exceeds ${API_CONSTANTS.MAX_IMAGE_SIZE / 1024 / 1024}MB limit` };
    }

    const fileType = file.type;
    if (!API_CONSTANTS.ACCEPTED_IMAGE_FORMATS.includes(fileType)) {
      return { valid: false, error: `File type not supported. Accepted: ${API_CONSTANTS.ACCEPTED_IMAGE_FORMATS.join(', ')}` };
    }

    return { valid: true };
  };

  const handleFile = async (file: File) => {
    setError('');
    const validation = validateFile(file);

    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploadProgress(0);
      await onUpload(file);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 2000);
    } catch (err) {
      setError('Upload failed. Please try again.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={API_CONSTANTS.ACCEPTED_IMAGE_FORMATS.map(f => `.${f.split('/')[1]}`).join(',')}
          onChange={handleFileSelect}
          disabled={isLoading}
          style={{ display: 'none' }}
        />

        <div className={styles.content}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <h3 className={styles.title}>Drag and drop your image here</h3>
          <p className={styles.subtitle}>or click to select from your computer</p>
          <p className={styles.formats}>
            Supported formats: {API_CONSTANTS.ACCEPTED_IMAGE_FORMATS.map(f => f.split('/')[1].toUpperCase()).join(', ')}
          </p>
          <p className={styles.size}>
            Max size: {API_CONSTANTS.MAX_IMAGE_SIZE / 1024 / 1024}MB
          </p>
        </div>
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className={styles.progressText}>{uploadProgress}% uploaded</p>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};
