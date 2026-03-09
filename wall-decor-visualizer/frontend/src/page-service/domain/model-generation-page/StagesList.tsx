import React from 'react';
import { IStagesListProps } from './interface.js';
import { calculateStageStatus, getStageIcon } from './progress_tracking_logic.js';
import styles from './progress_section.module.css';

export function StagesList({ currentStage, progress }: IStagesListProps): JSX.Element {
  const stages = calculateStageStatus(currentStage, progress);
  
  return (
    <div className={styles.stagesList}>
      {stages.map(stage => (
        <div 
          key={stage.id} 
          className={`${styles.stageItem} ${styles[`stage-${stage.status}`]}`}
        >
          <span className={styles.stageIcon}>{getStageIcon(stage.status)}</span>
          <span className={styles.stageText}>{stage.text}</span>
        </div>
      ))}
    </div>
  );
}
