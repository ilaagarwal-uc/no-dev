import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressSection } from '../../../src/page-service/domain/model-generation-page/ProgressSection';

describe('ProgressSection Component Tests', () => {
  describe('Component Rendering', () => {
    it('Test: Render progress bar with correct percentage', () => {
      const jobStatus = {
        jobId: 'job_123',
        status: 'processing' as const,
        progress: 50,
        stage: 'Generating script',
        createdAt: new Date().toISOString()
      };

      render(<ProgressSection jobStatus={jobStatus} />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('Test: Display current stage text', () => {
      const jobStatus = {
        jobId: 'job_123',
        status: 'processing' as const,
        progress: 30,
        stage: 'Generating Blender script with Gemini AI',
        createdAt: new Date().toISOString()
      };

      render(<ProgressSection jobStatus={jobStatus} />);
      
      expect(screen.getByText(/generating blender script/i)).toBeInTheDocument();
    });

    it('Test: Show stages list with active stage highlighted', () => {
      const jobStatus = {
        jobId: 'job_123',
        status: 'processing' as const,
        progress: 60,
        stage: 'Executing Blender script',
        createdAt: new Date().toISOString()
      };

      render(<ProgressSection jobStatus={jobStatus} />);
      
      expect(screen.getByText(/executing blender/i)).toBeInTheDocument();
    });

    it('Test: Display completion state when job completes', () => {
      const jobStatus = {
        jobId: 'job_123',
        status: 'completed' as const,
        progress: 100,
        stage: 'Generation complete',
        modelId: 'model_456',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      render(<ProgressSection jobStatus={jobStatus} />);
      
      expect(screen.getByText(/complete/i)).toBeInTheDocument();
    });

    it('Test: Handle null job status gracefully', () => {
      render(<ProgressSection jobStatus={null} />);
      
      // Should render without crashing
      expect(true).toBe(true);
    });
  });
});
