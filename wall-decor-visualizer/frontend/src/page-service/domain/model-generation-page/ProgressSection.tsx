import React from 'react';
import { IProgressSectionProps } from './interface.js';
import { ProgressBar } from './ProgressBar.js';
import { StagesList } from './StagesList.js';
import styles from './progress_section.module.css';

export function ProgressSection({ jobStatus }: IProgressSectionProps): JSX.Element {
  if (!jobStatus) {
    return <div className={styles.progressSection}>Initializing...</div>;
  }
  
  return (
    <div className={styles.progressSection}>
      <div className={styles.progressHeader}>
        <h2>Generating 3D Model</h2>
        <span className={styles.percentage}>{jobStatus.progress}%</span>
      </div>
      
      <ProgressBar progress={jobStatus.progress} />
      
      <p className={styles.stage}>{jobStatus.stage}</p>
      
      <StagesList currentStage={jobStatus.stage} progress={jobStatus.progress} />
    </div>
  );
}
