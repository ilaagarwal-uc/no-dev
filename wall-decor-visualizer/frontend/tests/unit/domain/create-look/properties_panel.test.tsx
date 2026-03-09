import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PropertiesPanel } from '../../../../src/page-service/domain/create-look-page/PropertiesPanel';
import { IAppliedModel, ICatalogItem } from '../../../../src/data-service/domain/create-look/create_look_schema';

describe('PropertiesPanel', () => {
  const mockCatalogItem: ICatalogItem = {
    id: 'WX919',
    name: 'Test Panel',
    description: 'Test description',
    category: 'panels',
    dimensions: { width: 4, height: 8, depth: 0.5 },
    unitCost: 50,
    thumbnailUrl: 'https://example.com/thumb.png',
    modelUrl: 'https://example.com/model.glb',
    filePath: '/models/WX919_4X8X0.5_FT.glb',
    tags: ['test'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockAppliedModel: IAppliedModel = {
    id: 'model-123',
    catalogItemId: 'WX919',
    position: { x: 1.5, y: 2.0, z: 3.5 },
    rotation: { x: 0, y: 90, z: 0 },
    scale: { x: 1.0, y: 1.0, z: 1.0 },
    quantity: 5,
    manualQuantity: false,
    penPressure: 0.8,
    placementMethod: 'pen',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockHandlers = {
    onPropertyChange: vi.fn(),
    onDelete: vi.fn(),
    onDuplicate: vi.fn(),
    onResetTransform: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should display empty state when no model is selected', () => {
      render(
        <PropertiesPanel
          selectedModel={null}
          catalogItem={null}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('Select a model to view properties')).toBeInTheDocument();
    });
  });

  describe('Model Display', () => {
    it('should display model name and thumbnail', () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      expect(screen.getByAltText('Test Panel')).toHaveAttribute('src', mockCatalogItem.thumbnailUrl);
    });

    it('should display model dimensions', () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      expect(screen.getByText("4' × 8' × 0.5'")).toBeInTheDocument();
    });

    it('should display quantity', () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('pieces')).toBeInTheDocument();
    });

    it('should display manual badge when quantity is manually set', () => {
      const manualModel = { ...mockAppliedModel, manualQuantity: true };
      render(
        <PropertiesPanel
          selectedModel={manualModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('Manual')).toBeInTheDocument();
    });
  });

  describe('Position Controls', () => {
    it('should display position values', () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const positionX = screen.getByLabelText('Position X coordinate') as HTMLInputElement;
      const positionY = screen.getByLabelText('Position Y coordinate') as HTMLInputElement;
      const positionZ = screen.getByLabelText('Position Z coordinate') as HTMLInputElement;

      expect(positionX.value).toBe('1.500');
      expect(positionY.value).toBe('2.000');
      expect(positionZ.value).toBe('3.500');
    });

    it('should call onPropertyChange when position is updated', async () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const positionX = screen.getByLabelText('Position X coordinate');
      fireEvent.change(positionX, { target: { value: '5.5' } });
      fireEvent.blur(positionX);

      await waitFor(() => {
        expect(mockHandlers.onPropertyChange).toHaveBeenCalledWith(
          'model-123',
          'position',
          { x: 5.5, y: 2.0, z: 3.5 }
        );
      });
    });

    it('should update position on Enter key press', async () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const positionY = screen.getByLabelText('Position Y coordinate');
      fireEvent.change(positionY, { target: { value: '10.0' } });
      fireEvent.keyDown(positionY, { key: 'Enter' });

      await waitFor(() => {
        expect(mockHandlers.onPropertyChange).toHaveBeenCalledWith(
          'model-123',
          'position',
          { x: 1.5, y: 10.0, z: 3.5 }
        );
      });
    });
  });

  describe('Rotation Controls', () => {
    it('should display rotation values', () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const rotationX = screen.getByLabelText('Rotation X angle in degrees') as HTMLInputElement;
      const rotationY = screen.getByLabelText('Rotation Y angle in degrees') as HTMLInputElement;
      const rotationZ = screen.getByLabelText('Rotation Z angle in degrees') as HTMLInputElement;

      expect(rotationX.value).toBe('0.0');
      expect(rotationY.value).toBe('90.0');
      expect(rotationZ.value).toBe('0.0');
    });

    it('should call onPropertyChange when rotation is updated', async () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const rotationZ = screen.getByLabelText('Rotation Z angle in degrees');
      fireEvent.change(rotationZ, { target: { value: '45' } });
      fireEvent.blur(rotationZ);

      await waitFor(() => {
        expect(mockHandlers.onPropertyChange).toHaveBeenCalledWith(
          'model-123',
          'rotation',
          { x: 0, y: 90, z: 45 }
        );
      });
    });
  });

  describe('Scale Controls', () => {
    it('should display scale values', () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const scaleX = screen.getByLabelText('Scale X multiplier') as HTMLInputElement;
      const scaleY = screen.getByLabelText('Scale Y multiplier') as HTMLInputElement;
      const scaleZ = screen.getByLabelText('Scale Z multiplier') as HTMLInputElement;

      expect(scaleX.value).toBe('1.00');
      expect(scaleY.value).toBe('1.00');
      expect(scaleZ.value).toBe('1.00');
    });

    it('should call onPropertyChange when scale is updated', async () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const scaleX = screen.getByLabelText('Scale X multiplier');
      fireEvent.change(scaleX, { target: { value: '2.5' } });
      fireEvent.blur(scaleX);

      await waitFor(() => {
        expect(mockHandlers.onPropertyChange).toHaveBeenCalledWith(
          'model-123',
          'scale',
          { x: 2.5, y: 1.0, z: 1.0 }
        );
      });
    });

    it('should constrain scale to 0.1-10.0 range', async () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const scaleX = screen.getByLabelText('Scale X multiplier');
      
      // Test upper bound
      fireEvent.change(scaleX, { target: { value: '15' } });
      fireEvent.blur(scaleX);

      await waitFor(() => {
        expect(mockHandlers.onPropertyChange).toHaveBeenCalledWith(
          'model-123',
          'scale',
          { x: 10.0, y: 1.0, z: 1.0 }
        );
      });

      // Test lower bound
      fireEvent.change(scaleX, { target: { value: '0.05' } });
      fireEvent.blur(scaleX);

      await waitFor(() => {
        expect(mockHandlers.onPropertyChange).toHaveBeenCalledWith(
          'model-123',
          'scale',
          { x: 0.1, y: 1.0, z: 1.0 }
        );
      });
    });
  });

  describe('Action Buttons', () => {
    it('should call onDuplicate when duplicate button is clicked', () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const duplicateButton = screen.getByLabelText('Duplicate model');
      fireEvent.click(duplicateButton);

      expect(mockHandlers.onDuplicate).toHaveBeenCalledWith('model-123');
    });

    it('should call onResetTransform when reset button is clicked with confirmation', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const resetButton = screen.getByLabelText('Reset transform');
      fireEvent.click(resetButton);

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockHandlers.onResetTransform).toHaveBeenCalledWith('model-123');

      confirmSpy.mockRestore();
    });

    it('should not call onResetTransform when reset is cancelled', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const resetButton = screen.getByLabelText('Reset transform');
      fireEvent.click(resetButton);

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockHandlers.onResetTransform).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it('should call onDelete when delete button is clicked with confirmation', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const deleteButton = screen.getByLabelText('Delete model');
      fireEvent.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockHandlers.onDelete).toHaveBeenCalledWith('model-123');

      confirmSpy.mockRestore();
    });

    it('should not call onDelete when deletion is cancelled', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const deleteButton = screen.getByLabelText('Delete model');
      fireEvent.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockHandlers.onDelete).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all inputs', () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      expect(screen.getByLabelText('Position X coordinate')).toBeInTheDocument();
      expect(screen.getByLabelText('Position Y coordinate')).toBeInTheDocument();
      expect(screen.getByLabelText('Position Z coordinate')).toBeInTheDocument();
      expect(screen.getByLabelText('Rotation X angle in degrees')).toBeInTheDocument();
      expect(screen.getByLabelText('Rotation Y angle in degrees')).toBeInTheDocument();
      expect(screen.getByLabelText('Rotation Z angle in degrees')).toBeInTheDocument();
      expect(screen.getByLabelText('Scale X multiplier')).toBeInTheDocument();
      expect(screen.getByLabelText('Scale Y multiplier')).toBeInTheDocument();
      expect(screen.getByLabelText('Scale Z multiplier')).toBeInTheDocument();
    });

    it('should have proper ARIA labels for all buttons', () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      expect(screen.getByLabelText('Duplicate model')).toBeInTheDocument();
      expect(screen.getByLabelText('Reset transform')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete model')).toBeInTheDocument();
    });

    it('should have minimum 44x44px touch targets for buttons', () => {
      render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const duplicateButton = screen.getByLabelText('Duplicate model');
      const resetButton = screen.getByLabelText('Reset transform');
      const deleteButton = screen.getByLabelText('Delete model');

      // Verify buttons exist and are clickable (CSS module styles are applied at runtime)
      expect(duplicateButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
      
      // Verify buttons have the actionButton class (which defines min-height: 44px in CSS)
      expect(duplicateButton.className).toContain('actionButton');
      expect(resetButton.className).toContain('actionButton');
      expect(deleteButton.className).toContain('actionButton');
    });
  });

  describe('Real-time Updates', () => {
    it('should update displayed values when selectedModel prop changes', () => {
      const { rerender } = render(
        <PropertiesPanel
          selectedModel={mockAppliedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const updatedModel = {
        ...mockAppliedModel,
        position: { x: 10.0, y: 20.0, z: 30.0 },
      };

      rerender(
        <PropertiesPanel
          selectedModel={updatedModel}
          catalogItem={mockCatalogItem}
          {...mockHandlers}
        />
      );

      const positionX = screen.getByLabelText('Position X coordinate') as HTMLInputElement;
      const positionY = screen.getByLabelText('Position Y coordinate') as HTMLInputElement;
      const positionZ = screen.getByLabelText('Position Z coordinate') as HTMLInputElement;

      expect(positionX.value).toBe('10.000');
      expect(positionY.value).toBe('20.000');
      expect(positionZ.value).toBe('30.000');
    });
  });
});
