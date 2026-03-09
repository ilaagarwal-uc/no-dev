import React from 'react';
import { IErrorDisplayProps } from './interface.js';
import styles from './model_generation_page.module.css';

export function ErrorDisplay({ error, onRetry, onGoBack }: IErrorDisplayProps): JSX.Element {
  return (
    <div className={styles.errorDisplay}>
      <div className={styles.errorIcon}>⚠️</div>
      <h2>Generation Failed</h2>
      <p className={styles.errorMessage}>{error}</p>
      <div className={styles.errorActions}>
        <button onClick={onRetry} className={styles.retryButton}>
          Retry Generation
        </button>
        {onGoBack && (
          <button onClick={onGoBack} className={styles.goBackButton}>
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}
