import React from 'react';
import styles from './error_display.module.css';

interface IErrorDisplayProps {
  error: string;
  onRetry: () => void;
  retryDisabled?: boolean;
}

export const ErrorDisplay: React.FC<IErrorDisplayProps> = ({ error, onRetry, retryDisabled }) => {
  const getErrorIcon = () => {
    if (error.toLowerCase().includes('catalog')) {
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    }
    if (error.toLowerCase().includes('model')) {
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          <line x1="12" y1="12" x2="12" y2="22" strokeDasharray="2 2" />
        </svg>
      );
    }
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  };

  const getErrorTitle = () => {
    if (error.toLowerCase().includes('catalog')) {
      return 'Failed to Load Catalog';
    }
    if (error.toLowerCase().includes('model')) {
      return 'Failed to Load Model';
    }
    if (error.toLowerCase().includes('save')) {
      return 'Failed to Save Look';
    }
    if (error.toLowerCase().includes('load')) {
      return 'Failed to Load Look';
    }
    return 'Something Went Wrong';
  };

  const getSuggestions = () => {
    const suggestions: string[] = [];
    
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')) {
      suggestions.push('Check your internet connection');
      suggestions.push('Verify the server is running');
    }
    
    if (error.toLowerCase().includes('catalog')) {
      suggestions.push('Ensure the /models folder exists');
      suggestions.push('Check that catalog files are properly formatted');
    }
    
    if (error.toLowerCase().includes('model')) {
      suggestions.push('Verify the model file exists');
      suggestions.push('Check that the model format is supported (.glb or .gltf)');
    }
    
    if (retryDisabled) {
      suggestions.push('Try refreshing the page');
    } else {
      suggestions.push('Click the retry button to try again');
    }
    
    return suggestions;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Error Icon */}
        <div className={styles.iconContainer}>
          {getErrorIcon()}
        </div>

        {/* Error Title */}
        <h2 className={styles.title}>{getErrorTitle()}</h2>

        {/* Error Message */}
        <p className={styles.message}>{error}</p>

        {/* Suggestions */}
        <div className={styles.suggestions}>
          <h3 className={styles.suggestionsTitle}>What you can try:</h3>
          <ul className={styles.suggestionsList}>
            {getSuggestions().map((suggestion, index) => (
              <li key={index} className={styles.suggestionItem}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            className={styles.retryButton}
            onClick={onRetry}
            disabled={retryDisabled}
            aria-label="Retry"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            {retryDisabled ? 'Maximum Retries Reached' : 'Retry'}
          </button>
          <button
            className={styles.homeButton}
            onClick={() => window.location.href = '/dashboard'}
            aria-label="Go to Dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go to Dashboard
          </button>
        </div>

        {/* Additional Help */}
        {retryDisabled && (
          <div className={styles.helpText}>
            If the problem persists, please contact support or try refreshing the page.
          </div>
        )}
      </div>
    </div>
  );
};
