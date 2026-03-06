import { describe, it, expect } from 'vitest';
import * as CoordinateLogic from '../../../../src/page-service/domain/dimension-mark-page/coordinate_logic';
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';

describe('coordinate_logic', () => {
  const imageWidth = 1000;
  const imageHeight = 800;

  describe('transformCoordinatesToImage', () => {
    it('should transform canvas coordinates to image coordinates at 100% zoom', () => {
      const canvasCoords = { x: 100, y: 100 };
      const zoom = 100;
      const pan = { x: 0, y: 0 };

      const imageCoords = CoordinateLogic.transformCoordinatesToImage(
        canvasCoords,
        zoom,
        pan,
        imageWidth,
        imageHeight
      );

      expect(imageCoords).toEqual({ x: 100, y: 100 });
    });

    it('should transform canvas coordinates at 50% zoom', () => {
      const canvasCoords = { x: 100, y: 100 };
      const zoom = 50;
      const pan = { x: 0, y: 0 };

      const imageCoords = CoordinateLogic.transformCoordinatesToImage(
        canvasCoords,
        zoom,
        pan,
        imageWidth,
        imageHeight
      );

      expect(imageCoords).toEqual({ x: 200, y: 200 });
    });

    it('should transform canvas coordinates at 200% zoom', () => {
      const canvasCoords = { x: 100, y: 100 };
      const zoom = 200;
      const pan = { x: 0, y: 0 };

      const imageCoords = CoordinateLogic.transformCoordinatesToImage(
        canvasCoords,
        zoom,
        pan,
        imageWidth,
        imageHeight
      );

      expect(imageCoords).toEqual({ x: 50, y: 50 });
    });

    it('should account for pan offset', () => {
      const canvasCoords = { x: 200, y: 200 };
      const zoom = 100;
      const pan = { x: 100, y: 100 };

      const imageCoords = CoordinateLogic.transformCoordinatesToImage(
        canvasCoords,
        zoom,
        pan,
        imageWidth,
        imageHeight
      );

      expect(imageCoords).toEqual({ x: 100, y: 100 });
    });

    it('should clamp coordinates to image bounds', () => {
      const canvasCoords = { x: 2000, y: 2000 };
      const zoom = 100;
      const pan = { x: 0, y: 0 };

      const imageCoords = CoordinateLogic.transformCoordinatesToImage(
        canvasCoords,
        zoom,
        pan,
        imageWidth,
        imageHeight
      );

      expect(imageCoords.x).toBeLessThanOrEqual(imageWidth - 1);
      expect(imageCoords.y).toBeLessThanOrEqual(imageHeight - 1);
    });

    it('should clamp negative coordinates to 0', () => {
      const canvasCoords = { x: -100, y: -100 };
      const zoom = 100;
      const pan = { x: 0, y: 0 };

      const imageCoords = CoordinateLogic.transformCoordinatesToImage(
        canvasCoords,
        zoom,
        pan,
        imageWidth,
        imageHeight
      );

      expect(imageCoords.x).toBeGreaterThanOrEqual(0);
      expect(imageCoords.y).toBeGreaterThanOrEqual(0);
    });

    it('should handle zoom and pan together', () => {
      const canvasCoords = { x: 300, y: 300 };
      const zoom = 200;
      const pan = { x: 100, y: 100 };

      const imageCoords = CoordinateLogic.transformCoordinatesToImage(
        canvasCoords,
        zoom,
        pan,
        imageWidth,
        imageHeight
      );

      expect(imageCoords.x).toBeGreaterThanOrEqual(0);
      expect(imageCoords.y).toBeGreaterThanOrEqual(0);
    });
  });

  describe('transformCoordinatesToCanvas', () => {
    it('should transform image coordinates to canvas coordinates at 100% zoom', () => {
      const imageCoords = { x: 100, y: 100 };
      const zoom = 100;
      const pan = { x: 0, y: 0 };

      const canvasCoords = CoordinateLogic.transformCoordinatesToCanvas(imageCoords, zoom, pan);

      expect(canvasCoords).toEqual({ x: 100, y: 100 });
    });

    it('should transform image coordinates at 50% zoom', () => {
      const imageCoords = { x: 100, y: 100 };
      const zoom = 50;
      const pan = { x: 0, y: 0 };

      const canvasCoords = CoordinateLogic.transformCoordinatesToCanvas(imageCoords, zoom, pan);

      expect(canvasCoords).toEqual({ x: 50, y: 50 });
    });

    it('should transform image coordinates at 200% zoom', () => {
      const imageCoords = { x: 100, y: 100 };
      const zoom = 200;
      const pan = { x: 0, y: 0 };

      const canvasCoords = CoordinateLogic.transformCoordinatesToCanvas(imageCoords, zoom, pan);

      expect(canvasCoords).toEqual({ x: 200, y: 200 });
    });

    it('should account for pan offset', () => {
      const imageCoords = { x: 100, y: 100 };
      const zoom = 100;
      const pan = { x: 50, y: 50 };

      const canvasCoords = CoordinateLogic.transformCoordinatesToCanvas(imageCoords, zoom, pan);

      expect(canvasCoords).toEqual({ x: 150, y: 150 });
    });

    it('should handle zoom and pan together', () => {
      const imageCoords = { x: 100, y: 100 };
      const zoom = 200;
      const pan = { x: 100, y: 100 };

      const canvasCoords = CoordinateLogic.transformCoordinatesToCanvas(imageCoords, zoom, pan);

      expect(canvasCoords).toEqual({ x: 300, y: 300 });
    });
  });

  describe('scaleAnnotationForZoom', () => {
    it('should preserve annotation when zoom changes', () => {
      const annotation: DimensionMarkDomain.IAnnotation = {
        id: 'test_1',
        type: 'polygon',
        data: {
          vertices: [
            { x: 100, y: 100 },
            { x: 200, y: 100 },
            { x: 200, y: 200 }
          ],
          area: 5000,
          color: '#FF0000',
          fillColor: 'rgba(255, 0, 0, 0.2)'
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const scaled = CoordinateLogic.scaleAnnotationForZoom(annotation, 100, 200);

      expect(scaled.data).toEqual(annotation.data);
      expect(scaled.updatedAt).toBeGreaterThanOrEqual(annotation.updatedAt);
    });

    it('should update timestamp', () => {
      const annotation: DimensionMarkDomain.IAnnotation = {
        id: 'test_1',
        type: 'dimension',
        data: {
          startPoint: { x: 0, y: 0 },
          endPoint: { x: 100, y: 100 },
          color: '#000000',
          arrowHeadSize: 12
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const oldTime = annotation.updatedAt;
      const scaled = CoordinateLogic.scaleAnnotationForZoom(annotation, 100, 50);

      expect(scaled.updatedAt).toBeGreaterThanOrEqual(oldTime);
    });
  });

  describe('syncAnnotationsAfterZoom', () => {
    it('should preserve annotations after zoom', () => {
      const annotations: DimensionMarkDomain.IAnnotation[] = [
        {
          id: 'test_1',
          type: 'polygon',
          data: {
            vertices: [
              { x: 100, y: 100 },
              { x: 200, y: 100 },
              { x: 200, y: 200 }
            ],
            area: 5000,
            color: '#FF0000',
            fillColor: 'rgba(255, 0, 0, 0.2)'
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];

      const synced = CoordinateLogic.syncAnnotationsAfterZoom(annotations, 100, 200);

      expect(synced).toEqual(annotations);
    });

    it('should handle multiple annotations', () => {
      const annotations: DimensionMarkDomain.IAnnotation[] = [
        {
          id: 'test_1',
          type: 'polygon',
          data: {
            vertices: [
              { x: 100, y: 100 },
              { x: 200, y: 100 },
              { x: 200, y: 200 }
            ],
            area: 5000,
            color: '#FF0000',
            fillColor: 'rgba(255, 0, 0, 0.2)'
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: 'test_2',
          type: 'dimension',
          data: {
            startPoint: { x: 0, y: 0 },
            endPoint: { x: 100, y: 100 },
            color: '#000000',
            arrowHeadSize: 12
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];

      const synced = CoordinateLogic.syncAnnotationsAfterZoom(annotations, 100, 50);

      expect(synced).toHaveLength(2);
      expect(synced).toEqual(annotations);
    });
  });

  describe('syncAnnotationsAfterPan', () => {
    it('should preserve annotations after pan', () => {
      const annotations: DimensionMarkDomain.IAnnotation[] = [
        {
          id: 'test_1',
          type: 'polygon',
          data: {
            vertices: [
              { x: 100, y: 100 },
              { x: 200, y: 100 },
              { x: 200, y: 200 }
            ],
            area: 5000,
            color: '#FF0000',
            fillColor: 'rgba(255, 0, 0, 0.2)'
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];

      const panOffset = { x: 50, y: 50 };
      const synced = CoordinateLogic.syncAnnotationsAfterPan(annotations, panOffset);

      expect(synced).toEqual(annotations);
    });
  });

  describe('getImageBounds', () => {
    it('should calculate bounds at 100% zoom with no pan', () => {
      const zoom = 100;
      const pan = { x: 0, y: 0 };

      const bounds = CoordinateLogic.getImageBounds(imageWidth, imageHeight, zoom, pan);

      expect(bounds.minX).toBe(0);
      expect(bounds.minY).toBe(0);
      expect(bounds.maxX).toBe(imageWidth);
      expect(bounds.maxY).toBe(imageHeight);
    });

    it('should calculate bounds at 50% zoom', () => {
      const zoom = 50;
      const pan = { x: 0, y: 0 };

      const bounds = CoordinateLogic.getImageBounds(imageWidth, imageHeight, zoom, pan);

      expect(bounds.maxX).toBe(imageWidth * 0.5);
      expect(bounds.maxY).toBe(imageHeight * 0.5);
    });

    it('should calculate bounds at 200% zoom', () => {
      const zoom = 200;
      const pan = { x: 0, y: 0 };

      const bounds = CoordinateLogic.getImageBounds(imageWidth, imageHeight, zoom, pan);

      expect(bounds.maxX).toBe(imageWidth * 2);
      expect(bounds.maxY).toBe(imageHeight * 2);
    });

    it('should account for pan offset', () => {
      const zoom = 100;
      const pan = { x: 100, y: 100 };

      const bounds = CoordinateLogic.getImageBounds(imageWidth, imageHeight, zoom, pan);

      expect(bounds.minX).toBe(100);
      expect(bounds.minY).toBe(100);
      expect(bounds.maxX).toBe(100 + imageWidth);
      expect(bounds.maxY).toBe(100 + imageHeight);
    });

    it('should handle zoom and pan together', () => {
      const zoom = 200;
      const pan = { x: 50, y: 50 };

      const bounds = CoordinateLogic.getImageBounds(imageWidth, imageHeight, zoom, pan);

      expect(bounds.minX).toBe(50);
      expect(bounds.minY).toBe(50);
      expect(bounds.maxX).toBe(50 + imageWidth * 2);
      expect(bounds.maxY).toBe(50 + imageHeight * 2);
    });
  });

  describe('clampCoordinatesToImage', () => {
    it('should preserve coordinates within bounds', () => {
      const point = { x: 500, y: 400 };

      const clamped = CoordinateLogic.clampCoordinatesToImage(point, imageWidth, imageHeight);

      expect(clamped).toEqual(point);
    });

    it('should clamp x coordinate to max', () => {
      const point = { x: 2000, y: 400 };

      const clamped = CoordinateLogic.clampCoordinatesToImage(point, imageWidth, imageHeight);

      expect(clamped.x).toBe(imageWidth - 1);
      expect(clamped.y).toBe(400);
    });

    it('should clamp y coordinate to max', () => {
      const point = { x: 500, y: 2000 };

      const clamped = CoordinateLogic.clampCoordinatesToImage(point, imageWidth, imageHeight);

      expect(clamped.x).toBe(500);
      expect(clamped.y).toBe(imageHeight - 1);
    });

    it('should clamp negative x coordinate to 0', () => {
      const point = { x: -100, y: 400 };

      const clamped = CoordinateLogic.clampCoordinatesToImage(point, imageWidth, imageHeight);

      expect(clamped.x).toBe(0);
      expect(clamped.y).toBe(400);
    });

    it('should clamp negative y coordinate to 0', () => {
      const point = { x: 500, y: -100 };

      const clamped = CoordinateLogic.clampCoordinatesToImage(point, imageWidth, imageHeight);

      expect(clamped.x).toBe(500);
      expect(clamped.y).toBe(0);
    });

    it('should clamp both coordinates', () => {
      const point = { x: -100, y: 2000 };

      const clamped = CoordinateLogic.clampCoordinatesToImage(point, imageWidth, imageHeight);

      expect(clamped.x).toBe(0);
      expect(clamped.y).toBe(imageHeight - 1);
    });

    it('should handle corner coordinates', () => {
      const point = { x: 0, y: 0 };

      const clamped = CoordinateLogic.clampCoordinatesToImage(point, imageWidth, imageHeight);

      expect(clamped).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Coordinate transformation round-trip', () => {
    it('should preserve coordinates in round-trip at 100% zoom', () => {
      const imageCoords = { x: 100, y: 100 };
      const zoom = 100;
      const pan = { x: 0, y: 0 };

      const canvasCoords = CoordinateLogic.transformCoordinatesToCanvas(imageCoords, zoom, pan);
      const backToImage = CoordinateLogic.transformCoordinatesToImage(
        canvasCoords,
        zoom,
        pan,
        imageWidth,
        imageHeight
      );

      expect(backToImage).toEqual(imageCoords);
    });

    it('should preserve coordinates in round-trip at 50% zoom', () => {
      const imageCoords = { x: 100, y: 100 };
      const zoom = 50;
      const pan = { x: 0, y: 0 };

      const canvasCoords = CoordinateLogic.transformCoordinatesToCanvas(imageCoords, zoom, pan);
      const backToImage = CoordinateLogic.transformCoordinatesToImage(
        canvasCoords,
        zoom,
        pan,
        imageWidth,
        imageHeight
      );

      expect(backToImage).toEqual(imageCoords);
    });

    it('should preserve coordinates in round-trip with pan', () => {
      const imageCoords = { x: 100, y: 100 };
      const zoom = 100;
      const pan = { x: 50, y: 50 };

      const canvasCoords = CoordinateLogic.transformCoordinatesToCanvas(imageCoords, zoom, pan);
      const backToImage = CoordinateLogic.transformCoordinatesToImage(
        canvasCoords,
        zoom,
        pan,
        imageWidth,
        imageHeight
      );

      expect(backToImage).toEqual(imageCoords);
    });
  });
});
