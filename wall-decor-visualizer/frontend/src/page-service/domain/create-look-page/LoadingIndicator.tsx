import React from 'react';
import styles from './loading_indicator.module.css';

interface ILoadingIndicatorProps {
  progress: number; // 0-100
  stage: string;
}

export const LoadingIndicator: React.FC<ILoadingIndicatorProps> = ({ progress, stage }) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Loading Spinner */}
        <div className={styles.spinnerContainer}>
          <svg className={styles.spinner} viewBox="0 0 50 50">
            <circle
              className={styles.spinnerPath}
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
            />
          </svg>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.progressText}>{progress}%</div>
        </div>

        {/* Stage Message */}
        <div className={styles.stageMessage}>{stage}</div>

        {/* Loading Stages */}
        <div className={styles.stages}>
          <div className={`${styles.stage} ${progress >= 10 ? styles.stageComplete : ''}`}>
            <div className={styles.stageIcon}>
              {progress >= 10 ? '✓' : '1'}
            </div>
            <div className={styles.stageName}>Loading base model</div>
          </div>
          <div className={`${styles.stage} ${progress >= 50 ? styles.stageComplete : ''}`}>
            <div className={styles.stageIcon}>
              {progress >= 50 ? '✓' : '2'}
            </div>
            <div className={styles.stageName}>Loading catalog</div>
          </div>
          <div className={`${styles.stage} ${progress >= 85 ? styles.stageComplete : ''}`}>
            <div className={styles.stageIcon}>
              {progress >= 85 ? '✓' : '3'}
            </div>
            <div className={styles.stageName}>Initializing viewer</div>
          </div>
        </div>
      </div>
    </div>
  );
};
