import { describe, it, expect, afterEach } from 'vitest';
import { render, within, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import { ModelViewer } from '../../../../src/page-service/domain/model-generation-page/ModelViewer';

/**
 * Preservation Property Tests
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3**
 * 
 * These tests verify that UI components (ViewModeSelector, ViewerControls, ModelInfoPanel)
 * continue to display correctly after the Three.js rendering fix is implemented.
 * 
 * IMPORTANT: These tests are run on UNFIXED code FIRST to capture baseline behavior,
 * then run again after the fix to ensure no regressions.
 * 
 * EXPECTED OUTCOME on UNFIXED code: Tests PASS (confirms baseline behavior)
 * EXPECTED OUTCOME on FIXED code: Tests PASS (confirms preservation)
 */
describe('ModelViewer - Preservation Property Tests', () => {
  
  // Clean up after each test to prevent DOM pollution
  afterEach(() => {
    cleanup();
  });
  
  /**
   * Property 2: Preservation - UI Components Display Unchanged
   * 
   * For any modelUrl input, the component SHALL continue to display:
   * - ViewModeSelector with three buttons (Perspective, Orthographic, Wireframe)
   * - ViewerControls with four buttons (Zoom In, Zoom Out, Reset, Fullscreen)
   * - ModelInfoPanel with vertex count, face count, and file size
   */
  
  describe('ViewModeSelector Preservation', () => {
    it('Property 2.1: ViewModeSelector displays three buttons with correct labels', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary valid model URLs
          fc.webUrl({ validSchemes: ['https'] }),
          (modelUrl) => {
            // GIVEN: A modelUrl is provided to ModelViewer
            const { container } = render(<ModelViewer modelUrl={modelUrl} />);
            
            // WHEN: The component renders
            // THEN: ViewModeSelector displays three buttons with correct labels
            
            const perspectiveBtn = within(container).getByText('Perspective');
            const orthographicBtn = within(container).getByText('Orthographic');
            const wireframeBtn = within(container).getByText('Wireframe');
            
            expect(perspectiveBtn).toBeTruthy();
            expect(orthographicBtn).toBeTruthy();
            expect(wireframeBtn).toBeTruthy();
            
            // Verify buttons are actual button elements
            expect(perspectiveBtn.tagName).toBe('BUTTON');
            expect(orthographicBtn.tagName).toBe('BUTTON');
            expect(wireframeBtn.tagName).toBe('BUTTON');
            
            // Verify ViewModeSelector container exists
            const viewModeSelector = container.querySelector('[class*="viewModeSelector"]');
            expect(viewModeSelector).not.toBeNull();
            
            // Verify all three buttons are children of ViewModeSelector
            expect(viewModeSelector?.contains(perspectiveBtn)).toBe(true);
            expect(viewModeSelector?.contains(orthographicBtn)).toBe(true);
            expect(viewModeSelector?.contains(wireframeBtn)).toBe(true);
            
            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 50 } // Run 50 test cases with different URLs
      );
    });
    
    it('Property 2.2: ViewModeSelector displays active state styling', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          (modelUrl) => {
            // GIVEN: A modelUrl is provided to ModelViewer
            const { container } = render(<ModelViewer modelUrl={modelUrl} />);
            
            // WHEN: The component renders with default viewMode='perspective'
            // THEN: Perspective button has active class
            
            const perspectiveBtn = within(container).getByText('Perspective');
            
            // Check that the button has an active class
            // The exact class name may vary, but it should contain 'active' or similar
            const hasActiveClass = perspectiveBtn.className.includes('active') ||
                                   perspectiveBtn.classList.contains('active');
            
            expect(hasActiveClass).toBe(true);
            
            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
  
  describe('ViewerControls Preservation', () => {
    it('Property 2.3: ViewerControls displays four buttons with correct symbols', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          (modelUrl) => {
            // GIVEN: A modelUrl is provided to ModelViewer
            const { container } = render(<ModelViewer modelUrl={modelUrl} />);
            
            // WHEN: The component renders
            // THEN: ViewerControls displays four buttons with correct symbols/titles
            
            const zoomInBtn = within(container).getByTitle('Zoom In');
            const zoomOutBtn = within(container).getByTitle('Zoom Out');
            const resetBtn = within(container).getByTitle('Reset View');
            const fullscreenBtn = within(container).getByTitle('Fullscreen');
            
            expect(zoomInBtn).toBeTruthy();
            expect(zoomOutBtn).toBeTruthy();
            expect(resetBtn).toBeTruthy();
            expect(fullscreenBtn).toBeTruthy();
            
            // Verify buttons are actual button elements
            expect(zoomInBtn.tagName).toBe('BUTTON');
            expect(zoomOutBtn.tagName).toBe('BUTTON');
            expect(resetBtn.tagName).toBe('BUTTON');
            expect(fullscreenBtn.tagName).toBe('BUTTON');
            
            // Verify ViewerControls container exists
            const viewerControls = container.querySelector('[class*="viewerControls"]');
            expect(viewerControls).not.toBeNull();
            
            // Verify all four buttons are children of ViewerControls
            expect(viewerControls?.contains(zoomInBtn)).toBe(true);
            expect(viewerControls?.contains(zoomOutBtn)).toBe(true);
            expect(viewerControls?.contains(resetBtn)).toBe(true);
            expect(viewerControls?.contains(fullscreenBtn)).toBe(true);
            
            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 50 }
      );
    });
    
    it('Property 2.4: ViewerControls buttons have correct text content', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          (modelUrl) => {
            // GIVEN: A modelUrl is provided to ModelViewer
            const { container } = render(<ModelViewer modelUrl={modelUrl} />);
            
            // WHEN: The component renders
            // THEN: Buttons display correct symbols
            
            const zoomInBtn = within(container).getByTitle('Zoom In');
            const zoomOutBtn = within(container).getByTitle('Zoom Out');
            const resetBtn = within(container).getByTitle('Reset View');
            const fullscreenBtn = within(container).getByTitle('Fullscreen');
            
            // Verify button text content (symbols)
            expect(zoomInBtn.textContent).toBe('+');
            expect(zoomOutBtn.textContent).toBe('−');
            expect(resetBtn.textContent).toBe('⟲');
            expect(fullscreenBtn.textContent).toBe('⛶');
            
            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
  
  describe('ModelInfoPanel Preservation', () => {
    it('Property 2.5: ModelInfoPanel displays with correct structure', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          (modelUrl) => {
            // GIVEN: A modelUrl is provided to ModelViewer
            const { container } = render(<ModelViewer modelUrl={modelUrl} />);
            
            // WHEN: The component renders
            // THEN: ModelInfoPanel displays with correct structure
            
            const modelInfoPanel = container.querySelector('[class*="modelInfoPanel"]');
            expect(modelInfoPanel).not.toBeNull();
            
            // Verify heading exists
            const heading = within(container).getByText('Model Information');
            expect(heading).toBeTruthy();
            expect(heading.tagName).toBe('H3');
            
            // Verify info labels exist
            const verticesLabel = within(container).getByText('Vertices:');
            const facesLabel = within(container).getByText('Faces:');
            const fileSizeLabel = within(container).getByText('File Size:');
            
            expect(verticesLabel).toBeTruthy();
            expect(facesLabel).toBeTruthy();
            expect(fileSizeLabel).toBeTruthy();
            
            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 50 }
      );
    });
    
    it('Property 2.6: ModelInfoPanel displays vertex count, face count, and file size', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          (modelUrl) => {
            // GIVEN: A modelUrl is provided to ModelViewer
            const { container } = render(<ModelViewer modelUrl={modelUrl} />);
            
            // WHEN: The component renders
            // THEN: ModelInfoPanel displays values for all three metrics
            
            // Find all info items
            const infoItems = container.querySelectorAll('[class*="infoItem"]');
            expect(infoItems.length).toBeGreaterThanOrEqual(3);
            
            // Find info values
            const infoValues = container.querySelectorAll('[class*="infoValue"]');
            expect(infoValues.length).toBeGreaterThanOrEqual(3);
            
            // Verify each value is not empty
            infoValues.forEach(value => {
              expect(value.textContent).not.toBe('');
              expect(value.textContent).not.toBeNull();
            });
            
            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
  
  describe('Component Layout Preservation', () => {
    it('Property 2.7: Component maintains wrapper structure', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          (modelUrl) => {
            // GIVEN: A modelUrl is provided to ModelViewer
            const { container } = render(<ModelViewer modelUrl={modelUrl} />);
            
            // WHEN: The component renders
            // THEN: Component maintains expected wrapper structure
            
            // Verify viewerWrapper exists
            const viewerWrapper = container.querySelector('[class*="viewerWrapper"]');
            expect(viewerWrapper).not.toBeNull();
            
            // Verify canvas container exists (even if it contains placeholder)
            const canvasContainer = container.querySelector('[class*="canvas"]');
            expect(canvasContainer).not.toBeNull();
            
            // Verify canvas container is child of viewerWrapper
            expect(viewerWrapper?.contains(canvasContainer as Node)).toBe(true);
            
            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 50 }
      );
    });
    
    it('Property 2.8: All UI components are rendered for any valid modelUrl', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          (modelUrl) => {
            // GIVEN: A modelUrl is provided to ModelViewer
            const { container } = render(<ModelViewer modelUrl={modelUrl} />);
            
            // WHEN: The component renders
            // THEN: All three UI components are present
            
            const viewModeSelector = container.querySelector('[class*="viewModeSelector"]');
            const viewerControls = container.querySelector('[class*="viewerControls"]');
            const modelInfoPanel = container.querySelector('[class*="modelInfoPanel"]');
            
            expect(viewModeSelector).not.toBeNull();
            expect(viewerControls).not.toBeNull();
            expect(modelInfoPanel).not.toBeNull();
            
            // Verify all are children of viewerWrapper
            const viewerWrapper = container.querySelector('[class*="viewerWrapper"]');
            expect(viewerWrapper?.contains(viewModeSelector as Node)).toBe(true);
            expect(viewerWrapper?.contains(viewerControls as Node)).toBe(true);
            expect(viewerWrapper?.contains(modelInfoPanel as Node)).toBe(true);
            
            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
  
  describe('Component Props Interface Preservation', () => {
    it('Property 2.9: Component accepts modelUrl prop', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          (modelUrl) => {
            // GIVEN: A modelUrl is provided to ModelViewer
            // WHEN: The component is rendered with modelUrl prop
            // THEN: Component renders without errors
            
            expect(() => {
              render(<ModelViewer modelUrl={modelUrl} />);
              cleanup();
            }).not.toThrow();
          }
        ),
        { numRuns: 50 }
      );
    });
    
    it('Property 2.10: Component renders consistently for different modelUrl values', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          fc.webUrl({ validSchemes: ['https'] }),
          (modelUrl1, modelUrl2) => {
            // GIVEN: Two different modelUrls
            const { container: container1 } = render(<ModelViewer modelUrl={modelUrl1} />);
            const { container: container2 } = render(<ModelViewer modelUrl={modelUrl2} />);
            
            // WHEN: Components are rendered with different URLs
            // THEN: Both render the same UI components structure
            
            // Check ViewModeSelector
            const viewModeSelector1 = container1.querySelector('[class*="viewModeSelector"]');
            const viewModeSelector2 = container2.querySelector('[class*="viewModeSelector"]');
            expect(viewModeSelector1).not.toBeNull();
            expect(viewModeSelector2).not.toBeNull();
            
            // Check ViewerControls
            const viewerControls1 = container1.querySelector('[class*="viewerControls"]');
            const viewerControls2 = container2.querySelector('[class*="viewerControls"]');
            expect(viewerControls1).not.toBeNull();
            expect(viewerControls2).not.toBeNull();
            
            // Check ModelInfoPanel
            const modelInfoPanel1 = container1.querySelector('[class*="modelInfoPanel"]');
            const modelInfoPanel2 = container2.querySelector('[class*="modelInfoPanel"]');
            expect(modelInfoPanel1).not.toBeNull();
            expect(modelInfoPanel2).not.toBeNull();
            
            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 25 } // Fewer runs since we're rendering twice per test
      );
    });
  });
});
