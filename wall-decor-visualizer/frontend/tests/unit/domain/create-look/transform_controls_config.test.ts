/**
 * Unit tests for TransformControls configuration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import {
  configureTransformControls,
  setTransformMode,
  setGridSnapping,
  setAngleSnapping,
  getPressureSpeedMultiplier
} from '../../../../src/page-service/domain/create-look-page/transform_controls_config.js';

// Mock WebGL context for jsdom
HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return {
      canvas: document.createElement('canvas'),
      drawingBufferWidth: 800,
      drawingBufferHeight: 600,
      getParameter: vi.fn((param) => {
        // GL_VERSION
        if (param === 7938) return 'WebGL 2.0';
        // GL_RENDERER
        if (param === 7937) return 'WebKit WebGL';
        return null;
      }),
      getExtension: vi.fn(() => ({})),
      getShaderPrecisionFormat: vi.fn(() => ({
        precision: 23,
        rangeMin: 127,
        rangeMax: 127,
      })),
      getContextAttributes: vi.fn(() => ({
        alpha: true,
        antialias: true,
        depth: true,
        stencil: true,
      })),
    };
  }
  return null;
}) as any;

describe('TransformControls Configuration', () => {
  // Skip all tests that require WebGL context - these should be tested in E2E
  // jsdom cannot properly mock WebGL context for Three.js
  describe.skip('configureTransformControls', () => {
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: TransformControls;

    beforeEach(() => {
      camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      renderer = new THREE.WebGLRenderer();
      controls = new TransformControls(camera, renderer.domElement);
    });

    it('should configure controls with larger gizmo size', () => {
      configureTransformControls(controls);
      expect(controls.size).toBe(1.2);
    });

    it('should enable all axes', () => {
      configureTransformControls(controls);
      expect(controls.showX).toBe(true);
      expect(controls.showY).toBe(true);
      expect(controls.showZ).toBe(true);
    });

    it('should set space to world', () => {
      configureTransformControls(controls);
      expect(controls.space).toBe('world');
    });
  });

  describe.skip('setTransformMode', () => {
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: TransformControls;

    beforeEach(() => {
      camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      renderer = new THREE.WebGLRenderer();
      controls = new TransformControls(camera, renderer.domElement);
    });

    it('should set translate mode', () => {
      setTransformMode(controls, 'translate');
      expect(controls.mode).toBe('translate');
    });

    it('should set rotate mode', () => {
      setTransformMode(controls, 'rotate');
      expect(controls.mode).toBe('rotate');
    });

    it('should set scale mode', () => {
      setTransformMode(controls, 'scale');
      expect(controls.mode).toBe('scale');
    });
  });

  describe.skip('setGridSnapping', () => {
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: TransformControls;

    beforeEach(() => {
      camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      renderer = new THREE.WebGLRenderer();
      controls = new TransformControls(camera, renderer.domElement);
    });

    it('should enable grid snapping with default spacing', () => {
      setGridSnapping(controls, true);
      expect(controls.translationSnap).toBe(0.1524);
    });

    it('should enable grid snapping with custom spacing', () => {
      setGridSnapping(controls, true, 0.5);
      expect(controls.translationSnap).toBe(0.5);
    });

    it('should disable grid snapping', () => {
      setGridSnapping(controls, false);
      expect(controls.translationSnap).toBeNull();
    });
  });

  describe.skip('setAngleSnapping', () => {
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: TransformControls;

    beforeEach(() => {
      camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      renderer = new THREE.WebGLRenderer();
      controls = new TransformControls(camera, renderer.domElement);
    });

    it('should enable angle snapping with default increment', () => {
      setAngleSnapping(controls, true);
      expect(controls.rotationSnap).toBeCloseTo(Math.PI / 12, 5);
    });

    it('should enable angle snapping with custom increment', () => {
      const customIncrement = Math.PI / 6; // 30 degrees
      setAngleSnapping(controls, true, customIncrement);
      expect(controls.rotationSnap).toBe(customIncrement);
    });

    it('should disable angle snapping', () => {
      setAngleSnapping(controls, false);
      expect(controls.rotationSnap).toBeNull();
    });
  });

  describe('getPressureSpeedMultiplier', () => {
    it('should return 0.3x for zero pressure (light touch)', () => {
      expect(getPressureSpeedMultiplier(0.0)).toBe(0.3);
    });

    it('should return 2.0x for full pressure (heavy touch)', () => {
      expect(getPressureSpeedMultiplier(1.0)).toBe(2.0);
    });

    it('should return 1.15x for medium pressure', () => {
      expect(getPressureSpeedMultiplier(0.5)).toBeCloseTo(1.15, 2);
    });

    it('should scale linearly between 0.3x and 2.0x', () => {
      const result1 = getPressureSpeedMultiplier(0.25);
      const result2 = getPressureSpeedMultiplier(0.75);
      
      expect(result1).toBeGreaterThan(0.3);
      expect(result1).toBeLessThan(2.0);
      expect(result2).toBeGreaterThan(result1);
      expect(result2).toBeLessThan(2.0);
    });
  });
});
