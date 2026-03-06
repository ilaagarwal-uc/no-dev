# Dimension Marking - TypeScript Interfaces and Data Structures

**Feature**: Dimension Marking Tool for Wall Decor Visualizer
**Created**: 2026-03-06
**Purpose**: Define all TypeScript interfaces, data structures, and API contracts for dimension marking annotations

---

## Table of Contents

1. [Coordinate System](#coordinate-system)
2. [Base Annotation Interface](#base-annotation-interface)
3. [Annotation Type Definitions](#annotation-type-definitions)
4. [Polygon Annotation](#polygon-annotation)
5. [Dimension Line Annotation](#dimension-line-annotation)
6. [Freehand Annotation](#freehand-annotation)
7. [Arch Annotation](#arch-annotation)
8. [Corner Annotations](#corner-annotations)
9. [API Request/Response Contracts](#api-requestresponse-contracts)
10. [Validation Rules](#validation-rules)
11. [Color Scheme Reference](#color-scheme-reference)
12. [Examples](#examples)

---

## Coordinate System

### Overview
All coordinates in the dimension marking system are stored relative to the **original image dimensions**, not the canvas or zoomed viewport. This ensures that annotations remain synchronized with the image content regardless of zoom level or pan offset.

### Coordinate Format
```typescript
interface IPoint {
  x: number;  // Horizontal position (0 = left edge of image)
  y: number;  // Vertical position (0 = top edge of image)
}
```

### Coordinate Constraints
- **Valid Range**: `x >= 0` and `y >= 0`
- **Upper Bounds**: `x < imageWidth` and `y < imageHeight`
- **Type**: Must be numbers (integers or floats)
- **Precision**: Coordinates can be fractional (e.g., 123.45)

### Coordinate Transformation During Zoom
When the zoom level changes, annotation coordinates remain unchanged in image space. The rendering system applies zoom transformations to display annotations at the correct visual size:

```
Canvas Position = Image Position × Zoom Level + Pan Offset
```

---

## Base Annotation Interface

### IAnnotation
The base interface for all annotation types. Every annotation in the system extends this structure.

```typescript
interface IAnnotation {
  /**
   * Unique identifier for this annotation
   * Format: `annotation_${timestamp}_${randomString}`
   * Example: "annotation_1709769600000_a1b2c3d4e"
   */
  id: string;

  /**
   * Type of annotation (determines which data structure is used)
   * One of: 'polygon' | 'dimension' | 'freehand' | 'arch' | 'concave' | 'convex'
   */
  type: AnnotationType;

  /**
   * Annotation-specific data (type depends on annotation type)
   * Can be: IPolygon | IDimension | IFreehand | IArch | IConcaveCorner | IConvexCorner
   */
  data: IPolygon | IDimension | IFreehand | IArch | IConcaveCorner | IConvexCorner;

  /**
   * Timestamp when annotation was created (milliseconds since epoch)
   * Example: 1709769600000
   */
  createdAt: number;

  /**
   * Timestamp when annotation was last modified (milliseconds since epoch)
   * Updated whenever annotation data changes
   */
  updatedAt: number;
}
```

### AnnotationType
Union type representing all possible annotation types.

```typescript
type AnnotationType = 'polygon' | 'dimension' | 'freehand' | 'arch' | 'concave' | 'convex';
```

---

## Annotation Type Definitions

### IPolygon
Represents a closed polygon annotation with multiple vertices.

```typescript
interface IPolygon {
  /**
   * Array of vertices defining the polygon boundary
   * Minimum 3 vertices required to form a valid polygon
   * Vertices are in order (first to last form the boundary)
   * Coordinates are relative to original image dimensions
   */
  vertices: IPoint[];

  /**
   * Calculated area of the polygon in square pixels
   * Calculated using the Shoelace formula
   * Must be > 0 for valid polygon
   */
  area: number;

  /**
   * Boundary color (bright red)
   * Used for polygon outline
   * Literal type ensures consistency
   */
  color: '#FF0000';

  /**
   * Fill color (semi-transparent red)
   * Used for polygon interior fill
   * Literal type ensures consistency
   */
  fillColor: 'rgba(255, 0, 0, 0.2)';
}
```

#### Validation Rules for IPolygon
- `vertices.length >= 3` - Minimum 3 vertices required
- `area > 0` - Polygon must have non-zero area
- All vertex coordinates must be valid (x >= 0, y >= 0)
- All vertices must be within image bounds

#### Rendering Specifications
- **Boundary**: Bright red (#FF0000) line, 2px width
- **Fill**: Semi-transparent red (rgba(255, 0, 0, 0.2))
- **Vertices**: Filled red circles, 6px diameter
- **Hover State**: Brighter red (#FF3333) for boundary

---

### IDimension
Represents a dimension line annotation with two endpoints and arrow heads.

```typescript
interface IDimension {
  /**
   * Starting point of the dimension line
   * Coordinates relative to original image dimensions
   */
  startPoint: IPoint;

  /**
   * Ending point of the dimension line
   * Coordinates relative to original image dimensions
   * Must be different from startPoint
   */
  endPoint: IPoint;

  /**
   * Line color (black)
   * Used for both the line and arrow heads
   * Literal type ensures consistency
   */
  color: '#000000';

  /**
   * Size of arrow heads in pixels
   * Determines the length of arrow head lines
   * Typical value: 12-15 pixels
   * Arrow heads are open (not filled) with 50-degree opening angle
   */
  arrowHeadSize: number;
}
```

#### Validation Rules for IDimension
- `startPoint !== endPoint` - Start and end points must be different
- `arrowHeadSize > 0` - Arrow head size must be positive
- `arrowHeadSize <= 30` - Arrow head size should not exceed 30px
- Both points must be within image bounds

#### Rendering Specifications
- **Line**: Black (#000000), 2px width
- **Arrow Heads**: Open (not filled), 50-degree opening angle, pointing inward toward the line
- **Arrow Head Style**: Two lines forming a V-shape at each endpoint
- **Hover State**: Thicker line (3px) or brighter color

#### Arrow Head Geometry
```
Arrow head at endpoint:
- Two lines extending from the endpoint
- Each line is arrowHeadSize pixels long
- Lines form a 50-degree angle
- Lines point inward toward the dimension line
- Not filled (open style)
```

---

### IFreehand
Represents a freehand drawing annotation with multiple points.

```typescript
interface IFreehand {
  /**
   * Array of points forming the freehand line
   * Minimum 2 points required to form a valid line
   * Points are in drawing order (first to last)
   * Coordinates are relative to original image dimensions
   */
  points: IPoint[];

  /**
   * Line color (black)
   * Used for the freehand stroke
   * Literal type ensures consistency
   */
  color: '#000000';

  /**
   * Stroke width in pixels
   * Determines the thickness of the freehand line
   * Typical value: 2-4 pixels
   */
  strokeWidth: number;
}
```

#### Validation Rules for IFreehand
- `points.length >= 2` - Minimum 2 points required
- `strokeWidth > 0` - Stroke width must be positive
- `strokeWidth <= 20` - Stroke width should not exceed 20px
- All point coordinates must be valid (x >= 0, y >= 0)
- All points must be within image bounds

#### Rendering Specifications
- **Line**: Black (#000000), smooth curve connecting all points
- **Stroke Width**: As specified in strokeWidth property
- **Line Cap**: Round (smooth endpoints)
- **Line Join**: Round (smooth corners)
- **Hover State**: Thicker line or brighter color

---

### IArch
Represents an arch annotation with two circumference points and calculated center/radius.

```typescript
interface IArch {
  /**
   * Type of arch
   * '180': Semicircular arch (180 degrees)
   * '90': Quarter-circle arch (90 degrees)
   */
  type: '180' | '90';

  /**
   * Two points on the circumference of the arch
   * These are the points the user clicked to define the arch
   * Coordinates are relative to original image dimensions
   * Tuple of exactly 2 points
   */
  circumferencePoints: [IPoint, IPoint];

  /**
   * Calculated center point of the arch circle
   * Automatically calculated based on circumference points and arch type
   * Coordinates are relative to original image dimensions
   */
  centerPoint: IPoint;

  /**
   * Calculated radius of the arch circle in pixels
   * Distance from center point to either circumference point
   * Automatically calculated based on circumference points
   */
  radius: number;

  /**
   * Arc color (black)
   * Used for the arch curve
   * Literal type ensures consistency
   */
  color: '#000000';
}
```

#### Validation Rules for IArch
- `type` must be either '180' or '90'
- `circumferencePoints.length === 2` - Exactly 2 circumference points required
- `circumferencePoints[0] !== circumferencePoints[1]` - Points must be different
- `radius > 0` - Radius must be positive
- All points must be within image bounds
- Center point must be calculable from circumference points

#### Rendering Specifications

**For 180° Arch (Semicircle)**:
- **Arc**: Black (#000000) curve, 2px width
- **Supporting Lines**: One straight black line from center through the midpoint of the two circumference points (visible only during drawing preview)
- **Arc Direction**: Curves perpendicular to the line connecting the two circumference points

**For 90° Arch (Quarter-Circle)**:
- **Arc**: Black (#000000) curve, 2px width
- **Supporting Lines**: Two dotted black lines from center to each circumference point (visible only during drawing preview)
- **Arc Direction**: Curves from first point to second point in clockwise direction
- **Special Note**: First clicked point serves as both a circumference point and the center point

#### Arch Calculation Logic

**180° Arch**:
```
1. User clicks two circumference points (p1, p2)
2. Calculate midpoint: mid = ((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
3. Calculate perpendicular direction to line p1-p2
4. Center is located on the perpendicular bisector at distance = radius
5. Radius = distance(p1, p2) / 2
```

**90° Arch**:
```
1. User clicks first point (p1) - this becomes the center
2. User clicks second point (p2) - this is on the circumference
3. Center = p1
4. Radius = distance(p1, p2)
5. Arc curves from p1 to p2 in clockwise direction
```

---

## Corner Annotations

### IConcaveCorner
Represents a concave corner marker annotation.

```typescript
interface IConcaveCorner {
  /**
   * Location of the corner intersection point
   * This is where the two L-shape lines meet
   * Coordinates are relative to original image dimensions
   */
  point: IPoint;

  /**
   * Size of the corner marker in pixels
   * Represents the length of each L-shape line
   * Calculated as 3% of the original image width
   * Example: If image width is 1000px, size = 30px
   */
  size: number;

  /**
   * Color of the center indicator (filled circle/dot)
   * Blue color for visibility
   * Literal type ensures consistency
   */
  color: '#0000FF';

  /**
   * Color of the L-shape strokes
   * Black color for contrast
   * Literal type ensures consistency
   */
  strokeColor: '#000000';
}
```

#### Rendering Specifications for Concave Corner
- **Center Dot**: Blue (#0000FF) filled circle, 6px diameter
- **L-Shape Strokes**: Black (#000000) lines, 4px width
- **Stroke Direction**: Vertical line going DOWN, horizontal line going LEFT
- **Stroke Length**: Equal to size property
- **Line Cap**: Round (smooth endpoints)
- **Hover State**: Brighter colors or thicker strokes

#### Visual Representation
```
Concave Corner (viewed from inside the corner):
        |
        |
        |
--------+
```

---

### IConvexCorner
Represents a convex corner marker annotation.

```typescript
interface IConvexCorner {
  /**
   * Location of the corner intersection point
   * This is where the two L-shape lines meet
   * Coordinates are relative to original image dimensions
   */
  point: IPoint;

  /**
   * Size of the corner marker in pixels
   * Represents the length of each L-shape line
   * Calculated as 3% of the original image width
   * Example: If image width is 1000px, size = 30px
   */
  size: number;

  /**
   * Color of the center indicator (filled circle/dot)
   * Blue color for visibility
   * Literal type ensures consistency
   */
  color: '#0000FF';

  /**
   * Color of the L-shape strokes
   * Black color for contrast
   * Literal type ensures consistency
   */
  strokeColor: '#000000';
}
```

#### Rendering Specifications for Convex Corner
- **Center Dot**: Blue (#0000FF) filled circle, 6px diameter
- **L-Shape Strokes**: Black (#000000) lines, 4px width
- **Stroke Direction**: Vertical line going UP, horizontal line going RIGHT
- **Stroke Length**: Equal to size property
- **Line Cap**: Round (smooth endpoints)
- **Hover State**: Brighter colors or thicker strokes

#### Visual Representation
```
Convex Corner (viewed from outside the corner):
--------+
        |
        |
        |
```

#### Validation Rules for Corner Markers
- `point` must be within image bounds
- `size > 0` - Size must be positive
- `size === imageWidth * 0.03` - Size should be 3% of image width
- When zoom changes, size must scale proportionally to maintain 3% ratio

#### Zoom Scaling for Corners
When zoom level changes, corner marker size must be recalculated:
```
newSize = (imageWidth * 0.03) * (newZoom / 100)
```

This ensures corners maintain their visual size relative to the image at all zoom levels.

---

## API Request/Response Contracts

### ISaveDimensionsRequest
Request payload for saving dimension markings.

```typescript
interface ISaveDimensionsRequest {
  /**
   * URL of the original uploaded image
   * Used to identify which image the annotations belong to
   * Must be a valid URL string
   */
  imageUrl: string;

  /**
   * Array of all annotations created by the user
   * Can be empty array if user created no annotations
   * Each annotation must be a valid IAnnotation object
   */
  annotations: IAnnotation[];

  /**
   * Merged image blob containing original image with all annotations rasterized
   * Created by rendering all annotations onto the original image
   * Format: JPEG image
   * Must be a valid Blob object
   */
  mergedImageBlob: Blob;
}
```

#### Validation Rules for ISaveDimensionsRequest
- `imageUrl` must be a non-empty string
- `imageUrl` must be a valid URL format
- `annotations` must be an array (can be empty)
- All annotations in array must be valid IAnnotation objects
- `mergedImageBlob` must be a Blob instance
- `mergedImageBlob.type` should be 'image/jpeg'
- `mergedImageBlob.size > 0` - Blob must not be empty

---

### ISaveDimensionsResponse
Response payload from save operation.

```typescript
interface ISaveDimensionsResponse {
  /**
   * Indicates whether the save operation was successful
   * true: Save completed successfully
   * false: Save failed (check message for details)
   */
  success: boolean;

  /**
   * Human-readable message describing the result
   * Success example: "Dimensions saved successfully"
   * Error example: "Failed to save dimensions: Invalid image format"
   */
  message: string;

  /**
   * Next step in the workflow after save
   * Typically a URL or route to navigate to
   * Example: "/3d-model-generation"
   */
  nextStep: string;
}
```

---

### ISkipDimensionsRequest
Request payload for skipping dimension marking.

```typescript
interface ISkipDimensionsRequest {
  /**
   * URL of the original uploaded image
   * Used to identify which image to skip marking for
   * Must be a valid URL string
   */
  imageUrl: string;
}
```

#### Validation Rules for ISkipDimensionsRequest
- `imageUrl` must be a non-empty string
- `imageUrl` must be a valid URL format

---

### ISkipDimensionsResponse
Response payload from skip operation.

```typescript
interface ISkipDimensionsResponse {
  /**
   * Indicates whether the skip operation was successful
   * true: Skip completed successfully
   * false: Skip failed (check message for details)
   */
  success: boolean;

  /**
   * Human-readable message describing the result
   * Success example: "Dimension marking skipped"
   * Error example: "Failed to skip dimensions: Invalid image URL"
   */
  message: string;

  /**
   * Next step in the workflow after skip
   * Typically a URL or route to navigate to
   * Example: "/3d-model-generation"
   */
  nextStep: string;
}
```

---

## Validation Rules

### Global Validation Rules

#### Coordinate Validation
```typescript
function isValidCoordinate(point: IPoint, imageWidth: number, imageHeight: number): boolean {
  return (
    typeof point.x === 'number' &&
    typeof point.y === 'number' &&
    point.x >= 0 &&
    point.y >= 0 &&
    point.x < imageWidth &&
    point.y < imageHeight
  );
}
```

#### Annotation Validation
```typescript
function isValidAnnotation(annotation: IAnnotation): boolean {
  return (
    typeof annotation.id === 'string' &&
    annotation.id.length > 0 &&
    isValidAnnotationType(annotation.type) &&
    annotation.data !== null &&
    typeof annotation.createdAt === 'number' &&
    annotation.createdAt > 0 &&
    typeof annotation.updatedAt === 'number' &&
    annotation.updatedAt >= annotation.createdAt
  );
}
```

### Polygon Validation
```typescript
function isValidPolygon(polygon: IPolygon, imageWidth: number, imageHeight: number): boolean {
  return (
    Array.isArray(polygon.vertices) &&
    polygon.vertices.length >= 3 &&
    polygon.vertices.every(v => isValidCoordinate(v, imageWidth, imageHeight)) &&
    polygon.area > 0 &&
    polygon.color === '#FF0000' &&
    polygon.fillColor === 'rgba(255, 0, 0, 0.2)'
  );
}
```

### Dimension Validation
```typescript
function isValidDimension(dimension: IDimension, imageWidth: number, imageHeight: number): boolean {
  return (
    isValidCoordinate(dimension.startPoint, imageWidth, imageHeight) &&
    isValidCoordinate(dimension.endPoint, imageWidth, imageHeight) &&
    dimension.startPoint.x !== dimension.endPoint.x ||
    dimension.startPoint.y !== dimension.endPoint.y &&
    dimension.color === '#000000' &&
    typeof dimension.arrowHeadSize === 'number' &&
    dimension.arrowHeadSize > 0 &&
    dimension.arrowHeadSize <= 30
  );
}
```

### Freehand Validation
```typescript
function isValidFreehand(freehand: IFreehand, imageWidth: number, imageHeight: number): boolean {
  return (
    Array.isArray(freehand.points) &&
    freehand.points.length >= 2 &&
    freehand.points.every(p => isValidCoordinate(p, imageWidth, imageHeight)) &&
    freehand.color === '#000000' &&
    typeof freehand.strokeWidth === 'number' &&
    freehand.strokeWidth > 0 &&
    freehand.strokeWidth <= 20
  );
}
```

### Arch Validation
```typescript
function isValidArch(arch: IArch, imageWidth: number, imageHeight: number): boolean {
  return (
    (arch.type === '180' || arch.type === '90') &&
    Array.isArray(arch.circumferencePoints) &&
    arch.circumferencePoints.length === 2 &&
    isValidCoordinate(arch.circumferencePoints[0], imageWidth, imageHeight) &&
    isValidCoordinate(arch.circumferencePoints[1], imageWidth, imageHeight) &&
    arch.circumferencePoints[0].x !== arch.circumferencePoints[1].x ||
    arch.circumferencePoints[0].y !== arch.circumferencePoints[1].y &&
    isValidCoordinate(arch.centerPoint, imageWidth, imageHeight) &&
    typeof arch.radius === 'number' &&
    arch.radius > 0 &&
    arch.color === '#000000'
  );
}
```

### Corner Validation
```typescript
function isValidCorner(corner: IConcaveCorner | IConvexCorner, imageWidth: number, imageHeight: number): boolean {
  return (
    isValidCoordinate(corner.point, imageWidth, imageHeight) &&
    typeof corner.size === 'number' &&
    corner.size > 0 &&
    corner.size === imageWidth * 0.03 &&
    corner.color === '#0000FF' &&
    corner.strokeColor === '#000000'
  );
}
```

---

## Color Scheme Reference

### Official Color Palette

| Annotation Type | Element | Color | Hex Code | RGBA | Usage |
|---|---|---|---|---|---|
| Polygon | Boundary | Bright Red | #FF0000 | rgb(255, 0, 0) | Polygon outline |
| Polygon | Fill | Semi-transparent Red | N/A | rgba(255, 0, 0, 0.2) | Polygon interior |
| Polygon | Vertices | Bright Red | #FF0000 | rgb(255, 0, 0) | Vertex circles |
| Dimension | Line | Black | #000000 | rgb(0, 0, 0) | Dimension line and arrows |
| Freehand | Line | Black | #000000 | rgb(0, 0, 0) | Freehand stroke |
| Arch | Curve | Black | #000000 | rgb(0, 0, 0) | Arch arc |
| Arch | Support Lines | Black (dotted) | #000000 | rgb(0, 0, 0) | Radius lines (preview only) |
| Concave Corner | Center Dot | Blue | #0000FF | rgb(0, 0, 255) | Intersection indicator |
| Concave Corner | Strokes | Black | #000000 | rgb(0, 0, 0) | L-shape lines |
| Convex Corner | Center Dot | Blue | #0000FF | rgb(0, 0, 255) | Intersection indicator |
| Convex Corner | Strokes | Black | #000000 | rgb(0, 0, 0) | L-shape lines |

### Hover States
- **Polygons**: Brighter red (#FF3333) or thicker outline
- **Dimension Lines**: Thicker line (3px) or brighter color
- **Freehand**: Thicker line or brighter color
- **Arches**: Thicker arc or brighter color
- **Corners**: Brighter colors or thicker strokes

---

## Examples

### Example 1: Polygon Annotation

```typescript
const polygonExample: IAnnotation = {
  id: 'annotation_1709769600000_a1b2c3d4e',
  type: 'polygon',
  data: {
    vertices: [
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 300 },
      { x: 100, y: 300 }
    ],
    area: 40000,
    color: '#FF0000',
    fillColor: 'rgba(255, 0, 0, 0.2)'
  },
  createdAt: 1709769600000,
  updatedAt: 1709769600000
};
```

### Example 2: Dimension Line Annotation

```typescript
const dimensionExample: IAnnotation = {
  id: 'annotation_1709769601000_b2c3d4e5f',
  type: 'dimension',
  data: {
    startPoint: { x: 150, y: 150 },
    endPoint: { x: 450, y: 150 },
    color: '#000000',
    arrowHeadSize: 12
  },
  createdAt: 1709769601000,
  updatedAt: 1709769601000
};
```

### Example 3: Freehand Annotation

```typescript
const freehandExample: IAnnotation = {
  id: 'annotation_1709769602000_c3d4e5f6g',
  type: 'freehand',
  data: {
    points: [
      { x: 200, y: 200 },
      { x: 210, y: 195 },
      { x: 220, y: 205 },
      { x: 230, y: 200 },
      { x: 240, y: 210 }
    ],
    color: '#000000',
    strokeWidth: 2
  },
  createdAt: 1709769602000,
  updatedAt: 1709769602000
};
```

### Example 4: 180° Arch Annotation

```typescript
const arch180Example: IAnnotation = {
  id: 'annotation_1709769603000_d4e5f6g7h',
  type: 'arch',
  data: {
    type: '180',
    circumferencePoints: [
      { x: 200, y: 300 },
      { x: 400, y: 300 }
    ],
    centerPoint: { x: 300, y: 300 },
    radius: 100,
    color: '#000000'
  },
  createdAt: 1709769603000,
  updatedAt: 1709769603000
};
```

### Example 5: 90° Arch Annotation

```typescript
const arch90Example: IAnnotation = {
  id: 'annotation_1709769604000_e5f6g7h8i',
  type: 'arch',
  data: {
    type: '90',
    circumferencePoints: [
      { x: 300, y: 300 },
      { x: 400, y: 300 }
    ],
    centerPoint: { x: 300, y: 300 },
    radius: 100,
    color: '#000000'
  },
  createdAt: 1709769604000,
  updatedAt: 1709769604000
};
```

### Example 6: Concave Corner Annotation

```typescript
const concaveCornerExample: IAnnotation = {
  id: 'annotation_1709769605000_f6g7h8i9j',
  type: 'concave',
  data: {
    point: { x: 250, y: 250 },
    size: 30,  // 3% of 1000px image width
    color: '#0000FF',
    strokeColor: '#000000'
  },
  createdAt: 1709769605000,
  updatedAt: 1709769605000
};
```

### Example 7: Convex Corner Annotation

```typescript
const convexCornerExample: IAnnotation = {
  id: 'annotation_1709769606000_g7h8i9j0k',
  type: 'convex',
  data: {
    point: { x: 350, y: 350 },
    size: 30,  // 3% of 1000px image width
    color: '#0000FF',
    strokeColor: '#000000'
  },
  createdAt: 1709769606000,
  updatedAt: 1709769606000
};
```

### Example 8: Save Dimensions Request

```typescript
const saveRequest: ISaveDimensionsRequest = {
  imageUrl: 'https://example.com/images/wall-photo-123.jpg',
  annotations: [
    polygonExample,
    dimensionExample,
    freehandExample,
    arch180Example,
    concaveCornerExample,
    convexCornerExample
  ],
  mergedImageBlob: new Blob([/* image data */], { type: 'image/jpeg' })
};
```

### Example 9: Save Dimensions Response

```typescript
const saveResponse: ISaveDimensionsResponse = {
  success: true,
  message: 'Dimensions saved successfully',
  nextStep: '/3d-model-generation'
};
```

### Example 10: Skip Dimensions Request

```typescript
const skipRequest: ISkipDimensionsRequest = {
  imageUrl: 'https://example.com/images/wall-photo-123.jpg'
};
```

### Example 11: Skip Dimensions Response

```typescript
const skipResponse: ISkipDimensionsResponse = {
  success: true,
  message: 'Dimension marking skipped',
  nextStep: '/3d-model-generation'
};
```

---

## Summary

This interfaces document defines:

1. **Coordinate System**: All coordinates stored relative to original image dimensions
2. **Base Annotation Interface**: IAnnotation with id, type, data, timestamps
3. **7 Annotation Types**: Polygon, Dimension, Freehand, Arch, Concave Corner, Convex Corner
4. **API Contracts**: Save and Skip request/response structures
5. **Validation Rules**: Comprehensive validation for all data structures
6. **Color Scheme**: Official colors for all annotation types
7. **Examples**: Real-world examples of each annotation type and API operation

All interfaces follow TypeScript best practices with:
- Complete JSDoc comments
- Literal types for color consistency
- Tuple types for fixed-size arrays
- Union types for flexible data
- Comprehensive validation rules
- Clear rendering specifications
