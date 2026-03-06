import { describe, it, expect, beforeEach } from 'vitest';
import * as AnnotationLogic from '../../../../src/page-service/domain/dimension-mark-page/annotation_logic';
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';

describe('annotation_logic', () => {
  let testAnnotation: DimensionMarkDomain.IAnnotation;

  beforeEach(() => {
    testAnnotation = {
      id: 'test_annotation_1',
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
  });

  describe('createAnnotation', () => {
    it('should create a polygon annotation', () => {
      const polygonData: DimensionMarkDomain.IPolygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 }
        ],
        area: 5000,
        color: '#FF0000',
        fillColor: 'rgba(255, 0, 0, 0.2)'
      };

      const annotation = AnnotationLogic.createAnnotation('polygon', polygonData);

      expect(annotation.type).toBe('polygon');
      expect(annotation.data).toEqual(polygonData);
      expect(annotation.id).toBeDefined();
      expect(annotation.createdAt).toBeDefined();
    });

    it('should create a dimension annotation', () => {
      const dimensionData: DimensionMarkDomain.IDimension = {
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 100, y: 100 },
        color: '#000000',
        arrowHeadSize: 12
      };

      const annotation = AnnotationLogic.createAnnotation('dimension', dimensionData);

      expect(annotation.type).toBe('dimension');
      expect(annotation.data).toEqual(dimensionData);
    });

    it('should create a freehand annotation', () => {
      const freehandData: DimensionMarkDomain.IFreehand = {
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
          { x: 20, y: 5 }
        ],
        color: '#000000',
        strokeWidth: 2
      };

      const annotation = AnnotationLogic.createAnnotation('freehand', freehandData);

      expect(annotation.type).toBe('freehand');
      expect(annotation.data).toEqual(freehandData);
    });

    it('should create an arch annotation', () => {
      const archData: DimensionMarkDomain.IArch = {
        type: '180',
        circumferencePoints: [
          { x: 0, y: 0 },
          { x: 100, y: 0 }
        ],
        centerPoint: { x: 50, y: 0 },
        radius: 50,
        color: '#000000'
      };

      const annotation = AnnotationLogic.createAnnotation('arch', archData);

      expect(annotation.type).toBe('arch');
      expect(annotation.data).toEqual(archData);
    });

    it('should create a concave corner annotation', () => {
      const cornerData: DimensionMarkDomain.IConcaveCorner = {
        point: { x: 50, y: 50 },
        size: 30,
        color: '#0000FF',
        strokeColor: '#000000'
      };

      const annotation = AnnotationLogic.createAnnotation('concave', cornerData);

      expect(annotation.type).toBe('concave');
      expect(annotation.data).toEqual(cornerData);
    });

    it('should create a convex corner annotation', () => {
      const cornerData: DimensionMarkDomain.IConvexCorner = {
        point: { x: 50, y: 50 },
        size: 30,
        color: '#0000FF',
        strokeColor: '#000000'
      };

      const annotation = AnnotationLogic.createAnnotation('convex', cornerData);

      expect(annotation.type).toBe('convex');
      expect(annotation.data).toEqual(cornerData);
    });
  });

  describe('updateAnnotation', () => {
    it('should update annotation data', () => {
      const newData: DimensionMarkDomain.IPolygon = {
        vertices: [
          { x: 150, y: 150 },
          { x: 250, y: 150 },
          { x: 250, y: 250 }
        ],
        area: 10000,
        color: '#FF0000',
        fillColor: 'rgba(255, 0, 0, 0.2)'
      };

      const updated = AnnotationLogic.updateAnnotation(testAnnotation, { data: newData });

      expect(updated.data).toEqual(newData);
      expect(updated.id).toBe(testAnnotation.id);
      expect(updated.updatedAt).toBeGreaterThanOrEqual(testAnnotation.updatedAt);
    });

    it('should preserve id when updating', () => {
      const updated = AnnotationLogic.updateAnnotation(testAnnotation, { data: testAnnotation.data });

      expect(updated.id).toBe(testAnnotation.id);
    });
  });

  describe('deleteAnnotation', () => {
    it('should remove annotation from array', () => {
      const annotations = [testAnnotation];

      const result = AnnotationLogic.deleteAnnotation(annotations, testAnnotation.id);

      expect(result).toHaveLength(0);
    });

    it('should keep other annotations', () => {
      const annotation2: DimensionMarkDomain.IAnnotation = {
        ...testAnnotation,
        id: 'test_annotation_2'
      };
      const annotations = [testAnnotation, annotation2];

      const result = AnnotationLogic.deleteAnnotation(annotations, testAnnotation.id);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test_annotation_2');
    });

    it('should handle deleting non-existent annotation', () => {
      const annotations = [testAnnotation];

      const result = AnnotationLogic.deleteAnnotation(annotations, 'non_existent');

      expect(result).toHaveLength(1);
    });
  });

  describe('getAnnotationById', () => {
    it('should find annotation by id', () => {
      const annotations = [testAnnotation];

      const result = AnnotationLogic.getAnnotationById(annotations, testAnnotation.id);

      expect(result).toEqual(testAnnotation);
    });

    it('should return undefined for non-existent id', () => {
      const annotations = [testAnnotation];

      const result = AnnotationLogic.getAnnotationById(annotations, 'non_existent');

      expect(result).toBeUndefined();
    });

    it('should find correct annotation among multiple', () => {
      const annotation2: DimensionMarkDomain.IAnnotation = {
        ...testAnnotation,
        id: 'test_annotation_2'
      };
      const annotations = [testAnnotation, annotation2];

      const result = AnnotationLogic.getAnnotationById(annotations, 'test_annotation_2');

      expect(result?.id).toBe('test_annotation_2');
    });
  });

  describe('moveAnnotation', () => {
    it('should move polygon vertices', () => {
      const offset = { x: 50, y: 50 };

      const moved = AnnotationLogic.moveAnnotation(testAnnotation, offset);

      const movedData = moved.data as DimensionMarkDomain.IPolygon;
      expect(movedData.vertices[0]).toEqual({ x: 150, y: 150 });
      expect(movedData.vertices[1]).toEqual({ x: 250, y: 150 });
    });

    it('should move dimension line', () => {
      const dimensionAnnotation: DimensionMarkDomain.IAnnotation = {
        id: 'dim_1',
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

      const offset = { x: 50, y: 50 };
      const moved = AnnotationLogic.moveAnnotation(dimensionAnnotation, offset);

      const movedData = moved.data as DimensionMarkDomain.IDimension;
      expect(movedData.startPoint).toEqual({ x: 50, y: 50 });
      expect(movedData.endPoint).toEqual({ x: 150, y: 150 });
    });

    it('should move freehand points', () => {
      const freehandAnnotation: DimensionMarkDomain.IAnnotation = {
        id: 'fh_1',
        type: 'freehand',
        data: {
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 10 }
          ],
          color: '#000000',
          strokeWidth: 2
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const offset = { x: 20, y: 20 };
      const moved = AnnotationLogic.moveAnnotation(freehandAnnotation, offset);

      const movedData = moved.data as DimensionMarkDomain.IFreehand;
      expect(movedData.points[0]).toEqual({ x: 20, y: 20 });
      expect(movedData.points[1]).toEqual({ x: 30, y: 30 });
    });

    it('should move arch points and center', () => {
      const archAnnotation: DimensionMarkDomain.IAnnotation = {
        id: 'arch_1',
        type: 'arch',
        data: {
          type: '180',
          circumferencePoints: [
            { x: 0, y: 0 },
            { x: 100, y: 0 }
          ],
          centerPoint: { x: 50, y: 0 },
          radius: 50,
          color: '#000000'
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const offset = { x: 25, y: 25 };
      const moved = AnnotationLogic.moveAnnotation(archAnnotation, offset);

      const movedData = moved.data as DimensionMarkDomain.IArch;
      expect(movedData.circumferencePoints[0]).toEqual({ x: 25, y: 25 });
      expect(movedData.centerPoint).toEqual({ x: 75, y: 25 });
    });

    it('should move corner marker', () => {
      const cornerAnnotation: DimensionMarkDomain.IAnnotation = {
        id: 'corner_1',
        type: 'concave',
        data: {
          point: { x: 100, y: 100 },
          size: 30,
          color: '#0000FF',
          strokeColor: '#000000'
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const offset = { x: 50, y: 50 };
      const moved = AnnotationLogic.moveAnnotation(cornerAnnotation, offset);

      const movedData = moved.data as DimensionMarkDomain.IConcaveCorner;
      expect(movedData.point).toEqual({ x: 150, y: 150 });
    });
  });

  describe('scaleAnnotation', () => {
    it('should scale polygon vertices and area', () => {
      const scaleFactor = 2;

      const scaled = AnnotationLogic.scaleAnnotation(testAnnotation, scaleFactor);

      const scaledData = scaled.data as DimensionMarkDomain.IPolygon;
      expect(scaledData.vertices[0]).toEqual({ x: 200, y: 200 });
      expect(scaledData.area).toBe(20000); // 5000 * 2 * 2
    });

    it('should scale dimension line and arrow head', () => {
      const dimensionAnnotation: DimensionMarkDomain.IAnnotation = {
        id: 'dim_1',
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

      const scaled = AnnotationLogic.scaleAnnotation(dimensionAnnotation, 2);

      const scaledData = scaled.data as DimensionMarkDomain.IDimension;
      expect(scaledData.startPoint).toEqual({ x: 0, y: 0 });
      expect(scaledData.endPoint).toEqual({ x: 200, y: 200 });
      expect(scaledData.arrowHeadSize).toBe(24);
    });

    it('should scale freehand stroke width', () => {
      const freehandAnnotation: DimensionMarkDomain.IAnnotation = {
        id: 'fh_1',
        type: 'freehand',
        data: {
          points: [
            { x: 10, y: 10 },
            { x: 20, y: 20 }
          ],
          color: '#000000',
          strokeWidth: 2
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const scaled = AnnotationLogic.scaleAnnotation(freehandAnnotation, 1.5);

      const scaledData = scaled.data as DimensionMarkDomain.IFreehand;
      expect(scaledData.strokeWidth).toBe(3);
    });

    it('should scale arch radius', () => {
      const archAnnotation: DimensionMarkDomain.IAnnotation = {
        id: 'arch_1',
        type: 'arch',
        data: {
          type: '180',
          circumferencePoints: [
            { x: 0, y: 0 },
            { x: 100, y: 0 }
          ],
          centerPoint: { x: 50, y: 0 },
          radius: 50,
          color: '#000000'
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const scaled = AnnotationLogic.scaleAnnotation(archAnnotation, 2);

      const scaledData = scaled.data as DimensionMarkDomain.IArch;
      expect(scaledData.radius).toBe(100);
    });

    it('should scale corner marker size', () => {
      const cornerAnnotation: DimensionMarkDomain.IAnnotation = {
        id: 'corner_1',
        type: 'concave',
        data: {
          point: { x: 100, y: 100 },
          size: 30,
          color: '#0000FF',
          strokeColor: '#000000'
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const scaled = AnnotationLogic.scaleAnnotation(cornerAnnotation, 2);

      const scaledData = scaled.data as DimensionMarkDomain.IConcaveCorner;
      expect(scaledData.size).toBe(60);
    });
  });

  describe('isPointInAnnotation', () => {
    it('should detect point inside polygon', () => {
      const point = { x: 150, y: 150 };

      const result = AnnotationLogic.isPointInAnnotation(point, testAnnotation);

      expect(result).toBe(true);
    });

    it('should detect point outside polygon', () => {
      const point = { x: 300, y: 300 };

      const result = AnnotationLogic.isPointInAnnotation(point, testAnnotation);

      expect(result).toBe(false);
    });

    it('should detect point near dimension line', () => {
      const dimensionAnnotation: DimensionMarkDomain.IAnnotation = {
        id: 'dim_1',
        type: 'dimension',
        data: {
          startPoint: { x: 0, y: 0 },
          endPoint: { x: 100, y: 0 },
          color: '#000000',
          arrowHeadSize: 12
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const point = { x: 50, y: 2 };
      const result = AnnotationLogic.isPointInAnnotation(point, dimensionAnnotation);

      expect(result).toBe(true);
    });

    it('should detect point near freehand line', () => {
      const freehandAnnotation: DimensionMarkDomain.IAnnotation = {
        id: 'fh_1',
        type: 'freehand',
        data: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 }
          ],
          color: '#000000',
          strokeWidth: 2
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Point at (0, 3) is within strokeWidth + 2 = 4 pixels of (0, 0)
      const point = { x: 0, y: 3 };
      const result = AnnotationLogic.isPointInAnnotation(point, freehandAnnotation);

      expect(result).toBe(true);
    });

    it('should detect point near corner marker', () => {
      const cornerAnnotation: DimensionMarkDomain.IAnnotation = {
        id: 'corner_1',
        type: 'concave',
        data: {
          point: { x: 100, y: 100 },
          size: 30,
          color: '#0000FF',
          strokeColor: '#000000'
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const point = { x: 110, y: 110 };
      const result = AnnotationLogic.isPointInAnnotation(point, cornerAnnotation);

      expect(result).toBe(true);
    });
  });

  describe('getAnnotationsAtPoint', () => {
    it('should return empty array when no annotations at point', () => {
      const annotations = [testAnnotation];
      const point = { x: 300, y: 300 };

      const result = AnnotationLogic.getAnnotationsAtPoint(annotations, point);

      expect(result).toHaveLength(0);
    });

    it('should return annotations at point', () => {
      const annotations = [testAnnotation];
      const point = { x: 150, y: 150 };

      const result = AnnotationLogic.getAnnotationsAtPoint(annotations, point);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(testAnnotation.id);
    });

    it('should return multiple annotations at same point', () => {
      const annotation2: DimensionMarkDomain.IAnnotation = {
        id: 'test_annotation_2',
        type: 'polygon',
        data: {
          vertices: [
            { x: 100, y: 100 },
            { x: 300, y: 100 },
            { x: 300, y: 300 }
          ],
          area: 20000,
          color: '#FF0000',
          fillColor: 'rgba(255, 0, 0, 0.2)'
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const annotations = [testAnnotation, annotation2];
      const point = { x: 150, y: 150 };

      const result = AnnotationLogic.getAnnotationsAtPoint(annotations, point);

      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });
});
