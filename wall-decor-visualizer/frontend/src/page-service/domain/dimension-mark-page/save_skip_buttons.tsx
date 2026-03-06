import React from 'react';
import { ISaveSkipButtonsProps } from './interface.js';

export function SaveSkipButtons({ onSave, onSkip, isLoading }: ISaveSkipButtonsProps): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={onSave}
        disabled={isLoading}
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '600',
          backgroundColor: '#4caf50',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? 'Saving...' : 'Save'}
      </button>
      <button
        onClick={onSkip}
        disabled={isLoading}
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '600',
          backgroundColor: '#f44336',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        Skip
      </button>
    </div>
  );
}
