# Dimension Marking Feature - Frontend Page-Service Architecture

**Feature**: Dimension Marking Tool for Wall Decor Visualizer
**Created**: 2026-03-06
**Architecture Pattern**: DDD (Domain-Driven Design) with page-service
**Scope**: Frontend-only (no backend API calls during marking)

---

## Architecture Overview

The dimension marking feature follows the DDD page-service pattern with a flat component structure. All components are organized within a single domain folder (`dimension-mark-page`) with no nested component folders.

### Core Principle
- **Frontend-only marking**: All drawing, editing, undo/redo operations handled client-side
- **In-memory state**: Annotations stored in React state, not persisted until Save
- **Flat structure**: All components at same level, no nested folders
- **Separation of concerns**: Page logic, component logic, and styling clearly separated

---

## Directory Structure

### Frontend src/ Structure
```
frontend/src/
├── data-service/
│   ├── application/
│   │   ├── dimension-mark/
│   │   │   ├── dimension_mark_save.api.ts    (Save API call)
│   │   │   ├── dimension_mark_skip.api.ts    (Skip API call)
│   │   │   └── index.ts                      (exports)
│   │   ├── errors.ts                         (ALL errors)
│   │   └── index.ts                          (service exports)
│   └── domain/
│       ├── dimension-mark/
│       │   ├── dimension_mark_schema.ts      (REQUIRED - type definitions)
│       │   ├── index.ts                      (domain logic functions)
│       │   └── interface.ts                  (optional - additional interfaces)
│       └── index.ts                          (domain exports)
├── page-service/
│   ├── application/
│   │   ├── dimension-mark/
│   │   │   ├── dimension_mark_page.api.ts    (Page API calls)
│   │   │   └── index.ts                      (exports)
│   │   ├── errors.ts                         (ALL errors)
│   │   └── index.ts                          (service exports)
│   └── domain/
│       ├── dimension-mark-page/
│       │   ├── DimensionMarkPage.tsx          (main page component)
│       │   ├── Canvas.tsx                     (canvas rendering)
│       │   ├── Toolbar.tsx                    (tool selector)
│       │   ├── ZoomControls.tsx               (zoom in/out buttons)
│       │   ├── ToolPanel.tsx                  (arch type selector)
│       │   ├── SaveSkipButtons.tsx            (save/skip actions)
│       │   ├── UndoRedoButtons.tsx            (undo/redo controls)
│       │   ├── dimension_mark_page.module.css (page styles)
│       │   ├── canvas.module.css              (canvas styles)
│       │   ├── toolbar.module.css             (toolbar styles)
│       │   ├── dimension_mark_logic.ts        (page-level logic)
│       │   ├── canvas_logic.ts                (canvas rendering logic)
│       │   ├── tool_logic.ts                  (tool-specific logic)
│       │   ├── annotation_logic.ts            (annotation operations)
│       │   ├── undo_redo_logic.ts             (undo/redo stack management)
│       │   ├── coordinate_logic.ts            (coordinate transformations)
│       │   ├── index.ts                       (domain exports)
│       │   └── interface.ts                   (TypeScript interfaces)
│       └── index.ts                           (page-service exports)
├── App.tsx
└── main.tsx
```

---

## Data-Service Architecture

### Purpose
The data-service layer handles all backend API calls for the dimension marking feature. Since dimension marking is frontend-only during the annotation process, the data-service is minimal and only handles two operations: Save and Skip.

### Data-Service Domain: dimension-mark

**Location**: `frontend/src/data-service/domain/dimension-mark/`

**Responsibility**: Define data structures and validation logic for dimension marking operations

#### Files

**dimension_mark_schema.ts** (REQUIRED - Type Definitions)
```typescript
// Type definitions for dimension marking domain
export interface IAnnotation {
  id: string;
  type: AnnotationType;
  data: IPolygon | IDimension | IFreehand | IArch | IConcaveCorner | IConvexCorner;
  createdAt: number;
  updatedAt: number;
}

export type AnnotationType = 'polygon' | 'dimension' | 'freehand' | 'arch' | 'concave' | 'convex'

export interface IPolygon {
  vertices: { x: number; y: number }[];
  area: number;
  color: '#FF0000';
  fillColor: 'rgba(255, 0, 0, 0.2)';
}

export interface IDimension {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  color: '#000000';
  arrowHeadSize: number;
}

export interface IFreehand {
  points: { x: number; y: number }[];
  color: '#000000';
  strokeWidth: number;
}

export interface IArch {
  type: '180' | '90';
  circumferencePoints: [{ x: number; y: number }, { x: number; y: number }];
  centerPoint: { x: number; y: number };
  radius: number;
  color: '#000000';
}

export interface IConcaveCorner {
  point: { x: number; y: number };
  size: number;
  color: '#0000FF';
  strokeColor: '#000000';
}

export interface IConvexCorner {
  point: { x: number; y: number };
  size: number;
  color: '#0000FF';
  strokeColor: '#000000';
}

export interface ISaveDimensionsRequest {
  imageUrl: string;
  annotations: IAnnotation[];
  mergedImageBlob: Blob;
}

export interface ISkipDimensionsRequest {
  imageUrl: string;
}

export interface ISaveDimensionsResponse {
  success: boolean;
  message: string;
  nextStep: string;
}

export interface ISkipDimensionsResponse {
  success: boolean;
  message: string;
  nextStep: string;
}
```

**index.ts** (Domain Logic Functions)
```typescript
// Domain logic for dimension marking validation and operations
import * as DimensionMarkSchema from './dimension_mark_schema.js';

// Validation functions
export function validateAnnotations(annotations: DimensionMarkSchema.IAnnotation[]): boolean {
  return Array.isArray(annotations) && annotations.length >= 0;
}

export function validateImageUrl(imageUrl: string): boolean {
  return typeof imageUrl === 'string' && imageUrl.length > 0;
}

export function validateSaveRequest(request: DimensionMarkSchema.ISaveDimensionsRequest): boolean {
  return (
    validateImageUrl(request.imageUrl) &&
    validateAnnotations(request.annotations) &&
    request.mergedImageBlob instanceof Blob
  );
}

export function validateSkipRequest(request: DimensionMarkSchema.ISkipDimensionsRequest): boolean {
  return validateImageUrl(request.imageUrl);
}

// Annotation operations
export function createAnnotation(
  type: DimensionMarkSchema.AnnotationType,
  data: any
): DimensionMarkSchema.IAnnotation {
  return {
    id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function updateAnnotation(
  annotation: DimensionMarkSchema.IAnnotation,
  updates: Partial<DimensionMarkSchema.IAnnotation>
): DimensionMarkSchema.IAnnotation {
  return {
    ...annotation,
    ...updates,
    updatedAt: Date.now()
  };
}

export function deleteAnnotation(
  annotations: DimensionMarkSchema.IAnnotation[],
  id: string
): DimensionMarkSchema.IAnnotation[] {
  return annotations.filter(ann => ann.id !== id);
}

export function getAnnotationById(
  annotations: DimensionMarkSchema.IAnnotation[],
  id: string
): DimensionMarkSchema.IAnnotation | undefined {
  return annotations.find(ann => ann.id === id);
}

// Export all schema types
export type { 
  IAnnotation,
  AnnotationType,
  IPolygon,
  IDimension,
  IFreehand,
  IArch,
  IConcaveCorner,
  IConvexCorner,
  ISaveDimensionsRequest,
  ISkipDimensionsRequest,
  ISaveDimensionsResponse,
  ISkipDimensionsResponse
} from './dimension_mark_schema.js';
```

**interface.ts** (Optional - Additional Interfaces)
```typescript
// Additional interfaces for dimension marking operations
export interface IDimensionMarkOperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface IAnnotationMetadata {
  totalAnnotations: number;
  annotationsByType: Record<string, number>;
  lastModified: number;
}
```

### Data-Service Application Layer: dimension-mark

**Location**: `frontend/src/data-service/application/dimension-mark/`

**Responsibility**: Handle backend API calls for Save and Skip operations

#### Files

**dimension_mark_save.api.ts** (Save API Call)
```typescript
// API call for saving dimension markings
import * as DimensionMarkDomain from '../../domain/dimension-mark/index.js';
import { SaveError } from '../errors.js';

export async function saveDimensionsApi(
  request: DimensionMarkDomain.ISaveDimensionsRequest
): Promise<DimensionMarkDomain.ISaveDimensionsResponse> {
  // Validate request
  if (!DimensionMarkDomain.validateSaveRequest(request)) {
    throw new SaveError('Invalid save request');
  }

  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('imageUrl', request.imageUrl);
    formData.append('annotations', JSON.stringify(request.annotations));
    formData.append('mergedImage', request.mergedImageBlob);

    // Call backend API
    const response = await fetch('/api/dimension-mark/save', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new SaveError(`Save failed with status ${response.status}`);
    }

    const data = await response.json();
    return data as DimensionMarkDomain.ISaveDimensionsResponse;
  } catch (error) {
    if (error instanceof SaveError) {
      throw error;
    }
    throw new SaveError(`Failed to save dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

**dimension_mark_skip.api.ts** (Skip API Call)
```typescript
// API call for skipping dimension markings
import * as DimensionMarkDomain from '../../domain/dimension-mark/index.js';
import { SkipError } from '../errors.js';

export async function skipDimensionsApi(
  request: DimensionMarkDomain.ISkipDimensionsRequest
): Promise<DimensionMarkDomain.ISkipDimensionsResponse> {
  // Validate request
  if (!DimensionMarkDomain.validateSkipRequest(request)) {
    throw new SkipError('Invalid skip request');
  }

  try {
    // Call backend API
    const response = await fetch('/api/dimension-mark/skip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new SkipError(`Skip failed with status ${response.status}`);
    }

    const data = await response.json();
    return data as DimensionMarkDomain.ISkipDimensionsResponse;
  } catch (error) {
    if (error instanceof SkipError) {
      throw error;
    }
    throw new SkipError(`Failed to skip dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

**index.ts** (Application Layer Exports)
```typescript
// Export all dimension-mark application APIs
export { saveDimensionsApi } from './dimension_mark_save.api.js';
export { skipDimensionsApi } from './dimension_mark_skip.api.js';
```

### Data-Service Errors

**Location**: `frontend/src/data-service/application/errors.ts`

**Add these error classes** (append to existing errors.ts):
```typescript
export class DimensionMarkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DimensionMarkError';
  }
}

export class SaveError extends DimensionMarkError {
  constructor(message: string) {
    super(message);
    this.name = 'SaveError';
  }
}

export class SkipError extends DimensionMarkError {
  constructor(message: string) {
    super(message);
    this.name = 'SkipError';
  }
}
```

### Data-Service Exports

**Location**: `frontend/src/data-service/application/index.ts`

**Add these exports** (append to existing index.ts):
```typescript
// Dimension marking APIs
export { saveDimensionsApi, skipDimensionsApi } from './dimension-mark/index.js';
```

**Location**: `frontend/src/data-service/domain/index.ts`

**Add these exports** (append to existing index.ts):
```typescript
// Dimension marking domain
export * from './dimension-mark/index.js';
```

---

## Data-Service Integration with Page-Service

### How Page-Service Uses Data-Service

The page-service imports and uses the data-service for Save and Skip operations:

```typescript
// page-service/domain/dimension-mark-page/DimensionMarkPage.tsx
import * as DimensionMarkApi from '@data-service/application/dimension-mark/index.js';
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';

export function DimensionMarkPage(): JSX.Element {
  // ... component logic ...

  const handleSave = async (annotations: IAnnotation[], mergedImageBlob: Blob) => {
    try {
      const request: DimensionMarkDomain.ISaveDimensionsRequest = {
        imageUrl: imageUrl,
        annotations: annotations,
        mergedImageBlob: mergedImageBlob
      };
      
      const response = await DimensionMarkApi.saveDimensionsApi(request);
      
      if (response.success) {
        // Navigate to next step
        navigate(response.nextStep);
      }
    } catch (error) {
      // Handle error
      console.error('Save failed:', error);
    }
  };

  const handleSkip = async () => {
    try {
      const request: DimensionMarkDomain.ISkipDimensionsRequest = {
        imageUrl: imageUrl
      };
      
      const response = await DimensionMarkApi.skipDimensionsApi(request);
      
      if (response.success) {
        // Navigate to next step
        navigate(response.nextStep);
      }
    } catch (error) {
      // Handle error
      console.error('Skip failed:', error);
    }
  };

  // ... rest of component ...
}
```

### Key Design Decisions

1. **Minimal Data-Service**: Only handles Save and Skip API calls
2. **Domain Types**: All annotation types defined in `dimension_mark_schema.ts`
3. **Validation**: Domain layer validates all requests before API calls
4. **Error Handling**: Specific error classes for Save and Skip operations
5. **Namespace Imports**: Page-service imports data-service as namespace
6. **No Backend During Marking**: All annotation logic stays in page-service
7. **Separation of Concerns**: Data-service handles API, page-service handles UI

---

### DimensionMarkPage (Main Page Component)
**File**: `DimensionMarkPage.tsx`
**Responsibility**: Orchestrate all sub-components and manage page-level state

**Props**: None (page component)

**State Management**:
- `annotations`: Array of all annotations (polygons, dimensions, freehand, arches, corners)
- `selectedTool`: Currently selected tool (Polygon, Dimension, Freehand, Arch, Concave, Convex, Pan)
- `zoomLevel`: Current zoom percentage (10-500%)
- `panOffset`: Current pan position (x, y)
- `undoStack`: Stack of previous states
- `redoStack`: Stack of undone states
- `toolbarPosition`: Toolbar position (x, y)
- `archType`: Selected arch type (180° or 90°)
- `isDrawing`: Whether user is currently drawing
- `previewData`: Preview line/shape data during drawing

**Key Functions**:
- `handleToolSelect(tool)`: Switch active tool
- `handleAnnotationCreate(annotation)`: Add new annotation
- `handleAnnotationDelete(id)`: Remove annotation
- `handleUndo()`: Undo last action
- `handleRedo()`: Redo last undone action
- `handleZoom(direction)`: Zoom in/out
- `handlePan(offset)`: Pan image
- `handleSave()`: Save annotations and image
- `handleSkip()`: Skip marking and use original image

---

### Canvas Component
**File**: `Canvas.tsx`
**Responsibility**: Render image, annotations, and handle drawing interactions

**Props**:
```typescript
interface ICanvasProps {
  imageUrl: string;
  annotations: IAnnotation[];
  selectedTool: ToolType;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  previewData?: IPreviewData;
  onAnnotationCreate: (annotation: IAnnotation) => void;
  onAnnotationUpdate: (id: string, annotation: IAnnotation) => void;
  onDrawingStart: () => void;
  onDrawingEnd: () => void;
  onPreviewUpdate: (preview: IPreviewData) => void;
}
```

**Responsibilities**:
- Render image with zoom and pan applied
- Render all annotations at correct positions and scales
- Handle mouse/touch events for drawing
- Display preview during drawing
- Coordinate synchronization during zoom/pan

**Key Functions**:
- `renderImage()`: Draw image on canvas
- `renderAnnotations()`: Draw all annotations
- `renderPreview()`: Draw preview during drawing
- `handleMouseDown()`: Start drawing
- `handleMouseMove()`: Update preview or pan
- `handleMouseUp()`: Finalize annotation
- `handleWheel()`: Zoom with mouse wheel
- `transformCoordinates()`: Convert canvas coords to image coords

---

### Toolbar Component
**File**: `Toolbar.tsx`
**Responsibility**: Display and manage tool selection

**Props**:
```typescript
interface IToolbarProps {
  selectedTool: ToolType;
  position: { x: number; y: number };
  onToolSelect: (tool: ToolType) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}
```

**Responsibilities**:
- Display all 7 tools in correct order
- Show tool icons and labels
- Handle tool selection
- Support dragging toolbar
- Remember position for session

**Tools in Order**:
1. Polygon
2. Dimension
3. Freehand
4. Arch
5. Concave Corner
6. Convex Corner
7. Pan (default)

---

### ZoomControls Component
**File**: `ZoomControls.tsx`
**Responsibility**: Display zoom in/out buttons and percentage

**Props**:
```typescript
interface IZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}
```

**Responsibilities**:
- Display zoom percentage
- Handle zoom in button (10% increment)
- Handle zoom out button (10% decrement)
- Disable buttons at boundaries (10%, 500%)

---

### ToolPanel Component
**File**: `ToolPanel.tsx`
**Responsibility**: Display tool-specific options (e.g., arch type selector)

**Props**:
```typescript
interface IToolPanelProps {
  selectedTool: ToolType;
  archType?: '180' | '90';
  onArchTypeSelect?: (type: '180' | '90') => void;
}
```

**Responsibilities**:
- Show arch type selector when Arch tool selected
- Hide when other tools selected
- Highlight selected arch type

---

### SaveSkipButtons Component
**File**: `SaveSkipButtons.tsx`
**Responsibility**: Display and handle Save/Skip actions

**Props**:
```typescript
interface ISaveSkipButtonsProps {
  onSave: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}
```

**Responsibilities**:
- Display Save and Skip buttons in top-right
- Handle Save click (merge annotations, rasterize, save JPEG)
- Handle Skip click (use original image)
- Show loading state during save

---

### UndoRedoButtons Component
**File**: `UndoRedoButtons.tsx`
**Responsibility**: Display and handle undo/redo actions

**Props**:
```typescript
interface IUndoRedoButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}
```

**Responsibilities**:
- Display Undo and Redo buttons
- Disable buttons when stacks empty
- Handle keyboard shortcuts (Ctrl+Z, Ctrl+Y)

---

## Logic Files

### dimension_mark_logic.ts
**Responsibility**: Page-level state management and orchestration

**Key Functions**:
```typescript
export function initializeDimensionMarkPage(imageUrl: string): IDimensionMarkPageState
export function handleToolSelection(state: IDimensionMarkPageState, tool: ToolType): IDimensionMarkPageState
export function handleZoomIn(state: IDimensionMarkPageState): IDimensionMarkPageState
export function handleZoomOut(state: IDimensionMarkPageState): IDimensionMarkPageState
export function handlePan(state: IDimensionMarkPageState, offset: { x: number; y: number }): IDimensionMarkPageState
export function handleUndo(state: IDimensionMarkPageState): IDimensionMarkPageState
export function handleRedo(state: IDimensionMarkPageState): IDimensionMarkPageState
export function canUndo(state: IDimensionMarkPageState): boolean
export function canRedo(state: IDimensionMarkPageState): boolean
```

---

### canvas_logic.ts
**Responsibility**: Canvas rendering and coordinate transformations

**Key Functions**:
```typescript
export function renderCanvasImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, zoom: number, pan: { x: number; y: number }): void
export function renderAnnotations(ctx: CanvasRenderingContext2D, annotations: IAnnotation[], zoom: number, pan: { x: number; y: number }): void
export function renderPreview(ctx: CanvasRenderingContext2D, preview: IPreviewData, zoom: number, pan: { x: number; y: number }): void
export function canvasToImageCoordinates(canvasX: number, canvasY: number, zoom: number, pan: { x: number; y: number }, imageWidth: number, imageHeight: number): { x: number; y: number }
export function imageToCanvasCoordinates(imageX: number, imageY: number, zoom: number, pan: { x: number; y: number }): { x: number; y: number }
export function getCanvasCenter(canvasWidth: number, canvasHeight: number): { x: number; y: number }
export function calculateZoomCenter(mouseX: number, mouseY: number, canvasWidth: number, canvasHeight: number): { x: number; y: number }
```

---

### tool_logic.ts
**Responsibility**: Tool-specific drawing logic

**Key Functions**:
```typescript
// Polygon Tool
export function startPolygonDrawing(startPoint: { x: number; y: number }): IPolygonDrawingState
export function addPolygonVertex(state: IPolygonDrawingState, point: { x: number; y: number }): IPolygonDrawingState
export function closePolygon(state: IPolygonDrawingState): IPolygon
export function calculatePolygonArea(vertices: { x: number; y: number }[]): number

// Dimension Tool
export function startDimensionDrawing(startPoint: { x: number; y: number }): IDimensionDrawingState
export function completeDimensionLine(state: IDimensionDrawingState, endPoint: { x: number; y: number }): IDimension

// Freehand Tool
export function startFreehandDrawing(startPoint: { x: number; y: number }): IFreehandDrawingState
export function addFreehandPoint(state: IFreehandDrawingState, point: { x: number; y: number }): IFreehandDrawingState
export function completeFreehandLine(state: IFreehandDrawingState): IFreehand

// Arch Tool
export function startArchDrawing(startPoint: { x: number; y: number }, archType: '180' | '90'): IArchDrawingState
export function completeArch(state: IArchDrawingState, endPoint: { x: number; y: number }): IArch
export function calculateArchCenter(p1: { x: number; y: number }, p2: { x: number; y: number }, archType: '180' | '90'): { x: number; y: number }
export function calculateArchRadius(p1: { x: number; y: number }, p2: { x: number; y: number }, archType: '180' | '90'): number

// Corner Tools
export function createConcaveCorner(point: { x: number; y: number }, imageWidth: number): IConcaveCorner
export function createConvexCorner(point: { x: number; y: number }, imageWidth: number): IConvexCorner
```

---

### annotation_logic.ts
**Responsibility**: Annotation CRUD operations

**Key Functions**:
```typescript
export function createAnnotation(type: AnnotationType, data: any): IAnnotation
export function updateAnnotation(annotation: IAnnotation, updates: Partial<IAnnotation>): IAnnotation
export function deleteAnnotation(annotations: IAnnotation[], id: string): IAnnotation[]
export function getAnnotationById(annotations: IAnnotation[], id: string): IAnnotation | undefined
export function moveAnnotation(annotation: IAnnotation, offset: { x: number; y: number }): IAnnotation
export function scaleAnnotation(annotation: IAnnotation, scaleFactor: number): IAnnotation
export function isPointInAnnotation(point: { x: number; y: number }, annotation: IAnnotation): boolean
export function getAnnotationsAtPoint(annotations: IAnnotation[], point: { x: number; y: number }): IAnnotation[]
```

---

### undo_redo_logic.ts
**Responsibility**: Undo/redo stack management

**Key Functions**:
```typescript
export function createUndoRedoState(): IUndoRedoState
export function pushToUndoStack(state: IUndoRedoState, snapshot: IDimensionMarkPageState): IUndoRedoState
export function undo(state: IUndoRedoState): { newState: IDimensionMarkPageState; undoRedoState: IUndoRedoState }
export function redo(state: IUndoRedoState): { newState: IDimensionMarkPageState; undoRedoState: IUndoRedoState }
export function clearRedoStack(state: IUndoRedoState): IUndoRedoState
export function canUndo(state: IUndoRedoState): boolean
export function canRedo(state: IUndoRedoState): boolean
```

---

### coordinate_logic.ts
**Responsibility**: Coordinate system transformations and synchronization

**Key Functions**:
```typescript
export function transformCoordinatesToImage(canvasCoords: { x: number; y: number }, zoom: number, pan: { x: number; y: number }, imageWidth: number, imageHeight: number): { x: number; y: number }
export function transformCoordinatesToCanvas(imageCoords: { x: number; y: number }, zoom: number, pan: { x: number; y: number }): { x: number; y: number }
export function scaleAnnotationForZoom(annotation: IAnnotation, oldZoom: number, newZoom: number): IAnnotation
export function syncAnnotationsAfterZoom(annotations: IAnnotation[], oldZoom: number, newZoom: number): IAnnotation[]
export function syncAnnotationsAfterPan(annotations: IAnnotation[], panOffset: { x: number; y: number }): IAnnotation[]
export function getImageBounds(imageWidth: number, imageHeight: number, zoom: number, pan: { x: number; y: number }): { minX: number; maxX: number; minY: number; maxY: number }
export function clampCoordinatesToImage(point: { x: number; y: number }, imageWidth: number, imageHeight: number): { x: number; y: number }
```

---

## Styling Strategy

### dimension_mark_page.module.css
**Responsibility**: Page-level layout and spacing

**Key Classes**:
- `.pageContainer`: Main page wrapper
- `.canvasArea`: Canvas container
- `.controlsArea`: Top controls (zoom, undo/redo)
- `.buttonsArea`: Save/Skip buttons area
- `.toolbarArea`: Toolbar container

---

### canvas.module.css
**Responsibility**: Canvas-specific styling

**Key Classes**:
- `.canvas`: Canvas element styling
- `.canvasWrapper`: Canvas container with border/shadow
- `.imageContainer`: Image rendering area

---

### toolbar.module.css
**Responsibility**: Toolbar and tool button styling

**Key Classes**:
- `.toolbar`: Toolbar container (floating, draggable)
- `.toolbarHeader`: Draggable header
- `.toolButton`: Individual tool button
- `.toolButtonActive`: Active tool button state
- `.toolIcon`: Tool icon styling
- `.toolLabel`: Tool label text

---

## Data Structures (interface.ts)

### Annotation Types
```typescript
type AnnotationType = 'polygon' | 'dimension' | 'freehand' | 'arch' | 'concave' | 'convex'
type ToolType = 'polygon' | 'dimension' | 'freehand' | 'arch' | 'concave' | 'convex' | 'pan'

interface IAnnotation {
  id: string;
  type: AnnotationType;
  data: IPolygon | IDimension | IFreehand | IArch | IConcaveCorner | IConvexCorner;
  createdAt: number;
  updatedAt: number;
}

interface IPolygon {
  vertices: { x: number; y: number }[];
  area: number;
  color: '#FF0000';
  fillColor: 'rgba(255, 0, 0, 0.2)';
}

interface IDimension {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  color: '#000000';
  arrowHeadSize: number;
}

interface IFreehand {
  points: { x: number; y: number }[];
  color: '#000000';
  strokeWidth: number;
}

interface IArch {
  type: '180' | '90';
  circumferencePoints: [{ x: number; y: number }, { x: number; y: number }];
  centerPoint: { x: number; y: number };
  radius: number;
  color: '#000000';
}

interface IConcaveCorner {
  point: { x: number; y: number };
  size: number; // 3% of image width
  color: '#0000FF';
  strokeColor: '#000000';
}

interface IConvexCorner {
  point: { x: number; y: number };
  size: number; // 3% of image width
  color: '#0000FF';
  strokeColor: '#000000';
}

interface IDimensionMarkPageState {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  annotations: IAnnotation[];
  selectedTool: ToolType;
  zoomLevel: number; // 10-500
  panOffset: { x: number; y: number };
  toolbarPosition: { x: number; y: number };
  archType: '180' | '90';
  isDrawing: boolean;
  previewData?: IPreviewData;
  undoRedoState: IUndoRedoState;
}

interface IPreviewData {
  type: AnnotationType;
  data: any; // Tool-specific preview data
}

interface IUndoRedoState {
  undoStack: IDimensionMarkPageState[];
  redoStack: IDimensionMarkPageState[];
}
```

---

## API Layer (dimension_mark_page.api.ts)

**Responsibility**: Backend API calls for Save and Skip actions

**Key Functions**:
```typescript
export async function saveDimensionsApi(
  imageUrl: string,
  annotations: IAnnotation[],
  mergedImageBlob: Blob
): Promise<ISaveDimensionsResponse>

export async function skipDimensionsApi(
  imageUrl: string
): Promise<ISkipDimensionsResponse>

export async function mergeAnnotationsWithImage(
  imageUrl: string,
  annotations: IAnnotation[],
  canvasWidth: number,
  canvasHeight: number
): Promise<Blob>
```

---

## Error Handling (errors.ts)

**Error Classes**:
```typescript
export class DimensionMarkError extends Error
export class CanvasRenderError extends DimensionMarkError
export class AnnotationError extends DimensionMarkError
export class CoordinateTransformError extends DimensionMarkError
export class SaveError extends DimensionMarkError
```

---

## Key Design Decisions

### 1. Flat Component Structure
- All components at same level in `dimension-mark-page/`
- No nested component folders
- Easier to navigate and maintain
- Follows DDD page-service pattern

### 2. Separation of Logic
- Page logic in `dimension_mark_logic.ts`
- Canvas rendering in `canvas_logic.ts`
- Tool-specific logic in `tool_logic.ts`
- Annotation operations in `annotation_logic.ts`
- Undo/redo in `undo_redo_logic.ts`
- Coordinate transformations in `coordinate_logic.ts`

### 3. In-Memory State Management
- All annotations stored in React state
- No backend persistence during marking
- Undo/redo stacks for state history
- Save/Skip trigger backend API calls

### 4. Coordinate System
- Annotations stored with image-relative coordinates
- Canvas coordinates transformed to image coordinates
- Zoom and pan don't affect stored coordinates
- Rendering applies zoom/pan transformations

### 5. Tool-Specific Panels
- Arch type selector shown only when Arch tool active
- Other tools don't show additional panels
- Keeps UI clean and focused

---

## Implementation Order

1. **Phase 1**: Core infrastructure
   - DimensionMarkPage component
   - Canvas component with basic rendering
   - dimension_mark_logic.ts

2. **Phase 2**: Drawing tools
   - Toolbar component
   - Pan tool
   - Polygon tool with tool_logic.ts

3. **Phase 3**: More tools
   - Dimension tool
   - Freehand tool
   - Arch tool with ToolPanel

4. **Phase 4**: Corner tools
   - Concave corner tool
   - Convex corner tool

5. **Phase 5**: Controls and actions
   - ZoomControls component
   - UndoRedoButtons component
   - SaveSkipButtons component

6. **Phase 6**: Coordinate synchronization
   - coordinate_logic.ts
   - Zoom/pan synchronization
   - Annotation scaling

7. **Phase 7**: Polish and optimization
   - Styling refinement
   - Performance optimization
   - Error handling

---

## Notes

- All code follows DDD rules from global-setup
- No middleware, utils, or helpers folders
- All errors in application/errors.ts
- All styling in component-specific .module.css files
- No external UI libraries (vanilla Canvas API)
- Frontend-only implementation (no backend during marking)
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo)
- Touch support for stylus/pencil drawing
