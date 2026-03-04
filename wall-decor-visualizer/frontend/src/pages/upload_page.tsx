import React, { useState } from 'react';
import { ImageUpload } from '@components/upload/image_upload';
import styles from './upload_page.module.css';

export const UploadPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    try {
      // Implementation will be added
      console.log('Uploading file:', file.name);
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Upload Wall Image</h1>
          <p className={styles.subtitle}>Upload an image of your wall to get started</p>
        </div>

        <div className={styles.content}>
          <ImageUpload onUpload={handleUpload} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};
