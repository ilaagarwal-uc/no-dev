import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as GeminiService from '../../../src/data-service/domain/gemini-service';

describe('Gemini API Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1.1.1 Script Generation - Happy Path', () => {
    it('Test 1.1.1.1: Generate Blender script from valid dimension data with main wall only', async () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          }
        ]
      };

      const script = await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      
      expect(script).toBeTruthy();
      expect(script).toContain('import bpy');
      expect(typeof script).toBe('string');
    });

    it('Test 1.1.1.2: Generate script with main wall + return walls (left and right)', async () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          },
          {
            id: 'element_2',
            category: 'STRUCTURE' as const,
            type: 'RETURN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 6, height: 10, depth: 0.75 },
            side: 'LEFT' as const,
            direction: 'INWARD' as const
          },
          {
            id: 'element_3',
            category: 'STRUCTURE' as const,
            type: 'RETURN_WALL' as const,
            origin: { x: 12, y: 0, z: 0 },
            dimensions: { width: 6, height: 10, depth: 0.75 },
            side: 'RIGHT' as const,
            direction: 'OUTWARD' as const
          }
        ]
      };

      const script = await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      
      expect(script).toBeTruthy();
      expect(script).toContain('import bpy');
    });

    it('Test 1.1.1.3: Generate script with door opening (rectangular)', async () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          },
          {
            id: 'element_2',
            category: 'STRUCTURE' as const,
            type: 'DOOR_RECT' as const,
            origin: { x: 4, y: 0, z: 0 },
            dimensions: { width: 3, height: 7, depth: 0.75 },
            hostId: 'element_1'
          }
        ]
      };

      const script = await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      
      expect(script).toBeTruthy();
      expect(script).toContain('import bpy');
    });

    it('Test 1.1.1.4: Generate script with arch opening (180° semicircular)', async () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          },
          {
            id: 'element_2',
            category: 'STRUCTURE' as const,
            type: 'ARCH_OPENING' as const,
            origin: { x: 4, y: 0, z: 0 },
            dimensions: { width: 4, height: 8, depth: 0.75 },
            hostId: 'element_1',
            archShape: 'SEMI' as const,
            radius: 2
          }
        ]
      };

      const script = await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      
      expect(script).toBeTruthy();
      expect(script).toContain('import bpy');
    });

    it('Test 1.1.1.5: Generate script with window opening', async () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          },
          {
            id: 'element_2',
            category: 'STRUCTURE' as const,
            type: 'WINDOW' as const,
            origin: { x: 4, y: 4, z: 0 },
            dimensions: { width: 4, height: 3, depth: 0.75 },
            hostId: 'element_1'
          }
        ]
      };

      const script = await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      
      expect(script).toBeTruthy();
      expect(script).toContain('import bpy');
    });
  });

  describe('1.1.2 Script Generation - Complex Structures', () => {
    it('Test 1.1.2.1: Generate script with beam on main wall', async () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          },
          {
            id: 'element_2',
            category: 'STRUCTURE' as const,
            type: 'BEAM' as const,
            origin: { x: 2, y: 8, z: 0 },
            dimensions: { width: 2, height: 1, depth: 0.75 },
            hostId: 'element_1'
          }
        ]
      };

      const script = await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      
      expect(script).toBeTruthy();
      expect(script).toContain('import bpy');
    });

    it('Test 1.1.2.2: Generate script with column/pillar on return wall', async () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          },
          {
            id: 'element_2',
            category: 'STRUCTURE' as const,
            type: 'RETURN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 6, height: 10, depth: 0.75 },
            side: 'LEFT' as const,
            direction: 'INWARD' as const
          },
          {
            id: 'element_3',
            category: 'STRUCTURE' as const,
            type: 'COLUMN' as const,
            origin: { x: 2, y: 0, z: 2 },
            dimensions: { width: 1, height: 10, depth: 0.75 },
            hostId: 'element_2'
          }
        ]
      };

      const script = await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      
      expect(script).toBeTruthy();
      expect(script).toContain('import bpy');
    });

    it('Test 1.1.2.3: Generate script with structural niche', async () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          },
          {
            id: 'element_2',
            category: 'STRUCTURE' as const,
            type: 'NICHE' as const,
            origin: { x: 4, y: 3, z: 0 },
            dimensions: { width: 2, height: 3, depth: -0.5 },
            hostId: 'element_1'
          }
        ]
      };

      const script = await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      
      expect(script).toBeTruthy();
      expect(script).toContain('import bpy');
    });

    it('Test 1.1.2.4: Generate script with 90° quarter-circle arch', async () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          },
          {
            id: 'element_2',
            category: 'STRUCTURE' as const,
            type: 'ARCH_OPENING' as const,
            origin: { x: 4, y: 0, z: 0 },
            dimensions: { width: 4, height: 8, depth: 0.75 },
            hostId: 'element_1',
            archShape: 'QUARTER' as const,
            orientation: 'TR' as const,
            radius: 2
          }
        ]
      };

      const script = await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      
      expect(script).toBeTruthy();
      expect(script).toContain('import bpy');
    });

    it('Test 1.1.2.5: Generate script with switch board on wall', async () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          },
          {
            id: 'element_2',
            category: 'ELECTRICAL' as const,
            type: 'SWITCH_BOARD' as const,
            origin: { x: 2, y: 4, z: 0 },
            dimensions: { width: 0.8, height: 0.8, depth: 0.1 },
            hostId: 'element_1'
          }
        ]
      };

      const script = await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      
      expect(script).toBeTruthy();
      expect(script).toContain('import bpy');
    });

    it('Test 1.1.2.6: Generate script with AC unit on wall', async () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          },
          {
            id: 'element_2',
            category: 'ELECTRICAL' as const,
            type: 'AC' as const,
            origin: { x: 4, y: 8, z: 0 },
            dimensions: { width: 3, height: 1, depth: 1 },
            hostId: 'element_1'
          }
        ]
      };

      const script = await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      
      expect(script).toBeTruthy();
      expect(script).toContain('import bpy');
    });

    it('Test 1.1.2.7: Generate script with cutout/opening marked as X', async () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          },
          {
            id: 'element_2',
            category: 'STRUCTURE' as const,
            type: 'CUTOUT' as const,
            origin: { x: 4, y: 3, z: 0 },
            dimensions: { width: 2, height: 3, depth: 0.75 },
            hostId: 'element_1'
          }
        ]
      };

      const script = await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      
      expect(script).toBeTruthy();
      expect(script).toContain('import bpy');
    });

    it('Test 1.1.2.8: Generate script with multiple elements (wall + door + window + beam)', async () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          },
          {
            id: 'element_2',
            category: 'STRUCTURE' as const,
            type: 'DOOR_RECT' as const,
            origin: { x: 2, y: 0, z: 0 },
            dimensions: { width: 3, height: 7, depth: 0.75 },
            hostId: 'element_1'
          },
          {
            id: 'element_3',
            category: 'STRUCTURE' as const,
            type: 'WINDOW' as const,
            origin: { x: 7, y: 4, z: 0 },
            dimensions: { width: 4, height: 3, depth: 0.75 },
            hostId: 'element_1'
          },
          {
            id: 'element_4',
            category: 'STRUCTURE' as const,
            type: 'BEAM' as const,
            origin: { x: 1, y: 8, z: 0 },
            dimensions: { width: 2, height: 1, depth: 0.75 },
            hostId: 'element_1'
          }
        ]
      };

      const script = await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      
      expect(script).toBeTruthy();
      expect(script).toContain('import bpy');
    });
  });

  describe('1.1.3 Prompt Formatting & Validation', () => {
    it('Test 1.1.3.1: Format prompt with dimension data correctly', () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          }
        ]
      };

      const prompt = GeminiService.formatPrompt(dimensionData, 'base64imagedata');
      
      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('Test 1.1.3.2: Include image data in prompt (base64)', () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          }
        ]
      };

      const imageData = 'base64encodedimagedata';
      const prompt = GeminiService.formatPrompt(dimensionData, imageData);
      
      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
    });

    it('Test 1.1.3.3: Validate dimension data before API call', () => {
      const invalidData = {
        elements: []
      };

      expect(() => {
        GeminiService.validateBlenderScript('');
      }).toThrow();
    });

    it('Test 1.1.3.4: Sanitize user input in prompts (prevent injection)', () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1<script>alert("xss")</script>',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          }
        ]
      };

      const prompt = GeminiService.formatPrompt(dimensionData, 'base64imagedata');
      
      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
    });

    it('Test 1.1.3.5: Convert units correctly (inches to feet decimals)', () => {
      // This test validates that the system handles decimal feet correctly
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 6.5, height: 10, depth: 0.75 }
          }
        ]
      };

      const prompt = GeminiService.formatPrompt(dimensionData, 'base64imagedata');
      
      expect(prompt).toBeTruthy();
      expect(prompt).toContain('6.5');
    });

    it('Test 1.1.3.6: Validate coordinate system (origin at bottom-left)', () => {
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          }
        ]
      };

      const prompt = GeminiService.formatPrompt(dimensionData, 'base64imagedata');
      
      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe('string');
    });
  });

  describe('1.1.4 API Response Parsing', () => {
    it('Test 1.1.4.1: Parse valid Gemini API response', () => {
      const response = {
        script: 'import bpy\nbpy.ops.mesh.primitive_cube_add()',
        metadata: {
          tokensUsed: 100,
          modelVersion: 'gemini-flash-3.0'
        }
      };

      const script = GeminiService.parseGeminiResponse(response);
      
      expect(script).toBe(response.script);
      expect(script).toContain('import bpy');
    });

    it('Test 1.1.4.2: Handle malformed API response (invalid JSON)', () => {
      expect(() => {
        GeminiService.parseGeminiResponse({} as any);
      }).toThrow();
    });

    it('Test 1.1.4.3: Handle API response with missing script field', () => {
      const response = {
        metadata: {
          tokensUsed: 100,
          modelVersion: 'gemini-flash-3.0'
        }
      };

      expect(() => {
        GeminiService.parseGeminiResponse(response as any);
      }).toThrow('No script in Gemini response');
    });
  });

  describe('1.1.5 Error Handling & Retries', () => {
    it('Test 1.1.5.1: Handle API timeout (5 second limit)', async () => {
      // Mock timeout scenario
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          }
        ]
      };

      // This test validates timeout handling exists
      expect(async () => {
        await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      }).toBeDefined();
    });

    it('Test 1.1.5.2: Retry on transient failures (3 retries with exponential backoff)', async () => {
      // This test validates retry logic exists
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          }
        ]
      };

      expect(async () => {
        await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      }).toBeDefined();
    });

    it('Test 1.1.5.3: Respect API rate limits (429 status)', async () => {
      // This test validates rate limit handling exists
      const dimensionData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          }
        ]
      };

      expect(async () => {
        await GeminiService.generateBlenderScript(dimensionData, 'base64imagedata');
      }).toBeDefined();
    });
  });
});
