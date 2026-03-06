import { describe, it, expect, beforeEach } from 'vitest';
import * as UndoRedoLogic from '../../../../src/page-service/domain/dimension-mark-page/undo_redo_logic';
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';

describe('undo_redo_logic', () => {
  let undoRedoState: UndoRedoLogic.IUndoRedoState;
  let annotation1: DimensionMarkDomain.IAnnotation;
  let annotation2: DimensionMarkDomain.IAnnotation;

  beforeEach(() => {
    undoRedoState = UndoRedoLogic.createUndoRedoState();

    annotation1 = {
      id: 'ann_1',
      type: 'polygon',
      data: {
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 }
        ],
        area: 5000,
        color: '#FF0000',
        fillColor: 'rgba(255, 0, 0, 0.2)'
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    annotation2 = {
      id: 'ann_2',
      type: 'dimension',
      data: {
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 100, y: 100 },
        color: '#000000',
        arrowHeadSize: 12
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  });

  describe('createUndoRedoState', () => {
    it('should create empty undo/redo state', () => {
      const state = UndoRedoLogic.createUndoRedoState();

      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(0);
    });
  });

  describe('pushToUndoStack', () => {
    it('should add snapshot to undo stack', () => {
      const snapshot = [annotation1];

      const newState = UndoRedoLogic.pushToUndoStack(undoRedoState, snapshot);

      expect(newState.undoStack).toHaveLength(1);
      expect(newState.undoStack[0]).toEqual(snapshot);
    });

    it('should clear redo stack when pushing to undo', () => {
      undoRedoState.redoStack = [[annotation1]];

      const newState = UndoRedoLogic.pushToUndoStack(undoRedoState, [annotation2]);

      expect(newState.redoStack).toHaveLength(0);
    });

    it('should preserve previous undo stack entries', () => {
      const snapshot1 = [annotation1];
      const snapshot2 = [annotation2];

      let newState = UndoRedoLogic.pushToUndoStack(undoRedoState, snapshot1);
      newState = UndoRedoLogic.pushToUndoStack(newState, snapshot2);

      expect(newState.undoStack).toHaveLength(2);
      expect(newState.undoStack[0]).toEqual(snapshot1);
      expect(newState.undoStack[1]).toEqual(snapshot2);
    });

    it('should handle multiple snapshots', () => {
      let state = undoRedoState;
      for (let i = 0; i < 5; i++) {
        state = UndoRedoLogic.pushToUndoStack(state, [annotation1]);
      }

      expect(state.undoStack).toHaveLength(5);
    });
  });

  describe('undo', () => {
    it('should restore previous annotations', () => {
      const currentAnnotations = [annotation1];
      const previousAnnotations = [annotation2];

      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, previousAnnotations);

      const result = UndoRedoLogic.undo(undoRedoState, currentAnnotations);

      expect(result.newAnnotations).toEqual(previousAnnotations);
    });

    it('should move current annotations to redo stack', () => {
      const currentAnnotations = [annotation1];
      const previousAnnotations = [annotation2];

      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, previousAnnotations);

      const result = UndoRedoLogic.undo(undoRedoState, currentAnnotations);

      expect(result.undoRedoState.redoStack).toHaveLength(1);
      expect(result.undoRedoState.redoStack[0]).toEqual(currentAnnotations);
    });

    it('should remove from undo stack', () => {
      const previousAnnotations = [annotation2];

      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, previousAnnotations);

      const result = UndoRedoLogic.undo(undoRedoState, [annotation1]);

      expect(result.undoRedoState.undoStack).toHaveLength(0);
    });

    it('should do nothing when undo stack is empty', () => {
      const currentAnnotations = [annotation1];

      const result = UndoRedoLogic.undo(undoRedoState, currentAnnotations);

      expect(result.newAnnotations).toEqual(currentAnnotations);
      expect(result.undoRedoState.undoStack).toHaveLength(0);
      expect(result.undoRedoState.redoStack).toHaveLength(0);
    });

    it('should handle multiple undos', () => {
      const ann1 = [annotation1];
      const ann2 = [annotation2];
      const ann3 = [{ ...annotation1, id: 'ann_3' }];

      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, ann1);
      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, ann2);
      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, ann3);

      // First undo: current is ann3, undo stack has [ann1, ann2, ann3]
      // After undo: newAnnotations = ann3 (popped from stack), redoStack = [ann3]
      let result = UndoRedoLogic.undo(undoRedoState, ann3);
      expect(result.newAnnotations).toEqual(ann3);
      expect(result.undoRedoState.undoStack).toHaveLength(2);
      expect(result.undoRedoState.redoStack).toHaveLength(1);

      // Second undo: current is ann3, undo stack has [ann1, ann2]
      result = UndoRedoLogic.undo(result.undoRedoState, ann3);
      expect(result.newAnnotations).toEqual(ann2);
      expect(result.undoRedoState.undoStack).toHaveLength(1);
    });
  });

  describe('redo', () => {
    it('should restore next annotations', () => {
      const currentAnnotations = [annotation1];
      const nextAnnotations = [annotation2];

      undoRedoState.redoStack = [nextAnnotations];

      const result = UndoRedoLogic.redo(undoRedoState, currentAnnotations);

      expect(result.newAnnotations).toEqual(nextAnnotations);
    });

    it('should move current annotations to undo stack', () => {
      const currentAnnotations = [annotation1];
      const nextAnnotations = [annotation2];

      undoRedoState.redoStack = [nextAnnotations];

      const result = UndoRedoLogic.redo(undoRedoState, currentAnnotations);

      expect(result.undoRedoState.undoStack).toHaveLength(1);
      expect(result.undoRedoState.undoStack[0]).toEqual(currentAnnotations);
    });

    it('should remove from redo stack', () => {
      const nextAnnotations = [annotation2];

      undoRedoState.redoStack = [nextAnnotations];

      const result = UndoRedoLogic.redo(undoRedoState, [annotation1]);

      expect(result.undoRedoState.redoStack).toHaveLength(0);
    });

    it('should do nothing when redo stack is empty', () => {
      const currentAnnotations = [annotation1];

      const result = UndoRedoLogic.redo(undoRedoState, currentAnnotations);

      expect(result.newAnnotations).toEqual(currentAnnotations);
      expect(result.undoRedoState.undoStack).toHaveLength(0);
      expect(result.undoRedoState.redoStack).toHaveLength(0);
    });

    it('should handle multiple redos', () => {
      const ann1 = [annotation1];
      const ann2 = [annotation2];
      const ann3 = [{ ...annotation1, id: 'ann_3' }];

      undoRedoState.redoStack = [ann3, ann2];

      let result = UndoRedoLogic.redo(undoRedoState, ann1);
      expect(result.newAnnotations).toEqual(ann2);

      result = UndoRedoLogic.redo(result.undoRedoState, ann2);
      expect(result.newAnnotations).toEqual(ann3);
    });
  });

  describe('clearRedoStack', () => {
    it('should clear redo stack', () => {
      undoRedoState.redoStack = [[annotation1], [annotation2]];

      const newState = UndoRedoLogic.clearRedoStack(undoRedoState);

      expect(newState.redoStack).toHaveLength(0);
    });

    it('should preserve undo stack', () => {
      undoRedoState.undoStack = [[annotation1]];
      undoRedoState.redoStack = [[annotation2]];

      const newState = UndoRedoLogic.clearRedoStack(undoRedoState);

      expect(newState.undoStack).toHaveLength(1);
      expect(newState.undoStack[0]).toEqual([annotation1]);
    });
  });

  describe('canUndo', () => {
    it('should return false when undo stack is empty', () => {
      const result = UndoRedoLogic.canUndo(undoRedoState);

      expect(result).toBe(false);
    });

    it('should return true when undo stack has items', () => {
      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, [annotation1]);

      const result = UndoRedoLogic.canUndo(undoRedoState);

      expect(result).toBe(true);
    });

    it('should return true with multiple items', () => {
      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, [annotation1]);
      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, [annotation2]);

      const result = UndoRedoLogic.canUndo(undoRedoState);

      expect(result).toBe(true);
    });
  });

  describe('canRedo', () => {
    it('should return false when redo stack is empty', () => {
      const result = UndoRedoLogic.canRedo(undoRedoState);

      expect(result).toBe(false);
    });

    it('should return true when redo stack has items', () => {
      undoRedoState.redoStack = [[annotation1]];

      const result = UndoRedoLogic.canRedo(undoRedoState);

      expect(result).toBe(true);
    });

    it('should return true with multiple items', () => {
      undoRedoState.redoStack = [[annotation1], [annotation2]];

      const result = UndoRedoLogic.canRedo(undoRedoState);

      expect(result).toBe(true);
    });
  });

  describe('Undo/Redo Workflow', () => {
    it('should undo then redo to restore state', () => {
      const ann1 = [annotation1];
      const ann2 = [annotation2];

      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, ann1);

      let result = UndoRedoLogic.undo(undoRedoState, ann2);
      expect(result.newAnnotations).toEqual(ann1);

      result = UndoRedoLogic.redo(result.undoRedoState, ann1);
      expect(result.newAnnotations).toEqual(ann2);
    });

    it('should clear redo stack when new action after undo', () => {
      const ann1 = [annotation1];
      const ann2 = [annotation2];
      const ann3 = [{ ...annotation1, id: 'ann_3' }];

      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, ann1);
      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, ann2);

      let result = UndoRedoLogic.undo(undoRedoState, ann2);
      expect(result.undoRedoState.redoStack).toHaveLength(1);

      result = UndoRedoLogic.pushToUndoStack(result.undoRedoState, ann3);
      expect(result.redoStack).toHaveLength(0);
    });

    it('should handle complex undo/redo sequence', () => {
      const ann1 = [annotation1];
      const ann2 = [annotation2];
      const ann3 = [{ ...annotation1, id: 'ann_3' }];

      // Create sequence: ann1 -> ann2 -> ann3
      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, ann1);
      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, ann2);
      undoRedoState = UndoRedoLogic.pushToUndoStack(undoRedoState, ann3);

      // Undo: current is ann3, undo stack has [ann1, ann2, ann3]
      // After undo: newAnnotations = ann3 (popped), redoStack = [ann3]
      let result = UndoRedoLogic.undo(undoRedoState, ann3);
      expect(result.newAnnotations).toEqual(ann3);
      expect(result.undoRedoState.redoStack).toHaveLength(1);

      // Undo again: current is ann3, undo stack has [ann1, ann2]
      // After undo: newAnnotations = ann2 (popped), redoStack = [ann3, ann3]
      result = UndoRedoLogic.undo(result.undoRedoState, ann3);
      expect(result.newAnnotations).toEqual(ann2);
      expect(result.undoRedoState.redoStack).toHaveLength(2);

      // Redo: current is ann2, redo stack has [ann3, ann3]
      // After redo: newAnnotations = ann3 (popped from redo), undoStack = [..., ann2]
      result = UndoRedoLogic.redo(result.undoRedoState, ann2);
      expect(result.newAnnotations).toEqual(ann3);

      // Redo again: current is ann3, redo stack has [ann3]
      // After redo: newAnnotations = ann3 (popped from redo)
      result = UndoRedoLogic.redo(result.undoRedoState, ann3);
      expect(result.newAnnotations).toEqual(ann3);
    });

    it('should handle many undo/redo operations', () => {
      let state = undoRedoState;
      const annotations = [];

      // Create 10 snapshots
      for (let i = 0; i < 10; i++) {
        const ann = [{ ...annotation1, id: `ann_${i}` }];
        annotations.push(ann);
        state = UndoRedoLogic.pushToUndoStack(state, ann);
      }

      // Undo all
      let current = annotations[9];
      for (let i = 0; i < 10; i++) {
        const result = UndoRedoLogic.undo(state, current);
        state = result.undoRedoState;
        current = result.newAnnotations;
      }

      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(10);

      // Redo all
      for (let i = 0; i < 10; i++) {
        const result = UndoRedoLogic.redo(state, current);
        state = result.undoRedoState;
        current = result.newAnnotations;
      }

      expect(state.undoStack).toHaveLength(10);
      expect(state.redoStack).toHaveLength(0);
    });
  });
});
