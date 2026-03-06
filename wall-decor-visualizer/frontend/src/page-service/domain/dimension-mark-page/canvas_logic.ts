// Canvas rendering and coordinate transformations
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';

export function renderCanvasImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  zoom: number,
  pan: DimensionMarkDomain.IPoint
): void {
  const scaledWidth = image.width * (zoom / 100);
  const scaledHeight = image.height * (zoom / 100);

  ctx.drawImage(image, pan.x, pan.y, scaledWidth, scaledHeight);
}

export function renderAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: DimensionMarkDomain.IAnnotation[],
  zoom: number,
  pan: DimensionMarkDomain.IPoint
): void {
  annotations.forEach(annotation => {
    renderAnnotation(ctx, annotation, zoom, pan);
  });
}

export function renderPreview(
  ctx: CanvasRenderingContext2D,
  preview: any,
  zoom: number,
  pan: DimensionMarkDomain.IPoint
): void {
  if (!preview) return;

  const scale = zoom / 100;

  if (preview.type === 'polygon') {
    renderPolygonPreview(ctx, preview.data, scale, pan);
  } else if (preview.type === 'dimension') {
    renderDimensionPreview(ctx, preview.data, scale, pan);
  } else if (preview.type === 'freehand') {
    renderFreehandPreview(ctx, preview.data, scale, pan);
  } else if (preview.type === 'arch') {
    renderArchPreview(ctx, preview.data, scale, pan);
  }
}

function renderAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: DimensionMarkDomain.IAnnotation,
  zoom: number,
  pan: DimensionMarkDomain.IPoint
): void {
  const scale = zoom / 100;

  if (annotation.type === 'polygon') {
    renderPolygon(ctx, annotation.data as DimensionMarkDomain.IPolygon, scale, pan);
  } else if (annotation.type === 'dimension') {
    renderDimension(ctx, annotation.data as DimensionMarkDomain.IDimension, scale, pan);
  } else if (annotation.type === 'freehand') {
    renderFreehand(ctx, annotation.data as DimensionMarkDomain.IFreehand, scale, pan);
  } else if (annotation.type === 'arch') {
    renderArch(ctx, annotation.data as DimensionMarkDomain.IArch, scale, pan);
  } else if (annotation.type === 'concave') {
    renderConcaveCorner(ctx, annotation.data as DimensionMarkDomain.IConcaveCorner, scale, pan);
  } else if (annotation.type === 'convex') {
    renderConvexCorner(ctx, annotation.data as DimensionMarkDomain.IConvexCorner, scale, pan);
  }
}

function renderPolygon(
  ctx: CanvasRenderingContext2D,
  polygon: DimensionMarkDomain.IPolygon,
  scale: number,
  pan: DimensionMarkDomain.IPoint
): void {
  if (polygon.vertices.length < 2) return;

  ctx.beginPath();
  const firstPoint = polygon.vertices[0];
  ctx.moveTo(firstPoint.x * scale + pan.x, firstPoint.y * scale + pan.y);

  for (let i = 1; i < polygon.vertices.length; i++) {
    const point = polygon.vertices[i];
    ctx.lineTo(point.x * scale + pan.x, point.y * scale + pan.y);
  }

  if (polygon.vertices.length >= 3) {
    ctx.closePath();
    ctx.fillStyle = polygon.fillColor;
    ctx.fill();
  }

  ctx.strokeStyle = polygon.color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw vertices
  ctx.fillStyle = polygon.color;
  polygon.vertices.forEach(vertex => {
    ctx.beginPath();
    ctx.arc(vertex.x * scale + pan.x, vertex.y * scale + pan.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function renderDimension(
  ctx: CanvasRenderingContext2D,
  dimension: DimensionMarkDomain.IDimension,
  scale: number,
  pan: DimensionMarkDomain.IPoint
): void {
  const startX = dimension.startPoint.x * scale + pan.x;
  const startY = dimension.startPoint.y * scale + pan.y;
  const endX = dimension.endPoint.x * scale + pan.x;
  const endY = dimension.endPoint.y * scale + pan.y;

  // Draw line
  ctx.strokeStyle = dimension.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Draw arrow heads
  const arrowSize = dimension.arrowHeadSize;
  drawArrowHead(ctx, startX, startY, endX, endY, arrowSize);
  drawArrowHead(ctx, endX, endY, startX, startY, arrowSize);
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  size: number
): void {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const openAngle = (50 * Math.PI) / 180; // 50 degrees

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(fromX - Math.cos(angle - openAngle / 2) * size, fromY - Math.sin(angle - openAngle / 2) * size);
  ctx.lineTo(fromX, fromY);
  ctx.lineTo(fromX - Math.cos(angle + openAngle / 2) * size, fromY - Math.sin(angle + openAngle / 2) * size);
  ctx.stroke();
}

function renderFreehand(
  ctx: CanvasRenderingContext2D,
  freehand: DimensionMarkDomain.IFreehand,
  scale: number,
  pan: DimensionMarkDomain.IPoint
): void {
  if (freehand.points.length < 2) return;

  ctx.strokeStyle = freehand.color;
  ctx.lineWidth = freehand.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  const firstPoint = freehand.points[0];
  ctx.moveTo(firstPoint.x * scale + pan.x, firstPoint.y * scale + pan.y);

  for (let i = 1; i < freehand.points.length; i++) {
    const point = freehand.points[i];
    ctx.lineTo(point.x * scale + pan.x, point.y * scale + pan.y);
  }

  ctx.stroke();
}

function renderArch(
  ctx: CanvasRenderingContext2D,
  arch: DimensionMarkDomain.IArch,
  scale: number,
  pan: DimensionMarkDomain.IPoint
): void {
  const centerX = arch.centerPoint.x * scale + pan.x;
  const centerY = arch.centerPoint.y * scale + pan.y;
  const radius = arch.radius * scale;

  ctx.strokeStyle = arch.color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  if (arch.type === '180') {
    // Draw semicircle
    const p1 = arch.circumferencePoints[0];
    const p2 = arch.circumferencePoints[1];
    const angle1 = Math.atan2(p1.y * scale + pan.y - centerY, p1.x * scale + pan.x - centerX);
    const angle2 = Math.atan2(p2.y * scale + pan.y - centerY, p2.x * scale + pan.x - centerX);

    ctx.arc(centerX, centerY, radius, angle1, angle2, false);
  } else {
    // Draw quarter circle
    const p1 = arch.circumferencePoints[0];
    const p2 = arch.circumferencePoints[1];
    const angle1 = Math.atan2(p1.y * scale + pan.y - centerY, p1.x * scale + pan.x - centerX);
    const angle2 = Math.atan2(p2.y * scale + pan.y - centerY, p2.x * scale + pan.x - centerX);

    ctx.arc(centerX, centerY, radius, angle1, angle2, true);
  }

  ctx.stroke();
}

function renderConcaveCorner(
  ctx: CanvasRenderingContext2D,
  corner: DimensionMarkDomain.IConcaveCorner,
  scale: number,
  pan: DimensionMarkDomain.IPoint
): void {
  const x = corner.point.x * scale + pan.x;
  const y = corner.point.y * scale + pan.y;
  const size = corner.size * scale;

  // Draw center dot
  ctx.fillStyle = corner.color;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();

  // Draw L-shape (vertical down, horizontal left)
  ctx.strokeStyle = corner.strokeColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + size);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - size, y);
  ctx.stroke();
}

function renderConvexCorner(
  ctx: CanvasRenderingContext2D,
  corner: DimensionMarkDomain.IConvexCorner,
  scale: number,
  pan: DimensionMarkDomain.IPoint
): void {
  const x = corner.point.x * scale + pan.x;
  const y = corner.point.y * scale + pan.y;
  const size = corner.size * scale;

  // Draw center dot
  ctx.fillStyle = corner.color;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();

  // Draw L-shape (vertical up, horizontal right)
  ctx.strokeStyle = corner.strokeColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - size);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.stroke();
}

function renderPolygonPreview(
  ctx: CanvasRenderingContext2D,
  data: any,
  scale: number,
  pan: DimensionMarkDomain.IPoint
): void {
  if (!data.vertices || data.vertices.length < 1) return;

  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;

  // Draw lines between vertices
  for (let i = 0; i < data.vertices.length - 1; i++) {
    const p1 = data.vertices[i];
    const p2 = data.vertices[i + 1];
    ctx.beginPath();
    ctx.moveTo(p1.x * scale + pan.x, p1.y * scale + pan.y);
    ctx.lineTo(p2.x * scale + pan.x, p2.y * scale + pan.y);
    ctx.stroke();
  }

  // Draw preview line to cursor
  if (data.cursorPoint) {
    const lastVertex = data.vertices[data.vertices.length - 1];
    ctx.strokeStyle = '#FF9999';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(lastVertex.x * scale + pan.x, lastVertex.y * scale + pan.y);
    ctx.lineTo(data.cursorPoint.x * scale + pan.x, data.cursorPoint.y * scale + pan.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function renderDimensionPreview(
  ctx: CanvasRenderingContext2D,
  data: any,
  scale: number,
  pan: DimensionMarkDomain.IPoint
): void {
  if (!data.startPoint || !data.cursorPoint) return;

  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(data.startPoint.x * scale + pan.x, data.startPoint.y * scale + pan.y);
  ctx.lineTo(data.cursorPoint.x * scale + pan.x, data.cursorPoint.y * scale + pan.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function renderFreehandPreview(
  ctx: CanvasRenderingContext2D,
  data: any,
  scale: number,
  pan: DimensionMarkDomain.IPoint
): void {
  if (!data.points || data.points.length < 1) return;

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  const firstPoint = data.points[0];
  ctx.moveTo(firstPoint.x * scale + pan.x, firstPoint.y * scale + pan.y);

  for (let i = 1; i < data.points.length; i++) {
    const point = data.points[i];
    ctx.lineTo(point.x * scale + pan.x, point.y * scale + pan.y);
  }

  ctx.stroke();
}

function renderArchPreview(
  ctx: CanvasRenderingContext2D,
  data: any,
  scale: number,
  pan: DimensionMarkDomain.IPoint
): void {
  if (!data.startPoint || !data.cursorPoint) return;

  const centerX = data.centerPoint.x * scale + pan.x;
  const centerY = data.centerPoint.y * scale + pan.y;
  const radius = data.radius * scale;

  // Draw radius lines (dotted)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(data.startPoint.x * scale + pan.x, data.startPoint.y * scale + pan.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(data.cursorPoint.x * scale + pan.x, data.cursorPoint.y * scale + pan.y);
  ctx.stroke();

  ctx.setLineDash([]);
}

export function canvasToImageCoordinates(
  canvasX: number,
  canvasY: number,
  zoom: number,
  pan: DimensionMarkDomain.IPoint,
  imageWidth: number,
  imageHeight: number
): DimensionMarkDomain.IPoint {
  const scale = zoom / 100;
  const imageX = (canvasX - pan.x) / scale;
  const imageY = (canvasY - pan.y) / scale;

  return {
    x: Math.max(0, Math.min(imageWidth - 1, imageX)),
    y: Math.max(0, Math.min(imageHeight - 1, imageY))
  };
}

export function imageToCanvasCoordinates(
  imageX: number,
  imageY: number,
  zoom: number,
  pan: DimensionMarkDomain.IPoint
): DimensionMarkDomain.IPoint {
  const scale = zoom / 100;
  return {
    x: imageX * scale + pan.x,
    y: imageY * scale + pan.y
  };
}

export function getCanvasCenter(canvasWidth: number, canvasHeight: number): DimensionMarkDomain.IPoint {
  return {
    x: canvasWidth / 2,
    y: canvasHeight / 2
  };
}

export function calculateZoomCenter(
  mouseX: number,
  mouseY: number,
  canvasWidth: number,
  canvasHeight: number
): DimensionMarkDomain.IPoint {
  return {
    x: mouseX,
    y: mouseY
  };
}
