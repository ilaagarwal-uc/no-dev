import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as CanvasLogic from '../../../../src/page-service/domain/dimension-mark-page/canvas_logic';
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';

describe('canvas_logic', () => {
  let mockCtx: Partial<CanvasRenderingContext2D>;
  let mockImage: Partial<HTMLImageElement>;

  beforeEach(() => {
    mockCtx = {
      drawImage: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fillRect: vi.fn(),
      setLineDash: vi.fn(),
      clearRect: vi.fn()
    };

    mockImage = {
      width: 1000,
      height: 800
    };
  });

  describe('canvasToImageCoordinates', () => {
    it('should convert canvas coordinates to image coordinates at 100% zoom', () => {
      const canvasX = 100;
      const canvasY = 100;
      const zoom = 100;
      const pan = { x: 0, y: 0 };

      const imageCoords = CanvasLogic.canvasToImageCoordinates(
        canvasX,
        canvasY,
        zoom,
        pan,
        1000,
        800
      );

      expect(imageCoords).toEqual({ x: 100, y: 100 });
    });

    it('should convert canvas coordinates at 50% zoom', () => {
      const canvasX = 100;
      const canvasY = 100;
      const zoom = 50;
      const pan = { x: 0, y: 0 };

      const imageCoords = CanvasLogic.canvasToImageCoordinates(
        canvasX,
        canvasY,
        zoom,
        pan,
        1000,
        800
      );

      expect(imageCoords).toEqual({ x: 200, y: 200 });
    });

    it('should convert canvas coordinates at 200% zoom', () => {
      const canvasX = 100;
      const canvasY = 100;
      const zoom = 200;
      const pan = { x: 0, y: 0 };

      const imageCoords = CanvasLogic.canvasToImageCoordinates(
        canvasX,
        canvasY,
        zoom,
        pan,
        1000,
        800
      );

      expect(imageCoords).toEqual({ x: 50, y: 50 });
    });

    it('should account for pan offset', () => {
      const canvasX = 200;
      const canvasY = 200;
      const zoom = 100;
      const pan = { x: 100, y: 100 };

      const imageCoords = CanvasLogic.canvasToImageCoordinates(
        canvasX,
        canvasY,
        zoom,
        pan,
        1000,
        800
      );

      expect(imageCoords).toEqual({ x: 100, y: 100 });
    });

    it('should clamp coordinates to image bounds', () => {
      const canvasX = 2000;
      const canvasY = 2000;
      const zoom = 100;
      const pan = { x: 0, y: 0 };

      const imageCoords = CanvasLogic.canvasToImageCoordinates(
        canvasX,
        canvasY,
        zoom,
        pan,
        1000,
        800
      );

      expect(imageCoords.x).toBeLessThanOrEqual(999);
      expect(imageCoords.y).toBeLessThanOrEqual(799);
    });
  });

  describe('imageToCanvasCoordinates', () => {
    it('should convert image coordinates to canvas coordinates at 100% zoom', () => {
      const imageX = 100;
      const imageY = 100;
      const zoom = 100;
      const pan = { x: 0, y: 0 };

      const canvasCoords = CanvasLogic.imageToCanvasCoordinates(imageX, imageY, zoom, pan);

      expect(canvasCoords).toEqual({ x: 100, y: 100 });
    });

    it('should convert image coordinates at 50% zoom', () => {
      const imageX = 100;
      const imageY = 100;
      const zoom = 50;
      const pan = { x: 0, y: 0 };

      const canvasCoords = CanvasLogic.imageToCanvasCoordinates(imageX, imageY, zoom, pan);

      expect(canvasCoords).toEqual({ x: 50, y: 50 });
    });

    it('should convert image coordinates at 200% zoom', () => {
      const imageX = 100;
      const imageY = 100;
      const zoom = 200;
      const pan = { x: 0, y: 0 };

      const canvasCoords = CanvasLogic.imageToCanvasCoordinates(imageX, imageY, zoom, pan);

      expect(canvasCoords).toEqual({ x: 200, y: 200 });
    });

    it('should account for pan offset', () => {
      const imageX = 100;
      const imageY = 100;
      const zoom = 100;
      const pan = { x: 50, y: 50 };

      const canvasCoords = CanvasLogic.imageToCanvasCoordinates(imageX, imageY, zoom, pan);

      expect(canvasCoords).toEqual({ x: 150, y: 150 });
    });

    it('should handle zoom and pan together', () => {
      const imageX = 100;
      const imageY = 100;
      const zoom = 200;
      const pan = { x: 100, y: 100 };

      const canvasCoords = CanvasLogic.imageToCanvasCoordinates(imageX, imageY, zoom, pan);

      expect(canvasCoords).toEqual({ x: 300, y: 300 });
    });
  });

  describe('getCanvasCenter', () => {
    it('should calculate center of canvas', () => {
      const center = CanvasLogic.getCanvasCenter(800, 600);

      expect(center).toEqual({ x: 400, y: 300 });
    });

    it('should handle square canvas', () => {
      const center = CanvasLogic.getCanvasCenter(1000, 1000);

      expect(center).toEqual({ x: 500, y: 500 });
    });

    it('should handle small canvas', () => {
      const center = CanvasLogic.getCanvasCenter(100, 100);

      expect(center).toEqual({ x: 50, y: 50 });
    });
  });

  describe('calculateZoomCenter', () => {
    it('should return mouse position as zoom center', () => {
      const center = CanvasLogic.calculateZoomCenter(250, 300, 800, 600);

      expect(center).toEqual({ x: 250, y: 300 });
    });

    it('should handle center position', () => {
      const center = CanvasLogic.calculateZoomCenter(400, 300, 800, 600);

      expect(center).toEqual({ x: 400, y: 300 });
    });

    it('should handle corner position', () => {
      const center = CanvasLogic.calculateZoomCenter(0, 0, 800, 600);

      expect(center).toEqual({ x: 0, y: 0 });
    });
  });

  describe('renderAnnotations', () => {
    it('should render multiple annotations', () => {
      const annotations: DimensionMarkDomain.IAnnotation[] = [
        {
          id: 'ann_1',
          type: 'polygon',
          data: {
            vertices: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 100 }
            ],
            area: 5000,
            color: '#FF0000',
            fillColor: 'rgba(255, 0, 0, 0.2)'
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: 'ann_2',
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

      CanvasLogic.renderAnnotations(
        mockCtx as CanvasRenderingContext2D,
        annotations,
        100,
        { x: 0, y: 0 }
      );

      expect(mockCtx.beginPath).toHaveBeenCalled();
    });

    it('should handle empty annotations array', () => {
      const annotations: DimensionMarkDomain.IAnnotation[] = [];

      CanvasLogic.renderAnnotations(
        mockCtx as CanvasRenderingContext2D,
        annotations,
        100,
        { x: 0, y: 0 }
      );

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('renderPreview', () => {
    it('should render polygon preview', () => {
      const preview = {
        type: 'polygon',
        data: {
          vertices: [
            { x: 0, y: 0 },
            { x: 100, y: 0 }
          ],
          cursorPoint: { x: 100, y: 100 }
        }
      };

      CanvasLogic.renderPreview(
        mockCtx as CanvasRenderingContext2D,
        preview,
        100,
        { x: 0, y: 0 }
      );

      expect(mockCtx.beginPath).toHaveBeenCalled();
    });

    it('should render dimension preview', () => {
      const preview = {
        type: 'dimension',
        data: {
          startPoint: { x: 0, y: 0 },
          cursorPoint: { x: 100, y: 100 }
        }
      };

      CanvasLogic.renderPreview(
        mockCtx as CanvasRenderingContext2D,
        preview,
        100,
        { x: 0, y: 0 }
      );

      expect(mockCtx.beginPath).toHaveBeenCalled();
    });

    it('should render freehand preview', () => {
      const preview = {
        type: 'freehand',
        data: {
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
            { x: 20, y: 5 }
          ]
        }
      };

      CanvasLogic.renderPreview(
        mockCtx as CanvasRenderingContext2D,
        preview,
        100,
        { x: 0, y: 0 }
      );

      expect(mockCtx.beginPath).toHaveBeenCalled();
    });

    it('should render arch preview', () => {
      const preview = {
        type: 'arch',
        data: {
          startPoint: { x: 0, y: 0 },
          cursorPoint: { x: 100, y: 0 },
          centerPoint: { x: 50, y: 0 },
          radius: 50
        }
      };

      CanvasLogic.renderPreview(
        mockCtx as CanvasRenderingContext2D,
        preview,
        100,
        { x: 0, y: 0 }
      );

      expect(mockCtx.beginPath).toHaveBeenCalled();
    });

    it('should handle null preview', () => {
      CanvasLogic.renderPreview(
        mockCtx as CanvasRenderingContext2D,
        null,
        100,
        { x: 0, y: 0 }
      );

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Coordinate transformation round-trip', () => {
    it('should preserve coordinates in round-trip at 100% zoom', () => {
      const imageCoords = { x: 100, y: 100 };
      const zoom = 100;
      const pan = { x: 0, y: 0 };

      const canvasCoords = CanvasLogic.imageToCanvasCoordinates(imageCoords.x, imageCoords.y, zoom, pan);
      const backToImage = CanvasLogic.canvasToImageCoordinates(
        canvasCoords.x,
        canvasCoords.y,
        zoom,
        pan,
        1000,
        800
      );

      expect(backToImage).toEqual(imageCoords);
    });

    it('should preserve coordinates in round-trip at 50% zoom', () => {
      const imageCoords = { x: 100, y: 100 };
      const zoom = 50;
      const pan = { x: 0, y: 0 };

      const canvasCoords = CanvasLogic.imageToCanvasCoordinates(imageCoords.x, imageCoords.y, zoom, pan);
      const backToImage = CanvasLogic.canvasToImageCoordinates(
        canvasCoords.x,
        canvasCoords.y,
        zoom,
        pan,
        1000,
        800
      );

      expect(backToImage).toEqual(imageCoords);
    });

    it('should preserve coordinates in round-trip with pan', () => {
      const imageCoords = { x: 100, y: 100 };
      const zoom = 100;
      const pan = { x: 50, y: 50 };

      const canvasCoords = CanvasLogic.imageToCanvasCoordinates(imageCoords.x, imageCoords.y, zoom, pan);
      const backToImage = CanvasLogic.canvasToImageCoordinates(
        canvasCoords.x,
        canvasCoords.y,
        zoom,
        pan,
        1000,
        800
      );

      expect(backToImage).toEqual(imageCoords);
    });
  });
});
