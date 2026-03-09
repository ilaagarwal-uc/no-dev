# ContextMenu Component

## Overview

The ContextMenu component provides a pen/tablet-optimized context menu for applied models in the Create Look feature. It displays on pen long-press (1 second) and offers quick actions: Duplicate, Delete, Reset Transform, and Lock Position.

## Features

- **Pen/Tablet Optimized**: 44x44px minimum touch targets
- **Long-Press Activation**: 1 second pen/touch hold to open
- **Accessibility**: ARIA labels, keyboard navigation, high contrast support
- **Smart Positioning**: Automatically adjusts to stay within viewport
- **Lock Position**: Prevents accidental movement of models

## Usage

### Basic Integration

```typescript
import { ContextMenu } from './ContextMenu';
import { useContextMenu } from './use_context_menu';
import {
  duplicateModel,
  resetModelTransform,
  toggleLockPosition,
} from './context_menu_actions';

function CreateLookPage() {
  const [appliedModels, setAppliedModels] = useState<IAppliedModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  
  const {
    contextMenuState,
    showContextMenu,
    hideContextMenu,
    handleLongPress,
    cleanupLongPress,
  } = useContextMenu();

  // Store original transforms for reset functionality
  const originalTransformsRef = useRef<Map<string, IOriginalTransform>>(new Map());

  // Handle model long-press in ModelViewer
  const handleModelLongPress = (modelId: string, event: PointerEvent) => {
    handleLongPress(modelId, event);
  };

  // Context menu actions
  const handleDuplicate = () => {
    const targetModel = appliedModels.find(
      (m) => m.id === contextMenuState.targetModelId
    );
    if (!targetModel) return;

    const duplicated = duplicateModel(targetModel, () => generateUUID());
    setAppliedModels([...appliedModels, duplicated]);
    
    // Store original transform for the duplicate
    originalTransformsRef.current.set(
      duplicated.id,
      createOriginalTransform(duplicated)
    );
  };

  const handleDelete = () => {
    if (!contextMenuState.targetModelId) return;
    
    setAppliedModels(
      appliedModels.filter((m) => m.id !== contextMenuState.targetModelId)
    );
    
    // Remove from original transforms
    originalTransformsRef.current.delete(contextMenuState.targetModelId);
    
    // Deselect if deleted model was selected
    if (selectedModelId === contextMenuState.targetModelId) {
      setSelectedModelId(null);
    }
  };

  const handleResetTransform = () => {
    const targetModel = appliedModels.find(
      (m) => m.id === contextMenuState.targetModelId
    );
    if (!targetModel) return;

    // Get original position from stored transforms
    const originalTransform = originalTransformsRef.current.get(targetModel.id);
    const originalPosition = originalTransform?.position;

    const resetModel = resetModelTransform(targetModel, originalPosition);
    
    setAppliedModels(
      appliedModels.map((m) => (m.id === resetModel.id ? resetModel : m))
    );
  };

  const handleLockPosition = () => {
    const targetModel = appliedModels.find(
      (m) => m.id === contextMenuState.targetModelId
    );
    if (!targetModel) return;

    const toggledModel = toggleLockPosition(targetModel);
    
    setAppliedModels(
      appliedModels.map((m) => (m.id === toggledModel.id ? toggledModel : m))
    );
  };

  const selectedModel = appliedModels.find((m) => m.id === contextMenuState.targetModelId);

  return (
    <div>
      <ModelViewer
        onModelLongPress={handleModelLongPress}
        onPointerUp={cleanupLongPress}
        onPointerMove={cleanupLongPress}
        // ... other props
      />

      <ContextMenu
        position={contextMenuState.position}
        isVisible={contextMenuState.isVisible}
        isLocked={selectedModel?.isLocked || false}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onResetTransform={handleResetTransform}
        onLockPosition={handleLockPosition}
        onClose={hideContextMenu}
      />
    </div>
  );
}
```

### ModelViewer Integration

In your ModelViewer component, add long-press detection:

```typescript
// In ModelViewer.tsx
const handlePointerDown = (event: PointerEvent) => {
  const intersects = raycaster.intersectObjects(appliedModelMeshes, true);
  
  if (intersects.length > 0) {
    const modelId = getModelIdFromMesh(intersects[0].object);
    
    // Trigger long-press detection
    if (onModelLongPress) {
      onModelLongPress(modelId, event);
    }
  }
};

const handlePointerUp = (event: PointerEvent) => {
  // Clean up long-press timer
  if (onPointerUp) {
    onPointerUp(event);
  }
};

const handlePointerMove = (event: PointerEvent) => {
  // Cancel long-press if pointer moves
  if (onPointerMove) {
    onPointerMove(event);
  }
};
```

### Respecting Lock State in TransformControls

When a model is locked, prevent position changes:

```typescript
import { canTransformModel, applyTransform } from './context_menu_actions';

const handleTransformChange = (modelId: string, transform: ITransform) => {
  const model = appliedModels.find((m) => m.id === modelId);
  if (!model) return;

  // Check if model can be transformed
  if (!canTransformModel(model)) {
    console.warn('Model is locked, cannot transform');
    return;
  }

  // Apply transform
  const transformedModel = applyTransform(model, transform);
  
  setAppliedModels(
    appliedModels.map((m) => (m.id === transformedModel.id ? transformedModel : m))
  );
};
```

## Props

### ContextMenu Props

| Prop | Type | Description |
|------|------|-------------|
| `position` | `{ x: number; y: number }` | Menu position in viewport coordinates |
| `isVisible` | `boolean` | Whether menu is visible |
| `isLocked` | `boolean` | Whether target model is locked |
| `onDuplicate` | `() => void` | Called when Duplicate is clicked |
| `onDelete` | `() => void` | Called when Delete is clicked |
| `onResetTransform` | `() => void` | Called when Reset Transform is clicked |
| `onLockPosition` | `() => void` | Called when Lock Position is clicked |
| `onClose` | `() => void` | Called when menu should close |

## Actions

### Duplicate

Creates a copy of the model at the same location (with slight offset for visibility).

**Requirements**: 11.3

### Delete

Removes the model from the scene and applied models list.

**Requirements**: 11.4

### Reset Transform

Restores the model to its original position, rotation (0,0,0), and scale (1,1,1).

**Requirements**: 11.5

### Lock Position

Prevents accidental movement of the model. Locked models cannot have their position changed via TransformControls or drag operations.

**Requirements**: 11.6

## Accessibility

- **Touch Targets**: All menu items are 44x44px minimum
- **ARIA Labels**: All buttons have descriptive aria-labels
- **Keyboard Navigation**: Escape key closes menu
- **Focus Indicators**: 3px solid blue outline with 2px offset
- **High Contrast**: Supports high contrast mode with thicker borders
- **Screen Readers**: Proper role="menu" and role="menuitem" attributes

## Styling

The component uses CSS modules with support for:
- Dark mode (`prefers-color-scheme: dark`)
- High contrast mode (`prefers-contrast: high`)
- Reduced motion (`prefers-reduced-motion: reduce`)
- Touch devices (`pointer: coarse`)

## Testing

See `context_menu.test.tsx` for unit tests covering:
- Long-press detection (1 second)
- Menu positioning within viewport
- Action handlers
- Lock state toggle
- Accessibility features

## Requirements Mapping

- **Requirement 11.1**: Display on pen long-press (1 second)
- **Requirement 11.2**: Show Duplicate, Delete, Reset, Lock options
- **Requirement 11.3**: Duplicate creates copy at same location
- **Requirement 11.4**: Delete removes from scene and list
- **Requirement 11.5**: Reset restores original transform
- **Requirement 11.6**: Lock prevents accidental movement
- **Requirement 11.7**: 44x44px minimum touch targets
- **Requirement 14.1**: Accessibility compliance
