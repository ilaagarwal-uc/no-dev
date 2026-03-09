# Implementation Plan: Create Look Feature

## Overview

This implementation plan breaks down the Create Look feature into discrete coding tasks. The feature enables users to compose 3D wall visualizations by applying decorative catalog models onto their base wall model using pen/tablet input, with Three.js TransformControls for manipulation, automatic quantity calculation, and BOM generation.

The implementation builds on the existing Blender Viewer (ModelViewer component) and follows the project's DDD architecture with TypeScript, React, and Three.js.

## Tasks

- [x] 1. Set up core data models and interfaces
  - Create TypeScript interfaces for catalog items, applied models, looks, and BOM items
  - Define type definitions for transforms, view modes, and catalog categories
  - Set up validation schemas using Zod or similar
  - _Requirements: 1.2, 1.3, 2.9, 7.2_

- [x] 2. Implement catalog loading and parsing
  - [x] 2.1 Create backend API endpoint to scan /models folder
    - Implement GET /api/catalog/models endpoint
    - Scan /models folder for .glb and .gltf files
    - Return list of file paths
    - _Requirements: 1.1_
  
  - [x] 2.2 Implement filename parsing logic
    - Parse format: {MODEL_ID}_{WIDTH}X{HEIGHT}X{DEPTH}_FT.glb
    - Extract model ID and dimensions in feet
    - Validate dimensions are positive numbers
    - Handle parsing errors gracefully
    - _Requirements: 1.2, 1.3, 15.1_
  
  - [ ]* 2.3 Write property test for filename parsing
    - **Property 1: Filename Parsing Round-Trip**
    - **Validates: Requirements 1.2, 1.3, 15.1**
  
  - [x] 2.4 Create catalog service to load and cache items
    - Fetch catalog from backend API
    - Parse metadata for each item
    - Generate or load thumbnails
    - Cache parsed catalog items
    - _Requirements: 1.1, 1.6_


- [x] 3. Build CatalogSidebar component
  - [x] 3.1 Create CatalogSidebar with scrollable grid layout
    - Display catalog items in 200x200px cards
    - Implement category filtering with 44x44px buttons
    - Add search functionality with pen-friendly input
    - Support collapse/expand sidebar
    - _Requirements: 1.5, 1.6, 1.7, 1.8, 14.1, 14.2_
  
  - [x] 3.2 Create CatalogItemCard component
    - Display thumbnail, name, dimensions, category badge
    - Handle pen tap for selection
    - Handle pen tap and hold (500ms) for drag initiation
    - Show loading skeleton while thumbnail loads
    - _Requirements: 1.6, 14.1, 14.2_
  
  - [ ]* 3.3 Write unit tests for catalog filtering and search
    - Test category filtering
    - Test search by name and tags
    - Test empty results handling
    - _Requirements: 1.7, 1.8_

- [x] 4. Enhance ModelViewer with drag-and-drop support
  - [x] 4.1 Add 6-inch grid overlay to ModelViewer
    - Create GridHelper with 0.1524m (6 inch) spacing
    - Calculate grid size based on base model bounding box
    - Add toggle for grid visibility
    - _Requirements: 9.1, 9.4_
  
  - [x] 4.2 Implement raycaster for drop zone detection
    - Initialize Three.js Raycaster
    - Detect intersections with base model during drag
    - Highlight valid drop zones in green
    - Show invalid zones in red
    - _Requirements: 2.3, 2.4, 2.5_
  
  - [x] 4.3 Implement grid snapping logic
    - Create snapToGridIntersection function
    - Round coordinates to nearest grid multiple
    - Add toggle for snap-to-grid
    - _Requirements: 2.7, 9.2, 9.3_
  
  - [ ]* 4.4 Write property test for grid snapping
    - **Property 2: Grid Snapping Consistency**
    - **Validates: Requirements 2.7, 3.5, 9.2, 9.3**
  
  - [x] 4.5 Render applied models in scene
    - Load GLTF models for applied items
    - Position models at specified coordinates
    - Apply rotation and scale transforms
    - Support selection highlighting
    - _Requirements: 2.9_

- [x] 5. Implement drag-and-drop workflow
  - [x] 5.1 Create DragGhostImage component
    - Display semi-transparent model preview
    - Follow pen position during drag
    - Show valid/invalid drop zone indicator
    - Scale based on pen pressure (optional)
    - _Requirements: 2.2, 2.4, 2.5_
  
  - [x] 5.2 Implement drag handler with pen optimization
    - Handle pen tap and hold (500ms) to initiate drag
    - Create ghost image on drag start
    - Update ghost position during pen move
    - Detect drop zone with raycasting
    - Provide haptic feedback throughout
    - _Requirements: 2.1, 2.2, 2.3, 4.4, 4.5, 4.6_
  
  - [x] 5.3 Handle model drop and placement
    - Validate drop zone on pen lift
    - Snap position to grid if enabled
    - Calculate orientation from surface normal
    - Create applied model instance with unique ID
    - Load and add model to scene
    - Animate placement
    - _Requirements: 2.6, 2.7, 2.8, 2.9_
  
  - [x] 5.4 Handle invalid drop
    - Animate ghost image back to catalog
    - Provide error haptic feedback
    - Do not add model to scene
    - _Requirements: 2.10_


- [x] 6. Implement TransformControls for model manipulation
  - [x] 6.1 Integrate Three.js TransformControls
    - Import TransformControls from three/examples
    - Create controls for camera and renderer
    - Attach to selected model
    - Configure 44x44px touch targets for gizmos
    - _Requirements: 3.1, 3.2, 14.1_
  
  - [x] 6.2 Implement position manipulation
    - Handle pen drag on axis arrows
    - Apply pressure-sensitive speed multipliers (0.3x-2.0x)
    - Snap to grid when enabled
    - Constrain to base model surface
    - Emit transform change events
    - _Requirements: 3.3, 3.4, 3.5, 4.1, 4.2_
  
  - [x] 6.3 Implement rotation manipulation
    - Handle pen drag on rotation circles
    - Apply pressure-sensitive speed
    - Snap to 15-degree increments when enabled
    - Emit transform change events
    - _Requirements: 3.6, 3.7, 3.8, 9.6_
  
  - [ ]* 6.4 Write property test for angle snapping
    - **Property 3: Angle Snapping Consistency**
    - **Validates: Requirements 3.8, 9.6**
  
  - [x] 6.5 Implement scale manipulation
    - Handle pen drag on scale handles
    - Apply pressure-sensitive speed
    - Constrain scale to 0.1x-10.0x range
    - Emit transform change events
    - _Requirements: 3.9, 3.10, 3.11_
  
  - [ ]* 6.6 Write property test for scale constraints
    - **Property 4: Scale Constraints**
    - **Validates: Requirements 3.11**
  
  - [x] 6.7 Add haptic feedback for manipulation
    - Vibrate on manipulation start (30ms)
    - Subtle vibration during drag (10ms every 100ms)
    - Success vibration on manipulation end (50ms)
    - _Requirements: 4.4, 4.8_
  
  - [x] 6.8 Handle model selection and deselection
    - Select model on pen tap
    - Show TransformControls for selected model
    - Deselect on tap empty space
    - Update selection state
    - _Requirements: 3.1, 3.12_

- [x] 7. Implement quantity calculation system
  - [x] 7.1 Create QuantityCalculator service
    - Implement calculateQuantity function
    - Support panel-type calculation (area-based)
    - Support linear-type calculation (length-based)
    - Support point-type calculation (spacing-based)
    - Round up to nearest whole number
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 7.2 Write property tests for quantity calculation
    - **Property 5: Quantity Calculation Non-Negativity**
    - **Property 6: Panel Quantity Calculation**
    - **Property 7: Linear Quantity Calculation**
    - **Property 8: Point Quantity Calculation**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
  
  - [x] 7.3 Integrate quantity calculation with model placement
    - Calculate quantity when model is placed
    - Display quantity in properties panel
    - Store quantity in applied model
    - _Requirements: 5.1, 5.7_
  
  - [x] 7.4 Implement quantity recalculation on scale change
    - Detect scale changes in transform handler
    - Recalculate quantity with new dimensions
    - Update applied model quantity
    - _Requirements: 5.6, 10.7_
  
  - [ ]* 7.5 Write property test for quantity recalculation
    - **Property 9: Quantity Recalculation on Scale Change**
    - **Validates: Requirements 5.6, 10.7**
  
  - [x] 7.6 Implement manual quantity override
    - Allow user to manually set quantity
    - Mark quantity as manually adjusted
    - Preserve manual value during transforms
    - _Requirements: 5.8_
  
  - [ ]* 7.7 Write property test for manual quantity preservation
    - **Property 24: Manual Quantity Override Preservation**
    - **Validates: Requirements 5.8**


- [x] 8. Build PropertiesPanel component
  - [x] 8.1 Create PropertiesPanel UI
    - Display selected model name and thumbnail
    - Show position (X, Y, Z) with numeric inputs (44x44px)
    - Show rotation (X, Y, Z) with numeric inputs
    - Show scale (X, Y, Z) with numeric inputs
    - Display calculated quantity
    - Add delete, duplicate, reset buttons (44x44px)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.8, 14.1_
  
  - [x] 8.2 Implement property change handlers
    - Update model position on input change
    - Update model rotation on input change
    - Update model scale on input change
    - Recalculate quantity on scale change
    - Update in real-time
    - _Requirements: 10.6, 10.7_
  
  - [ ]* 8.3 Write property test for properties panel reactivity
    - **Property 36: Properties Panel Reactivity**
    - **Validates: Requirements 10.6**
  
  - [x] 8.4 Implement model actions
    - Delete: Remove model from scene and list
    - Duplicate: Create copy at same location
    - Reset: Restore original transform
    - _Requirements: 11.3, 11.4, 11.5_
  
  - [ ]* 8.5 Write property tests for model actions
    - **Property 25: Model Duplication**
    - **Property 26: Model Deletion**
    - **Property 27: Transform Reset**
    - **Validates: Requirements 11.3, 11.4, 11.5**

- [x] 9. Checkpoint - Ensure core placement and manipulation works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Bill of Materials generation
  - [x] 10.1 Create BOM generator service
    - Implement generateBillOfMaterials function
    - Aggregate quantities by catalog item ID
    - Calculate grand totals (items, quantity, cost, coverage)
    - Sort by category then by name
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  
  - [ ]* 10.2 Write property tests for BOM generation
    - **Property 10: BOM Aggregation Correctness**
    - **Property 11: BOM Category Organization**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
  
  - [x] 10.3 Create BOMModal component
    - Display BOM table organized by category
    - Show item details (name, dimensions, quantity, cost)
    - Display grand totals
    - Add export buttons (PDF, CSV) with 44x44px size
    - _Requirements: 6.3, 6.4, 14.1_
  
  - [ ]* 10.4 Write property test for BOM display completeness
    - **Property 38: BOM Display Completeness**
    - **Validates: Requirements 6.4**
  
  - [x] 10.5 Implement BOM real-time updates
    - Update BOM when models are added
    - Update BOM when models are removed
    - Update BOM when quantities change
    - _Requirements: 6.9_
  
  - [ ]* 10.6 Write property test for BOM real-time updates
    - **Property 12: BOM Real-Time Updates**
    - **Validates: Requirements 6.9**
  
  - [x] 10.7 Implement BOM export functionality
    - Export to PDF with formatted layout
    - Export to CSV with all item data
    - Add print functionality
    - _Requirements: 6.7, 6.8_


- [x] 11. Implement look persistence
  - [x] 11.1 Create backend API endpoints for looks
    - POST /api/looks - Save new look
    - PUT /api/looks/:id - Update existing look
    - GET /api/looks/:id - Load specific look
    - GET /api/looks - List user's looks
    - DELETE /api/looks/:id - Delete look
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.8_
  
  - [x] 11.2 Create database schema for looks
    - Define Look table with all fields
    - Store base model reference
    - Store applied models as JSON
    - Store BOM as JSON
    - Add version field for history
    - _Requirements: 7.2, 7.7_
  
  - [x] 11.3 Implement look save functionality
    - Capture thumbnail screenshot from viewer
    - Generate BOM
    - Create look object with all data
    - Upload thumbnail to cloud storage
    - Save to backend database
    - Handle save errors with localStorage backup
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.9_
  
  - [x] 11.4 Implement look load functionality
    - Fetch look from backend
    - Restore base model
    - Restore all applied models with transforms
    - Restore BOM
    - Handle load errors
    - _Requirements: 7.5_
  
  - [ ]* 11.5 Write property tests for look persistence
    - **Property 13: Look Persistence Round-Trip**
    - **Property 14: Look ID Uniqueness**
    - **Property 15: Look Version Increment**
    - **Validates: Requirements 7.2, 7.3, 7.5, 7.7**
  
  - [x] 11.6 Create SaveLookModal component
    - Display save form with name and description inputs
    - Show thumbnail preview
    - Handle save submission
    - Display success message with look ID
    - _Requirements: 7.1, 7.2_
  
  - [x] 11.7 Create look list view
    - Display user's saved looks with thumbnails
    - Show metadata (name, date, version)
    - Support load and delete actions
    - _Requirements: 7.6, 7.8_

- [x] 12. Implement look sharing
  - [x] 12.1 Create share link generation
    - Generate unique shareable URL
    - Create read-only view of look
    - Store share link in database
    - _Requirements: 8.1, 8.2_
  
  - [ ]* 12.2 Write property test for share link uniqueness
    - **Property 16: Share Link Uniqueness**
    - **Validates: Requirements 8.1**
  
  - [x] 12.3 Implement shared look view
    - Display look without authentication
    - Prevent modifications by non-owners
    - Show view-only indicator
    - _Requirements: 8.3, 8.4_
  
  - [x] 12.4 Add share UI components
    - Generate QR code for mobile sharing
    - Add social media share buttons (44x44px)
    - Display share link with copy button
    - _Requirements: 8.5, 8.6, 14.1_

- [x] 13. Implement context menu
  - [x] 13.1 Create ContextMenu component
    - Display on pen long-press (1 second)
    - Show Duplicate, Delete, Reset, Lock options
    - Use 44x44px minimum touch targets
    - Position near pen location
    - _Requirements: 11.1, 11.2, 11.7, 14.1_
  
  - [x] 13.2 Implement context menu actions
    - Duplicate: Create copy of model
    - Delete: Remove model from scene
    - Reset Transform: Restore original transform
    - Lock Position: Prevent movement
    - _Requirements: 11.3, 11.4, 11.5, 11.6_
  
  - [ ]* 13.3 Write property test for position lock
    - **Property 28: Position Lock**
    - **Validates: Requirements 11.6**


- [x] 14. Implement CreateLookPage orchestrator
  - [x] 14.1 Create CreateLookPage component
    - Set up page layout with sidebar, viewer, and panels
    - Initialize state management for all features
    - Handle routing with baseModelId parameter
    - Coordinate between all child components
    - _Requirements: 1.1, 2.1_
  
  - [x] 14.2 Implement page initialization workflow
    - Fetch base model from backend
    - Load catalog items
    - Initialize Three.js scene with grid
    - Initialize drag-and-drop system
    - Initialize TransformControls
    - Show loading progress with stages
    - _Requirements: 1.1, 9.1_
  
  - [x] 14.3 Add ViewerControls component
    - Zoom controls
    - View mode selector (perspective, orthographic, wireframe)
    - Grid toggle
    - Snap toggle
    - Reset view button
    - All buttons 44x44px minimum
    - _Requirements: 9.4, 9.5, 14.1_
  
  - [x] 14.4 Implement error handling
    - Display error messages for catalog load failures
    - Display error messages for model placement failures
    - Display error messages for save/load failures
    - Provide retry buttons (44x44px)
    - Log errors to backend
    - _Requirements: 1.9, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  
  - [x] 14.5 Add loading indicators
    - Show progress bar with percentage
    - Display loading stage messages
    - Show skeleton loaders for catalog
    - _Requirements: 1.1_

- [x] 15. Checkpoint - Ensure all features integrated
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Implement performance optimizations
  - [ ] 16.1 Add model instancing for duplicates
    - Use Three.js InstancedMesh for same catalog items
    - Reduce draw calls
    - _Requirements: 12.2_
  
  - [ ] 16.2 Implement frustum culling
    - Enable automatic frustum culling
    - Hide models outside camera view
    - _Requirements: 12.3_
  
  - [ ] 16.3 Add polygon count validation
    - Check model polygon count on load
    - Reject models exceeding 50,000 polygons
    - Display warning message
    - _Requirements: 12.4_
  
  - [ ]* 16.4 Write property test for polygon count validation
    - **Property 29: Polygon Count Validation**
    - **Validates: Requirements 12.4**
  
  - [ ] 16.5 Implement applied model limit
    - Warn user when approaching 100 models
    - Prevent adding more than 100 models
    - Display warning message
    - _Requirements: 12.5_
  
  - [ ] 16.6 Add memory management
    - Dispose geometries and materials on model removal
    - Unload catalog thumbnails not in view
    - Clear undo history after 50 actions
    - _Requirements: 12.6_


- [x] 17. Implement accessibility features
  - [x] 17.1 Add ARIA labels to all interactive elements
    - Label catalog items with name, category, dimensions
    - Label transform gizmos with axis and value
    - Label all buttons with descriptive text
    - _Requirements: 14.4_
  
  - [ ]* 17.2 Write property test for ARIA label presence
    - **Property 32: Aria Label Presence**
    - **Validates: Requirements 14.4**
  
  - [x] 17.3 Implement keyboard navigation
    - Tab through catalog items
    - Arrow keys to navigate
    - Enter to select/apply
    - Escape to cancel/close
    - Ctrl+Z for undo, Ctrl+Y for redo
    - _Requirements: 14.4_
  
  - [x] 17.4 Add screen reader announcements
    - Announce model placement
    - Announce transform changes
    - Announce BOM generation
    - Use aria-live regions
    - _Requirements: 14.4_
  
  - [x] 17.5 Ensure touch target sizes
    - Verify all interactive elements are 44x44px minimum
    - Verify catalog cards are 200x200px
    - Verify text is 16px minimum
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ]* 17.6 Write property tests for accessibility
    - **Property 30: Touch Target Minimum Size**
    - **Property 31: Text Minimum Font Size**
    - **Validates: Requirements 14.1, 14.3**
  
  - [x] 17.7 Implement high contrast mode support
    - Support system high contrast settings
    - Increase outline thickness to 4px
    - Use high contrast colors
    - Add patterns to color-coded elements
    - _Requirements: 14.6_
  
  - [x] 17.8 Ensure text contrast ratios
    - Verify all text meets WCAG AA (4.5:1 minimum)
    - Use contrast checking tool
    - Fix any failing contrasts
    - _Requirements: 14.6_
  
  - [ ]* 17.9 Write property test for text contrast
    - **Property 33: Text Contrast Ratio**
    - **Validates: Requirements 14.6**
  
  - [x] 17.10 Add focus indicators
    - Visible focus outline (3px solid blue)
    - Focus outline offset (2px)
    - Focus on all interactive elements
    - _Requirements: 14.4_
  
  - [x] 17.11 Test browser zoom support
    - Test layout at 200% zoom
    - Ensure no breaking at high zoom
    - Use relative units (rem, em)
    - _Requirements: 14.7_


- [x] 18. Implement catalog management (admin)
  - [x] 18.1 Create admin API endpoints
    - POST /api/admin/catalog - Add model
    - PUT /api/admin/catalog/:id - Update model
    - DELETE /api/admin/catalog/:id - Delete model
    - Verify admin role on backend
    - _Requirements: 15.1, 15.4, 15.6, 15.7_
  
  - [x] 18.2 Implement file upload validation
    - Validate filename format
    - Validate file extension (.glb or .gltf only)
    - Validate file size (< 50MB)
    - _Requirements: 15.1, 15.2, 15.3_
  
  - [x] 18.3 Implement thumbnail generation
    - Auto-generate thumbnail from model if not provided
    - Use Three.js to render thumbnail
    - Save as {id}_thumb.png
    - _Requirements: 15.5_
  
  - [x] 18.4 Add delete warning for used models
    - Check if model is used in saved looks
    - Display warning before deletion
    - Require confirmation
    - _Requirements: 15.8_

- [x] 19. Add routing and navigation
  - [x] 19.1 Create route for Create Look page
    - Add /create-look/:baseModelId route
    - Extract baseModelId from URL params
    - Pass to CreateLookPage component
    - _Requirements: 1.1_
  
  - [x] 19.2 Add navigation from 3D model generation
    - Add "Create Look" button on model viewer page
    - Navigate to /create-look/:baseModelId
    - Pass model ID in URL
    - _Requirements: 1.1_
  
  - [x] 19.3 Add navigation to saved looks list
    - Create /looks route for list view
    - Add "My Looks" link in header
    - Display list of user's saved looks
    - _Requirements: 7.6_

- [ ] 20. Implement security measures
  - [ ] 20.1 Add input validation
    - Sanitize look names and descriptions (XSS prevention)
    - Validate numeric inputs (position, rotation, scale)
    - Limit string lengths (name: 100 chars, description: 500 chars)
    - Validate UUIDs for model IDs
    - _Requirements: 7.2_
  
  - [ ] 20.2 Implement authentication checks
    - Verify user is authenticated for save/load
    - Verify user owns look before modifications
    - Verify admin role for catalog management
    - _Requirements: 7.4, 7.8, 15.6_
  
  - [ ] 20.3 Add rate limiting
    - Limit API requests to 10 per minute
    - Apply to save/load endpoints
    - Return 429 status on limit exceeded
    - _Requirements: 7.4_
  
  - [ ] 20.4 Implement file security
    - Validate file magic numbers (glTF signature)
    - Sanitize filenames to prevent path traversal
    - Serve models with proper CORS headers
    - Use signed URLs for cloud storage
    - _Requirements: 15.2_

- [ ] 21. Final integration and testing
  - [-] 21.1 Create integration tests for end-to-end workflows
    - Test complete drag-and-drop flow
    - Test transform manipulation flow
    - Test BOM generation and export
    - Test save and load look flow
    - Test catalog filtering and search
    - _Requirements: All_
  
  - [ ]* 21.2 Run all property-based tests
    - Execute all property tests with 1000+ runs
    - Verify all properties hold
    - Fix any failing properties
    - _Requirements: All_
  
  - [ ] 21.3 Perform manual testing with pen/tablet
    - Test on actual tablet device with stylus
    - Verify pressure sensitivity works
    - Verify haptic feedback works
    - Verify touch targets are adequate
    - Test all gestures (tap, hold, drag, swipe)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [ ] 21.4 Test performance with many models
    - Place 50+ models in scene
    - Verify 60 FPS maintained
    - Test memory usage
    - Verify instancing works
    - _Requirements: 12.1, 12.2_
  
  - [ ] 21.5 Test accessibility with assistive technologies
    - Test with screen reader (NVDA, JAWS, VoiceOver)
    - Test keyboard navigation
    - Test high contrast mode
    - Test at 200% zoom
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.6, 14.7_

- [ ] 22. Final checkpoint - Complete feature verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- The implementation builds on existing ModelViewer component from Blender Viewer feature
- All code follows the project's DDD architecture with TypeScript, React, and Three.js
- Pen/tablet optimization is a core requirement throughout the implementation
- Accessibility features ensure WCAG AA compliance
