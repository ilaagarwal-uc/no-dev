# Create Look - Requirements Document

## Overview

The "Create Look" feature enables users to apply decorative 3D models from a catalog onto their generated base wall model, creating customized wall visualizations. Users can drag and drop models using pen/tablet, manipulate them in 3D space, and calculate material quantities needed for implementation.

This feature is accessed after the 3D base model has been successfully generated from the dimension-marked wall image.

**Primary Input Device:** Users will interact with this feature using a pen and tablet (stylus-based input). All interactions must be optimized for pen/stylus input with appropriate touch targets, pressure sensitivity support, and gesture recognition.

---

## Glossary

- **Base_Model**: The 3D wall model generated from Gemini API response and Blender script. The base wall model displays a grid spaced at 6-inch intervals
- **Model_Catalog**: Collection of pre-made 3D decorative models (panels, lights, cove, bidding, etc.) stored in `/models` folder
- **Catalog_Item**: A single decorative model in the catalog with metadata (name, description, dimensions, category). Models are present in `/models` folder
- **Applied_Model**: A catalog item that has been placed onto the Base_Model
- **Look**: A complete visualization consisting of the Base_Model with all Applied_Models
- **Pen_Input**: Stylus/pen-based input from a tablet device
- **Touch_Target**: Interactive UI element sized appropriately for pen/stylus interaction (minimum 44x44px)
- **Item_Specification**: Configuration defining dimensions and properties of a decorative item

---

## User Flow

```
3D Model Generated → View Base Model (with 6" grid) → Browse Catalog (pen/tablet) → Apply Models (drag with pen) → Manipulate Models (pen gestures) → Calculate Quantities → Save Look
```

---

## Feature Requirements

### 1. Model Catalog Display (Pen/Tablet Optimized)

**User Story:** As a user, I want to browse a catalog of decorative models using my pen/tablet, so that I can choose which items to apply to my wall.

#### Acceptance Criteria

1. **Catalog Sidebar Display**
   - WHEN the 3D viewer is active, THE catalog sidebar SHALL be visible on the right side of the screen
   - THE catalog sidebar SHALL occupy 25-30% of the screen width
   - THE catalog sidebar SHALL be collapsible/expandable via a toggle button (minimum 44x44px touch target)
   - ALL interactive elements SHALL have minimum 44x44px touch targets for pen input

2. **Catalog Organization**
   - THE catalog SHALL organize models into categories (Panels, Lights, Cove, Bidding, Artwork, Other)
   - WHEN a category is selected with pen tap, THE catalog SHALL display only models from that category
   - THE catalog SHALL support search functionality with pen-friendly input field
   - THE catalog SHALL support sorting by: Name (A-Z), Recently Added, Most Popular
   - ALL category buttons SHALL have 44x44px minimum touch targets

3. **Model Display**
   - EACH catalog item SHALL display:
     - Thumbnail preview (200x200px minimum, tappable with pen)
     - Model name (readable at tablet viewing distance, 16px minimum)
     - Brief description (1-2 lines)
     - Dimensions (width × height × depth) extracted from filename
     - Category badge
   - WHEN a model is tapped with pen, THE catalog SHALL highlight it and show expanded details
   - THE catalog SHALL support infinite scroll or pagination for large catalogs
   - SCROLLING SHALL support pen drag gestures (drag to scroll)

4. **Catalog Loading from /models Folder**
   - WHEN the catalog loads, THE system SHALL scan `/models` folder for .glb, .gltf files
   - THE system SHALL parse model filenames to extract metadata (e.g., WX919_0.658X0.0379X9.5_FT.glb)
   - THE filename format SHALL be: `{MODEL_ID}_{WIDTH}X{HEIGHT}X{DEPTH}_FT.glb`
   - THE system SHALL extract:
     - MODEL_ID: Unique identifier (e.g., "WX919")
     - Dimensions in feet (WIDTH x HEIGHT x DEPTH)
   - WHILE loading, THE catalog SHALL display skeleton loaders
   - IF loading fails, THE catalog SHALL display error message with retry button (44x44px minimum)
   - THE catalog SHALL cache loaded models for performance

5. **Model Preview**
   - WHEN a catalog item is tapped with pen, THE system SHALL show a larger preview modal
   - THE preview modal SHALL display:
     - 360° rotatable preview of the model (rotate with pen drag)
     - Full description
     - Detailed dimensions (extracted from filename)
     - Material specifications
     - Estimated cost (if available)
   - THE preview modal SHALL have "Apply to Wall" button (44x44px minimum)
   - THE modal SHALL support pen gestures (swipe down to close)

---

### 2. Drag and Drop Model Application (Pen/Tablet Optimized)

**User Story:** As a user, I want to drag decorative models from the catalog onto my wall model using my pen, so that I can visualize how they look in place.

#### Acceptance Criteria

1. **Drag Initiation (Pen Input)**
   - WHEN user taps and holds pen on a catalog item (500ms hold), THE system SHALL initiate drag operation
   - WHEN user starts dragging with pen, THE system SHALL provide haptic feedback (if supported)
   - DURING drag, THE pen cursor SHALL change to indicate draggable state
   - DURING drag, THE system SHALL display a ghost image of the model following the pen position
   - THE system SHALL support pressure-sensitive drag (lighter pressure = slower drag, heavier = faster)

2. **Drop Zone Indication (Pen Input)**
   - WHEN dragging pen over the 3D viewer, THE system SHALL highlight valid drop zones with visual feedback
   - WHEN dragging pen over invalid areas, THE pen cursor SHALL indicate "not allowed" with visual + haptic feedback
   - THE system SHALL use raycasting to detect intersection with Base_Model surfaces
   - THE system SHALL provide larger hit zones (20% larger than visual) for easier pen targeting
   - THE system SHALL show 6-inch grid on Base_Model to help with placement alignment

3. **Model Placement (Pen Input)**
   - WHEN user lifts pen over valid drop zone, THE system SHALL:
     - Place the model at the drop location
     - Snap the model to the nearest 6-inch grid intersection (if snap enabled)
     - Orient the model perpendicular to the surface
     - Add the model to the Applied_Models list
     - Provide haptic feedback on successful placement
   - IF drop location is invalid, THEN THE system SHALL:
     - Display error message "Cannot place model here" (large, readable text)
     - Return ghost image to catalog with animation
     - Provide error haptic feedback
     - Not apply the model

4. **Visual Feedback**
   - WHEN model is successfully applied, THE system SHALL:
     - Animate the model into place (0.3s ease-in-out)
     - Highlight the applied model briefly (1s, 3px thick outline)
     - Update the applied models counter
   - THE 3D viewer SHALL re-render to show the new model

5. **Multiple Applications**
   - THE system SHALL allow applying the same catalog item multiple times
   - EACH applied instance SHALL be independent and manipulable
   - THE system SHALL assign unique IDs to each applied instance

---

### 3. Applied Model Manipulation (Pen/Tablet Optimized)

**User Story:** As a user, I want to adjust the position, rotation, and scale of applied models using my pen, so that I can perfect my wall design.

#### Acceptance Criteria

1. **Model Selection (Pen Input)**
   - WHEN user taps pen on an applied model, THE system SHALL:
     - Select the model
     - Display selection outline (3px thick, high contrast)
     - Show manipulation controls (gizmos with 44x44px touch targets)
     - Display model properties panel
     - Provide haptic feedback on selection
   - ONLY one model SHALL be selected at a time
   - WHEN user taps pen on empty space, THE system SHALL deselect current model
   - THE system SHALL support double-tap to enter edit mode

2. **Position Manipulation (Pen Input)**
   - WHEN model is selected, THE system SHALL display position gizmo (3-axis arrows, 44x44px touch targets)
2. **Position Manipulation (Pen Input)**
   - WHEN model is selected, THE system SHALL display position gizmo (3-axis arrows, 44x44px touch targets)
   - WHEN user drags an axis arrow with pen, THE model SHALL move along that axis only
   - WHEN user drags the center sphere with pen, THE model SHALL move freely on the surface plane
   - THE system SHALL support pressure-sensitive movement (lighter = finer control, heavier = faster movement)
   - THE system SHALL constrain movement to keep model on Base_Model surface
   - THE system SHALL provide snap-to-grid toggle button in toolbar (6-inch grid)
   - THE system SHALL show distance measurements during pen drag
   - THE system SHALL align to 6-inch grid when snap is enabled
   - WHEN model is selected, THE system SHALL display rotation gizmo (3-axis circles, 44x44px touch targets)
3. **Rotation Manipulation (Pen Input)**
   - WHEN model is selected, THE system SHALL display rotation gizmo (3-axis circles, 44x44px touch targets)
   - WHEN user drags a rotation circle with pen, THE model SHALL rotate around that axis
   - THE system SHALL support two-finger pen gesture for free rotation (if tablet supports)
   - THE system SHALL display rotation angle in degrees during pen manipulation (large, readable text)
   - THE system SHALL provide snap-to-angle toggle button in toolbar (15°, 30°, 45°, 90° increments)
   - THE system SHALL support pressure-sensitive rotation (lighter = finer control)
   - WHEN model is selected, THE system SHALL display scale gizmo (3-axis boxes, 44x44px touch targets)
4. **Scale Manipulation (Pen Input)**
   - WHEN model is selected, THE system SHALL display scale gizmo (3-axis boxes, 44x44px touch targets)
   - WHEN user drags a scale box with pen, THE model SHALL scale along that axis
   - WHEN user drags the center box with pen, THE model SHALL scale uniformly
   - THE system SHALL support pinch gesture with pen for uniform scaling (if tablet supports)
   - THE system SHALL constrain scaling between 0.1x and 10x original size
   - THE system SHALL provide aspect ratio lock toggle button in toolbar
   - THE system SHALL display scale percentage during pen manipulation
   - WHEN model is selected, THE properties panel SHALL display:
     - Model name
     - Position (X, Y, Z coordinates)
     - Rotation (X, Y, Z angles in degrees)
     - Scale (X, Y, Z multipliers)
     - Dimensions (actual width × height × depth)
   - THE properties panel SHALL allow direct numeric input for all values (pen-friendly input fields)
   - WHEN values are changed in panel, THE model SHALL update in real-time
   - ALL input fields SHALL have 44x44px minimum touch targets

6. **Context Menu (Pen Input)**
   - WHEN user long-presses pen on applied model (1 second), THE system SHALL display context menu with:
     - Duplicate (creates copy at same location)
     - Delete (removes model)
     - Reset Transform (returns to original position/rotation/scale)
     - Bring to Front / Send to Back (z-order)
     - Lock Position (prevents accidental movement)
   - ALL menu items SHALL have 44x44px minimum touch targets
   - THE menu SHALL have large, readable text (16px minimum)
   - WHEN user taps menu option with pen, THE system SHALL execute the action immediately
   - THE system SHALL provide haptic feedback on menu selection

7. **Pen Button Shortcuts**
   - THE system SHALL support pen button shortcuts (if pen has buttons):
7. **UI Action Buttons**
   - THE system SHALL provide toolbar buttons (all 44x44px minimum) for:
     - Undo (reverses last action)
     - Redo (re-applies undone action)
     - Snap to Grid toggle (enables/disables 6-inch grid snapping)
     - Snap to Angle toggle (enables/disables angle snapping at 15°, 30°, 45°, 90°)
     - Lock Aspect Ratio toggle (maintains proportions during scaling)
     - Delete Selected (removes selected model)
     - Duplicate Selected (creates copy of selected model)
   - THE system SHALL support pen gestures:
     - Double-tap: Enter/exit edit mode
     - Long-press (1s): Context menu
     - Swipe left: Undo
     - Swipe right: Redo
   - THE system SHALL display gesture hints on first use
   - ALL toolbar buttons SHALL have clear icons and labels
   - THE toolbar SHALL be positioned for easy pen access (top or side of screen)

### 4. Material Quantity Calculation

**User Story:** As a user, I want the system to calculate how many items I need based on my wall dimensions, so that I can order the correct quantities.

#### Acceptance Criteria

1. **Automatic Calculation**
   - WHEN a model is applied, THE system SHALL automatically calculate quantity needed
   - THE calculation SHALL be based on:
     - Marked section dimensions from dimension marking phase
     - Item specifications (dimensions per unit from filename)
     - Coverage area requirements
     - 6-inch grid alignment
   - THE system SHALL round up to nearest whole number

2. **Calculation Logic**
   - FOR panel-type items:
     - Calculate: `quantity = ceil(marked_area / panel_area)`
     - Example: 4ft × 3ft section with 4ft × 1ft panels = 3 panels
   - FOR linear items (bidding, cove):
     - Calculate: `quantity = ceil(marked_length / item_length)`
   - FOR point items (lights, fixtures):
     - Calculate based on spacing requirements and marked area
   - FOR custom items:
     - Use item-specific calculation formula from Item_Specification

---

### 6. Look Persistence and Sharing

**User Story:** As a user, I want to save my wall design and share it with others, so that I can get feedback or return to it later.


### 7. Catalog Management (Admin)

**User Story:** As an administrator, I want to manage the model catalog, so that I can add new items, update existing ones, and remove outdated models.

#### Acceptance Criteria

1. **Admin Access**
   - THE system SHALL provide admin-only catalog management interface
   - ONLY users with admin role SHALL access this interface
   - THE interface SHALL be accessible via /admin/catalog route

2. **Add New Model to /models Folder**
   - THE admin interface SHALL provide "Add Model" button (44x44px minimum)
   - WHEN tapped with pen, THE system SHALL display upload form with fields:
     - Model file (glTF, FBX, OBJ formats)
     - Model name (required)
     - Description (required)
     - Category (dropdown, required)
     - Dimensions (width, height, depth in feet) - auto-extracted from filename
     - Unit cost (optional)
     - Tags (comma-separated)
     - Thumbnail image (auto-generated or custom upload)
   - THE filename SHALL follow format: `{MODEL_ID}_{WIDTH}X{HEIGHT}X{DEPTH}_FT.glb`
   - WHEN form is submitted, THE system SHALL:
     - Validate model file format
     - Generate thumbnail if not provided
     - Store model in `/models` folder
     - Add entry to catalog database
     - Display success message

3. **Edit Existing Model**
   - THE admin interface SHALL display all catalog models in a table
   - EACH row SHALL have "Edit" button (44x44px minimum)
   - WHEN tapped with pen, THE system SHALL display edit form with current values
   - THE admin SHALL be able to update any field
   - WHEN saved, THE system SHALL update catalog database

4. **Delete Model**
   - EACH row SHALL have "Delete" button (44x44px minimum)
   - WHEN tapped with pen, THE system SHALL display confirmation dialog
   - IF confirmed, THE system SHALL:
     - Remove model from catalog database
     - Delete model file from `/models` folder
     - Delete thumbnail
     - Display success message
   - THE system SHALL NOT delete models that are used in saved looks (show warning)

5. **Bulk Operations**
   - THE admin interface SHALL support:
     - Bulk upload (multiple models at once)
     - Bulk category change
     - Bulk delete
     - Bulk export (download all models)

---

### 8. Performance and Optimization

**User Story:** As a user, I want the 3D viewer to remain responsive even with many applied models, so that I can work efficiently.

#### Acceptance Criteria

1. **Model Optimization**
   - THE system SHALL limit catalog models to 50,000 polygons maximum
   - THE system SHALL automatically generate LOD (Level of Detail) versions
   - THE system SHALL use LOD based on camera distance

2. **Rendering Performance**
   - THE 3D viewer SHALL maintain 60 FPS with up to 50 applied models
   - THE system SHALL use instancing for duplicate models
   - THE system SHALL frustum cull models outside camera view

3. **Memory Management**
   - THE system SHALL unload catalog thumbnails not in view
   - THE system SHALL limit maximum applied models to 100
   - THE system SHALL display warning when approaching limit

4. **Loading Optimization**
   - THE system SHALL lazy-load catalog models from `/models` folder (load on demand)
   - THE system SHALL preload models in current category
   - THE system SHALL use progressive loading for large models

---

### 9. Error Handling

**User Story:** As a user, I want clear error messages when something goes wrong, so that I know how to fix the issue.

#### Acceptance Criteria

1. **Catalog Loading Errors**
   - IF catalog fails to load from `/models` folder, THE system SHALL:
     - Display "Failed to load catalog" message (large, readable text)
     - Show retry button (44x44px minimum)
     - Log error to backend
   - IF retry fails 3 times, THE system SHALL suggest refreshing page

2. **Model Application Errors**
   - IF model fails to apply, THE system SHALL:
     - Display specific error message (e.g., "Model too large for this surface")
     - Suggest alternative action
     - Not add model to Applied_Models list
     - Provide haptic error feedback

3. **Quantity Calculation Errors**
   - IF calculation fails, THE system SHALL:
     - Display "Unable to calculate quantity" message
     - Allow manual quantity input
     - Log error for debugging

4. **Save/Load Errors**
   - IF save fails, THE system SHALL:
     - Display "Failed to save look" message
     - Offer to retry
     - Preserve unsaved changes in browser storage
   - IF load fails, THE system SHALL:
     - Display "Failed to load look" message
     - Return to looks list
     - Log error details

---

### 10. Accessibility and Pen/Tablet Optimization

**User Story:** As a user with accessibility needs, I want to use all features with pen/tablet and assistive technologies.

#### Acceptance Criteria

1. **Pen/Tablet Optimization**
   - ALL interactive elements SHALL have minimum 44x44px touch targets
   - THE system SHALL support pressure sensitivity for fine control
   - THE system SHALL provide haptic feedback for all interactions (if supported)
   - THE system SHALL support pen tilt for advanced manipulation (if supported)
   - THE system SHALL prevent palm rejection issues (ignore palm touches)
   - THE system SHALL support pen hover states (show tooltips on hover)

2. **Screen Reader Support**
   - ALL interactive elements SHALL have aria-labels
   - THE catalog items SHALL announce name and description
   - THE manipulation gizmos SHALL announce current values
   - THE BOM SHALL be readable by screen readers
   - THE system SHALL announce pen gesture hints

3. **Visual Accessibility**
   - THE system SHALL support high contrast mode
   - THE selection highlights SHALL be 3px thick minimum for visibility
   - THE text SHALL meet WCAG AA contrast requirements (4.5:1 minimum)
   - THE text SHALL be minimum 16px for tablet viewing distance
   - THE system SHALL support zoom up to 200%
   - THE gizmos SHALL be color-coded AND pattern-coded (not color-only)

---

## Technical Specifications

### Model Storage

- **Location**: `/models` folder in project root
- **Format**: .glb or .gltf files
- **Naming Convention**: `{MODEL_ID}_{WIDTH}X{HEIGHT}X{DEPTH}_FT.glb`
  - Example: `WX919_0.658X0.0379X9.5_FT.glb`
  - MODEL_ID: Unique identifier (e.g., "WX919")
  - Dimensions in feet (WIDTH x HEIGHT x DEPTH)
- **Metadata Extraction**: Parse filename to extract dimensions and ID
- **Thumbnail Generation**: Auto-generate from model file or use `{MODEL_ID}_thumb.png` if present in `/models` folder

### API Endpoints

```
GET    /api/catalog/models              - Get all catalog models from /models folder
GET    /api/catalog/models/:id          - Get specific model file from /models
GET    /api/catalog/categories          - Get all categories
POST   /api/looks                       - Save a look
GET    /api/looks/:id                   - Get a look
GET    /api/looks/user/:userId          - Get user's looks
PUT    /api/looks/:id                   - Update a look
DELETE /api/looks/:id                   - Delete a look
POST   /api/looks/:id/share             - Generate share link
GET    /api/bom/:lookId                 - Get Bill of Materials
POST   /api/admin/catalog/models        - Add model to /models folder (admin only)
PUT    /api/admin/catalog/models/:id    - Update model metadata (admin only)
DELETE /api/admin/catalog/models/:id    - Delete model from /models folder (admin only)
```

### Data Models

```typescript
interface CatalogItem {
  id: string; // Extracted from filename (e.g., "WX919")
  name: string; // Generated from ID or metadata
  description: string;
  category: 'panels' | 'lights' | 'cove' | 'bidding' | 'artwork' | 'other';
  dimensions: { width: number; height: number; depth: number }; // Extracted from filename
  unitCost?: number;
  thumbnailUrl: string; // /models/{id}_thumb.png or auto-generated
  modelUrl: string; // /models/{filename}.glb
  filePath: string; // Relative path in /models folder
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface AppliedModel {
  id: string;
  catalogItemId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number }; // In degrees
  scale: { x: number; y: number; z: number }; // Multipliers
  quantity: number;
  manualQuantity: boolean;
  penPressure?: number; // Pressure used during placement (0-1)
  placementMethod: 'pen' | 'mouse' | 'touch'; // Track input method
}

interface Look {
  id: string;
  userId: string;
  name: string;
  description: string;
  baseModelId: string;
  appliedModels: AppliedModel[];
  billOfMaterials: BOMItem[];
  thumbnailUrl: string;
  shareLink?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BOMItem {
  catalogItemId: string;
  name: string;
  category: string;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  dimensions: { width: number; height: number; depth: number };
}
```

---

## Future Enhancements

1. **AI-Powered Suggestions**
   - Suggest complementary models based on current selection
   - Auto-arrange models for optimal aesthetics
   - Style matching (modern, traditional, minimalist, etc.)

2. **Collaborative Editing**
   - Multiple users can edit same look simultaneously
   - Real-time updates across all connected clients
   - Comment and annotation system

3. **AR Preview**
   - View look in augmented reality using phone camera
   - Place virtual models in real space
   - Take photos of AR preview

4. **Cost Estimation**
   - Integration with supplier APIs for real-time pricing
   - Labor cost estimation
   - Installation time estimation

5. **Material Alternatives**
   - Suggest alternative materials with different costs
   - Compare side-by-side
   - Filter by budget constraints

---

## Success Metrics

1. **User Engagement**
   - Average number of models applied per look: Target 5-10
   - Time spent in create look phase: Target 10-15 minutes
   - Looks saved per user: Target 2-3

2. **Performance**
   - 3D viewer FPS: Target 60 FPS
   - Catalog load time from /models folder: Target < 2 seconds
   - Model application time: Target < 500ms

3. **Accuracy**
   - Quantity calculation accuracy: Target 95%+
   - User satisfaction with BOM: Target 4.5/5 stars

4. **Adoption**
   - Percentage of users who apply at least one model: Target 80%
   - Percentage of users who save a look: Target 60%
   - Percentage of users who share a look: Target 30%
