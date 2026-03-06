import { describe, it, expect } from 'vitest';
import * as ToolLogic from '../../../../src/page-service/domain/dimension-mark-page/tool_logic';
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';

describe('tool_logic', () => {
  describe('Polygon Tool', () => {
    describe('startPolygonDrawing', () => {
      it('should initialize polygon drawing state with start point', () => {
        const startPoint = { x: 100, y: 100 };

        const state = ToolLogic.startPolygonDrawing(startPoint);

        expect(state.vertices).toHaveLength(1);
        expect(state.vertices[0]).toEqual(startPoint);
      });
    });

    describe('addPolygonVertex', () => {
      it('should add vertex to polygon', () => {
        const state = ToolLogic.startPolygonDrawing({ x: 100, y: 100 });
        const newVertex = { x: 200, y: 100 };

        const newState = ToolLogic.addPolygonVertex(state, newVertex);

        expect(newState.vertices).toHaveLength(2);
        expect(newState.vertices[1]).toEqual(newVertex);
      });

      it('should preserve previous vertices', () => {
        const state = ToolLogic.startPolygonDrawing({ x: 100, y: 100 });
        const vertex2 = { x: 200, y: 100 };
        const vertex3 = { x: 200, y: 200 };

        let newState = ToolLogic.addPolygonVertex(state, vertex2);
        newState = ToolLogic.addPolygonVertex(newState, vertex3);

        expect(newState.vertices).toHaveLength(3);
        expect(newState.vertices[0]).toEqual({ x: 100, y: 100 });
        expect(newState.vertices[1]).toEqual(vertex2);
        expect(newState.vertices[2]).toEqual(vertex3);
      });
    });

    describe('closePolygon', () => {
      it('should create polygon with 3 vertices', () => {
        let state = ToolLogic.startPolygonDrawing({ x: 0, y: 0 });
        state = ToolLogic.addPolygonVertex(state, { x: 100, y: 0 });
        state = ToolLogic.addPolygonVertex(state, { x: 100, y: 100 });

        const polygon = ToolLogic.closePolygon(state);

        expect(polygon.vertices).toHaveLength(3);
        expect(polygon.color).toBe('#FF0000');
        expect(polygon.fillColor).toBe('rgba(255, 0, 0, 0.2)');
      });

      it('should calculate polygon area', () => {
        let state = ToolLogic.startPolygonDrawing({ x: 0, y: 0 });
        state = ToolLogic.addPolygonVertex(state, { x: 100, y: 0 });
        state = ToolLogic.addPolygonVertex(state, { x: 100, y: 100 });

        const polygon = ToolLogic.closePolygon(state);

        expect(polygon.area).toBe(5000); // 100 * 100 / 2
      });

      it('should handle polygon with many vertices', () => {
        let state = ToolLogic.startPolygonDrawing({ x: 0, y: 0 });
        for (let i = 1; i < 10; i++) {
          state = ToolLogic.addPolygonVertex(state, { x: i * 10, y: i * 10 });
        }

        const polygon = ToolLogic.closePolygon(state);

        expect(polygon.vertices).toHaveLength(10);
        // Area should be calculated (may be 0 for collinear points)
        expect(typeof polygon.area).toBe('number');
      });
    });

    describe('calculatePolygonArea', () => {
      it('should calculate area of square', () => {
        const vertices: DimensionMarkDomain.IPoint[] = [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ];

        const area = ToolLogic.calculatePolygonArea(vertices);

        expect(area).toBe(10000);
      });

      it('should calculate area of triangle', () => {
        const vertices: DimensionMarkDomain.IPoint[] = [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 }
        ];

        const area = ToolLogic.calculatePolygonArea(vertices);

        expect(area).toBe(5000);
      });

      it('should return 0 for less than 3 vertices', () => {
        const vertices: DimensionMarkDomain.IPoint[] = [
          { x: 0, y: 0 },
          { x: 100, y: 0 }
        ];

        const area = ToolLogic.calculatePolygonArea(vertices);

        expect(area).toBe(0);
      });

      it('should calculate area of complex polygon', () => {
        const vertices: DimensionMarkDomain.IPoint[] = [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 150, y: 50 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ];

        const area = ToolLogic.calculatePolygonArea(vertices);

        expect(area).toBeGreaterThan(0);
      });
    });
  });

  describe('Dimension Tool', () => {
    describe('startDimensionDrawing', () => {
      it('should initialize dimension drawing state', () => {
        const startPoint = { x: 100, y: 100 };

        const state = ToolLogic.startDimensionDrawing(startPoint);

        expect(state.startPoint).toEqual(startPoint);
      });
    });

    describe('completeDimensionLine', () => {
      it('should create dimension line', () => {
        const state = ToolLogic.startDimensionDrawing({ x: 0, y: 0 });
        const endPoint = { x: 100, y: 100 };

        const dimension = ToolLogic.completeDimensionLine(state, endPoint);

        expect(dimension.startPoint).toEqual({ x: 0, y: 0 });
        expect(dimension.endPoint).toEqual(endPoint);
        expect(dimension.color).toBe('#000000');
        expect(dimension.arrowHeadSize).toBe(12);
      });

      it('should handle zero-length dimension', () => {
        const state = ToolLogic.startDimensionDrawing({ x: 100, y: 100 });
        const endPoint = { x: 100, y: 100 };

        const dimension = ToolLogic.completeDimensionLine(state, endPoint);

        expect(dimension.startPoint).toEqual(endPoint);
        expect(dimension.endPoint).toEqual(endPoint);
      });

      it('should handle horizontal dimension', () => {
        const state = ToolLogic.startDimensionDrawing({ x: 0, y: 100 });
        const endPoint = { x: 200, y: 100 };

        const dimension = ToolLogic.completeDimensionLine(state, endPoint);

        expect(dimension.startPoint.y).toBe(dimension.endPoint.y);
      });

      it('should handle vertical dimension', () => {
        const state = ToolLogic.startDimensionDrawing({ x: 100, y: 0 });
        const endPoint = { x: 100, y: 200 };

        const dimension = ToolLogic.completeDimensionLine(state, endPoint);

        expect(dimension.startPoint.x).toBe(dimension.endPoint.x);
      });

      it('should handle diagonal dimension', () => {
        const state = ToolLogic.startDimensionDrawing({ x: 0, y: 0 });
        const endPoint = { x: 100, y: 100 };

        const dimension = ToolLogic.completeDimensionLine(state, endPoint);

        expect(dimension.startPoint).toEqual({ x: 0, y: 0 });
        expect(dimension.endPoint).toEqual({ x: 100, y: 100 });
      });
    });
  });

  describe('Freehand Tool', () => {
    describe('startFreehandDrawing', () => {
      it('should initialize freehand drawing state', () => {
        const startPoint = { x: 100, y: 100 };

        const state = ToolLogic.startFreehandDrawing(startPoint);

        expect(state.points).toHaveLength(1);
        expect(state.points[0]).toEqual(startPoint);
      });
    });

    describe('addFreehandPoint', () => {
      it('should add point to freehand line', () => {
        const state = ToolLogic.startFreehandDrawing({ x: 100, y: 100 });
        const newPoint = { x: 110, y: 105 };

        const newState = ToolLogic.addFreehandPoint(state, newPoint);

        expect(newState.points).toHaveLength(2);
        expect(newState.points[1]).toEqual(newPoint);
      });

      it('should preserve previous points', () => {
        let state = ToolLogic.startFreehandDrawing({ x: 100, y: 100 });
        state = ToolLogic.addFreehandPoint(state, { x: 110, y: 105 });
        state = ToolLogic.addFreehandPoint(state, { x: 120, y: 110 });

        expect(state.points).toHaveLength(3);
      });

      it('should handle many points', () => {
        let state = ToolLogic.startFreehandDrawing({ x: 0, y: 0 });
        for (let i = 1; i < 100; i++) {
          state = ToolLogic.addFreehandPoint(state, { x: i, y: i });
        }

        expect(state.points).toHaveLength(100);
      });
    });

    describe('completeFreehandLine', () => {
      it('should create freehand line', () => {
        let state = ToolLogic.startFreehandDrawing({ x: 0, y: 0 });
        state = ToolLogic.addFreehandPoint(state, { x: 10, y: 10 });
        state = ToolLogic.addFreehandPoint(state, { x: 20, y: 5 });

        const freehand = ToolLogic.completeFreehandLine(state);

        expect(freehand.points).toHaveLength(3);
        expect(freehand.color).toBe('#000000');
        expect(freehand.strokeWidth).toBe(2);
      });

      it('should preserve all points', () => {
        let state = ToolLogic.startFreehandDrawing({ x: 0, y: 0 });
        const points = [
          { x: 10, y: 10 },
          { x: 20, y: 5 },
          { x: 30, y: 15 }
        ];

        for (const point of points) {
          state = ToolLogic.addFreehandPoint(state, point);
        }

        const freehand = ToolLogic.completeFreehandLine(state);

        expect(freehand.points).toHaveLength(4);
      });
    });
  });

  describe('Arch Tool', () => {
    describe('startArchDrawing', () => {
      it('should initialize 180° arch drawing state', () => {
        const startPoint = { x: 100, y: 100 };

        const state = ToolLogic.startArchDrawing(startPoint, '180');

        expect(state.startPoint).toEqual(startPoint);
        expect(state.archType).toBe('180');
      });

      it('should initialize 90° arch drawing state', () => {
        const startPoint = { x: 100, y: 100 };

        const state = ToolLogic.startArchDrawing(startPoint, '90');

        expect(state.startPoint).toEqual(startPoint);
        expect(state.archType).toBe('90');
      });
    });

    describe('calculateArchCenter', () => {
      it('should calculate center for 180° arch', () => {
        const p1 = { x: 0, y: 0 };
        const p2 = { x: 100, y: 0 };

        const center = ToolLogic.calculateArchCenter(p1, p2, '180');

        expect(center).toEqual({ x: 50, y: 0 });
      });

      it('should calculate center for 90° arch', () => {
        const p1 = { x: 100, y: 100 };
        const p2 = { x: 200, y: 100 };

        const center = ToolLogic.calculateArchCenter(p1, p2, '90');

        expect(center).toEqual(p1);
      });

      it('should handle vertical 180° arch', () => {
        const p1 = { x: 0, y: 0 };
        const p2 = { x: 0, y: 100 };

        const center = ToolLogic.calculateArchCenter(p1, p2, '180');

        expect(center).toEqual({ x: 0, y: 50 });
      });

      it('should handle diagonal 180° arch', () => {
        const p1 = { x: 0, y: 0 };
        const p2 = { x: 100, y: 100 };

        const center = ToolLogic.calculateArchCenter(p1, p2, '180');

        expect(center).toEqual({ x: 50, y: 50 });
      });
    });

    describe('calculateArchRadius', () => {
      it('should calculate radius for 180° arch', () => {
        const p1 = { x: 0, y: 0 };
        const p2 = { x: 100, y: 0 };

        const radius = ToolLogic.calculateArchRadius(p1, p2, '180');

        expect(radius).toBe(50);
      });

      it('should calculate radius for 90° arch', () => {
        const p1 = { x: 0, y: 0 };
        const p2 = { x: 100, y: 0 };

        const radius = ToolLogic.calculateArchRadius(p1, p2, '90');

        expect(radius).toBe(100);
      });

      it('should handle vertical arch', () => {
        const p1 = { x: 0, y: 0 };
        const p2 = { x: 0, y: 100 };

        const radius180 = ToolLogic.calculateArchRadius(p1, p2, '180');
        const radius90 = ToolLogic.calculateArchRadius(p1, p2, '90');

        expect(radius180).toBe(50);
        expect(radius90).toBe(100);
      });

      it('should handle diagonal arch', () => {
        const p1 = { x: 0, y: 0 };
        const p2 = { x: 100, y: 100 };

        const radius180 = ToolLogic.calculateArchRadius(p1, p2, '180');
        const radius90 = ToolLogic.calculateArchRadius(p1, p2, '90');

        expect(radius180).toBeCloseTo(70.71, 1);
        expect(radius90).toBeCloseTo(141.42, 1);
      });
    });

    describe('completeArch', () => {
      it('should create 180° arch', () => {
        const state = ToolLogic.startArchDrawing({ x: 0, y: 0 }, '180');
        const endPoint = { x: 100, y: 0 };

        const arch = ToolLogic.completeArch(state, endPoint);

        expect(arch.type).toBe('180');
        expect(arch.circumferencePoints[0]).toEqual({ x: 0, y: 0 });
        expect(arch.circumferencePoints[1]).toEqual(endPoint);
        expect(arch.centerPoint).toEqual({ x: 50, y: 0 });
        expect(arch.radius).toBe(50);
        expect(arch.color).toBe('#000000');
      });

      it('should create 90° arch', () => {
        const state = ToolLogic.startArchDrawing({ x: 0, y: 0 }, '90');
        const endPoint = { x: 100, y: 0 };

        const arch = ToolLogic.completeArch(state, endPoint);

        expect(arch.type).toBe('90');
        expect(arch.centerPoint).toEqual({ x: 0, y: 0 });
        expect(arch.radius).toBe(100);
      });
    });
  });

  describe('Corner Tools', () => {
    describe('createConcaveCorner', () => {
      it('should create concave corner marker', () => {
        const point = { x: 100, y: 100 };
        const imageWidth = 1000;

        const corner = ToolLogic.createConcaveCorner(point, imageWidth);

        expect(corner.point).toEqual(point);
        expect(corner.size).toBe(30); // 3% of 1000
        expect(corner.color).toBe('#0000FF');
        expect(corner.strokeColor).toBe('#000000');
      });

      it('should calculate size as 3% of image width', () => {
        const point = { x: 50, y: 50 };
        const imageWidth = 500;

        const corner = ToolLogic.createConcaveCorner(point, imageWidth);

        expect(corner.size).toBe(15); // 3% of 500
      });

      it('should handle different image widths', () => {
        const point = { x: 0, y: 0 };

        const corner1 = ToolLogic.createConcaveCorner(point, 1000);
        const corner2 = ToolLogic.createConcaveCorner(point, 2000);

        expect(corner2.size).toBe(corner1.size * 2);
      });

      it('should handle corner at image edge', () => {
        const point = { x: 0, y: 0 };
        const imageWidth = 1000;

        const corner = ToolLogic.createConcaveCorner(point, imageWidth);

        expect(corner.point).toEqual(point);
        expect(corner.size).toBe(30);
      });
    });

    describe('createConvexCorner', () => {
      it('should create convex corner marker', () => {
        const point = { x: 100, y: 100 };
        const imageWidth = 1000;

        const corner = ToolLogic.createConvexCorner(point, imageWidth);

        expect(corner.point).toEqual(point);
        expect(corner.size).toBe(30); // 3% of 1000
        expect(corner.color).toBe('#0000FF');
        expect(corner.strokeColor).toBe('#000000');
      });

      it('should calculate size as 3% of image width', () => {
        const point = { x: 50, y: 50 };
        const imageWidth = 500;

        const corner = ToolLogic.createConvexCorner(point, imageWidth);

        expect(corner.size).toBe(15); // 3% of 500
      });

      it('should handle different image widths', () => {
        const point = { x: 0, y: 0 };

        const corner1 = ToolLogic.createConvexCorner(point, 1000);
        const corner2 = ToolLogic.createConvexCorner(point, 2000);

        expect(corner2.size).toBe(corner1.size * 2);
      });

      it('should handle corner at image corner', () => {
        const point = { x: 1000, y: 1000 };
        const imageWidth = 1000;

        const corner = ToolLogic.createConvexCorner(point, imageWidth);

        expect(corner.point).toEqual(point);
        expect(corner.size).toBe(30);
      });
    });
  });
});
