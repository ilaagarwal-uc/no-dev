// Share Modal Component - Generate and display share link with QR code
import React, { useState, useEffect } from 'react';
import { generateShareLink } from '../../../data-service/application/look-persistence/look_persistence.api.js';
import styles from './share_modal.module.css';

export interface IShareModalProps {
  lookId: string;
  lookName: string;
  onClose: () => void;
}

export function ShareModal({ lookId, lookName, onClose }: IShareModalProps): JSX.Element {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  useEffect(() => {
    generateShare();
  }, [lookId]);
  
  async function generateShare(): Promise<void> {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await generateShareLink(lookId);
      
      if (!response.success || !response.shareUrl) {
        throw new Error(response.error || 'Failed to generate share link');
      }
      
      setShareUrl(response.shareUrl);
      
      // Generate QR code using a public API
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(response.shareUrl)}`;
      setQrCodeUrl(qrApiUrl);
      
    } catch (err) {
      console.error('Generate share link error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate share link');
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleCopyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      
      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Reset copy success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Copy to clipboard error:', err);
      // Fallback: Select the text
      const input = document.getElementById('share-url-input') as HTMLInputElement;
      if (input) {
        input.select();
      }
    }
  }
  
  function handleShareTwitter(): void {
    const text = `Check out my wall design: ${lookName}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  }
  
  function handleShareFacebook(): void {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  }
  
  function handleShareLinkedIn(): void {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  }
  
  function handleShareEmail(): void {
    const subject = `Check out my wall design: ${lookName}`;
    const body = `I created this wall design and wanted to share it with you:\n\n${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  
  function handleDownloadQR(): void {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${lookName}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="share-modal-title" className={styles.title}>Share Look</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close share modal"
          >
            ✕
          </button>
        </div>
        
        {isLoading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Generating share link...</p>
          </div>
        )}
        
        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
            <button
              className={styles.retryButton}
              onClick={generateShare}
              aria-label="Retry generating share link"
            >
              Retry
            </button>
          </div>
        )}
        
        {!isLoading && !error && shareUrl && (
          <div className={styles.content}>
            {/* Share URL */}
            <div className={styles.section}>
              <label htmlFor="share-url-input" className={styles.label}>
                Share Link
              </label>
              <div className={styles.urlContainer}>
                <input
                  id="share-url-input"
                  type="text"
                  value={shareUrl}
                  readOnly
                  className={styles.urlInput}
                  aria-label="Share URL"
                />
                <button
                  className={styles.copyButton}
                  onClick={handleCopyLink}
                  aria-label="Copy share link to clipboard"
                >
                  {copySuccess ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              {copySuccess && (
                <p className={styles.successMessage} role="status">
                  Link copied to clipboard!
                </p>
              )}
            </div>
            
            {/* QR Code */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>QR Code</h3>
              <div className={styles.qrContainer}>
                <img
                  src={qrCodeUrl}
                  alt="QR code for sharing"
                  className={styles.qrCode}
                />
                <button
                  className={styles.downloadButton}
                  onClick={handleDownloadQR}
                  aria-label="Download QR code"
                >
                  Download QR Code
                </button>
              </div>
            </div>
            
            {/* Social Media Share Buttons */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Share on Social Media</h3>
              <div className={styles.socialButtons}>
                <button
                  className={`${styles.socialButton} ${styles.twitter}`}
                  onClick={handleShareTwitter}
                  aria-label="Share on Twitter"
                  title="Share on Twitter"
                >
                  <svg viewBox="0 0 24 24" className={styles.socialIcon}>
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                  Twitter
                </button>
                
                <button
                  className={`${styles.socialButton} ${styles.facebook}`}
                  onClick={handleShareFacebook}
                  aria-label="Share on Facebook"
                  title="Share on Facebook"
                >
                  <svg viewBox="0 0 24 24" className={styles.socialIcon}>
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                  Facebook
                </button>
                
                <button
                  className={`${styles.socialButton} ${styles.linkedin}`}
                  onClick={handleShareLinkedIn}
                  aria-label="Share on LinkedIn"
                  title="Share on LinkedIn"
                >
                  <svg viewBox="0 0 24 24" className={styles.socialIcon}>
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  LinkedIn
                </button>
                
                <button
                  className={`${styles.socialButton} ${styles.email}`}
                  onClick={handleShareEmail}
                  aria-label="Share via email"
                  title="Share via email"
                >
                  <svg viewBox="0 0 24 24" className={styles.socialIcon}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
