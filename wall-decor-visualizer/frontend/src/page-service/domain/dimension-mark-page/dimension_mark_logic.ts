// Page-level state management and orchestration
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';
import { IDimensionMarkPageState, ToolType, createUndoRedoState } from './undo_redo_logic.js';

export function initializeDimensionMarkPage(
  imageUrl: string,
  imageWidth: number,
  imageHeight: number
): IDimensionMarkPageState {
  return {
    imageUrl,
    imageWidth,
    imageHeight,
    annotations: [],
    selectedTool: 'pan',
    zoomLevel: 100, // Keep as 100 for percentage, Canvas will convert to 1.0
    panOffset: { x: 0, y: 0 },
    toolbarPosition: { x: 20, y: 20 },
    archType: '180',
    isDrawing: false,
    previewData: undefined,
    undoRedoState: createUndoRedoState()
  };
}

export function handleToolSelection(
  state: IDimensionMarkPageState,
  tool: ToolType
): IDimensionMarkPageState {
  return {
    ...state,
    selectedTool: tool,
    isDrawing: false,
    previewData: undefined
  };
}

export function handleZoomIn(state: IDimensionMarkPageState): IDimensionMarkPageState {
  const newZoom = Math.min(500, state.zoomLevel + 10);
  return {
    ...state,
    zoomLevel: newZoom
  };
}

export function handleZoomOut(state: IDimensionMarkPageState): IDimensionMarkPageState {
  const newZoom = Math.max(10, state.zoomLevel - 10);
  return {
    ...state,
    zoomLevel: newZoom
  };
}

export function handlePan(
  state: IDimensionMarkPageState,
  offset: DimensionMarkDomain.IPoint
): IDimensionMarkPageState {
  return {
    ...state,
    panOffset: {
      x: state.panOffset.x + offset.x,
      y: state.panOffset.y + offset.y
    }
  };
}

export function handleUndo(state: IDimensionMarkPageState): IDimensionMarkPageState {
  const { undoRedoState } = state;

  if (undoRedoState.undoStack.length === 0) {
    return state;
  }

  const newUndoStack = [...undoRedoState.undoStack];
  const previousAnnotations = newUndoStack.pop()!;

  return {
    ...state,
    annotations: previousAnnotations,
    undoRedoState: {
      undoStack: newUndoStack,
      redoStack: [...undoRedoState.redoStack, state.annotations]
    }
  };
}

export function handleRedo(state: IDimensionMarkPageState): IDimensionMarkPageState {
  const { undoRedoState } = state;

  if (undoRedoState.redoStack.length === 0) {
    return state;
  }

  const newRedoStack = [...undoRedoState.redoStack];
  const nextAnnotations = newRedoStack.pop()!;

  return {
    ...state,
    annotations: nextAnnotations,
    undoRedoState: {
      undoStack: [...undoRedoState.undoStack, state.annotations],
      redoStack: newRedoStack
    }
  };
}

export function canUndo(state: IDimensionMarkPageState): boolean {
  return state.undoRedoState.undoStack.length > 0;
}

export function canRedo(state: IDimensionMarkPageState): boolean {
  return state.undoRedoState.redoStack.length > 0;
}

export function addAnnotation(
  state: IDimensionMarkPageState,
  annotation: DimensionMarkDomain.IAnnotation
): IDimensionMarkPageState {
  const newAnnotations = [...state.annotations, annotation];
  return {
    ...state,
    annotations: newAnnotations,
    undoRedoState: {
      undoStack: [...state.undoRedoState.undoStack, state.annotations],
      redoStack: []
    }
  };
}

export function removeAnnotation(
  state: IDimensionMarkPageState,
  annotationId: string
): IDimensionMarkPageState {
  const newAnnotations = state.annotations.filter(ann => ann.id !== annotationId);
  return {
    ...state,
    annotations: newAnnotations,
    undoRedoState: {
      undoStack: [...state.undoRedoState.undoStack, state.annotations],
      redoStack: []
    }
  };
}

export function updateToolbarPosition(
  state: IDimensionMarkPageState,
  position: DimensionMarkDomain.IPoint
): IDimensionMarkPageState {
  return {
    ...state,
    toolbarPosition: position
  };
}

export function setArchType(
  state: IDimensionMarkPageState,
  archType: '180' | '90'
): IDimensionMarkPageState {
  return {
    ...state,
    archType
  };
}

export function setPreviewData(state: IDimensionMarkPageState, previewData: any): IDimensionMarkPageState {
  return {
    ...state,
    previewData
  };
}

export function clearPreviewData(state: IDimensionMarkPageState): IDimensionMarkPageState {
  return {
    ...state,
    previewData: undefined
  };
}

export function setIsDrawing(state: IDimensionMarkPageState, isDrawing: boolean): IDimensionMarkPageState {
  return {
    ...state,
    isDrawing
  };
}
