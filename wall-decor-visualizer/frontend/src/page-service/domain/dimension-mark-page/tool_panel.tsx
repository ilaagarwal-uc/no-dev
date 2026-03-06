import React from 'react';
import { IToolPanelProps } from './interface.js';

export function ToolPanel({ selectedTool, archType, onArchTypeSelect }: IToolPanelProps): JSX.Element {
  if (selectedTool !== 'arch') {
    return <div />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Arch Type</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onArchTypeSelect?.('180')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: archType === '180' ? '#1976d2' : '#f5f5f5',
            color: archType === '180' ? '#ffffff' : '#666',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          180°
        </button>
        <button
          onClick={() => onArchTypeSelect?.('90')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: archType === '90' ? '#1976d2' : '#f5f5f5',
            color: archType === '90' ? '#ffffff' : '#666',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          90°
        </button>
      </div>
    </div>
  );
}
