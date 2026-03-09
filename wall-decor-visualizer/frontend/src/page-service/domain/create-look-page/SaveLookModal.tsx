import React, { useState } from 'react';
import styles from './save_look_modal.module.css';

export interface ISaveLookModalProps {
  isOpen: boolean;
  thumbnailDataUrl: string;
  savedLookId?: string;
  onSave: (name: string, description: string) => Promise<void>;
  onShare?: (lookId: string) => void;
  onClose: () => void;
}

export function SaveLookModal({ isOpen, thumbnailDataUrl, savedLookId, onSave, onShare, onClose }: ISaveLookModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  if (!isOpen) {
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a name for your look');
      return;
    }
    
    if (name.length > 100) {
      setError('Name must be 100 characters or less');
      return;
    }
    
    if (description.length > 500) {
      setError('Description must be 500 characters or less');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      await onSave(name.trim(), description.trim());
      setSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save look');
      setIsSaving(false);
    }
  };
  
  const handleClose = () => {
    setName('');
    setDescription('');
    setError(null);
    setSuccess(false);
    setIsSaving(false);
    onClose();
  };
  
  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Save Look</h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close modal"
            disabled={isSaving}
          >
            ×
          </button>
        </div>
        
        {success ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <p>Look saved successfully!</p>
            {savedLookId && onShare && (
              <button
                className={styles.shareButton}
                onClick={() => onShare(savedLookId)}
                aria-label="Share this look"
              >
                Share Look
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.thumbnailPreview}>
              <img src={thumbnailDataUrl} alt="Look preview" />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="lookName">
                Name <span className={styles.required}>*</span>
              </label>
              <input
                id="lookName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for your look"
                maxLength={100}
                disabled={isSaving}
                className={styles.input}
                autoFocus
              />
              <div className={styles.charCount}>{name.length}/100</div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="lookDescription">Description</label>
              <textarea
                id="lookDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)"
                maxLength={500}
                rows={4}
                disabled={isSaving}
                className={styles.textarea}
              />
              <div className={styles.charCount}>{description.length}/500</div>
            </div>
            
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !name.trim()}
                className={styles.saveButton}
              >
                {isSaving ? 'Saving...' : 'Save Look'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
