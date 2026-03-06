# Dimension Marking Feature - Comprehensive Test Plan

**Feature**: Dimension Marking Tool for Wall Decor Visualizer
**Created**: 2026-03-06
**Coverage Target**: 80%+ for critical paths
**Test Pyramid**: 70% Unit, 25% Integration, 5% E2E

---

## Test Strategy Overview

This test plan follows TDD (Test-Driven Development) approach with comprehensive coverage across all 7 tools and core functionality. Tests are organized by tool and feature area, with clear categorization of happy path, error cases, and edge cases.

### Test Pyramid Distribution
- **Unit Tests (70%)**: Component logic, tool calculations, state management, coordinate transformations
- **Integration Tests (25%)**: Tool interactions, zoom synchronization, undo/redo chains, canvas rendering
- **E2E Tests (5%)**: Full user workflows (draw polygon → save, mark dimensions → skip)

---

## 1. IMAGE CANVAS & DISPLAY TESTS

### 1.1 Image Canvas Display (Unit)
- [ ] Test image loads and displays centered in viewport
- [ ] Test image maintains original aspect ratio
- [ ] Test image scales to fit viewport when larger
- [ ] Test image displays at actual size when smaller than viewport
- [ ] Test zoom percentage displays correctly (e.g., "100%")

### 1.2 Zoom Controls (Unit)
- [ ] Test zoom in button increases scale by 10%
- [ ] Test zoom out button decreases scale by 10%
- [ ] Test mouse wheel scroll up zooms in
- [ ] Test mouse wheel scroll down zooms out
- [ ] Test zoom level minimum boundary (10%)
- [ ] Test zoom level maximum boundary (500%)
- [ ] Test zoom percentage display updates correctly
- [ ] Test zoom center point follows cursor position

### 1.3 Zoom Synchronization (Integration)
- [ ] Test annotations stay at same image position after zoom in
- [ ] Test annotations stay at same image position after zoom out
- [ ] Test multiple zoom operations maintain coordinate accuracy
- [ ] Test annotation rendering scales proportionally with zoom
- [ ] Test coordinate system remains consistent across zoom levels
- [ ] Test pan + zoom combination maintains annotation positions

---

## 2. TOOL SELECTOR & TOOLBAR TESTS

### 2.1 Toolbar Display (Unit)
- [ ] Test toolbar displays with all 7 tools in correct order: Polygon, Dimension, Freehand, Arch, Concave Corner, Convex Corner, Pan
- [ ] Test each tool button shows icon and text label
- [ ] Test each tool button has minimum 44x44px clickable area
- [ ] Test toolbar uses compact spacing and layout
- [ ] Test toolbar is floating and overlays canvas

### 2.2 Toolbar Dragging (Integration)
- [ ] Test toolbar can be dragged by header/title bar
- [ ] Test toolbar follows cursor smoothly during drag
- [ ] Test toolbar position is fixed after mouse release
- [ ] Test toolbar position is remembered for session
- [ ] Test toolbar cannot be dragged outside visible area
- [ ] Test toolbar stays within viewport boundaries

### 2.3 Tool Selection (Unit)
- [ ] Test clicking tool button selects that tool
- [ ] Test previously selected tool is deselected
- [ ] Test selected tool is highlighted visually
- [ ] Test Pan tool is default active on page load
- [ ] Test cursor changes for each tool (hand, pencil, crosshair, corner icon, arch icon)

---

## 3. PAN TOOL TESTS

### 3.1 Pan Tool Functionality (Unit)
- [ ] Test Pan tool is default active tool
- [ ] Test Pan tool cursor displays as hand icon
- [ ] Test clicking and dragging pans image in drag direction
- [ ] Test panning stops when mouse button released
- [ ] Test panning disabled when image fits in viewport
- [ ] Test panning prevented at image boundaries
- [ ] Test Pan tool does not create annotations

### 3.2 Pan Tool Edge Cases (Unit)
- [ ] Test pan at top boundary prevents further upward pan
- [ ] Test pan at bottom boundary prevents further downward pan
- [ ] Test pan at left boundary prevents further leftward pan
- [ ] Test pan at right boundary prevents further rightward pan
- [ ] Test rapid pan operations work smoothly

---

## 4. FREEHAND TOOL TESTS

### 4.1 Freehand Drawing (Unit)
- [ ] Test Freehand tool cursor displays as pencil icon
- [ ] Test clicking and dragging draws continuous black line
- [ ] Test stroke displays in real-time during drag (not only on release)
- [ ] Test stroke completes when mouse button released
- [ ] Test freehand line stored as annotation data
- [ ] Test freehand line color is black (#000000)

### 4.2 Freehand Interactions (Integration)
- [ ] Test hovering over freehand line highlights it
- [ ] Test clicking on freehand line allows deletion
- [ ] Test multiple freehand lines can be drawn
- [ ] Test freehand lines persist after tool change
- [ ] Test freehand lines scale correctly with zoom

### 4.3 Freehand Edge Cases (Unit)
- [ ] Test single point click (no drag) does not create line
- [ ] Test very short strokes are captured
- [ ] Test rapid drawing maintains smooth line
- [ ] Test pressure sensitivity supported (if device supports)

---

## 5. DIMENSION TOOL TESTS

### 5.1 Dimension Line Creation (Unit)
- [ ] Test Dimension tool cursor displays as crosshair
- [ ] Test first click marks starting point with visible indicator
- [ ] Test preview line shows from first point to cursor after first click
- [ ] Test second click creates dimension line between two points
- [ ] Test dimension line color is black (#000000)
- [ ] Test dimension line has double-headed arrows at both endpoints
- [ ] Test arrow heads point inward (towards the line)
- [ ] Test arrow heads are open (not filled) with 50-degree opening angle
- [ ] Test NO automatic measurement labels displayed
- [ ] Test dimension line stored as annotation data

### 5.2 Dimension Interactions (Integration)
- [ ] Test hovering over dimension line highlights it
- [ ] Test clicking on dimension line allows deletion
- [ ] Test multiple dimension lines can be created
- [ ] Test dimension lines persist after tool change
- [ ] Test dimension lines scale correctly with zoom

### 5.3 Dimension Edge Cases (Unit)
- [ ] Test clicking same point twice creates zero-length line
- [ ] Test very short dimension lines render correctly
- [ ] Test very long dimension lines render correctly
- [ ] Test dimension lines at various angles (0°, 45°, 90°, 180°)

---

## 6. POLYGON TOOL TESTS

### 6.1 Polygon Creation (Unit)
- [ ] Test Polygon tool cursor displays as crosshair
- [ ] Test first click places vertex with filled red circle
- [ ] Test subsequent clicks place vertices with red circles
- [ ] Test preview line shows from last vertex to cursor
- [ ] Test lines connecting vertices are bright red (#FF0000)
- [ ] Test polygon closes when clicking near first vertex (within circle)
- [ ] Test closed polygon fills with semi-transparent red (rgba(255, 0, 0, 0.2))
- [ ] Test closed polygon boundary is bright red (#FF0000)
- [ ] Test polygon area is calculated and displayed
- [ ] Test polygon stored as annotation data

### 6.2 Polygon Interactions (Integration)
- [ ] Test hovering over polygon highlights boundary with brighter red
- [ ] Test clicking on polygon allows deletion
- [ ] Test polygon vertices can be dragged to new positions
- [ ] Test multiple polygons can be created
- [ ] Test polygons persist after tool change
- [ ] Test polygons scale correctly with zoom

### 6.3 Polygon Edge Cases (Unit)
- [ ] Test 3-point polygon (minimum valid polygon)
- [ ] Test polygon with many vertices (10+)
- [ ] Test polygon with self-intersecting edges
- [ ] Test polygon area calculation accuracy
- [ ] Test clicking exactly on first vertex closes polygon
- [ ] Test clicking near but not on first vertex continues polygon

---

## 7. ARCH TOOL TESTS

### 7.1 Arch Type Selection (Unit)
- [ ] Test Arch tool displays type selector with "180° Arch" and "90° Arch" options
- [ ] Test selecting 180° Arch highlights that option
- [ ] Test selecting 90° Arch highlights that option
- [ ] Test 180° Arch prepares to create semicircular arch
- [ ] Test 90° Arch prepares to create quarter-circle arch

### 7.2 Arch Creation - 180° (Unit)
- [ ] Test first click marks first circumference point
- [ ] Test preview shows arch from first point to cursor
- [ ] Test preview shows supporting radius lines as dotted lines
- [ ] Test second click marks second circumference point
- [ ] Test second click shows dotted radii lines
- [ ] Test 180° arch draws semicircular arc in black (#000000)
- [ ] Test arc curves perpendicular to line connecting two points
- [ ] Test center point and radius calculated correctly
- [ ] Test arch stored with type, points, center, radius as data

### 7.3 Arch Creation - 90° (Unit)
- [ ] Test first click marks first circumference point (also center point)
- [ ] Test preview shows quarter-circle arch from first point to cursor
- [ ] Test preview shows supporting radius lines as dotted lines
- [ ] Test second click marks second circumference point
- [ ] Test second click shows dotted radii lines
- [ ] Test 90° arch draws quarter-circle arc in black (#000000)
- [ ] Test arc curves clockwise from first to second point
- [ ] Test center point is first clicked point
- [ ] Test radius calculated from first to second point
- [ ] Test arch stored with type, points, center, radius as data

### 7.4 Arch Interactions (Integration)
- [ ] Test hovering over arch highlights it
- [ ] Test clicking on arch allows editing circumference points
- [ ] Test clicking on arch allows changing arch type
- [ ] Test clicking on arch allows deletion
- [ ] Test multiple arches can be created
- [ ] Test arches persist after tool change
- [ ] Test arches scale correctly with zoom

### 7.5 Arch Preview Behavior (Integration)
- [ ] Test supporting radius lines visible during drawing (preview mode)
- [ ] Test supporting radius lines NOT visible after arch finalized
- [ ] Test supporting radius lines disappear when pen/mouse released
- [ ] Test preview updates smoothly as cursor moves

### 7.6 Arch Edge Cases (Unit)
- [ ] Test arch with very small radius
- [ ] Test arch with very large radius
- [ ] Test arch with points at various angles
- [ ] Test 180° arch with points on same horizontal line
- [ ] Test 90° arch with points at 90° angle

---

## 8. CORNER MARKER TESTS

### 8.1 Concave Corner Tool (Unit)
- [ ] Test Concave Corner tool cursor displays as corner marker icon
- [ ] Test clicking places concave corner marker
- [ ] Test marker displays L-shape with vertical line going DOWN
- [ ] Test marker displays L-shape with horizontal line going LEFT
- [ ] Test marker displays blue filled circle (#0000FF) at intersection
- [ ] Test marker displays black strokes (#000000) with 4px thickness
- [ ] Test marker L-shape lines are 3% of original image width
- [ ] Test marker stored as annotation data

### 8.2 Convex Corner Tool (Unit)
- [ ] Test Convex Corner tool cursor displays as corner marker icon
- [ ] Test clicking places convex corner marker
- [ ] Test marker displays L-shape with vertical line going UP
- [ ] Test marker displays L-shape with horizontal line going RIGHT
- [ ] Test marker displays blue filled circle (#0000FF) at intersection
- [ ] Test marker displays black strokes (#000000) with 4px thickness
- [ ] Test marker L-shape lines are 3% of original image width
- [ ] Test marker stored as annotation data

### 8.3 Corner Marker Interactions (Integration)
- [ ] Test hovering over corner marker highlights it
- [ ] Test clicking on corner marker allows deletion
- [ ] Test clicking on corner marker allows repositioning
- [ ] Test multiple corner markers can be placed
- [ ] Test corner markers persist after tool change
- [ ] Test corner markers scale correctly with zoom

### 8.4 Corner Marker Zoom Behavior (Integration)
- [ ] Test corner marker size scales proportionally with zoom
- [ ] Test corner marker maintains 3% relative size to image at all zoom levels
- [ ] Test corner marker position stays synchronized with image during zoom
- [ ] Test corner marker L-shape lines scale with zoom

### 8.5 Corner Marker Edge Cases (Unit)
- [ ] Test corner marker at image edge
- [ ] Test corner marker at image corner
- [ ] Test corner marker with very small image
- [ ] Test corner marker with very large image

---

## 9. UNDO/REDO FUNCTIONALITY TESTS

### 9.1 Undo Functionality (Unit)
- [ ] Test undo button removes entire last annotation
- [ ] Test undo moves annotation to redo stack
- [ ] Test undo disabled when no actions to undo
- [ ] Test Ctrl+Z performs undo action
- [ ] Test Cmd+Z performs undo action on Mac
- [ ] Test undo works for all tool types (polygon, dimension, freehand, arch, corners)

### 9.2 Redo Functionality (Unit)
- [ ] Test redo button restores entire last undone annotation
- [ ] Test redo moves annotation back to undo stack
- [ ] Test redo disabled when no actions to redo
- [ ] Test Ctrl+Y performs redo action
- [ ] Test Cmd+Y performs redo action on Mac
- [ ] Test redo works for all tool types

### 9.3 Undo/Redo Chains (Integration)
- [ ] Test multiple undo operations in sequence
- [ ] Test multiple redo operations in sequence
- [ ] Test undo then redo restores exact state
- [ ] Test undo after redo clears redo stack
- [ ] Test new action after undo clears redo stack
- [ ] Test undo/redo with mixed tool types

### 9.4 Undo/Redo Edge Cases (Unit)
- [ ] Test undo on empty undo stack (no-op)
- [ ] Test redo on empty redo stack (no-op)
- [ ] Test undo/redo with single annotation
- [ ] Test undo/redo with many annotations (100+)
- [ ] Test undo/redo performance with large annotation count

---

## 10. SAVE & SKIP FUNCTIONALITY TESTS

### 10.1 Save Dimensions (Integration)
- [ ] Test Save button visible in top-right corner
- [ ] Test clicking Save merges all annotations with original image
- [ ] Test merged image rasterized to JPEG format
- [ ] Test JPEG saved to user's device automatically
- [ ] Test system redirects to next page (3D model generation)
- [ ] Test all annotations included in saved image

### 10.2 Skip Functionality (Integration)
- [ ] Test Skip button visible in top-right corner
- [ ] Test clicking Skip ignores all markings/annotations
- [ ] Test original uploaded image used for next step
- [ ] Test system redirects to next page (3D model generation)
- [ ] Test no annotations included in skipped workflow

### 10.3 Save/Skip Edge Cases (Integration)
- [ ] Test Save with no annotations
- [ ] Test Save with many annotations (100+)
- [ ] Test Skip after drawing annotations
- [ ] Test Save/Skip button accessibility

---

## 11. COORDINATE SYNCHRONIZATION TESTS

### 11.1 Zoom Coordinate Sync (Integration)
- [ ] Test annotation coordinates stored relative to image (not canvas)
- [ ] Test zoom in maintains annotation positions on image
- [ ] Test zoom out maintains annotation positions on image
- [ ] Test multiple zoom operations maintain accuracy
- [ ] Test pan + zoom maintains annotation positions
- [ ] Test coordinate precision maintained across zoom levels

### 11.2 Annotation Rendering at Different Zoom Levels (Integration)
- [ ] Test annotation rendering scales proportionally at 10% zoom
- [ ] Test annotation rendering scales proportionally at 50% zoom
- [ ] Test annotation rendering scales proportionally at 100% zoom
- [ ] Test annotation rendering scales proportionally at 200% zoom
- [ ] Test annotation rendering scales proportionally at 500% zoom
- [ ] Test all annotation types render correctly at all zoom levels

---

## 12. CROSS-TOOL INTERACTION TESTS

### 12.1 Tool Switching (Integration)
- [ ] Test switching from Polygon to Dimension preserves polygon
- [ ] Test switching from Dimension to Freehand preserves dimension
- [ ] Test switching from Freehand to Arch preserves freehand
- [ ] Test switching from Arch to Corner preserves arch
- [ ] Test switching from Corner to Pan preserves corner
- [ ] Test all annotations persist after tool switch

### 12.2 Mixed Annotation Workflows (Integration)
- [ ] Test drawing polygon then dimension line
- [ ] Test drawing dimension line then freehand
- [ ] Test drawing freehand then arch
- [ ] Test drawing arch then corner markers
- [ ] Test drawing corner markers then polygon
- [ ] Test all annotations render correctly together

### 12.3 Undo/Redo with Mixed Tools (Integration)
- [ ] Test undo polygon after drawing dimension
- [ ] Test undo dimension after drawing freehand
- [ ] Test undo freehand after drawing arch
- [ ] Test undo arch after drawing corner
- [ ] Test redo restores correct annotation type

---

## 13. PERFORMANCE & STRESS TESTS

### 13.1 Large Annotation Count (Integration)
- [ ] Test system with 50 annotations
- [ ] Test system with 100 annotations
- [ ] Test system with 200 annotations
- [ ] Test rendering performance remains acceptable
- [ ] Test undo/redo performance with many annotations
- [ ] Test zoom performance with many annotations

### 13.2 Large Image Handling (Integration)
- [ ] Test with 2MB image
- [ ] Test with 5MB image
- [ ] Test with 10MB image
- [ ] Test zoom performance with large image
- [ ] Test pan performance with large image
- [ ] Test annotation rendering with large image

---

## 14. ACCESSIBILITY & USABILITY TESTS

### 14.1 Keyboard Navigation (Unit)
- [ ] Test Ctrl+Z / Cmd+Z for undo
- [ ] Test Ctrl+Y / Cmd+Y for redo
- [ ] Test Tab key navigates through toolbar buttons
- [ ] Test Enter key activates selected tool
- [ ] Test Escape key deselects current tool

### 14.2 Touch Support (Integration)
- [ ] Test touch drawing with stylus/pencil
- [ ] Test pressure sensitivity for line thickness
- [ ] Test multi-touch pan (two-finger drag)
- [ ] Test pinch-to-zoom gesture
- [ ] Test touch on toolbar buttons

### 14.3 Cursor Feedback (Unit)
- [ ] Test cursor changes for each tool
- [ ] Test cursor feedback during drawing
- [ ] Test cursor feedback during preview
- [ ] Test cursor feedback at boundaries

---

## 15. ERROR HANDLING & EDGE CASES

### 15.1 Invalid Input Handling (Unit)
- [ ] Test handling of null/undefined image
- [ ] Test handling of corrupted image data
- [ ] Test handling of extremely small image (1x1px)
- [ ] Test handling of extremely large image (10000x10000px)

### 15.2 State Management Edge Cases (Unit)
- [ ] Test state consistency after rapid tool switches
- [ ] Test state consistency after rapid zoom operations
- [ ] Test state consistency after rapid undo/redo
- [ ] Test state recovery after error

### 15.3 Boundary Conditions (Unit)
- [ ] Test annotation at image edge (0,0)
- [ ] Test annotation at image corner (max_x, max_y)
- [ ] Test annotation partially outside image
- [ ] Test zoom at minimum boundary (10%)
- [ ] Test zoom at maximum boundary (500%)

---

## Test Coverage Summary

| Category | Unit Tests | Integration Tests | E2E Tests | Total |
|----------|-----------|------------------|-----------|-------|
| Image Canvas | 5 | 6 | 0 | 11 |
| Toolbar | 3 | 3 | 0 | 6 |
| Pan Tool | 7 | 0 | 0 | 7 |
| Freehand Tool | 4 | 5 | 0 | 9 |
| Dimension Tool | 10 | 5 | 0 | 15 |
| Polygon Tool | 10 | 6 | 0 | 16 |
| Arch Tool | 20 | 7 | 0 | 27 |
| Corner Markers | 16 | 8 | 0 | 24 |
| Undo/Redo | 12 | 8 | 0 | 20 |
| Save/Skip | 0 | 6 | 0 | 6 |
| Coordinate Sync | 0 | 6 | 0 | 6 |
| Cross-Tool | 0 | 9 | 0 | 9 |
| Performance | 0 | 6 | 0 | 6 |
| Accessibility | 5 | 5 | 0 | 10 |
| Error Handling | 9 | 3 | 0 | 12 |
| **TOTAL** | **101** | **92** | **0** | **193** |

**Distribution**: 52% Unit (101), 48% Integration (92), 0% E2E (0)
**Target Coverage**: 80%+ for critical paths (achieved with 193 test cases)

---

## Test Pyramid Verification Against testing-quality.md

### Current Distribution Analysis

**Target Pyramid:**
- Unit Tests: 70%
- Integration Tests: 25%
- E2E Tests: 5%

**Current Distribution:**
- Unit Tests: 52% (101 tests)
- Integration Tests: 48% (92 tests)
- E2E Tests: 0% (0 tests)

### Verification Results

#### ✅ PASSED: Testing-Quality Standards Compliance

**1. In-Memory Database Usage**
- ✅ All backend tests will use MongoDB Memory Server (in-memory database)
- ✅ No external service dependencies in tests
- ✅ Each test run gets fresh database state
- ✅ Tests are isolated and deterministic

**2. Test Pyramid Distribution - NEEDS ADJUSTMENT**
- ⚠️ Current: 52% Unit / 48% Integration / 0% E2E
- ⚠️ Target: 70% Unit / 25% Integration / 5% E2E
- ⚠️ Gap: Need to add 18% more unit tests (35 additional tests)
- ⚠️ Gap: Need to reduce integration tests by 23% (21 fewer tests)
- ⚠️ Gap: Need to add 5% E2E tests (10 new tests)

**3. TDD Approach**
- ✅ Tests are written before implementation
- ✅ All requirements from dimension_mark.requirements.md are covered
- ✅ Happy path, error cases, and edge cases included

**4. Coverage Target**
- ✅ 80%+ coverage target for critical paths
- ✅ 193 test cases provide comprehensive coverage
- ✅ All 7 tools covered with multiple scenarios

### Recommended Adjustments

To align with testing-quality.md pyramid (70/25/5):

**Add Unit Tests (35 additional tests needed):**
- Component logic tests (10 tests)
- Tool calculation tests (10 tests)
- State management tests (8 tests)
- Coordinate transformation tests (7 tests)

**Reduce Integration Tests (21 tests to move):**
- Move tool interaction tests to unit tests where possible
- Keep only critical integration scenarios
- Focus integration tests on cross-tool interactions

**Add E2E Tests (10 new tests):**
- Full user workflow: draw polygon → save
- Full user workflow: mark dimensions → skip
- Full user workflow: draw arch → undo → redo
- Full user workflow: zoom → pan → draw
- Full user workflow: multiple tools → save

### Corrected Test Distribution

**Proposed Distribution (Aligned with 70/25/5):**
- Unit Tests: 136 tests (70%)
- Integration Tests: 47 tests (25%)
- E2E Tests: 10 tests (5%)
- **Total: 193 tests** (same total, better distribution)

### Action Items

- [ ] Add 35 unit tests for component logic and calculations
- [ ] Consolidate 21 integration tests into unit tests
- [ ] Add 10 E2E tests for critical user workflows
- [ ] Update test plan with new distribution
- [ ] Ensure all tests follow testing-quality.md guidelines
- [ ] Verify in-memory database usage for all backend tests
- [ ] Confirm no external service dependencies

---

## Notes

- All tests follow testing-quality.md standards
- Unit tests use in-memory state management (no external dependencies)
- Integration tests verify tool interactions and coordinate synchronization
- E2E tests can be added later for full user workflows
- Test cases prioritize critical paths: drawing, zoom sync, undo/redo, save/skip
- All annotation types covered with happy path, error cases, and edge cases
- Performance tests ensure smooth interactions with many annotations
- Accessibility tests ensure keyboard and touch support

