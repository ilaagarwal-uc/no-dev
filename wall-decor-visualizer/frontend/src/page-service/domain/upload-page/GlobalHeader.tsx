import React, { useState } from 'react';
import styles from './upload_page.module.css';
import { maskPhoneNumber } from './index';

export interface IGlobalHeaderProps {
  userId: string;
  phoneNumber: string;
  onLogout: () => void;
}

export function GlobalHeader({ userId, phoneNumber, onLogout }: IGlobalHeaderProps): JSX.Element {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = (): void => {
    setShowConfirmation(true);
  };

  const handleConfirmLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } catch (error) {
      setIsLoggingOut(false);
      setShowConfirmation(false);
    }
  };

  const handleCancelLogout = (): void => {
    setShowConfirmation(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape') {
      handleCancelLogout();
    }
  };

  return (
    <>
      <header className={styles.globalHeader} role="banner" aria-label="Application header">
        <div className={styles.headerLeft}>
          <h1>Wall Decor Visualizer</h1>
        </div>

        <nav className={styles.headerCenter} aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="/looks">My Looks</a>
          <a href="#gallery">Gallery</a>
        </nav>

        <div className={styles.headerRight}>
          <span 
            className={styles.userInfo}
            aria-label={`Logged in as ${maskPhoneNumber(phoneNumber)}`}
          >
            {maskPhoneNumber(phoneNumber)}
          </span>
          <button
            className={styles.logoutButton}
            onClick={handleLogoutClick}
            aria-label="Logout from application"
            aria-describedby="logout-help"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
          <span id="logout-help" className={styles.srOnly}>
            Click to log out and return to login page
          </span>
        </div>
      </header>

      {showConfirmation && (
        <LogoutConfirmationDialog
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
          isLoading={isLoggingOut}
          onKeyDown={handleKeyDown}
        />
      )}
    </>
  );
}

interface ILogoutConfirmationDialogProps {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

function LogoutConfirmationDialog({
  onConfirm,
  onCancel,
  isLoading,
  onKeyDown
}: ILogoutConfirmationDialogProps): JSX.Element {
  return (
    <div 
      className={styles.dialogOverlay} 
      onClick={onCancel}
      role="presentation"
      onKeyDown={onKeyDown}
    >
      <div 
        className={styles.dialogContent} 
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <h2 id="logout-dialog-title">Confirm Logout</h2>
        <p id="logout-dialog-description">
          Are you sure you want to log out? You will need to log in again to access your uploads.
        </p>
        <div className={styles.dialogButtons}>
          <button
            className={`${styles.dialogButton} ${styles.cancelButton}`}
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Cancel logout"
          >
            Cancel
          </button>
          <button
            className={`${styles.dialogButton} ${styles.confirmButton}`}
            onClick={onConfirm}
            disabled={isLoading}
            aria-label="Confirm logout"
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
}
