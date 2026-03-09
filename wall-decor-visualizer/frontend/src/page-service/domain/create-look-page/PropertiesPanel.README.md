# PropertiesPanel Component

## Overview

The PropertiesPanel component displays and allows editing of properties for a selected applied model in the Create Look feature. It provides pen/tablet-optimized controls for position, rotation, and scale manipulation, along with action buttons for model management.

## Features

- **Model Information Display**: Shows thumbnail, name, and dimensions of the selected catalog item
- **Position Controls**: X, Y, Z numeric inputs with real-time updates
- **Rotation Controls**: X, Y, Z angle inputs in degrees
- **Scale Controls**: X, Y, Z scale multipliers with 0.1-10.0 constraints
- **Quantity Display**: Shows calculated or manual quantity with badge indicator
- **Action Buttons**: Duplicate, Reset Transform, and Delete operations
- **Accessibility**: ARIA labels, 44x44px touch targets, keyboard navigation support
- **Real-time Updates**: Reflects changes from TransformControls manipulation

## Usage

```tsx
import { PropertiesPanel } from './PropertiesPanel';

<PropertiesPanel
  selectedModel={selectedAppliedModel}
  catalogItem={catalogItemForSelectedModel}
  onPropertyChange={(modelId, property, value) => {
    // Handle property change (position, rotation, or scale)
    updateAppliedModel(modelId, { [property]: value });
  }}
  onDelete={(modelId) => {
    // Remove model from scene and list
    removeAppliedModel(modelId);
  }}
  onDuplicate={(modelId) => {
    // Create copy of model at same location
    duplicateAppliedModel(modelId);
  }}
  onResetTransform={(modelId) => {
    // Restore original transform
    resetModelTransform(modelId);
  }}
/>
```

## Props

### `selectedModel: IAppliedModel | null`
The currently selected applied model instance. If null, displays empty state.

### `catalogItem: ICatalogItem | null`
The catalog item corresponding to the selected model. Used to display name, thumbnail, and dimensions.

### `onPropertyChange: (modelId: string, property: string, value: any) => void`
Callback fired when a property is changed via numeric inputs. Property can be 'position', 'rotation', or 'scale'.

### `onDelete: (modelId: string) => void`
Callback fired when the delete button is clicked (after confirmation).

### `onDuplicate: (modelId: string) => void`
Callback fired when the duplicate button is clicked.

### `onResetTransform: (modelId: string) => void`
Callback fired when the reset transform button is clicked (after confirmation).

## Behavior

### Input Handling
- Changes are applied on blur or Enter key press
- Invalid numeric values are ignored
- Scale values are automatically constrained to 0.1-10.0 range

### Confirmations
- Delete action requires confirmation dialog
- Reset transform requires confirmation dialog
- Duplicate action executes immediately

### Real-time Updates
- Input values update when selectedModel prop changes
- Supports external updates from TransformControls manipulation
- Maintains local state for controlled inputs

## Accessibility

- All inputs have descriptive ARIA labels
- All buttons have ARIA labels and titles
- Minimum 44x44px touch targets for pen/tablet input
- Keyboard navigation support (Tab, Enter, Escape)
- Focus indicators for all interactive elements
- High contrast mode support

## Styling

The component uses CSS modules (`properties_panel.module.css`) with:
- Responsive layout (320px width, scrollable)
- Pen/tablet-optimized touch targets (44x44px minimum)
- Clear visual hierarchy with sections
- Accessible color contrast (WCAG AA compliant)
- Focus indicators and hover states

## Testing

Comprehensive unit tests cover:
- Empty state display
- Model information display
- Position/rotation/scale input handling
- Action button functionality
- Accessibility features
- Real-time updates

Run tests:
```bash
npm test -- properties_panel.test.tsx
```

## Requirements Satisfied

- **10.1**: Display selected model name and thumbnail
- **10.2**: Show position (X, Y, Z) with numeric inputs
- **10.3**: Show rotation (X, Y, Z) with numeric inputs
- **10.4**: Show scale (X, Y, Z) with numeric inputs
- **10.5**: Display calculated quantity
- **10.6**: Update model in real-time on property change
- **10.7**: Recalculate quantity on scale change (handled by parent)
- **10.8**: Provide delete, duplicate, and reset buttons
- **11.3**: Duplicate model action
- **11.4**: Delete model action
- **11.5**: Reset transform action
- **14.1**: 44x44px minimum touch targets for pen/tablet

## Future Enhancements

- Manual quantity override input
- Lock position toggle
- Copy/paste transform values
- Undo/redo for property changes
- Batch edit multiple models
- Custom property presets
