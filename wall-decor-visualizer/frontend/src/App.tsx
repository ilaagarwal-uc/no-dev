import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from './page-service/domain/login-page/login_page';
import { Dashboard } from './page-service/domain/dashboard/Dashboard';
import { UploadPage } from './page-service/domain/upload-page/UploadPage';
import { DimensionMarkPage } from './page-service/domain/dimension-mark-page/dimension_mark_page';
import { ModelGenerationPage } from './page-service/domain/model-generation-page/ModelGenerationPage';
import { SharedLookPage } from './page-service/domain/shared-look-page/SharedLookPage';
import { CreateLookPage } from './page-service/domain/create-look-page';
import { LooksListPage } from './page-service/domain/looks-list-page/LooksListPage';
import { getAuthToken, isTokenExpired, clearAuthToken } from './data-service/domain/auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token && !isTokenExpired(token)) {
      setIsAuthenticated(true);
    } else {
      clearAuthToken();
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
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

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dimension-mark"
          element={
            <ProtectedRoute>
              <DimensionMarkPageWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/model-generation"
          element={
            <ProtectedRoute>
              <ModelGenerationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-look/:baseModelId"
          element={
            <ProtectedRoute>
              <CreateLookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/looks"
          element={
            <ProtectedRoute>
              <LooksListPage />
            </ProtectedRoute>
          }
        />
        {/* Public route for shared looks - no authentication required */}
        <Route path="/shared-look/:shareLink" element={<SharedLookPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

interface IUploadedImageData {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
}

function DimensionMarkPageWrapper() {
  const navigate = useNavigate();
  const [imageData, setImageData] = useState<IUploadedImageData | null>(null);

  useEffect(() => {
    // Get image data from sessionStorage
    const storedData = sessionStorage.getItem('uploadedImageData');
    if (storedData) {
      try {
        setImageData(JSON.parse(storedData));
      } catch (error) {
        console.error('Failed to parse image data:', error);
        navigate('/upload');
      }
    } else {
      navigate('/upload');
    }
  }, [navigate]);

  if (!imageData) {
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

  const handleSave = (annotations: any[], mergedImageBlob: Blob) => {
    console.log('Dimension marking saved:', { annotations, blob: mergedImageBlob });
    // Clear the stored image data
    sessionStorage.removeItem('uploadedImageData');
    // Navigate to dashboard or next page
    navigate('/dashboard');
  };

  const handleSkip = () => {
    console.log('Dimension marking skipped');
    // Clear the stored image data
    sessionStorage.removeItem('uploadedImageData');
    // Navigate to dashboard or next page
    navigate('/dashboard');
  };

  return (
    <DimensionMarkPage
      imageUrl={imageData.imageUrl}
      imageWidth={imageData.imageWidth}
      imageHeight={imageData.imageHeight}
      onSave={handleSave}
      onSkip={handleSkip}
    />
  );
}

export default App;
