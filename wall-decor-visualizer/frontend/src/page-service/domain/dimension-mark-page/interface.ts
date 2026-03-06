// TypeScript interfaces for dimension marking page-service
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';

export type ToolType = 'polygon' | 'dimension' | 'freehand' | 'arch' | 'concave' | 'convex' | 'pan';

export interface IPreviewData {
  type: DimensionMarkDomain.AnnotationType;
  data: any;
}

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

export interface ICanvasProps {
  imageUrl: string;
  annotations: DimensionMarkDomain.IAnnotation[];
  selectedTool: ToolType;
  zoomLevel: number;
  panOffset: DimensionMarkDomain.IPoint;
  previewData?: IPreviewData;
  onAnnotationCreate: (annotation: DimensionMarkDomain.IAnnotation) => void;
  onAnnotationUpdate: (id: string, annotation: DimensionMarkDomain.IAnnotation) => void;
  onDrawingStart: () => void;
  onDrawingEnd: () => void;
  onPreviewUpdate: (preview: IPreviewData | undefined) => void;
  imageWidth: number;
  imageHeight: number;
  archType?: '180' | '90';
}

export interface IToolbarProps {
  selectedTool: ToolType;
  position: DimensionMarkDomain.IPoint;
  onToolSelect: (tool: ToolType) => void;
  onPositionChange: (position: DimensionMarkDomain.IPoint) => void;
}

export interface IZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export interface IToolPanelProps {
  selectedTool: ToolType;
  archType?: '180' | '90';
  onArchTypeSelect?: (type: '180' | '90') => void;
}

export interface ISaveSkipButtonsProps {
  onSave: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export interface IUndoRedoButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}
