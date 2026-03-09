# Create Look Page - Drag-and-Drop Implementation

## Overview

This implementation provides a complete drag-and-drop workflow for the Create Look feature with pen/tablet optimization. The system includes:

1. **DragGhostImage Component** - Visual feedback during drag with valid/invalid indicators
2. **DragHandler** - Pen-optimized drag logic with 500ms hold, haptic feedback, and raycasting
3. **Model Placement** - Automatic positioning, orientation calculation, and grid snapping
4. **Invalid Drop Handling** - Animated return to catalog with error feedback
5. **6-inch Grid Overlay** - Visual grid aligned to 6-inch (0.1524m) spacing
6. **Raycaster Drop Zone Detection** - Real-time detection of valid drop zones
7. **Applied Model Rendering** - Rendering of placed catalog items with transforms

## Components

### DragGhostImage.tsx

Semi-transparent preview component that follows the pen during drag:

- **Visual Feedback**: Shows catalog item thumbnail and info
- **Valid/Invalid Indicators**: Green checkmark for valid, red X for invalid
- **Pressure Sensitivity**: Scales based on pen pressure (0.8x to 1.2x)
- **Smooth Positioning**: CSS transforms for 60fps movement
- **Accessibility**: High contrast borders and clear icons

### drag_handler.ts

Core drag-and-drop logic optimized for pen/tablet input:

- **Hold Detection**: 500ms tap-and-hold to initiate drag
- **Raycasting**: Real-time drop zone detection on base model
- **Haptic Feedback**: 
  - 50ms on drag start
  - 20ms when entering valid zone
  - [50, 50, 50]ms on successful drop
  - [100, 50, 100]ms on error
- **Pressure Tracking**: Captures pen pressure for placement metadata
- **Event Management**: Handles pointerdown, pointermove, pointerup, pointercancel

### model_placement.ts

Model placement and scene management utilities:

- **Orientation Calculation**: Calculates rotation from surface normal to orient models perpendicular to wall
- **Grid Snapping**: Snaps position to 6-inch grid intersections
- **Instance Creation**: Generates unique IDs and creates IAppliedModel instances
- **GLTF Loading**: Loads catalog models and adds to Three.js scene
- **Placement Animation**: Smooth scale-in effect (300ms ease-out cubic)
- **Validation**: Ensures drop position is on base model surface

### ghost_animation.ts

Animation utilities for ghost image:

- **Return Animation**: Animates ghost back to catalog on invalid drop (400ms ease-in-out)
- **Scale Animation**: Updates ghost scale based on pen pressure
- **Pulse Effect**: Optional pulse animation for valid drop zones

### grid_utils.ts

Utility functions for grid operations:

- `snapToGridIntersection()` - Snap 3D position to nearest grid point
- `snapToAngle()` - Snap rotation angle to increments (default 15°)
- `calculateGridSize()` - Calculate grid dimensions based on model size
- `constrainScale()` - Constrain scale values to valid range (0.1x - 10.0x)

## Features Implemented

### Task 5.1: DragGhostImage Component ✅

- ✅ Semi-transparent preview with catalog item info
- ✅ Follows pen position during drag
- ✅ Valid/invalid drop zone indicator (green/red)
- ✅ Pressure-based scaling (0.8x to 1.2x)
- ✅ Smooth CSS animations

### Task 5.2: Drag Handler with Pen Optimization ✅

- ✅ Pen tap and hold (500ms) to initiate drag
- ✅ Creates ghost image on drag start
- ✅ Updates ghost position during pen move
- ✅ Detects drop zone with raycasting
- ✅ Provides haptic feedback throughout
- ✅ Tracks pen pressure for metadata

### Task 5.3: Model Drop and Placement ✅

- ✅ Validates drop zone on pen lift
- ✅ Snaps position to grid if enabled
- ✅ Calculates orientation from surface normal
- ✅ Creates applied model instance with unique ID
- ✅ Loads and adds model to scene
- ✅ Animates placement with scale-in effect

### Task 5.4: Invalid Drop Handling ✅

- ✅ Animates ghost image back to catalog
- ✅ Provides error haptic feedback ([100, 50, 100]ms)
- ✅ Does not add model to scene
- ✅ Smooth return animation (400ms)

## Usage Example

```typescript
import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import {
  DragGhostImage,
  DragHandler,
  createAppliedModelInstance,
  loadAndAddModelToScene,
  animateModelPlacement
} from './create-look-page';

function CreateLookPage() {
  const [appliedModels, setAppliedModels] = useState<IAppliedModel[]>([]);
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedItem: null,
    ghostPosition: { x: 0, y: 0 },
    isValidDropZone: false,
    pressure: 1.0
  });

  const sceneRef = useRef<THREE.Scene>(null);
  const cameraRef = useRef<THREE.Camera>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const baseModelRef = useRef<THREE.Object3D>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragHandlerRef = useRef<DragHandler | null>(null);

  // Initialize drag handler
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !baseModelRef.current || !canvasRef.current) {
      return;
    }

    const dragHandler = new DragHandler(
      raycasterRef.current,
      cameraRef.current,
      baseModelRef.current,
      canvasRef.current,
      {
        onDragStart: (item, position) => {
          setDragState({
            isDragging: true,
            draggedItem: item,
            ghostPosition: position,
            isValidDropZone: false,
            pressure: 1.0
          });
        },
        onDragMove: (position, isValid, pressure) => {
          setDragState(prev => ({
            ...prev,
            ghostPosition: position,
            isValidDropZone: isValid,
            pressure
          }));
        },
        onDragEnd: async (item, dropPosition, dropNormal) => {
          // Create applied model instance
          const appliedModel = createAppliedModelInstance(
            item,
            dropPosition,
            dropNormal,
            snapToGrid,
            dragState.pressure
          );

          // Load and add model to scene
          const modelObject = await loadAndAddModelToScene(
            item,
            appliedModel,
            sceneRef.current!
          );

          // Animate placement
          animateModelPlacement(modelObject, dropPosition);

          // Add to state
          setAppliedModels(prev => [...prev, appliedModel]);

          // Reset drag state
          setDragState({
            isDragging: false,
            draggedItem: null,
            ghostPosition: { x: 0, y: 0 },
            isValidDropZone: false,
            pressure: 1.0
          });
        },
        onDragCancel: (item, returnPosition) => {
          // Animate ghost return (handled by DragGhostImage)
          setDragState({
            isDragging: false,
            draggedItem: null,
            ghostPosition: { x: 0, y: 0 },
            isValidDropZone: false,
            pressure: 1.0
          });
        }
      }
    );

    dragHandlerRef.current = dragHandler;

    return () => {
      dragHandler.dispose();
    };
  }, [snapToGrid]);

  // Handle catalog item pointer down
  const handleCatalogItemPointerDown = (event: PointerEvent, item: ICatalogItem) => {
    if (dragHandlerRef.current) {
      dragHandlerRef.current.handlePointerDown(event, item);
    }
  };

  return (
    <div>
      <CatalogSidebar
        catalogItems={catalogItems}
        onDragStart={handleCatalogItemPointerDown}
      />
      
      <ModelViewer
        baseModelUrl="/models/wall-model.glb"
        appliedModels={appliedModels}
        selectedModelId={selectedModelId}
        showGrid={showGrid}
        snapToGrid={snapToGrid}
        viewMode="perspective"
        onLoadProgress={(progress, stage) => console.log(progress, stage)}
        onLoadComplete={(metadata) => console.log('Loaded', metadata)}
        onLoadError={(error) => console.error(error)}
        onModelDrop={handleModelDrop}
        onModelSelect={setSelectedModelId}
        onModelTransform={handleModelTransform}
      />

      <DragGhostImage
        item={dragState.draggedItem}
        position={dragState.ghostPosition}
        isDragging={dragState.isDragging}
        isValidDropZone={dragState.isValidDropZone}
        pressure={dragState.pressure}
      />
    </div>
  );
}
```

## Haptic Feedback Patterns

The drag-and-drop system provides rich haptic feedback for pen/tablet users:

| Event | Pattern | Duration | Purpose |
|-------|---------|----------|---------|
| Drag Start | Single | 50ms | Confirms drag initiated |
| Enter Valid Zone | Single | 20ms | Indicates valid drop zone |
| Successful Drop | Triple | [50, 50, 50]ms | Confirms placement |
| Invalid Drop | Double | [100, 50, 100]ms | Indicates error |

## Animation Timings

| Animation | Duration | Easing | Purpose |
|-----------|----------|--------|---------|
| Ghost Return | 400ms | Ease-in-out cubic | Smooth return to catalog |
| Model Placement | 300ms | Ease-out cubic | Scale-in effect |
| Ghost Scale | 100ms | Ease-out | Pressure response |

## Technical Details

### Orientation Calculation

Models are automatically oriented perpendicular to the surface using the drop point's normal vector:

```typescript
// Calculate quaternion from up vector to surface normal
const up = new THREE.Vector3(0, 1, 0);
const quaternion = new THREE.Quaternion();
quaternion.setFromUnitVectors(up, normal.normalize());

// Convert to Euler angles (degrees)
const euler = new THREE.Euler();
euler.setFromQuaternion(quaternion, 'XYZ');
```

### Grid Snapping

Position snapping rounds each coordinate to the nearest grid multiple:

```typescript
const snappedX = Math.round(position.x / gridSpacing) * gridSpacing;
const snappedY = Math.round(position.y / gridSpacing) * gridSpacing;
const snappedZ = Math.round(position.z / gridSpacing) * gridSpacing;
```

### Unique ID Generation

Applied models receive unique IDs combining timestamp and random string:

```typescript
const id = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

## File Structure

```
create-look-page/
├── DragGhostImage.tsx           # Ghost image component
├── drag_ghost_image.module.css  # Ghost image styles
├── drag_handler.ts              # Drag-and-drop logic
├── model_placement.ts           # Model placement utilities
├── ghost_animation.ts           # Animation utilities
├── ModelViewer.tsx              # Main 3D viewer component
├── model_viewer.module.css      # Viewer styles
├── grid_utils.ts                # Grid utility functions
├── interface.ts                 # TypeScript interfaces
├── CatalogSidebar.tsx           # Catalog browsing
├── CatalogItemCard.tsx          # Catalog item card
├── index.ts                     # Exports
└── README.md                    # This file
```

## Next Steps

To complete the Create Look feature, the following tasks remain:

1. **Task 6**: Implement TransformControls for model manipulation
   - Position manipulation with pressure sensitivity
   - Rotation manipulation with angle snapping
   - Scale manipulation with constraints
   - Haptic feedback for manipulation

2. **Task 7**: Implement quantity calculation system
   - Panel-type calculation (area-based)
   - Linear-type calculation (length-based)
   - Point-type calculation (spacing-based)

3. **Task 8**: Build PropertiesPanel component
   - Display and edit model properties
   - Manual quantity override
   - Delete, duplicate, reset actions

## Dependencies

- three: ^0.160.0
- @types/three: ^0.160.0
- React: ^18.2.0

## Constants

```typescript
export const GRID_SPACING = 0.1524;        // 6 inches in meters
export const HOLD_DURATION = 500;          // 500ms hold to initiate drag
export const HAPTIC_DRAG_START = 50;       // 50ms vibration on drag start
export const HAPTIC_ENTER_ZONE = 20;       // 20ms vibration entering valid zone
export const HAPTIC_SUCCESS = [50, 50, 50]; // Triple vibration on success
export const HAPTIC_ERROR = [100, 50, 100]; // Error pattern
export const PLACEMENT_ANIMATION_DURATION = 300; // 300ms scale-in
export const GHOST_RETURN_DURATION = 400;  // 400ms return animation
```
