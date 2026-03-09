// Shared Look Page - Read-only view of a shared look
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSharedLook } from '../../../data-service/application/look-persistence/look_persistence.api.js';
import type { ILook } from '../../../data-service/domain/create-look/create_look_schema.js';
import { ModelViewer } from '../create-look-page/ModelViewer.js';
import styles from './shared_look_page.module.css';

export function SharedLookPage(): JSX.Element {
  const { shareLink } = useParams<{ shareLink: string }>();
  const navigate = useNavigate();
  
  const [look, setLook] = useState<ILook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!shareLink) {
      setError('Invalid share link');
      setIsLoading(false);
      return;
    }
    
    loadSharedLook(shareLink);
  }, [shareLink]);
  
  async function loadSharedLook(link: string): Promise<void> {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getSharedLook(link);
      
      if (!response.success || !response.look) {
        throw new Error(response.error || 'Failed to load shared look');
      }
      
      setLook(response.look);
    } catch (err) {
      console.error('Load shared look error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load shared look');
    } finally {
      setIsLoading(false);
    }
  }
  
  function handleGoHome(): void {
    navigate('/');
  }
  
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading shared look...</p>
        </div>
      </div>
    );
  }
  
  if (error || !look) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Look Not Found</h2>
          <p className={styles.errorMessage}>
            {error || 'This shared look could not be found or is no longer available.'}
          </p>
          <button
            className={styles.homeButton}
            onClick={handleGoHome}
            aria-label="Go to home page"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      {/* Read-only banner */}
      <div className={styles.readOnlyBanner} role="banner" aria-label="View-only mode indicator">
        <span className={styles.readOnlyIcon}>👁️</span>
        <span className={styles.readOnlyText}>View Only - This is a shared look</span>
      </div>
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{look.name}</h1>
          {look.description && (
            <p className={styles.description}>{look.description}</p>
          )}
        </div>
        <button
          className={styles.homeButton}
          onClick={handleGoHome}
          aria-label="Go to home page"
        >
          Home
        </button>
      </header>
      
      {/* 3D Viewer */}
      <div className={styles.viewerContainer}>
        <ModelViewer
          baseModelId={look.baseModelId}
          appliedModels={look.appliedModels}
          selectedModelId={null}
          showGrid={true}
          snapToGrid={false}
          viewMode="perspective"
          isReadOnly={true}
          onLoadProgress={() => {}}
          onLoadComplete={() => {}}
          onLoadError={(err) => setError(err)}
          onModelDrop={() => {}}
          onModelSelect={() => {}}
          onModelTransform={() => {}}
        />
      </div>
      
      {/* Info panel */}
      <aside className={styles.infoPanel}>
        <h2 className={styles.infoPanelTitle}>Look Details</h2>
        
        <div className={styles.infoSection}>
          <h3 className={styles.infoLabel}>Applied Models</h3>
          <p className={styles.infoValue}>{look.appliedModels.length} items</p>
        </div>
        
        {look.billOfMaterials && look.billOfMaterials.length > 0 && (
          <div className={styles.infoSection}>
            <h3 className={styles.infoLabel}>Bill of Materials</h3>
            <div className={styles.bomList}>
              {look.billOfMaterials.map((item, index) => (
                <div key={index} className={styles.bomItem}>
                  <span className={styles.bomName}>{item.name}</span>
                  <span className={styles.bomQuantity}>Qty: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className={styles.infoSection}>
          <h3 className={styles.infoLabel}>Created</h3>
          <p className={styles.infoValue}>
            {new Date(look.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className={styles.infoSection}>
          <h3 className={styles.infoLabel}>Version</h3>
          <p className={styles.infoValue}>{look.version}</p>
        </div>
      </aside>
    </div>
  );
}
