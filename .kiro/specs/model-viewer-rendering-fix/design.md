# Model Viewer Rendering Fix - Bugfix Design

## Overview

The ModelViewer component in the model generation page currently displays only a placeholder message instead of rendering the generated 3D model. This bugfix implements Three.js rendering to display GLB models with interactive controls (zoom, pan, rotate) and view modes (perspective, orthographic, wireframe). The fix involves initializing a Three.js scene with proper camera, lighting, and controls, loading the GLB model using GLTFLoader, and connecting the existing UI controls to actual Three.js operations.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a valid modelUrl is provided to the ModelViewer component
- **Property (P)**: The desired behavior - the 3D model should be loaded and rendered in an interactive Three.js canvas
- **Preservation**: Existing UI components (ViewModeSelector, ViewerControls, ModelInfoPanel) and their display must remain unchanged
- **ModelViewer**: The component in `wall-decor-visualizer/frontend/src/page-service/domain/model-generation-page/ModelViewer.tsx` that should render 3D models
- **GLTFLoader**: Three.js loader for loading GLB/GLTF 3D model files
- **OrbitControls**: Three.js controls that enable camera rotation, panning, and zooming via mouse/touch
- **ViewMode**: The rendering mode (perspective, orthographic, wireframe) selected by the user

## Bug Details

### Fault Condition

The bug manifests when a valid modelUrl is provided to the ModelViewer component after successful model generation. The component renders placeholder text instead of initializing Three.js, loading the GLB model, and creating an interactive 3D canvas.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { modelUrl: string }
  OUTPUT: boolean
  
  RETURN input.modelUrl IS NOT NULL
         AND input.modelUrl IS NOT EMPTY
         AND componentRendersPlaceholder()
         AND NOT threeJsInitialized()
END FUNCTION
```

### Examples

- User generates a 3D model successfully → Backend returns modelUrl: "https://storage.googleapis.com/models/abc123.glb" → ModelViewer displays "Note: Three.js integration will be completed in the next phase" instead of rendering the model
- User clicks "Zoom In" button → Console logs "Zoom in" but no visual change occurs (expected: camera moves closer to model)
- User selects "Wireframe" view mode → State updates but rendering doesn't change (expected: model displays in wireframe mode)
- User clicks "Reset View" → Console logs "Reset view" but nothing happens (expected: camera returns to initial position)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- ViewModeSelector component must continue to display three buttons (Perspective, Orthographic, Wireframe) with active state styling
- ViewerControls component must continue to display four buttons (Zoom In, Zoom Out, Reset, Fullscreen) with proper icons
- ModelInfoPanel must continue to display vertex count, face count, and file size
- Component must continue to accept modelUrl as a prop
- Parent component (ModelGenerationPage) must continue to pass modelUrl and display "Create Look" button below the viewer

**Scope:**
All inputs and behaviors that do NOT involve the actual 3D rendering canvas should be completely unaffected by this fix. This includes:
- Component prop interface (IModelViewerProps)
- UI component layout and styling
- State management for viewMode
- Button click handlers (they will be enhanced, not replaced)

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is clear:

1. **Missing Three.js Initialization**: The component does not create a Three.js scene, camera, renderer, or lighting setup

2. **Missing GLB Loading Logic**: The component does not use GLTFLoader to load the model from the provided modelUrl

3. **Placeholder Implementation**: The component intentionally renders a placeholder div with text instead of a canvas element

4. **Stub Event Handlers**: All control handlers (zoom, reset, fullscreen) only log to console without performing actual Three.js operations

## Correctness Properties

Property 1: Fault Condition - Three.js Rendering

_For any_ input where a valid modelUrl is provided (isBugCondition returns true), the fixed ModelViewer component SHALL initialize Three.js with scene, camera, renderer, and lighting, load the GLB model using GLTFLoader, render it in an interactive canvas, and enable OrbitControls for user interaction.

**Validates: Requirements 2.1, 2.11**

Property 2: Preservation - UI Components Display

_For any_ input where a modelUrl is provided, the fixed component SHALL continue to display ViewModeSelector, ViewerControls, and ModelInfoPanel components exactly as before, preserving their layout, styling, and prop interfaces.

**Validates: Requirements 3.1, 3.2, 3.3**

## Fix Implementation

### Changes Required

**File**: `wall-decor-visualizer/frontend/src/page-service/domain/model-generation-page/ModelViewer.tsx`

**Function**: `ModelViewer` component

**Specific Changes**:

1. **Add Three.js Initialization**:
   - Create refs for scene, camera, renderer, controls, and animation frame
   - Initialize Three.js scene with background color
   - Create PerspectiveCamera with appropriate FOV and position
   - Create WebGLRenderer with antialiasing and attach to DOM
   - Add ambient and directional lighting
   - Create OrbitControls for mouse interaction
   - Start animation loop with requestAnimationFrame

2. **Add GLB Model Loading**:
   - Use GLTFLoader to load model from modelUrl
   - Handle loading progress (optional)
   - Calculate model bounding box and center the model
   - Extract model metadata (vertex count, face count)
   - Update modelInfo state with actual values from loaded model
   - Handle loading errors and display error message

3. **Implement View Mode Switching**:
   - For 'perspective': Use PerspectiveCamera (default)
   - For 'orthographic': Switch to OrthographicCamera with proper frustum
   - For 'wireframe': Traverse scene and set material.wireframe = true on all meshes

4. **Implement Viewer Controls**:
   - **Zoom In**: Animate camera position closer to target (reduce distance by 20%)
   - **Zoom Out**: Animate camera position farther from target (increase distance by 20%)
   - **Reset View**: Restore camera to initial position and rotation
   - **Fullscreen**: Use Fullscreen API to toggle fullscreen mode on canvas container

5. **Add Cleanup Logic**:
   - Cancel animation frame on unmount
   - Dispose Three.js resources (geometries, materials, textures)
   - Remove renderer from DOM
   - Remove event listeners

6. **Replace Placeholder Rendering**:
   - Remove placeholder div with text
   - Render canvas container div that Three.js will attach to
   - Show loading state while model is loading
   - Show error state if model fails to load

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that the placeholder is displayed instead of a 3D model.

**Test Plan**: Write tests that render the ModelViewer component with a valid modelUrl and assert that the placeholder text is visible. Run these tests on the UNFIXED code to observe failures and confirm the root cause.

**Test Cases**:
1. **Placeholder Display Test**: Render ModelViewer with modelUrl → Assert placeholder text is visible (will pass on unfixed code, should fail on fixed code)
2. **No Canvas Test**: Render ModelViewer with modelUrl → Assert no canvas element exists (will pass on unfixed code, should fail on fixed code)
3. **Console Log Test**: Click zoom in button → Assert console.log was called with "Zoom in" (will pass on unfixed code, should fail on fixed code)
4. **No Three.js Test**: Render ModelViewer → Assert Three.js scene is not initialized (will pass on unfixed code, should fail on fixed code)

**Expected Counterexamples**:
- Placeholder div with text "Note: Three.js integration will be completed in the next phase" is rendered
- No canvas element is created in the DOM
- Control buttons only log to console without performing visual operations
- Three.js is not initialized (no scene, camera, or renderer)

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (valid modelUrl provided), the fixed component produces the expected behavior (renders 3D model).

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := ModelViewer_fixed(input)
  ASSERT threeJsInitialized(result)
  ASSERT canvasElementExists(result)
  ASSERT modelLoaded(result)
  ASSERT controlsWork(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs, the fixed component continues to display UI components (ViewModeSelector, ViewerControls, ModelInfoPanel) exactly as before.

**Pseudocode:**
```
FOR ALL input WHERE modelUrl IS PROVIDED DO
  ASSERT ViewModeSelector_displayed(ModelViewer_fixed(input)) = ViewModeSelector_displayed(ModelViewer_original(input))
  ASSERT ViewerControls_displayed(ModelViewer_fixed(input)) = ViewerControls_displayed(ModelViewer_original(input))
  ASSERT ModelInfoPanel_displayed(ModelViewer_fixed(input)) = ModelInfoPanel_displayed(ModelViewer_original(input))
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because it can generate many test cases to verify that UI components continue to render correctly across different states.

**Test Plan**: Observe behavior on UNFIXED code first to capture how UI components are displayed, then write tests to verify this continues after fix.

**Test Cases**:
1. **ViewModeSelector Preservation**: Verify ViewModeSelector displays three buttons with correct labels and active state
2. **ViewerControls Preservation**: Verify ViewerControls displays four buttons with correct icons and titles
3. **ModelInfoPanel Preservation**: Verify ModelInfoPanel displays with correct structure (even if values change from hardcoded to actual)
4. **Layout Preservation**: Verify component layout and CSS classes remain unchanged

### Unit Tests

- Test Three.js initialization creates scene, camera, renderer, and controls
- Test GLTFLoader is called with correct modelUrl
- Test model centering logic calculates bounding box correctly
- Test view mode switching changes camera type or material properties
- Test zoom in/out controls modify camera position
- Test reset control restores initial camera state
- Test fullscreen control calls Fullscreen API
- Test cleanup disposes Three.js resources on unmount
- Test error handling displays error message when model fails to load

### Property-Based Tests

- Generate random valid modelUrls and verify Three.js initializes for each
- Generate random view mode sequences and verify rendering updates correctly
- Generate random zoom/reset sequences and verify camera state remains valid
- Test that UI components always render regardless of Three.js state

### Integration Tests

- Test full flow: component mounts → Three.js initializes → model loads → user interacts with controls → component unmounts cleanly
- Test view mode switching while model is loading
- Test rapid control clicks don't cause errors
- Test window resize updates renderer and camera aspect ratio
- Test fullscreen mode works across different browsers
