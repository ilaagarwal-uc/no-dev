// Undo/redo stack management
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';

export interface IUndoRedoState {
  undoStack: DimensionMarkDomain.IAnnotation[][];
  redoStack: DimensionMarkDomain.IAnnotation[][];
}

export interface IDimensionMarkPageState {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  annotations: DimensionMarkDomain.IAnnotation[];
  selectedTool: ToolType;
  zoomLevel: number;
  panOffset: DimensionMarkDomain.IPoint;
  toolbarPosition: DimensionMarkDomain.IPoint;
  archType: '180' | '90';
  isDrawing: boolean;
  previewData?: IPreviewData;
  undoRedoState: IUndoRedoState;
}

export type ToolType = 'polygon' | 'dimension' | 'freehand' | 'arch' | 'concave' | 'convex' | 'pan';

export interface IPreviewData {
  type: DimensionMarkDomain.AnnotationType;
  data: any;
}

export function createUndoRedoState(): IUndoRedoState {
  return {
    undoStack: [],
    redoStack: []
  };
}

export function pushToUndoStack(
  state: IUndoRedoState,
  snapshot: DimensionMarkDomain.IAnnotation[]
): IUndoRedoState {
  return {
    undoStack: [...state.undoStack, snapshot],
    redoStack: []
  };
}

export function undo(
  state: IUndoRedoState,
  currentAnnotations: DimensionMarkDomain.IAnnotation[]
): { newAnnotations: DimensionMarkDomain.IAnnotation[]; undoRedoState: IUndoRedoState } {
  if (state.undoStack.length === 0) {
    return { newAnnotations: currentAnnotations, undoRedoState: state };
  }

  const newUndoStack = [...state.undoStack];
  const previousAnnotations = newUndoStack.pop()!;

  return {
    newAnnotations: previousAnnotations,
    undoRedoState: {
      undoStack: newUndoStack,
      redoStack: [...state.redoStack, currentAnnotations]
    }
  };
}

export function redo(
  state: IUndoRedoState,
  currentAnnotations: DimensionMarkDomain.IAnnotation[]
): { newAnnotations: DimensionMarkDomain.IAnnotation[]; undoRedoState: IUndoRedoState } {
  if (state.redoStack.length === 0) {
    return { newAnnotations: currentAnnotations, undoRedoState: state };
  }

  const newRedoStack = [...state.redoStack];
  const nextAnnotations = newRedoStack.pop()!;

  return {
    newAnnotations: nextAnnotations,
    undoRedoState: {
      undoStack: [...state.undoStack, currentAnnotations],
      redoStack: newRedoStack
    }
  };
}

export function clearRedoStack(state: IUndoRedoState): IUndoRedoState {
  return {
    ...state,
    redoStack: []
  };
}

export function canUndo(state: IUndoRedoState): boolean {
  return state.undoStack.length > 0;
}

export function canRedo(state: IUndoRedoState): boolean {
  return state.redoStack.length > 0;
}
