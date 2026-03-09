import React from 'react';
import { IModelInfoPanelProps } from './interface.js';
import { formatFileSize } from '../../../data-service/domain/model-generation/index.js';
import styles from './model_viewer.module.css';

export function ModelInfoPanel({ modelInfo }: IModelInfoPanelProps): JSX.Element {
  if (!modelInfo) {
    return <div className={styles.modelInfoPanel}>Loading model info...</div>;
  }
  
  return (
    <div className={styles.modelInfoPanel}>
      <h3>Model Information</h3>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>Vertices:</span>
        <span className={styles.infoValue}>{modelInfo.vertexCount.toLocaleString()}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>Faces:</span>
        <span className={styles.infoValue}>{modelInfo.faceCount.toLocaleString()}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>File Size:</span>
        <span className={styles.infoValue}>{formatFileSize(modelInfo.fileSize)}</span>
      </div>
    </div>
  );
}
