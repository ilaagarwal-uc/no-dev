import React from 'react';
import { IViewerControlsProps } from './interface.js';
import styles from './model_viewer.module.css';

export function ViewerControls({ 
  onZoomIn, 
  onZoomOut, 
  onReset, 
  onFullscreen 
}: IViewerControlsProps): JSX.Element {
  return (
    <div className={styles.viewerControls}>
      <button onClick={onZoomIn} className={styles.controlBtn} title="Zoom In">
        +
      </button>
      <button onClick={onZoomOut} className={styles.controlBtn} title="Zoom Out">
        −
      </button>
      <button onClick={onReset} className={styles.controlBtn} title="Reset View">
        ⟲
      </button>
      <button onClick={onFullscreen} className={styles.controlBtn} title="Fullscreen">
        ⛶
      </button>
    </div>
  );
}
