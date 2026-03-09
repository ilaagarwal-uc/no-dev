import { describe, it, expect } from 'vitest';
import { parseFilenameMetadata } from '../../../../src/data-service/domain/catalog/index.js';

describe('Filename Parsing', () => {
  describe('Valid filenames', () => {
    it('should parse standard format correctly', () => {
      const result = parseFilenameMetadata('WX919_0.658X0.0379X9.5_FT.glb');
      
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.modelId).toBe('WX919');
      expect(result.metadata?.dimensions.width).toBe(0.658);
      expect(result.metadata?.dimensions.height).toBe(0.0379);
      expect(result.metadata?.dimensions.depth).toBe(9.5);
    });

    it('should parse filename with underscores in model ID', () => {
      const result = parseFilenameMetadata('FLOATING_SHELVE_3.94X0.656X0.082_FT.glb');
      
      expect(result.success).toBe(true);
      expect(result.metadata?.modelId).toBe('FLOATING_SHELVE');
      expect(result.metadata?.dimensions.width).toBe(3.94);
      expect(result.metadata?.dimensions.height).toBe(0.656);
      expect(result.metadata?.dimensions.depth).toBe(0.082);
    });

    it('should parse .gltf extension', () => {
      const result = parseFilenameMetadata('H2022_0.658X0.0379X9.5_FT.gltf');
      
      expect(result.success).toBe(true);
      expect(result.metadata?.modelId).toBe('H2022');
    });

    it('should handle zero depth', () => {
      const result = parseFilenameMetadata('PANEL_1.0X2.0X0_FT.glb');
      
      expect(result.success).toBe(true);
      expect(result.metadata?.dimensions.depth).toBe(0);
    });

    it('should handle large dimensions', () => {
      const result = parseFilenameMetadata('WALNUT_TV_SHLEVE_4.92X0.984X0.886_FT.glb');
      
      expect(result.success).toBe(true);
      expect(result.metadata?.modelId).toBe('WALNUT_TV_SHLEVE');
      expect(result.metadata?.dimensions.width).toBe(4.92);
      expect(result.metadata?.dimensions.height).toBe(0.984);
      expect(result.metadata?.dimensions.depth).toBe(0.886);
    });
  });

  describe('Invalid filenames', () => {
    it('should reject filename without FT suffix', () => {
      const result = parseFilenameMetadata('WX919_0.658X0.0379X9.5.glb');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('expected at least 3 parts');
    });

    it('should reject filename with wrong dimension format', () => {
      const result = parseFilenameMetadata('WX919_0.658X0.0379_FT.glb');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('expected 3 values separated by "X"');
    });

    it('should reject filename with negative width', () => {
      const result = parseFilenameMetadata('WX919_-0.658X0.0379X9.5_FT.glb');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid width');
    });

    it('should reject filename with negative height', () => {
      const result = parseFilenameMetadata('WX919_0.658X-0.0379X9.5_FT.glb');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid height');
    });

    it('should reject filename with negative depth', () => {
      const result = parseFilenameMetadata('WX919_0.658X0.0379X-9.5_FT.glb');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid depth');
    });

    it('should reject filename with non-numeric dimensions', () => {
      const result = parseFilenameMetadata('WX919_abcXdefXghi_FT.glb');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid width');
    });

    it('should reject filename without model ID', () => {
      const result = parseFilenameMetadata('0.658X0.0379X9.5_FT.glb');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('expected at least 3 parts');
    });

    it('should reject filename with too few parts', () => {
      const result = parseFilenameMetadata('WX919.glb');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('expected at least 3 parts');
    });
  });

  describe('Edge cases', () => {
    it('should handle very small dimensions', () => {
      const result = parseFilenameMetadata('SMALL_0.001X0.001X0.001_FT.glb');
      
      expect(result.success).toBe(true);
      expect(result.metadata?.dimensions.width).toBe(0.001);
    });

    it('should handle case-insensitive FT suffix', () => {
      const result = parseFilenameMetadata('WX919_0.658X0.0379X9.5_ft.glb');
      
      expect(result.success).toBe(true);
    });

    it('should handle case-insensitive extension', () => {
      const result = parseFilenameMetadata('WX919_0.658X0.0379X9.5_FT.GLB');
      
      expect(result.success).toBe(true);
    });
  });
});
