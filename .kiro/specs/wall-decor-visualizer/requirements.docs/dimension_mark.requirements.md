# Dimension Marking Requirements - Wall Decor Visualizer

## Introduction

This document contains all requirements related to dimension marking functionality for the Wall Decor Visualizer application. Dimension marking allows users to annotate wall images with measurements that will be used for 3D model generation. The interface provides a centered image canvas with zoom controls and multiple drawing tools for marking dimensions, creating polygons, and marking architectural features.

**Important Note:** All dimension marking functionality (drawing, editing, undo/redo) is implemented entirely on the frontend. No backend API calls are made during the marking process. All annotations, measurements, and tool interactions are handled client-side using in-memory state management. However, the Save and Skip actions will make backend API calls to persist or skip the dimension data (backend implementation to be defined separately).

## Glossary

- **Wall_Image**: A 2D photograph or image of a wall surface provided by the user
- **Image_Canvas**: The centered viewport area where the Wall_Image is displayed and can be annotated
- **Dimension_Marker**: A visual annotation placed on the Wall_Image to indicate measurements (width, height, depth)
- **Dimension_Line**: A double-headed arrow drawn between two points showing measurement location (no automatic labels displayed)
- **Dimension_Data**: Extracted numerical values and positions from Dimension_Markers
- **Dimension_Validator**: Component that validates dimension markings for consistency and completeness
- **Image_Display**: Component that renders uploaded images in the editor viewport
- **Zoom_Controller**: Component that manages zoom in/out functionality for the image canvas (10% to 500% range)
- **Tool_Selector**: UI component that displays a floating, draggable toolbar allowing users to select different marking tools in order: Polygon, Dimension, Freehand, Arch, Concave Corner, Convex Corner, Pan
- **Pan_Tool**: Tool for moving/panning the image within the canvas (default active tool)
- **Freehand_Tool**: Tool for drawing freehand lines with pencil or mouse (shows stroke in real-time)
- **Dimension_Tool**: Tool for creating dimension lines by clicking two points (draws double-headed arrows without labels)
- **Polygon_Tool**: Tool for creating closed polygons by clicking multiple points (bright red color with filled circles at vertices)
- **Concave_Corner_Tool**: Tool for marking concave corners on the wall (blue dot at intersection with black L-shape: down and left lines)
- **Convex_Corner_Tool**: Tool for marking convex corners on the wall (blue dot at intersection with black L-shape: up and right lines)
- **Arch_Tool**: Tool for marking arches on the wall with selectable arch types (180° or 90°)
- **Arch_180**: A semicircular arch spanning 180 degrees
- **Arch_90**: A quarter-circle arch spanning 90 degrees
- **Arch_Marker**: Visual annotation representing an arch with its type, two circumference points, calculated center point, radius, and dotted radii lines
- **Marked_Section**: A region on the wall image that has been designated for a specific item type
- **Save_Dimensions_Button**: Button to save all marked dimensions and annotations (calls backend API)
- **Skip_Button**: Button to skip dimension marking and proceed to next step (calls backend API)
- **Undo_Button**: Button to remove the entire last annotation/stroke made
- **Redo_Button**: Button to restore the last undone annotation/stroke

---

## Requirements

### Requirement 1: Image Canvas Display and Centering

**User Story:** As a user, I want the uploaded wall image to be displayed in the center of the page, so that I can easily view and annotate it.

#### Acceptance Criteria

1. WHEN a wall image is loaded, THE Image_Canvas SHALL display the image centered in the viewport
2. WHEN the image is displayed, THE Image_Canvas SHALL maintain the original aspect ratio of the image
3. WHEN the viewport is resized, THE Image_Canvas SHALL keep the image centered
4. WHEN the image is smaller than the viewport, THE Image_Canvas SHALL display it at actual size
5. WHEN the image is larger than the viewport, THE Image_Canvas SHALL scale it to fit within the viewport while maintaining aspect ratio
6. WHEN the image is displayed, THE Image_Canvas SHALL show the current zoom level percentage (e.g., "100%")

---

### Requirement 1.1: Zoom In and Zoom Out Controls

**User Story:** As a user, I want to zoom in and out on the wall image, so that I can view details or see the entire image for marking dimensions.

#### Acceptance Criteria

1. WHEN the dimension marking page loads, THE Zoom_Controller SHALL display zoom in and zoom out buttons near the image
2. WHEN the user clicks the zoom in button, THE Zoom_Controller SHALL increase the image scale by 10%
3. WHEN the user clicks the zoom out button, THE Zoom_Controller SHALL decrease the image scale by 10%
4. WHEN the user scrolls the mouse wheel over the image, THE Zoom_Controller SHALL zoom in (scroll up) or zoom out (scroll down)
5. WHEN zooming, THE Zoom_Controller SHALL maintain the center point of the zoom at the mouse cursor position
6. WHEN the zoom level reaches 10%, THE Zoom_Controller SHALL prevent further zooming out
7. WHEN the zoom level reaches 500%, THE Zoom_Controller SHALL prevent further zooming in
8. WHEN the zoom level changes, THE Zoom_Controller SHALL display the current zoom percentage
9. WHEN the image is zoomed beyond viewport size, THE Pan_Tool SHALL allow panning to view different areas
10. WHEN the zoom level changes, THE system SHALL maintain all annotation coordinates relative to the image, ensuring markings stay at exactly the same position on the image as before the zoom
11. WHEN annotations are displayed at any zoom level, THE system SHALL scale the annotation rendering (lines, arrows, circles, text) proportionally with the image zoom level
12. WHEN zooming in or out, THE system SHALL preserve the exact pixel coordinates of all annotations relative to the image, so that markings remain synchronized with the image content

---

### Requirement 1.2: Tool Selection Interface

**User Story:** As a user, I want to select different marking tools from a toolbar, so that I can use various annotation methods on the wall image.

#### Acceptance Criteria

1. WHEN the dimension marking page loads, THE Tool_Selector SHALL display a floating toolbar with available tools in the following exact order: Polygon, Dimension, Freehand, Arch, Concave Corner, Convex Corner, and Pan
2. WHEN the toolbar is displayed, THE Tool_Selector SHALL render it as a floating panel that overlays the image canvas
3. WHEN the toolbar is displayed, THE Tool_Selector SHALL minimize the space occupied by the toolbar while maintaining usability
4. WHEN each tool button is displayed, THE Tool_Selector SHALL show both an icon and text label for the tool to ensure clarity
5. WHEN each tool button is displayed, THE Tool_Selector SHALL ensure the button is easily clickable with sufficient touch/click target size (minimum 44x44 pixels or equivalent)
6. WHEN the toolbar is rendered, THE Tool_Selector SHALL use compact spacing and layout to minimize overall toolbar dimensions
7. WHEN the user clicks and drags the toolbar header or title bar, THE Tool_Selector SHALL allow the user to reposition the toolbar anywhere on the screen
8. WHEN the toolbar is dragged, THE Tool_Selector SHALL move the toolbar smoothly following the cursor position
9. WHEN the user releases the mouse button, THE Tool_Selector SHALL fix the toolbar at the new position
10. WHEN the toolbar is repositioned, THE Tool_Selector SHALL remember the position for the current session
11. WHEN the user clicks on a tool, THE Tool_Selector SHALL highlight the selected tool
12. WHEN a tool is selected, THE Tool_Selector SHALL deselect any previously selected tool
13. WHEN the Pan tool is selected, THE Tool_Selector SHALL change the cursor to a hand icon
14. WHEN the Freehand tool is selected, THE Tool_Selector SHALL change the cursor to a pencil icon
15. WHEN the Dimension tool is selected, THE Tool_Selector SHALL change the cursor to a crosshair
16. WHEN the Polygon tool is selected, THE Tool_Selector SHALL change the cursor to a crosshair
17. WHEN the Concave Corner tool is selected, THE Tool_Selector SHALL change the cursor to a corner marker icon
18. WHEN the Convex Corner tool is selected, THE Tool_Selector SHALL change the cursor to a corner marker icon
19. WHEN the Arch tool is selected, THE Tool_Selector SHALL change the cursor to an arch marker icon
20. WHEN no tool is selected, THE Tool_Selector SHALL default to the Pan tool
21. WHEN the toolbar is dragged near the edge of the viewport, THE Tool_Selector SHALL prevent the toolbar from being positioned outside the visible area

---

### Requirement 1.3: Pan Tool Functionality

**User Story:** As a user, I want to pan the image when it's zoomed in, so that I can view different areas of the wall.

#### Acceptance Criteria

1. WHEN the Pan tool is selected, THE Pan_Tool SHALL allow the user to click and drag the image
2. WHEN the user clicks and drags with the Pan tool, THE Pan_Tool SHALL move the image in the direction of the drag
3. WHEN the user releases the mouse button, THE Pan_Tool SHALL stop panning
4. WHEN the image is at actual size or smaller than viewport, THE Pan_Tool SHALL not allow panning
5. WHEN the image is panned to the edge, THE Pan_Tool SHALL prevent panning beyond the image boundaries
6. WHEN the Pan tool is active, THE Pan_Tool SHALL not create any annotations on the image
7. WHEN the dimension marking page loads, THE Pan_Tool SHALL be the default active tool

---

### Requirement 1.4: Annotation Color Scheme

**User Story:** As a user, I want different annotation types to have distinct colors, so that I can easily distinguish between polygons and other markings.

#### Acceptance Criteria

1. WHEN a freehand line is drawn, THE Freehand_Tool SHALL render the line in black color (#000000)
2. WHEN a dimension line is created, THE Dimension_Tool SHALL render the line and arrows in black color (#000000)
3. WHEN a polygon is created, THE Polygon_Tool SHALL render the polygon boundary in bright red color (#FF0000)
4. WHEN a polygon is filled, THE Polygon_Tool SHALL use a semi-transparent bright red fill (rgba(255, 0, 0, 0.2))
5. WHEN a concave corner marker is placed, THE Concave_Corner_Tool SHALL render the center indicator (filled circle) in blue color (#0000FF) and the two side strokes in black color (#000000)
6. WHEN a convex corner marker is placed, THE Convex_Corner_Tool SHALL render the center indicator (inward arrow) in blue color (#0000FF) and the two side strokes in black color (#000000)
7. WHEN an arch is created, THE Arch_Tool SHALL render both the arch curve and the supporting radii lines in black color (#000000). For 90 degree arch two supporting radii lines and for 180 degree arch one straight centre line
8. WHEN annotations are highlighted on hover, THE system SHALL use a brighter or thicker version of the annotation's base color
9. WHEN annotations are selected, THE system SHALL display selection handles in a contrasting color (e.g., blue or white)
10. WHEN polygon vertices are displayed, THE Polygon_Tool SHALL render filled circles at each vertex in bright red color (#FF0000)

---

### Requirement 1.5: Freehand Drawing Tool

**User Story:** As a user, I want to draw freehand lines on the image using a pencil or mouse, so that I can mark areas or make notes.

#### Acceptance Criteria

1. WHEN the Freehand tool is selected, THE Freehand_Tool SHALL allow the user to draw by clicking and dragging
2. WHEN the user clicks and drags with the Freehand tool, THE Freehand_Tool SHALL draw a continuous black line following the mouse/pencil movement
3. WHEN the user drags with the Freehand tool, THE Freehand_Tool SHALL display the stroke in real-time as the user draws (not only when the mouse button is released)
4. WHEN the user releases the mouse button, THE Freehand_Tool SHALL complete the freehand line
5. WHEN a freehand line is drawn, THE Freehand_Tool SHALL store the line coordinates as annotation data
6. WHEN the user hovers over a freehand line, THE Freehand_Tool SHALL highlight the line
7. WHEN the user clicks on a freehand line, THE Freehand_Tool SHALL allow deletion of the line
8. WHEN drawing with a stylus/pencil, THE Freehand_Tool SHALL support pressure sensitivity for line thickness (if device supports it)

---

### Requirement 2: Dimension Line Tool

**User Story:** As a user, I want to create dimension lines by clicking two points on the image, so that I can mark measurements on the wall.

#### Acceptance Criteria

1. WHEN the Dimension tool is selected, THE Dimension_Tool SHALL display a crosshair cursor
2. WHEN the user clicks the first point, THE Dimension_Tool SHALL mark the starting point with a visible indicator
3. WHEN the user moves the mouse after clicking the first point, THE Dimension_Tool SHALL show a preview line from the first point to the cursor
4. WHEN the user clicks the second point, THE Dimension_Tool SHALL create a dimension line between the two points in black color
5. WHEN a dimension line is created, THE Dimension_Tool SHALL draw a arrow between the two points with arrowheads at both endpoints pointing towards the line
6. WHEN drawing arrow heads, THE Dimension_Tool SHALL render them as open arrowheads (not filled) with a 50-degree opening angle
7. WHEN a dimension line is created, THE Dimension_Tool SHALL NOT automatically display any measurement labels or values
9. WHEN the user hovers over a dimension line, THE Dimension_Tool SHALL highlight it
---

### Requirement 2.1: Polygon Creation Tool

**User Story:** As a user, I want to create closed polygons by clicking multiple points, so that I can mark specific areas or sections on the wall.

#### Acceptance Criteria

1. WHEN the Polygon tool is selected, THE Polygon_Tool SHALL display a crosshair cursor
2. WHEN the user clicks a point, THE Polygon_Tool SHALL place a vertex at that location
3. WHEN a vertex is placed, THE Polygon_Tool SHALL display a filled red circle at that vertex location to mark the point
4. WHEN the user clicks additional points, THE Polygon_Tool SHALL draw bright red lines connecting consecutive vertices
5. WHEN the user moves the mouse after placing a vertex, THE Polygon_Tool SHALL show a preview line from the last vertex to the cursor
6. WHEN the user clicks near the first vertex such that it is clicking within the red circle of the point, THE Polygon_Tool SHALL close the polygon by connecting to that vertex
7. WHEN a polygon is closed, THE Polygon_Tool SHALL fill the polygon with a semi-transparent bright red color (rgba(255, 0, 0, 0.2))
8. WHEN a polygon is closed, THE Polygon_Tool SHALL render the polygon boundary in bright red color (#FF0000)
9. WHEN a polygon is closed, THE Polygon_Tool SHALL calculate and display the area of the polygon
10. WHEN a polygon is created, THE Polygon_Tool SHALL allow the user to assign an Item_Type to the polygon
11. WHEN the user hovers over a polygon, THE Polygon_Tool SHALL highlight the polygon boundary with a brighter red color
13. WHEN editing a polygon, THE Polygon_Tool SHALL allow dragging vertices to new positions
15. WHEN polygon vertices are displayed, THE Polygon_Tool SHALL show filled red circles at each vertex point
16. WHEN drawing a polygon in progress, THE Polygon_Tool SHALL display filled red circles at all placed vertices

---

### Requirement 2.2: Concave and Convex Corner Tools

**User Story:** As a user, I want to mark concave and convex corners on the wall, so that the system can accurately model wall geometry.

#### Acceptance Criteria

1. WHEN the Concave Corner tool is selected, THE Concave_Corner_Tool SHALL display a corner marker cursor
2. WHEN the user clicks on the image with the Concave Corner tool, THE Concave_Corner_Tool SHALL place a concave corner marker at that location
3. WHEN a concave corner is marked, THE Concave_Corner_Tool SHALL display a visual indicator with two thick black strokes forming an L-shape with the vertical line going down and the horizontal line going left, and a blue-colored filled circle (dot) at the intersection point where the two lines meet
4. WHEN the Convex Corner tool is selected, THE Convex_Corner_Tool SHALL display a corner marker cursor
5. WHEN the user clicks on the image with the Convex Corner tool, THE Convex_Corner_Tool SHALL place a convex corner marker at that location
6. WHEN a convex corner is marked, THE Convex_Corner_Tool SHALL display a visual indicator with two thick black strokes forming an L-shape with the vertical line going up and the horizontal line going right, and a blue-colored filled circle (dot) at the intersection point where the two lines meet
7. WHEN corner markers are displayed, THE corner tool SHALL render the blue dot at the intersection in blue color (#0000FF or similar blue)
8. WHEN corner markers are displayed, THE corner tool SHALL render the two side strokes in black color (#000000) with thick line width (4px or similar)
9. WHEN corner markers are displayed, THE corner tool SHALL size each corner marker's L-shape lines to be 3% of the original image width (not the canvas or zoomed size)
10. WHEN the zoom level changes, THE corner tool SHALL scale the corner marker size proportionally with the zoom level to maintain the 3% relative size to the image
11. WHEN the user hovers over a corner marker, THE corner tool SHALL highlight the marker
12. WHEN the user clicks on a corner marker, THE corner tool SHALL allow deletion or repositioning of the marker
13. WHEN corner markers are placed, THE corner tool SHALL store the corner type and coordinates as annotation data
14. WHEN a concave corner is displayed, THE Concave_Corner_Tool SHALL draw the vertical line downward and the horizontal line leftward from the intersection point, with a blue dot at the intersection
15. WHEN a convex corner is displayed, THE Convex_Corner_Tool SHALL draw the vertical line upward and the horizontal line rightward from the intersection point, with a blue dot at the intersection

---

### Requirement 2.3: Arch Marking Tool

**User Story:** As a user, I want to mark arches on the wall with different arch types (180° or 90°), so that the system can accurately model architectural features.

#### Acceptance Criteria

1. WHEN the Arch tool is selected, THE Arch_Tool SHALL display an arch type selector with options for "180° Arch" and "90° Arch"
2. WHEN the user selects an arch type, THE Arch_Tool SHALL highlight the selected arch type
3. WHEN the 180° Arch type is selected, THE Arch_Tool SHALL prepare to create a semicircular arch
4. WHEN the 90° Arch type is selected, THE Arch_Tool SHALL prepare to create a quarter-circle arch
5. WHEN the user clicks the first point with the Arch tool, THE Arch_Tool SHALL mark the first point on the circumference of the arch
6. WHEN the user moves the mouse after clicking the first point, THE Arch_Tool SHALL show a preview of the arch from the first point to the cursor position
7. WHEN the user is drawing an arch (moment they click first clic), THE Arch_Tool SHALL display the supporting radius lines as dotted lines in the preview
8. WHEN the user clicks the second point, THE Arch_Tool SHALL mark the second point on the circumference of the arch and also mark dotted radii lines.
9. WHEN both points are marked, THE Arch_Tool SHALL calculate the arch that passes through both circumference points based on the selected arch type
10. WHEN a 180° arch is created, THE Arch_Tool SHALL draw a semicircular arc between the two circumference points in black color (#000000), with the arc curving in the direction perpendicular to the line connecting the two points
11. WHEN a 90° arch is created, THE Arch_Tool SHALL draw a quarter-circle arc between the two circumference points in black color (#000000), with the first clicked point serving as both a circumference point and the center point of the circle
12. WHEN a 90° arch is created, THE Arch_Tool SHALL orient the quarter-circle such that the arc curves from the first point to the second point in a clockwise direction
13. WHEN an arch is created, THE Arch_Tool SHALL automatically determine the center point and radius based on the two circumference points and arch type
14. WHEN an arch is finalized, THE Arch_Tool SHALL store the arch type (180° or 90°), the two circumference points, calculated center point, radius, and orientation as Arch_Marker data
15. WHEN the user hovers over an arch marker, THE Arch_Tool SHALL highlight the arch
16. WHEN the user clicks on an arch marker, THE Arch_Tool SHALL allow editing the circumference points, changing the arch type, or deleting the arch
17. WHEN multiple arches are created, THE Arch_Tool SHALL display all arches with their respective types
18. WHEN the user is in the process of drawing an arch (preview mode), THE supporting radius lines SHALL be visible as dotted lines
19. WHEN the arch drawing is complete (pen/mouse is released after second click), THE supporting radius lines SHALL no longer be visible

---

### Requirement 3.1: Save and Skip Actions

**User Story:** As a user, I want to save my dimension markings or skip this step, so that I can proceed with the workflow.

#### Acceptance Criteria

1. WHEN the dimension marking page loads, THE UI SHALL display "Save Dimensions" and "Skip" buttons in the top-right corner
2. WHEN the user clicks "Save Dimensions", THE system SHALL create all merge all annotaions and markings and original image - rasterize in jpeg and save the image in users device automatically. Also move to next page where this image will be used. 
4. THE system SHALL redirect the user to the next step (3D model generation)
5. WHEN the user clicks "Skip", THE system SHALL use the input image only , ignore all markings / annotaion and just use the original uploaded image to move to next page where image will be used
6. THE system SHALL redirect the user to the next step (3D model generation)

---

### Requirement 3.2: Undo and Redo Functionality

**User Story:** As a user, I want to undo and redo my marking actions, so that I can correct mistakes without starting over.

#### Acceptance Criteria

1. WHEN the dimension marking page loads, THE UI SHALL display undo and redo buttons in the toolbar
2. WHEN the user creates any annotation (dimension line, polygon, corner marker, freehand line, arch), THE system SHALL add the entire annotation as a single action to the undo stack
3. WHEN the user clicks the undo button, THE system SHALL remove the entire last stroke/annotation and move it to the redo stack
4. WHEN the user clicks the redo button, THE system SHALL restore the entire last undone stroke/annotation
5. WHEN there are no actions to undo, THE undo button SHALL be disabled
6. WHEN there are no actions to redo, THE redo button SHALL be disabled
7. WHEN the user performs a new action after undoing, THE redo stack SHALL be cleared
8. WHEN the user presses Ctrl+Z (or Cmd+Z on Mac), THE system SHALL perform an undo action
9. WHEN the user presses Ctrl+Y (or Cmd+Y on Mac), THE system SHALL perform a redo action
10. WHEN undo is triggered, THE system SHALL remove the entire last annotation/stroke (not individual points or segments)

---

## Summary of Key Requirements

### Frontend-Only Implementation
- All marking, drawing, editing, and undo/redo operations are handled entirely on the frontend
- No backend API calls during annotation process
- Only Save and Skip buttons trigger backend API calls

### Tool Order (Exact Sequence)
1. Polygon
2. Dimension
3. Freehand
4. Arch
5. Concave Corner
6. Convex Corner
7. Pan (default active)

### Color Scheme
- **Polygons**: Bright red (#FF0000) with semi-transparent fill (rgba(255, 0, 0, 0.2))
- **Dimension lines**: Black (#000000) with double-headed open arrows (50-degree angle) pointing inward
- **Freehand lines**: Black (#000000)
- **Arches**: Black (#000000) arc curve only; supporting dotted radii lines visible only during drawing (preview mode), not on finalized arches
- **Concave corners**: Blue dot (#0000FF) at intersection + black L-shape strokes (#000000, 4px thick) going down and left
- **Convex corners**: Blue dot (#0000FF) at intersection + black L-shape strokes (#000000, 4px thick) going up and right

### Zoom Behavior
- Range: 10% to 500%
- Increment: 10% per click
- Annotations must stay synchronized with image at all zoom levels
- Coordinates stored relative to image, not canvas

### Polygon Behavior
- Filled red circles at each vertex
- Closes when clicking near first vertex (within 10 pixels)
- Real-time preview line to cursor

### Dimension Line Behavior
- Double-headed arrows only (no automatic labels)
- Arrow heads point inward (towards the line)
- Arrow heads are open (not filled) with 50-degree opening angle
- Black color

### Freehand Behavior
- Real-time stroke display (not only on mouse release)
- Black color

### Arch Behavior
- Two types: 180° (semicircle) and 90° (quarter-circle)
- User clicks two circumference points
- System calculates center and radius
- Supporting radius lines (dotted) and solid black arc curve is visible 

### Corner Markers
- Concave: Blue dot at intersection + black L-shape (down and left lines, 4px thick)
- Convex: Blue dot at intersection + black L-shape (up and right lines, 4px thick)
- Both have blue filled circle at the intersection point where the two lines meet
- Size: L-shape lines are 3% of the original image width, scaled proportionally with zoom

### Toolbar
- Floating and draggable
- Position remembered for session
- Cannot be dragged outside visible area
- Minimizes space while maintaining usability
- Each tool button shows both icon and text label
- Minimum clickable size: 44x44 pixels for accessibility
- Compact spacing and layout

### Undo/Redo
- Removes/restores entire annotations (not individual points)
- Keyboard shortcuts: Ctrl+Z / Ctrl+Y (Cmd on Mac)
- Buttons disabled when stacks are empty

---
