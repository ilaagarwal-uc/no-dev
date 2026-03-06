import { describe, it, expect, beforeEach } from 'vitest';
import * as DimensionMarkLogic from '../../../../src/page-service/domain/dimension-mark-page/dimension_mark_logic';
import * as UndoRedoLogic from '../../../../src/page-service/domain/dimension-mark-page/undo_redo_logic';
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';

describe('dimension_mark_logic', () => {
  let pageState: UndoRedoLogic.IDimensionMarkPageState;
  let testAnnotation: DimensionMarkDomain.IAnnotation;

  beforeEach(() => {
    pageState = DimensionMarkLogic.initializeDimensionMarkPage('test-image.jpg', 1000, 800);

    testAnnotation = {
      id: 'test_ann_1',
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
  });

  describe('initializeDimensionMarkPage', () => {
    it('should initialize page state with default values', () => {
      const state = DimensionMarkLogic.initializeDimensionMarkPage('image.jpg', 1000, 800);

      expect(state.imageUrl).toBe('image.jpg');
      expect(state.imageWidth).toBe(1000);
      expect(state.imageHeight).toBe(800);
      expect(state.annotations).toHaveLength(0);
      expect(state.selectedTool).toBe('pan');
      expect(state.zoomLevel).toBe(100);
      expect(state.panOffset).toEqual({ x: 0, y: 0 });
      expect(state.archType).toBe('180');
      expect(state.isDrawing).toBe(false);
    });

    it('should initialize toolbar position', () => {
      const state = DimensionMarkLogic.initializeDimensionMarkPage('image.jpg', 1000, 800);

      expect(state.toolbarPosition).toEqual({ x: 20, y: 20 });
    });

    it('should initialize empty undo/redo stacks', () => {
      const state = DimensionMarkLogic.initializeDimensionMarkPage('image.jpg', 1000, 800);

      expect(state.undoRedoState.undoStack).toHaveLength(0);
      expect(state.undoRedoState.redoStack).toHaveLength(0);
    });
  });

  describe('handleToolSelection', () => {
    it('should select polygon tool', () => {
      const newState = DimensionMarkLogic.handleToolSelection(pageState, 'polygon');

      expect(newState.selectedTool).toBe('polygon');
    });

    it('should select dimension tool', () => {
      const newState = DimensionMarkLogic.handleToolSelection(pageState, 'dimension');

      expect(newState.selectedTool).toBe('dimension');
    });

    it('should select freehand tool', () => {
      const newState = DimensionMarkLogic.handleToolSelection(pageState, 'freehand');

      expect(newState.selectedTool).toBe('freehand');
    });

    it('should select arch tool', () => {
      const newState = DimensionMarkLogic.handleToolSelection(pageState, 'arch');

      expect(newState.selectedTool).toBe('arch');
    });

    it('should select corner tools', () => {
      let newState = DimensionMarkLogic.handleToolSelection(pageState, 'concave');
      expect(newState.selectedTool).toBe('concave');

      newState = DimensionMarkLogic.handleToolSelection(pageState, 'convex');
      expect(newState.selectedTool).toBe('convex');
    });

    it('should clear drawing state when selecting tool', () => {
      pageState.isDrawing = true;
      pageState.previewData = { type: 'polygon', data: {} };

      const newState = DimensionMarkLogic.handleToolSelection(pageState, 'dimension');

      expect(newState.isDrawing).toBe(false);
      expect(newState.previewData).toBeUndefined();
    });
  });

  describe('handleZoomIn', () => {
    it('should increase zoom by 10%', () => {
      const newState = DimensionMarkLogic.handleZoomIn(pageState);

      expect(newState.zoomLevel).toBe(110);
    });

    it('should not exceed maximum zoom (500%)', () => {
      pageState.zoomLevel = 495;

      const newState = DimensionMarkLogic.handleZoomIn(pageState);

      expect(newState.zoomLevel).toBe(500);
    });

    it('should handle multiple zoom in operations', () => {
      let state = pageState;
      for (let i = 0; i < 5; i++) {
        state = DimensionMarkLogic.handleZoomIn(state);
      }

      expect(state.zoomLevel).toBe(150);
    });

    it('should clamp at maximum zoom', () => {
      pageState.zoomLevel = 500;

      const newState = DimensionMarkLogic.handleZoomIn(pageState);

      expect(newState.zoomLevel).toBe(500);
    });
  });

  describe('handleZoomOut', () => {
    it('should decrease zoom by 10%', () => {
      pageState.zoomLevel = 150;

      const newState = DimensionMarkLogic.handleZoomOut(pageState);

      expect(newState.zoomLevel).toBe(140);
    });

    it('should not go below minimum zoom (10%)', () => {
      pageState.zoomLevel = 15;

      const newState = DimensionMarkLogic.handleZoomOut(pageState);

      expect(newState.zoomLevel).toBe(10);
    });

    it('should handle multiple zoom out operations', () => {
      pageState.zoomLevel = 150;
      let state = pageState;
      for (let i = 0; i < 5; i++) {
        state = DimensionMarkLogic.handleZoomOut(state);
      }

      expect(state.zoomLevel).toBe(100);
    });

    it('should clamp at minimum zoom', () => {
      pageState.zoomLevel = 10;

      const newState = DimensionMarkLogic.handleZoomOut(pageState);

      expect(newState.zoomLevel).toBe(10);
    });
  });

  describe('handlePan', () => {
    it('should pan by offset', () => {
      const offset = { x: 50, y: 50 };

      const newState = DimensionMarkLogic.handlePan(pageState, offset);

      expect(newState.panOffset).toEqual({ x: 50, y: 50 });
    });

    it('should accumulate pan offsets', () => {
      let state = pageState;
      state = DimensionMarkLogic.handlePan(state, { x: 50, y: 50 });
      state = DimensionMarkLogic.handlePan(state, { x: 30, y: 20 });

      expect(state.panOffset).toEqual({ x: 80, y: 70 });
    });

    it('should handle negative pan offsets', () => {
      let state = pageState;
      state = DimensionMarkLogic.handlePan(state, { x: 100, y: 100 });
      state = DimensionMarkLogic.handlePan(state, { x: -50, y: -50 });

      expect(state.panOffset).toEqual({ x: 50, y: 50 });
    });
  });

  describe('addAnnotation', () => {
    it('should add annotation to state', () => {
      const newState = DimensionMarkLogic.addAnnotation(pageState, testAnnotation);

      expect(newState.annotations).toHaveLength(1);
      expect(newState.annotations[0]).toEqual(testAnnotation);
    });

    it('should push previous state to undo stack', () => {
      const newState = DimensionMarkLogic.addAnnotation(pageState, testAnnotation);

      expect(newState.undoRedoState.undoStack).toHaveLength(1);
      expect(newState.undoRedoState.undoStack[0]).toEqual(pageState.annotations);
    });

    it('should clear redo stack', () => {
      pageState.undoRedoState.redoStack = [[testAnnotation]];

      const newState = DimensionMarkLogic.addAnnotation(pageState, testAnnotation);

      expect(newState.undoRedoState.redoStack).toHaveLength(0);
    });

    it('should add multiple annotations', () => {
      let state = pageState;
      state = DimensionMarkLogic.addAnnotation(state, testAnnotation);

      const annotation2 = { ...testAnnotation, id: 'test_ann_2' };
      state = DimensionMarkLogic.addAnnotation(state, annotation2);

      expect(state.annotations).toHaveLength(2);
    });
  });

  describe('removeAnnotation', () => {
    it('should remove annotation from state', () => {
      pageState = DimensionMarkLogic.addAnnotation(pageState, testAnnotation);

      const newState = DimensionMarkLogic.removeAnnotation(pageState, testAnnotation.id);

      expect(newState.annotations).toHaveLength(0);
    });

    it('should keep other annotations', () => {
      const annotation2 = { ...testAnnotation, id: 'test_ann_2' };

      pageState = DimensionMarkLogic.addAnnotation(pageState, testAnnotation);
      pageState = DimensionMarkLogic.addAnnotation(pageState, annotation2);

      const newState = DimensionMarkLogic.removeAnnotation(pageState, testAnnotation.id);

      expect(newState.annotations).toHaveLength(1);
      expect(newState.annotations[0].id).toBe('test_ann_2');
    });

    it('should push previous state to undo stack', () => {
      pageState = DimensionMarkLogic.addAnnotation(pageState, testAnnotation);

      const newState = DimensionMarkLogic.removeAnnotation(pageState, testAnnotation.id);

      expect(newState.undoRedoState.undoStack.length).toBeGreaterThan(0);
    });
  });

  describe('handleUndo', () => {
    it('should restore previous annotations', () => {
      pageState = DimensionMarkLogic.addAnnotation(pageState, testAnnotation);

      const newState = DimensionMarkLogic.handleUndo(pageState);

      expect(newState.annotations).toHaveLength(0);
    });

    it('should move current state to redo stack', () => {
      pageState = DimensionMarkLogic.addAnnotation(pageState, testAnnotation);

      const newState = DimensionMarkLogic.handleUndo(pageState);

      expect(newState.undoRedoState.redoStack).toHaveLength(1);
    });

    it('should do nothing when undo stack is empty', () => {
      const newState = DimensionMarkLogic.handleUndo(pageState);

      expect(newState).toEqual(pageState);
    });
  });

  describe('handleRedo', () => {
    it('should restore next annotations', () => {
      pageState = DimensionMarkLogic.addAnnotation(pageState, testAnnotation);
      pageState = DimensionMarkLogic.handleUndo(pageState);

      const newState = DimensionMarkLogic.handleRedo(pageState);

      expect(newState.annotations).toHaveLength(1);
    });

    it('should move current state to undo stack', () => {
      pageState = DimensionMarkLogic.addAnnotation(pageState, testAnnotation);
      pageState = DimensionMarkLogic.handleUndo(pageState);

      const newState = DimensionMarkLogic.handleRedo(pageState);

      expect(newState.undoRedoState.undoStack.length).toBeGreaterThan(0);
    });

    it('should do nothing when redo stack is empty', () => {
      const newState = DimensionMarkLogic.handleRedo(pageState);

      expect(newState).toEqual(pageState);
    });
  });

  describe('canUndo', () => {
    it('should return false when undo stack is empty', () => {
      const result = DimensionMarkLogic.canUndo(pageState);

      expect(result).toBe(false);
    });

    it('should return true when undo stack has items', () => {
      pageState = DimensionMarkLogic.addAnnotation(pageState, testAnnotation);

      const result = DimensionMarkLogic.canUndo(pageState);

      expect(result).toBe(true);
    });
  });

  describe('canRedo', () => {
    it('should return false when redo stack is empty', () => {
      const result = DimensionMarkLogic.canRedo(pageState);

      expect(result).toBe(false);
    });

    it('should return true when redo stack has items', () => {
      pageState = DimensionMarkLogic.addAnnotation(pageState, testAnnotation);
      pageState = DimensionMarkLogic.handleUndo(pageState);

      const result = DimensionMarkLogic.canRedo(pageState);

      expect(result).toBe(true);
    });
  });

  describe('updateToolbarPosition', () => {
    it('should update toolbar position', () => {
      const newPosition = { x: 100, y: 100 };

      const newState = DimensionMarkLogic.updateToolbarPosition(pageState, newPosition);

      expect(newState.toolbarPosition).toEqual(newPosition);
    });
  });

  describe('setArchType', () => {
    it('should set arch type to 180°', () => {
      const newState = DimensionMarkLogic.setArchType(pageState, '180');

      expect(newState.archType).toBe('180');
    });

    it('should set arch type to 90°', () => {
      const newState = DimensionMarkLogic.setArchType(pageState, '90');

      expect(newState.archType).toBe('90');
    });
  });

  describe('setPreviewData', () => {
    it('should set preview data', () => {
      const previewData = { type: 'polygon', data: { vertices: [] } };

      const newState = DimensionMarkLogic.setPreviewData(pageState, previewData);

      expect(newState.previewData).toEqual(previewData);
    });
  });

  describe('clearPreviewData', () => {
    it('should clear preview data', () => {
      pageState.previewData = { type: 'polygon', data: {} };

      const newState = DimensionMarkLogic.clearPreviewData(pageState);

      expect(newState.previewData).toBeUndefined();
    });
  });

  describe('setIsDrawing', () => {
    it('should set drawing state to true', () => {
      const newState = DimensionMarkLogic.setIsDrawing(pageState, true);

      expect(newState.isDrawing).toBe(true);
    });

    it('should set drawing state to false', () => {
      pageState.isDrawing = true;

      const newState = DimensionMarkLogic.setIsDrawing(pageState, false);

      expect(newState.isDrawing).toBe(false);
    });
  });

  describe('Complex workflows', () => {
    it('should handle add, undo, redo workflow', () => {
      let state = pageState;

      // Add annotation
      state = DimensionMarkLogic.addAnnotation(state, testAnnotation);
      expect(state.annotations).toHaveLength(1);

      // Undo
      state = DimensionMarkLogic.handleUndo(state);
      expect(state.annotations).toHaveLength(0);

      // Redo
      state = DimensionMarkLogic.handleRedo(state);
      expect(state.annotations).toHaveLength(1);
    });

    it('should handle tool switching with zoom', () => {
      let state = pageState;

      state = DimensionMarkLogic.handleToolSelection(state, 'polygon');
      expect(state.selectedTool).toBe('polygon');

      state = DimensionMarkLogic.handleZoomIn(state);
      expect(state.zoomLevel).toBe(110);

      state = DimensionMarkLogic.handleToolSelection(state, 'dimension');
      expect(state.selectedTool).toBe('dimension');
      expect(state.zoomLevel).toBe(110);
    });

    it('should handle pan and zoom together', () => {
      let state = pageState;

      state = DimensionMarkLogic.handlePan(state, { x: 50, y: 50 });
      state = DimensionMarkLogic.handleZoomIn(state);
      state = DimensionMarkLogic.handlePan(state, { x: 30, y: 30 });

      expect(state.panOffset).toEqual({ x: 80, y: 80 });
      expect(state.zoomLevel).toBe(110);
    });
  });
});
