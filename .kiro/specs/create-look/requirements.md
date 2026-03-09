# Requirements Document: Create Look Feature

## Introduction

The Create Look feature enables users to compose 3D wall visualizations by applying decorative catalog models (panels, lights, cove, bidding, etc.) onto their generated base wall model. Users interact with the system using pen/tablet input to drag-and-drop models, manipulate them in 3D space with TransformControls, and automatically calculate material quantities based on 6-inch grid alignment. The system generates a Bill of Materials for ordering and cost estimation.

This feature transforms the static 3D wall viewer into an interactive design workspace, building on the existing Blender Viewer implementation while adding catalog browsing, model manipulation, quantity calculation, and look persistence capabilities.

## Glossary

- **Base_Model**: The 3D wall model generated from the dimension marking phase, displayed with a 6-inch grid overlay
- **Catalog**: Collection of decorative 3D models stored in the `/models` folder with metadata extracted from filenames
- **Catalog_Item**: A single decorative model with parsed metadata (MODEL_ID, dimensions in feet)
- **Applied_Model**: An instance of a catalog item placed on the Base_Model with position, rotation, and scale
- **Look**: A complete visualization consisting of the Base_Model with all Applied_Models and calculated quantities
- **TransformControls**: Three.js manipulation gizmos for position, rotation, and scale adjustments
- **Grid_Spacing**: 6-inch (0.1524 meter) grid alignment for model placement
- **Quantity_Calculator**: System component that calculates material quantities based on dimensions and grid alignment
- **BOM**: Bill of Materials listing all items, quantities, and costs
- **Pen_Input**: Stylus/pen-based input from tablet device with pressure sensitivity
- **Touch_Target**: Interactive UI element with minimum 44x44px size for pen/tablet interaction
- **Ghost_Image**: Semi-transparent preview of model during drag operation
- **Raycaster**: Three.js component for detecting 3D intersections during drag-and-drop
- **Snap_To_Grid**: Feature that aligns model positions to 6-inch grid intersections

## Requirements

### Requirement 1: Catalog Loading and Display

**User Story:** As a user, I want to browse a catalog of decorative models loaded from the `/models` folder, so that I can choose which items to apply to my wall.

#### Acceptance Criteria

1. WHEN the Create Look page loads, THE System SHALL scan the `/models` folder for .glb and .gltf files
2. WHEN scanning the `/models` folder, THE System SHALL parse each filename following the format `{MODEL_ID}_{WIDTH}X{HEIGHT}X{DEPTH}_FT.glb`
3. WHEN parsing filenames, THE System SHALL extract MODEL_ID, width, height, and depth dimensions in feet
4. WHEN a filename does not match the expected format, THE System SHALL log a warning and skip that file
5. WHEN catalog items are loaded, THE System SHALL display them in a sidebar organized by category
6. WHEN displaying catalog items, THE System SHALL show thumbnail, name, dimensions, and category for each item
7. WHEN the user filters by category, THE System SHALL display only items matching that category
8. WHEN the user searches by name or tags, THE System SHALL display only items matching the search query
9. WHEN catalog loading fails, THE System SHALL display an error message with a retry button

### Requirement 2: Drag and Drop Model Placement

**User Story:** As a user, I want to drag decorative models from the catalog onto my wall using pen input, so that I can visualize how they look in place.

#### Acceptance Criteria

1. WHEN the user taps and holds pen on a catalog item for 500ms, THE System SHALL initiate a drag operation
2. WHEN a drag operation starts, THE System SHALL create a ghost image following the pen position
3. WHEN the pen moves over the 3D viewer during drag, THE System SHALL use raycasting to detect valid drop zones on the Base_Model
4. WHEN the pen is over a valid drop zone, THE System SHALL highlight the zone and display the ghost image in green
5. WHEN the pen is over an invalid area, THE System SHALL display the ghost image in red
6. WHEN the user lifts the pen over a valid drop zone, THE System SHALL place the model at that location
7. WHEN placing a model, THE System SHALL snap the position to the nearest 6-inch grid intersection if snap is enabled
8. WHEN placing a model, THE System SHALL orient it perpendicular to the surface
9. WHEN a model is successfully placed, THE System SHALL add it to the Applied_Models list with a unique ID
10. WHEN the user lifts the pen over an invalid area, THE System SHALL animate the ghost image back to the catalog

### Requirement 3: Model Manipulation with TransformControls

**User Story:** As a user, I want to adjust the position, rotation, and scale of applied models using pen input, so that I can perfect my wall design.

#### Acceptance Criteria

1. WHEN the user taps pen on an applied model, THE System SHALL select that model and display TransformControls
2. WHEN a model is selected, THE System SHALL display position gizmo with 44x44px touch targets for each axis
3. WHEN the user drags a position axis with pen, THE System SHALL move the model along that axis only
4. WHEN the user drags the center sphere with pen, THE System SHALL move the model freely on the surface plane
5. WHEN snap-to-grid is enabled, THE System SHALL constrain position to 6-inch grid intersections
6. WHEN a model is selected, THE System SHALL display rotation gizmo with 44x44px touch targets
7. WHEN the user drags a rotation circle with pen, THE System SHALL rotate the model around that axis
8. WHEN snap-to-angle is enabled, THE System SHALL constrain rotation to 15-degree increments
9. WHEN a model is selected, THE System SHALL display scale gizmo with 44x44px touch targets
10. WHEN the user drags a scale handle with pen, THE System SHALL scale the model along that axis
11. WHEN scaling a model, THE System SHALL constrain scale values between 0.1x and 10.0x
12. WHEN the user taps on empty space, THE System SHALL deselect the current model

### Requirement 4: Pen Input and Pressure Sensitivity

**User Story:** As a user, I want pen/tablet input with pressure sensitivity, so that I have precise control over model manipulation.

#### Acceptance Criteria

1. WHEN the user manipulates a model with pen, THE System SHALL apply pressure-sensitive speed multipliers ranging from 0.3x (light) to 2.0x (heavy)
2. WHEN the user drags with light pressure, THE System SHALL provide finer control for precise adjustments
3. WHEN the user drags with heavy pressure, THE System SHALL provide faster movement for quick adjustments
4. WHEN a drag operation starts, THE System SHALL provide haptic feedback with 50ms vibration
5. WHEN the pen enters a valid drop zone, THE System SHALL provide haptic feedback with 20ms vibration
6. WHEN a model is successfully placed, THE System SHALL provide haptic feedback with [50, 50, 50]ms pattern
7. WHEN an error occurs, THE System SHALL provide haptic feedback with [100, 50, 100]ms pattern
8. WHEN the user manipulates a model, THE System SHALL provide subtle 10ms haptic feedback every 100ms

### Requirement 5: Quantity Calculation

**User Story:** As a user, I want the system to automatically calculate material quantities based on wall dimensions, so that I can order the correct amounts.

#### Acceptance Criteria

1. WHEN a model is placed, THE Quantity_Calculator SHALL calculate the quantity needed based on marked dimensions
2. WHEN calculating quantity for panel-type items, THE Quantity_Calculator SHALL use formula: ceil(marked_area / panel_area)
3. WHEN calculating quantity for linear items (bidding, cove), THE Quantity_Calculator SHALL use formula: ceil(marked_length / item_length)
4. WHEN calculating quantity for point items (lights), THE Quantity_Calculator SHALL use spacing-based calculation (1 per 16 sq ft)
5. WHEN calculating quantity, THE Quantity_Calculator SHALL round up to the nearest whole number
6. WHEN a model's scale changes, THE Quantity_Calculator SHALL recalculate the quantity
7. WHEN quantity is calculated, THE System SHALL display it in the properties panel
8. WHEN the user manually overrides a quantity, THE System SHALL mark it as manually adjusted and preserve the value
9. WHEN calculation fails, THE System SHALL set quantity to 1 and allow manual input

### Requirement 6: Bill of Materials Generation

**User Story:** As a user, I want to see a complete Bill of Materials with all items and quantities, so that I can order materials and estimate costs.

#### Acceptance Criteria

1. WHEN the user requests BOM, THE System SHALL aggregate quantities by catalog item ID
2. WHEN aggregating quantities, THE System SHALL sum quantities for all instances of the same catalog item
3. WHEN generating BOM, THE System SHALL organize items by category (Panels, Lights, Cove, Bidding, Artwork, Other)
4. WHEN displaying BOM items, THE System SHALL show name, dimensions, quantity, unit cost, and total cost
5. WHEN calculating grand totals, THE System SHALL sum all item quantities and costs
6. WHEN an item has no unit cost, THE System SHALL display "N/A" for cost fields
7. WHEN the user exports BOM to PDF, THE System SHALL generate a formatted PDF document
8. WHEN the user exports BOM to CSV, THE System SHALL generate a CSV file with all item data
9. WHEN applied models change, THE System SHALL update the BOM in real-time

### Requirement 7: Look Persistence

**User Story:** As a user, I want to save my wall design and load it later, so that I can continue working or share it with others.

#### Acceptance Criteria

1. WHEN the user saves a look, THE System SHALL capture a thumbnail screenshot of the current view
2. WHEN saving a look, THE System SHALL store the Base_Model reference, all Applied_Models, and BOM
3. WHEN saving a look, THE System SHALL generate a unique look ID
4. WHEN saving a look, THE System SHALL store it in the backend database
5. WHEN the user loads a look, THE System SHALL restore the Base_Model and all Applied_Models with their transforms
6. WHEN the user requests their saved looks, THE System SHALL display a list with thumbnails and metadata
7. WHEN the user updates an existing look, THE System SHALL increment the version number
8. WHEN the user deletes a look, THE System SHALL remove it from the database
9. WHEN save fails, THE System SHALL preserve the look data in browser localStorage as backup

### Requirement 8: Look Sharing

**User Story:** As a user, I want to share my wall design with others, so that I can get feedback or collaborate.

#### Acceptance Criteria

1. WHEN the user requests a share link, THE System SHALL generate a unique shareable URL
2. WHEN generating a share link, THE System SHALL create a read-only view of the look
3. WHEN someone accesses a share link, THE System SHALL display the look without requiring authentication
4. WHEN displaying a shared look, THE System SHALL prevent modifications by non-owners
5. WHEN generating a share link, THE System SHALL create a QR code for mobile sharing
6. WHEN the user shares a look, THE System SHALL provide social media share buttons

### Requirement 9: Grid System and Snapping

**User Story:** As a user, I want a 6-inch grid overlay and snap-to-grid functionality, so that I can align models precisely.

#### Acceptance Criteria

1. WHEN the Base_Model loads, THE System SHALL display a 6-inch (0.1524 meter) grid overlay
2. WHEN snap-to-grid is enabled, THE System SHALL snap model positions to grid intersections
3. WHEN snapping to grid, THE System SHALL round each coordinate to the nearest multiple of grid spacing
4. WHEN the user toggles grid visibility, THE System SHALL show or hide the grid overlay
5. WHEN the user toggles snap-to-grid, THE System SHALL enable or disable position snapping
6. WHEN snap-to-angle is enabled, THE System SHALL snap rotations to 15-degree increments

### Requirement 10: Properties Panel

**User Story:** As a user, I want to view and edit model properties with numeric inputs, so that I can make precise adjustments.

#### Acceptance Criteria

1. WHEN a model is selected, THE System SHALL display a properties panel with model details
2. WHEN displaying properties, THE System SHALL show position (X, Y, Z) with numeric input fields
3. WHEN displaying properties, THE System SHALL show rotation (X, Y, Z) with numeric input fields
4. WHEN displaying properties, THE System SHALL show scale (X, Y, Z) with numeric input fields
5. WHEN displaying properties, THE System SHALL show calculated quantity
6. WHEN the user changes a property value, THE System SHALL update the model in real-time
7. WHEN the user changes scale, THE System SHALL recalculate quantity
8. WHEN displaying properties, THE System SHALL provide delete, duplicate, and reset buttons with 44x44px touch targets

### Requirement 11: Context Menu

**User Story:** As a user, I want a context menu for quick actions on applied models, so that I can efficiently manage my design.

#### Acceptance Criteria

1. WHEN the user long-presses pen on an applied model for 1 second, THE System SHALL display a context menu
2. WHEN displaying context menu, THE System SHALL show Duplicate, Delete, Reset Transform, and Lock Position options
3. WHEN the user selects Duplicate, THE System SHALL create a copy of the model at the same location
4. WHEN the user selects Delete, THE System SHALL remove the model from the scene and Applied_Models list
5. WHEN the user selects Reset Transform, THE System SHALL restore the model to its original position, rotation, and scale
6. WHEN the user selects Lock Position, THE System SHALL prevent accidental movement of the model
7. WHEN displaying context menu items, THE System SHALL use 44x44px minimum touch targets

### Requirement 12: Performance Optimization

**User Story:** As a user, I want the 3D viewer to remain responsive with many applied models, so that I can work efficiently.

#### Acceptance Criteria

1. WHEN rendering the scene, THE System SHALL maintain 60 FPS with up to 50 applied models
2. WHEN multiple instances of the same model are applied, THE System SHALL use Three.js instancing to reduce draw calls
3. WHEN models are outside the camera view, THE System SHALL use frustum culling to skip rendering
4. WHEN catalog models exceed 50,000 polygons, THE System SHALL reject them during loading
5. WHEN the user approaches 100 applied models, THE System SHALL display a warning
6. WHEN catalog thumbnails are not in view, THE System SHALL unload them from memory

### Requirement 13: Error Handling

**User Story:** As a user, I want clear error messages when something goes wrong, so that I know how to fix the issue.

#### Acceptance Criteria

1. WHEN catalog loading fails, THE System SHALL display "Failed to load catalog" with a retry button
2. WHEN model placement fails, THE System SHALL display "Failed to place model" and return the ghost image to catalog
3. WHEN quantity calculation fails, THE System SHALL display "Unable to calculate quantity" and allow manual input
4. WHEN save fails, THE System SHALL display "Failed to save look" and preserve data in localStorage
5. WHEN load fails, THE System SHALL display "Failed to load look" and return to the looks list
6. WHEN retry fails 3 times, THE System SHALL suggest refreshing the page
7. WHEN an error occurs, THE System SHALL log error details to the backend for debugging

### Requirement 14: Accessibility and Touch Targets

**User Story:** As a user with accessibility needs, I want all features to work with pen/tablet and assistive technologies.

#### Acceptance Criteria

1. WHEN displaying interactive elements, THE System SHALL use minimum 44x44px touch targets
2. WHEN displaying catalog item cards, THE System SHALL use 200x200px size for easy tapping
3. WHEN displaying text, THE System SHALL use minimum 16px font size for readability
4. WHEN displaying interactive elements, THE System SHALL provide aria-labels for screen readers
5. WHEN displaying selection highlights, THE System SHALL use 3px thick outlines for visibility
6. WHEN displaying text, THE System SHALL meet WCAG AA contrast requirements (4.5:1 minimum)
7. WHEN the user zooms the browser, THE System SHALL support zoom up to 200% without breaking layout

### Requirement 15: Catalog Management (Admin)

**User Story:** As an administrator, I want to manage the model catalog, so that I can add new items and update existing ones.

#### Acceptance Criteria

1. WHEN an admin adds a model, THE System SHALL validate the filename format `{MODEL_ID}_{WIDTH}X{HEIGHT}X{DEPTH}_FT.glb`
2. WHEN an admin uploads a model file, THE System SHALL validate the file extension (.glb or .gltf only)
3. WHEN an admin uploads a model file, THE System SHALL validate the file size (< 50MB)
4. WHEN an admin adds a model, THE System SHALL store it in the `/models` folder
5. WHEN an admin adds a model without a thumbnail, THE System SHALL auto-generate one from the model
6. WHEN an admin edits a model, THE System SHALL update the catalog metadata
7. WHEN an admin deletes a model, THE System SHALL remove it from the `/models` folder and catalog database
8. WHEN an admin attempts to delete a model used in saved looks, THE System SHALL display a warning

