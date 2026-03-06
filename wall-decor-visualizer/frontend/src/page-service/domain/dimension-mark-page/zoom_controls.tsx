import React from 'react';
import { IZoomControlsProps } from './interface.js';

export function ZoomControls({ zoomLevel, onZoomIn, onZoomOut }: IZoomControlsProps): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={onZoomOut}
        disabled={zoomLevel <= 10}
        style={{
          padding: '6px 12px',
          fontSize: '14px',
          cursor: zoomLevel <= 10 ? 'not-allowed' : 'pointer',
          opacity: zoomLevel <= 10 ? 0.5 : 1
        }}
      >
        −
      </button>
      <span style={{ minWidth: '60px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
        {zoomLevel}%
      </span>
      <button
        onClick={onZoomIn}
        disabled={zoomLevel >= 500}
        style={{
          padding: '6px 12px',
          fontSize: '14px',
          cursor: zoomLevel >= 500 ? 'not-allowed' : 'pointer',
          opacity: zoomLevel >= 500 ? 0.5 : 1
        }}
      >
        +
      </button>
    </div>
  );
}
