import React from 'react';
import { IProgressBarProps } from './interface.js';
import styles from './progress_section.module.css';

export function ProgressBar({ progress }: IProgressBarProps): JSX.Element {
  return (
    <div className={styles.progressBar}>
      <div 
        className={styles.progressBarFill} 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
