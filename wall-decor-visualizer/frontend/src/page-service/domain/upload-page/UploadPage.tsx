import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './upload_page.module.css';
import { GlobalHeader } from './GlobalHeader';
import { ImageUploader } from './ImageUploader';
import { CameraCapture } from './CameraCapture';
import { getAuthToken, getUserId, clearAuthToken } from '../../../data-service/domain/auth';
import { logoutUser } from '../../application/upload';
import type { IUploadPageProps } from './interface';

interface IDecodedToken {
  userId: string;
  phoneNumber: string;
  exp: number;
}

export function UploadPage(): JSX.Element {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify authentication on page load
    const token = getAuthToken();
    const storedUserId = getUserId();

    console.log('UploadPage: Checking authentication', { hasToken: !!token, hasUserId: !!storedUserId });

    if (!token || !storedUserId) {
      console.log('UploadPage: No token or userId, redirecting to login');
      navigate('/login');
      return;
    }

    try {
      // Decode JWT to get user info
      const decoded = decodeToken(token);
      console.log('UploadPage: Token decoded', { decoded });
      
      if (!decoded) {
        console.log('UploadPage: Failed to decode token, redirecting to login');
        clearAuthToken();
        navigate('/login');
        return;
      }

      // Check if token is expired
      if (isTokenExpired(decoded)) {
        console.log('UploadPage: Token expired, redirecting to login');
        clearAuthToken();
        navigate('/login');
        return;
      }

      console.log('UploadPage: Authentication successful', { userId: decoded.userId, phoneNumber: decoded.phoneNumber });
      setUserId(decoded.userId);
      setPhoneNumber(decoded.phoneNumber);
      setIsLoading(false);
    } catch (error) {
      console.error('UploadPage: Error during authentication check', error);
      clearAuthToken();
      navigate('/login');
    }
  }, [navigate]);

  const decodeToken = (token: string): IDecodedToken | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('UploadPage: Invalid token format - not 3 parts');
        return null;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      console.log('UploadPage: Decoded payload', payload);
      
      if (!payload.userId) {
        console.error('UploadPage: Token missing userId');
        return null;
      }
      
      if (!payload.phoneNumber) {
        console.error('UploadPage: Token missing phoneNumber');
        return null;
      }
      
      return {
        userId: payload.userId,
        phoneNumber: payload.phoneNumber,
        exp: payload.exp
      };
    } catch (error) {
      console.error('UploadPage: Error decoding token', error);
      return null;
    }
  };

  const isTokenExpired = (decoded: IDecodedToken): boolean => {
    const expiresAt = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    return now > expiresAt;
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutUser();
    } catch (error) {
      // Continue with logout even if API fails
    } finally {
      clearAuthToken();
      navigate('/login');
    }
  };

  const handleUploadSuccess = (imageId: string, gcpUrl: string): void => {
    setSuccessMessage(`Image uploaded successfully! Image ID: ${imageId}`);
    setErrorMessage(null);
    
    console.log('handleUploadSuccess: Processing upload', { imageId, gcpUrl, userId });
    
    // Extract userId, imageId, and filename from gcpUrl
    // Format: https://storage.googleapis.com/wall-decor-visualizer-images/{userId}/{imageId}/{filename}
    const urlParts = gcpUrl.split('/');
    const extractedUserId = urlParts[urlParts.length - 3]; // Get userId from URL
    const extractedImageId = urlParts[urlParts.length - 2]; // Get imageId from URL
    const filename = urlParts[urlParts.length - 1]; // Get filename from URL
    
    console.log('handleUploadSuccess: Extracted from URL', { extractedUserId, extractedImageId, filename });
    
    // Construct proxy URL
    const proxyUrl = `/api/images/${extractedUserId}/${extractedImageId}/${filename}`;
    console.log('handleUploadSuccess: Proxy URL', { proxyUrl });
    
    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      console.log('handleUploadSuccess: Image dimensions loaded', { width: img.naturalWidth, height: img.naturalHeight });
      
      const imageData = {
        imageUrl: proxyUrl,
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight
      };
      console.log('handleUploadSuccess: Storing image data', imageData);
      sessionStorage.setItem('uploadedImageData', JSON.stringify(imageData));
      sessionStorage.setItem('uploadedImageId', extractedImageId);
      
      // Redirect to dimension marking page
      navigate('/dimension-mark');
    };
    img.onerror = () => {
      console.error('handleUploadSuccess: Failed to load image for dimensions');
      
      const imageData = {
        imageUrl: proxyUrl,
        imageWidth: 1920,
        imageHeight: 1080
      };
      console.log('handleUploadSuccess: Storing image data (fallback)', imageData);
      sessionStorage.setItem('uploadedImageData', JSON.stringify(imageData));
      sessionStorage.setItem('uploadedImageId', extractedImageId);
      navigate('/dimension-mark');
    };
    img.src = gcpUrl;
  };

  const handleUploadError = (error: string): void => {
    setErrorMessage(error);
    setSuccessMessage(null);
  };

  const handleCameraCaptureSuccess = (imageId: string, gcpUrl: string): void => {
    setShowCameraCapture(false);
    handleUploadSuccess(imageId, gcpUrl);
  };

  const handleCameraCaptureError = (error: string): void => {
    handleUploadError(error);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9f7f4',
        color: '#2d3748',
        fontSize: '1.125rem',
        fontWeight: '500'
      }}>
        Loading...
      </div>
    );
  }

  if (!userId || !phoneNumber) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9f7f4',
        color: '#2d3748',
        fontSize: '1.125rem',
        fontWeight: '500'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <GlobalHeader
        userId={userId}
        phoneNumber={phoneNumber}
        onLogout={handleLogout}
      />

      <div className={styles.uploadPageContainer}>
        <div className={styles.uploadPageContent}>
          <div className={styles.uploadPageTitle}>
            <h1>Upload Your Wall Image</h1>
            <p>Choose an image from your device or capture one with your camera</p>
          </div>

          {successMessage && (
            <div className={styles.successMessage} role="status" aria-live="polite">
              ✓ {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className={styles.errorMessage} role="alert" aria-live="assertive">
              <span>✕ {errorMessage}</span>
              <button
                className={styles.errorClose}
                onClick={() => setErrorMessage(null)}
                aria-label="Close error message"
              >
                ×
              </button>
            </div>
          )}

          {!showCameraCapture ? (
            <div className={styles.uploadOptions}>
              <div className={styles.uploadOption}>
                <div className={styles.uploadOptionTitle}>Upload from Device</div>
                <ImageUploader
                  userId={userId}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </div>

              <div className={styles.uploadOption}>
                <div className={styles.uploadOptionTitle}>Capture from Camera</div>
                <CameraCapture
                  userId={userId}
                  onCaptureSuccess={handleCameraCaptureSuccess}
                  onCaptureError={handleCameraCaptureError}
                  onCancel={() => setShowCameraCapture(false)}
                />
              </div>
            </div>
          ) : (
            <CameraCapture
              userId={userId}
              onCaptureSuccess={handleCameraCaptureSuccess}
              onCaptureError={handleCameraCaptureError}
              onCancel={() => setShowCameraCapture(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}
