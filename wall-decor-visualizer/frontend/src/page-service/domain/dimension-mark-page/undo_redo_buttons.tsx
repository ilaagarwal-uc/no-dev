import React, { useEffect } from 'react';
import { IUndoRedoButtonsProps } from './interface.js';

export function UndoRedoButtons({ canUndo, canRedo, onUndo, onRedo }: IUndoRedoButtonsProps): JSX.Element {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (canUndo) {
          onUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        if (canRedo) {
          onRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        style={{
          padding: '6px 12px',
          fontSize: '14px',
          cursor: canUndo ? 'pointer' : 'not-allowed',
          opacity: canUndo ? 1 : 0.5
        }}
      >
        ↶ Undo
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        style={{
          padding: '6px 12px',
          fontSize: '14px',
          cursor: canRedo ? 'pointer' : 'not-allowed',
          opacity: canRedo ? 1 : 0.5
        }}
      >
        ↷ Redo
      </button>
    </div>
  );
}
