import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listLooks, deleteLook } from '../../../data-service/application/look-persistence/look_persistence.api.js';
import { ShareModal } from '../create-look-page/ShareModal.js';
import styles from './looks_list_page.module.css';

interface ILookListItem {
  id: string;
  name: string;
  description: string;
  baseModelId: string;
  thumbnailUrl: string;
  version: number;
  appliedModelsCount: number;
  createdAt: string;
  updatedAt: string;
}

export function LooksListPage() {
  const navigate = useNavigate();
  const [looks, setLooks] = useState<ILookListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedLookForShare, setSelectedLookForShare] = useState<{ id: string; name: string } | null>(null);
  
  useEffect(() => {
    loadLooks();
  }, []);
  
  const loadLooks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await listLooks();
      
      if (response.success && response.looks) {
        setLooks(response.looks);
      } else {
        setError(response.error || 'Failed to load looks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load looks');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLoadLook = (lookId: string) => {
    navigate(`/create-look?lookId=${lookId}`);
  };
  
  const handleDeleteLook = async (lookId: string, lookName: string) => {
    if (!confirm(`Are you sure you want to delete "${lookName}"?`)) {
      return;
    }
    
    setDeletingId(lookId);
    
    try {
      const response = await deleteLook(lookId);
      
      if (response.success) {
        // Remove from list
        setLooks(looks.filter(look => look.id !== lookId));
      } else {
        alert(response.error || 'Failed to delete look');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete look');
    } finally {
      setDeletingId(null);
    }
  };
  
  const handleShareLook = (lookId: string, lookName: string) => {
    setSelectedLookForShare({ id: lookId, name: lookName });
    setShareModalOpen(true);
  };
  
  const handleCloseShareModal = () => {
    setShareModalOpen(false);
    setSelectedLookForShare(null);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Looks</h1>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your looks...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Looks</h1>
        </div>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={loadLooks} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Looks</h1>
        <button
          onClick={() => navigate('/create-look')}
          className={styles.createButton}
        >
          + Create New Look
        </button>
      </div>
      
      {looks.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📐</div>
          <h2>No looks yet</h2>
          <p>Create your first wall design to get started</p>
          <button
            onClick={() => navigate('/create-look')}
            className={styles.createButton}
          >
            Create New Look
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {looks.map((look) => (
            <div key={look.id} className={styles.card}>
              <div className={styles.thumbnail}>
                <img src={look.thumbnailUrl} alt={look.name} />
                <div className={styles.overlay}>
                  <button
                    onClick={() => handleLoadLook(look.id)}
                    className={styles.loadButton}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleShareLook(look.id, look.name)}
                    className={styles.shareButton}
                  >
                    Share
                  </button>
                  <button
                    onClick={() => handleDeleteLook(look.id, look.name)}
                    disabled={deletingId === look.id}
                    className={styles.deleteButton}
                  >
                    {deletingId === look.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
              
              <div className={styles.cardContent}>
                <h3 className={styles.lookName}>{look.name}</h3>
                {look.description && (
                  <p className={styles.lookDescription}>{look.description}</p>
                )}
                
                <div className={styles.metadata}>
                  <span className={styles.metadataItem}>
                    {look.appliedModelsCount} {look.appliedModelsCount === 1 ? 'model' : 'models'}
                  </span>
                  <span className={styles.metadataItem}>
                    v{look.version}
                  </span>
                  <span className={styles.metadataItem}>
                    {formatDate(look.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Share Modal */}
      {shareModalOpen && selectedLookForShare && (
        <ShareModal
          lookId={selectedLookForShare.id}
          lookName={selectedLookForShare.name}
          onClose={handleCloseShareModal}
        />
      )}
    </div>
  );
}
