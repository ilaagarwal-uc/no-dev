import React, { useEffect, useRef } from 'react';
import * as CanvasLogic from './canvas_logic';
import * as ToolLogic from './tool_logic';
import * as DimensionMarkDomain from '../../../data-service/domain/dimension-mark';
import { getAuthToken } from '../../../data-service/domain/auth';
import { ICanvasProps } from './interface';
import styles from './canvas.module.css';

export function Canvas({
  imageUrl,
  annotations,
  selectedTool,
  zoomLevel,
  panOffset,
  previewData,
  onAnnotationCreate,
  onAnnotationUpdate,
  onDrawingStart,
  onDrawingEnd,
  onPreviewUpdate,
  imageWidth,
  imageHeight,
  archType
}: ICanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [currentDrawingState, setCurrentDrawingState] = React.useState<any>(null);

  // Set canvas size on mount and window resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Render image and annotations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    console.log('Canvas: Starting image load', { imageUrl, imageWidth, imageHeight });

    // Fetch image with JWT token
    const loadImage = async () => {
      try {
        const token = getAuthToken();
        console.log('Canvas: Got auth token', { hasToken: !!token });

        if (!token) {
          console.error('Canvas: No auth token available');
          ctx.fillStyle = '#ff0000';
          ctx.font = '16px Arial';
          ctx.fillText('Authentication required', 10, 30);
          return;
        }

        // Fetch image with Authorization header
        const response = await fetch(imageUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error('Canvas: Image fetch failed', { status: response.status, statusText: response.statusText });
          ctx.fillStyle = '#ff0000';
          ctx.font = '16px Arial';
          ctx.fillText(`Failed to load image (${response.status})`, 10, 30);
          return;
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        console.log('Canvas: Image blob created', { blobSize: blob.size, blobType: blob.type });

        // Load and render image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          console.log('Canvas: Image loaded successfully');
          // Save context state
          ctx.save();

          // Calculate scale to fit image in canvas while maintaining aspect ratio
          const canvasAspect = canvas.width / canvas.height;
          const imageAspect = img.naturalWidth / img.naturalHeight;
          
          let drawWidth, drawHeight;
          
          if (imageAspect > canvasAspect) {
            // Image is wider than canvas - fit to width
            drawWidth = canvas.width * 0.9; // 90% of canvas width for padding
            drawHeight = drawWidth / imageAspect;
          } else {
            // Image is taller than canvas - fit to height
            drawHeight = canvas.height * 0.9; // 90% of canvas height for padding
            drawWidth = drawHeight * imageAspect;
          }

          // Ensure the image doesn't exceed canvas bounds even with padding
          if (drawWidth > canvas.width * 0.95) {
            drawWidth = canvas.width * 0.95;
            drawHeight = drawWidth / imageAspect;
          }
          if (drawHeight > canvas.height * 0.95) {
            drawHeight = canvas.height * 0.95;
            drawWidth = drawHeight * imageAspect;
          }

          // Apply zoom and pan transformations
          ctx.translate(canvas.width / 2, canvas.height / 2);
          // Convert zoomLevel from percentage (100) to scale factor (1.0)
          const scaleFactor = zoomLevel / 100;
          ctx.scale(scaleFactor, scaleFactor);
          ctx.translate(panOffset.x, panOffset.y);

          // Draw image centered and scaled to fit
          const x = -drawWidth / 2;
          const y = -drawHeight / 2;
          ctx.drawImage(img, x, y, drawWidth, drawHeight);

          // Draw annotations in the same coordinate space as the image
          // Since we're already in the transformed coordinate space, we need to render annotations
          // using the image coordinate system but scaled to match the drawn image
          const imageScaleX = drawWidth / imageWidth;
          const imageScaleY = drawHeight / imageHeight;
          
          annotations.forEach(annotation => {
            renderAnnotationInImageSpace(ctx, annotation, imageScaleX, imageScaleY);
          });

          // Draw preview if exists
          if (previewData) {
            renderPreviewInImageSpace(ctx, previewData, imageScaleX, imageScaleY);
          }

          // Restore context state
          ctx.restore();

          // Clean up object URL
          URL.revokeObjectURL(objectUrl);
        };

        img.onerror = () => {
          console.error('Canvas: Image failed to load from blob');
          ctx.fillStyle = '#ff0000';
          ctx.font = '16px Arial';
          ctx.fillText('Failed to load image', 10, 30);
          URL.revokeObjectURL(objectUrl);
        };

        img.onabort = () => {
          console.error('Canvas: Image load aborted');
          URL.revokeObjectURL(objectUrl);
        };

        img.src = objectUrl;
      } catch (error) {
        console.error('Canvas: Error loading image', error);
        ctx.fillStyle = '#ff0000';
        ctx.font = '16px Arial';
        ctx.fillText('Error loading image', 10, 30);
      }
    };

    loadImage();
  }, [imageUrl, annotations, zoomLevel, panOffset, previewData, imageWidth, imageHeight]);

  // Helper function to convert canvas coordinates to image coordinates
  const canvasToImageCoords = (canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    // Get the current image transformation parameters (same as in render)
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = imageWidth / imageHeight;
    
    let drawWidth, drawHeight;
    
    if (imageAspect > canvasAspect) {
      drawWidth = canvas.width * 0.9;
      drawHeight = drawWidth / imageAspect;
    } else {
      drawHeight = canvas.height * 0.9;
      drawWidth = drawHeight * imageAspect;
    }

    if (drawWidth > canvas.width * 0.95) {
      drawWidth = canvas.width * 0.95;
      drawHeight = drawWidth / imageAspect;
    }
    if (drawHeight > canvas.height * 0.95) {
      drawHeight = canvas.height * 0.95;
      drawWidth = drawHeight * imageAspect;
    }

    // Account for the transformations applied in rendering
    const scaleFactor = zoomLevel / 100;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Reverse the transformations to get image coordinates
    const transformedX = (canvasX - centerX) / scaleFactor - panOffset.x;
    const transformedY = (canvasY - centerY) / scaleFactor - panOffset.y;

    // Convert from canvas space to image space
    const imageX = (transformedX + drawWidth / 2) * (imageWidth / drawWidth);
    const imageY = (transformedY + drawHeight / 2) * (imageHeight / drawHeight);

    return {
      x: Math.max(0, Math.min(imageWidth - 1, imageX)),
      y: Math.max(0, Math.min(imageHeight - 1, imageY))
    };
  };

  // Helper function to render annotations in image coordinate space
  const renderAnnotationInImageSpace = (
    ctx: CanvasRenderingContext2D, 
    annotation: DimensionMarkDomain.IAnnotation, 
    scaleX: number, 
    scaleY: number
  ) => {
    if (annotation.type === 'dimension') {
      const dimension = annotation.data as DimensionMarkDomain.IDimension;
      const startX = (dimension.startPoint.x - imageWidth / 2) * scaleX;
      const startY = (dimension.startPoint.y - imageHeight / 2) * scaleY;
      const endX = (dimension.endPoint.x - imageWidth / 2) * scaleX;
      const endY = (dimension.endPoint.y - imageHeight / 2) * scaleY;

      ctx.strokeStyle = dimension.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else if (annotation.type === 'polygon') {
      const polygon = annotation.data as DimensionMarkDomain.IPolygon;
      if (polygon.vertices.length < 2) return;

      ctx.beginPath();
      const firstVertex = polygon.vertices[0];
      const firstX = (firstVertex.x - imageWidth / 2) * scaleX;
      const firstY = (firstVertex.y - imageHeight / 2) * scaleY;
      ctx.moveTo(firstX, firstY);

      for (let i = 1; i < polygon.vertices.length; i++) {
        const vertex = polygon.vertices[i];
        const x = (vertex.x - imageWidth / 2) * scaleX;
        const y = (vertex.y - imageHeight / 2) * scaleY;
        ctx.lineTo(x, y);
      }

      if (polygon.vertices.length >= 3) {
        ctx.closePath();
        ctx.fillStyle = polygon.fillColor;
        ctx.fill();
      }

      ctx.strokeStyle = polygon.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (annotation.type === 'freehand') {
      const freehand = annotation.data as DimensionMarkDomain.IFreehand;
      if (freehand.points.length < 2) return;

      ctx.strokeStyle = freehand.color;
      ctx.lineWidth = freehand.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      const firstPoint = freehand.points[0];
      const firstX = (firstPoint.x - imageWidth / 2) * scaleX;
      const firstY = (firstPoint.y - imageHeight / 2) * scaleY;
      ctx.moveTo(firstX, firstY);

      for (let i = 1; i < freehand.points.length; i++) {
        const point = freehand.points[i];
        const x = (point.x - imageWidth / 2) * scaleX;
        const y = (point.y - imageHeight / 2) * scaleY;
        ctx.lineTo(x, y);
      }

      ctx.stroke();
    }
    // Add other annotation types as needed
  };

  // Helper function to render preview in image coordinate space
  const renderPreviewInImageSpace = (
    ctx: CanvasRenderingContext2D, 
    preview: any, 
    scaleX: number, 
    scaleY: number
  ) => {
    if (!preview) return;

    if (preview.type === 'dimension' && preview.data.startPoint && preview.data.cursorPoint) {
      const startX = (preview.data.startPoint.x - imageWidth / 2) * scaleX;
      const startY = (preview.data.startPoint.y - imageHeight / 2) * scaleY;
      const endX = (preview.data.cursorPoint.x - imageWidth / 2) * scaleX;
      const endY = (preview.data.cursorPoint.y - imageHeight / 2) * scaleY;

      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (preview.type === 'polygon' && preview.data.vertices) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;

      // Draw lines between vertices
      for (let i = 0; i < preview.data.vertices.length - 1; i++) {
        const p1 = preview.data.vertices[i];
        const p2 = preview.data.vertices[i + 1];
        const x1 = (p1.x - imageWidth / 2) * scaleX;
        const y1 = (p1.y - imageHeight / 2) * scaleY;
        const x2 = (p2.x - imageWidth / 2) * scaleX;
        const y2 = (p2.y - imageHeight / 2) * scaleY;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw preview line to cursor
      if (preview.data.cursorPoint && preview.data.vertices.length > 0) {
        const lastVertex = preview.data.vertices[preview.data.vertices.length - 1];
        const lastX = (lastVertex.x - imageWidth / 2) * scaleX;
        const lastY = (lastVertex.y - imageHeight / 2) * scaleY;
        const cursorX = (preview.data.cursorPoint.x - imageWidth / 2) * scaleX;
        const cursorY = (preview.data.cursorPoint.y - imageHeight / 2) * scaleY;
        
        ctx.strokeStyle = '#FF9999';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(cursorX, cursorY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    const imagePoint = canvasToImageCoords(canvasX, canvasY);

    console.log('Mouse down:', { canvasX, canvasY, imagePoint, selectedTool });

    if (selectedTool === 'pan') {
      setIsDrawing(true);
      setCurrentDrawingState({ startX: canvasX, startY: canvasY, initialPan: { ...panOffset } });
      onDrawingStart();
      return;
    }

    setIsDrawing(true);
    onDrawingStart();

    // Handle different tools
    switch (selectedTool) {
      case 'dimension':
        setCurrentDrawingState(ToolLogic.startDimensionDrawing(imagePoint));
        onPreviewUpdate({
          type: 'dimension',
          data: { startPoint: imagePoint, cursorPoint: imagePoint }
        });
        break;

      case 'polygon':
        setCurrentDrawingState(ToolLogic.startPolygonDrawing(imagePoint));
        onPreviewUpdate({
          type: 'polygon',
          data: { vertices: [imagePoint], cursorPoint: imagePoint }
        });
        break;

      case 'freehand':
        setCurrentDrawingState(ToolLogic.startFreehandDrawing(imagePoint));
        break;

      case 'arch':
        setCurrentDrawingState(ToolLogic.startArchDrawing(imagePoint, archType || '180'));
        onPreviewUpdate({
          type: 'arch',
          data: { startPoint: imagePoint, cursorPoint: imagePoint, centerPoint: imagePoint, radius: 0 }
        });
        break;

      case 'concave':
        const concaveCorner = ToolLogic.createConcaveCorner(imagePoint, imageWidth);
        const concaveAnnotation: DimensionMarkDomain.IAnnotation = {
          id: `concave_${Date.now()}`,
          type: 'concave',
          data: concaveCorner,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        onAnnotationCreate(concaveAnnotation);
        setIsDrawing(false);
        onDrawingEnd();
        break;

      case 'convex':
        const convexCorner = ToolLogic.createConvexCorner(imagePoint, imageWidth);
        const convexAnnotation: DimensionMarkDomain.IAnnotation = {
          id: `convex_${Date.now()}`,
          type: 'convex',
          data: convexCorner,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        onAnnotationCreate(convexAnnotation);
        setIsDrawing(false);
        onDrawingEnd();
        break;
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    const imagePoint = canvasToImageCoords(canvasX, canvasY);

    console.log('Mouse up:', { canvasX, canvasY, imagePoint, selectedTool });

    setIsDrawing(false);
    onDrawingEnd();

    if (selectedTool === 'pan') {
      setCurrentDrawingState(null);
      return;
    }

    // Complete the annotation based on tool
    switch (selectedTool) {
      case 'dimension':
        if (currentDrawingState) {
          const dimension = ToolLogic.completeDimensionLine(currentDrawingState, imagePoint);
          const annotation: DimensionMarkDomain.IAnnotation = {
            id: `dimension_${Date.now()}`,
            type: 'dimension',
            data: dimension,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          onAnnotationCreate(annotation);
        }
        break;

      case 'freehand':
        if (currentDrawingState) {
          const freehand = ToolLogic.completeFreehandLine(currentDrawingState);
          const annotation: DimensionMarkDomain.IAnnotation = {
            id: `freehand_${Date.now()}`,
            type: 'freehand',
            data: freehand,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          onAnnotationCreate(annotation);
        }
        break;

      case 'arch':
        if (currentDrawingState) {
          const arch = ToolLogic.completeArch(currentDrawingState, imagePoint);
          const annotation: DimensionMarkDomain.IAnnotation = {
            id: `arch_${Date.now()}`,
            type: 'arch',
            data: arch,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          onAnnotationCreate(annotation);
        }
        break;

      // Polygon continues on click, doesn't complete on mouse up
      case 'polygon':
        // Add vertex on click, don't complete yet
        break;
    }

    setCurrentDrawingState(null);
    onPreviewUpdate(undefined);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    const imagePoint = canvasToImageCoords(canvasX, canvasY);

    if (selectedTool === 'pan' && isDrawing && currentDrawingState) {
      // Handle panning
      const deltaX = canvasX - currentDrawingState.startX;
      const deltaY = canvasY - currentDrawingState.startY;
      
      // Update pan offset through parent component
      // Note: This would need to be handled by the parent component
      // For now, we'll just update the preview
      return;
    }

    if (!isDrawing) {
      // Update preview for tools that show preview while hovering
      if (selectedTool === 'polygon' && currentDrawingState) {
        onPreviewUpdate({
          type: 'polygon',
          data: { 
            vertices: currentDrawingState.vertices, 
            cursorPoint: imagePoint 
          }
        });
      }
      return;
    }

    // Handle drawing while mouse is down
    switch (selectedTool) {
      case 'dimension':
        if (currentDrawingState) {
          onPreviewUpdate({
            type: 'dimension',
            data: { 
              startPoint: currentDrawingState.startPoint, 
              cursorPoint: imagePoint 
            }
          });
        }
        break;

      case 'freehand':
        if (currentDrawingState) {
          const newState = ToolLogic.addFreehandPoint(currentDrawingState, imagePoint);
          setCurrentDrawingState(newState);
          onPreviewUpdate({
            type: 'freehand',
            data: { points: newState.points }
          });
        }
        break;

      case 'arch':
        if (currentDrawingState) {
          const centerPoint = ToolLogic.calculateArchCenter(
            currentDrawingState.startPoint, 
            imagePoint, 
            currentDrawingState.archType
          );
          const radius = ToolLogic.calculateArchRadius(
            currentDrawingState.startPoint, 
            imagePoint, 
            currentDrawingState.archType
          );
          onPreviewUpdate({
            type: 'arch',
            data: { 
              startPoint: currentDrawingState.startPoint, 
              cursorPoint: imagePoint,
              centerPoint,
              radius
            }
          });
        }
        break;
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // Handle polygon vertex addition on click (separate from mouse down/up)
    if (selectedTool === 'polygon' && !isDrawing) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;

      const imagePoint = canvasToImageCoords(canvasX, canvasY);

      if (currentDrawingState) {
        // Add vertex to existing polygon
        const newState = ToolLogic.addPolygonVertex(currentDrawingState, imagePoint);
        setCurrentDrawingState(newState);
        onPreviewUpdate({
          type: 'polygon',
          data: { vertices: newState.vertices, cursorPoint: imagePoint }
        });
      }
    }
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // Complete polygon on double click
    if (selectedTool === 'polygon' && currentDrawingState) {
      const polygon = ToolLogic.closePolygon(currentDrawingState);
      const annotation: DimensionMarkDomain.IAnnotation = {
        id: `polygon_${Date.now()}`,
        type: 'polygon',
        data: polygon,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      onAnnotationCreate(annotation);
      setCurrentDrawingState(null);
      onPreviewUpdate(undefined);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      role="img"
      aria-label="Canvas for dimension marking"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        border: '1px solid #ccc',
        cursor: selectedTool === 'pan' ? 'grab' : 'crosshair',
        backgroundColor: '#fafafa'
      }}
    />
  );
}
