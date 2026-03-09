import React from 'react';
import { ViewMode } from './interface';
import styles from './viewer_controls.module.css';

interface IViewerControlsProps {
  viewMode: ViewMode;
  showGrid: boolean;
  snapToGrid: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onGridToggle: () => void;
  onSnapToggle: () => void;
  onResetView: () => void;
  onSave: () => void;
  onShare: () => void;
  onShowBOM: () => void;
}

export const ViewerControls: React.FC<IViewerControlsProps> = ({
  viewMode,
  showGrid,
  snapToGrid,
  onViewModeChange,
  onGridToggle,
  onSnapToggle,
  onResetView,
  onSave,
  onShare,
  onShowBOM,
}) => {
  return (
    <div className={styles.container}>
      {/* Top Controls */}
      <div className={styles.topControls}>
        {/* View Mode Selector */}
        <div className={styles.controlGroup}>
          <label className={styles.label}>View Mode</label>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${viewMode === 'perspective' ? styles.active : ''}`}
              onClick={() => onViewModeChange('perspective')}
              title="Perspective View"
              aria-label="Perspective View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className={styles.buttonText}>Perspective</span>
            </button>
            <button
              className={`${styles.button} ${viewMode === 'orthographic' ? styles.active : ''}`}
              onClick={() => onViewModeChange('orthographic')}
              title="Orthographic View"
              aria-label="Orthographic View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" />
              </svg>
              <span className={styles.buttonText}>Orthographic</span>
            </button>
            <button
              className={`${styles.button} ${viewMode === 'wireframe' ? styles.active : ''}`}
              onClick={() => onViewModeChange('wireframe')}
              title="Wireframe View"
              aria-label="Wireframe View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeDasharray="2 2" />
              </svg>
              <span className={styles.buttonText}>Wireframe</span>
            </button>
          </div>
        </div>

        {/* Grid and Snap Toggles */}
        <div className={styles.controlGroup}>
          <button
            className={`${styles.toggleButton} ${showGrid ? styles.active : ''}`}
            onClick={onGridToggle}
            title="Toggle Grid"
            aria-label="Toggle Grid"
            aria-pressed={showGrid}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span className={styles.buttonText}>Grid</span>
          </button>
          <button
            className={`${styles.toggleButton} ${snapToGrid ? styles.active : ''}`}
            onClick={onSnapToggle}
            title="Toggle Snap to Grid"
            aria-label="Toggle Snap to Grid"
            aria-pressed={snapToGrid}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
            </svg>
            <span className={styles.buttonText}>Snap</span>
          </button>
        </div>

        {/* Reset View Button */}
        <button
          className={styles.iconButton}
          onClick={onResetView}
          title="Reset View"
          aria-label="Reset View"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button
          className={styles.primaryButton}
          onClick={onShowBOM}
          title="Bill of Materials"
          aria-label="View Bill of Materials"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>BOM</span>
        </button>
        <button
          className={styles.primaryButton}
          onClick={onSave}
          title="Save Look"
          aria-label="Save Look"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>Save</span>
        </button>
        <button
          className={styles.secondaryButton}
          onClick={onShare}
          title="Share Look"
          aria-label="Share Look"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};
