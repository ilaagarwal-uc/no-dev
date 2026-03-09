import React from 'react';
import { IViewModeSelectorProps, ViewMode } from './interface.js';
import styles from './model_viewer.module.css';

export function ViewModeSelector({ viewMode, onViewModeChange }: IViewModeSelectorProps): JSX.Element {
  const modes: { value: ViewMode; label: string }[] = [
    { value: 'perspective', label: 'Perspective' },
    { value: 'orthographic', label: 'Orthographic' },
    { value: 'wireframe', label: 'Wireframe' }
  ];
  
  return (
    <div className={styles.viewModeSelector}>
      {modes.map(mode => (
        <button
          key={mode.value}
          onClick={() => onViewModeChange(mode.value)}
          className={`${styles.viewModeBtn} ${viewMode === mode.value ? styles.active : ''}`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
