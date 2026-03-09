import React, { useState, useEffect } from 'react';
import { IAppliedModel, ICatalogItem } from '../../../data-service/domain/create-look/create_look_schema';
import { setManualQuantity } from '../../../data-service/application/create-look/quantity_calculator';
import styles from './properties_panel.module.css';

interface IPropertiesPanelProps {
  selectedModel: IAppliedModel | null;
  catalogItem: ICatalogItem | null;
  onPropertyChange: (modelId: string, property: string, value: any) => void;
  onDelete: (modelId: string) => void;
  onDuplicate: (modelId: string) => void;
  onResetTransform: (modelId: string) => void;
}

export const PropertiesPanel: React.FC<IPropertiesPanelProps> = ({
  selectedModel,
  catalogItem,
  onPropertyChange,
  onDelete,
  onDuplicate,
  onResetTransform,
}) => {
  // Local state for input values (for controlled inputs)
  const [positionX, setPositionX] = useState<string>('0');
  const [positionY, setPositionY] = useState<string>('0');
  const [positionZ, setPositionZ] = useState<string>('0');
  const [rotationX, setRotationX] = useState<string>('0');
  const [rotationY, setRotationY] = useState<string>('0');
  const [rotationZ, setRotationZ] = useState<string>('0');
  const [scaleX, setScaleX] = useState<string>('1');
  const [scaleY, setScaleY] = useState<string>('1');
  const [scaleZ, setScaleZ] = useState<string>('1');
  const [quantity, setQuantity] = useState<string>('1');
  const [isEditingQuantity, setIsEditingQuantity] = useState<boolean>(false);

  // Update local state when selected model changes
  useEffect(() => {
    if (selectedModel) {
      setPositionX(selectedModel.position.x.toFixed(3));
      setPositionY(selectedModel.position.y.toFixed(3));
      setPositionZ(selectedModel.position.z.toFixed(3));
      setRotationX(selectedModel.rotation.x.toFixed(1));
      setRotationY(selectedModel.rotation.y.toFixed(1));
      setRotationZ(selectedModel.rotation.z.toFixed(1));
      setScaleX(selectedModel.scale.x.toFixed(2));
      setScaleY(selectedModel.scale.y.toFixed(2));
      setScaleZ(selectedModel.scale.z.toFixed(2));
      setQuantity(selectedModel.quantity.toString());
      setIsEditingQuantity(false);
    }
  }, [selectedModel]);

  // Handle position change
  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: string) => {
    if (!selectedModel) return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    onPropertyChange(selectedModel.id, 'position', {
      ...selectedModel.position,
      [axis]: numValue,
    });
  };

  // Handle rotation change
  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: string) => {
    if (!selectedModel) return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    onPropertyChange(selectedModel.id, 'rotation', {
      ...selectedModel.rotation,
      [axis]: numValue,
    });
  };

  // Handle scale change
  const handleScaleChange = (axis: 'x' | 'y' | 'z', value: string) => {
    if (!selectedModel) return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    // Constrain scale to 0.1-10.0 range
    const constrainedValue = Math.max(0.1, Math.min(10.0, numValue));

    onPropertyChange(selectedModel.id, 'scale', {
      ...selectedModel.scale,
      [axis]: constrainedValue,
    });
  };

  // Handle quantity change
  const handleQuantityChange = (value: string) => {
    if (!selectedModel) return;

    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) return;
    
    // Set manual quantity
    const updatedModel = setManualQuantity(selectedModel, numValue);
    
    // Update the model
    onPropertyChange(selectedModel.id, 'quantity', updatedModel.quantity);
    onPropertyChange(selectedModel.id, 'manualQuantity', true);
  };

  // Handle clear manual quantity
  const handleClearManualQuantity = () => {
    if (!selectedModel) return;

    onPropertyChange(selectedModel.id, 'manualQuantity', false);
    // The quantity will be recalculated automatically in CreateLookPage
  };

  // Handle delete
  const handleDelete = () => {
    if (!selectedModel) return;
    if (window.confirm('Are you sure you want to delete this model?')) {
      onDelete(selectedModel.id);
    }
  };

  // Handle duplicate
  const handleDuplicate = () => {
    if (!selectedModel) return;
    onDuplicate(selectedModel.id);
  };

  // Handle reset transform
  const handleResetTransform = () => {
    if (!selectedModel) return;
    if (window.confirm('Reset this model to its original transform?')) {
      onResetTransform(selectedModel.id);
    }
  };

  // If no model is selected, show empty state
  if (!selectedModel || !catalogItem) {
    return (
      <div className={styles.panel}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Select a model to view properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {/* Header with model info */}
      <div className={styles.header}>
        <div className={styles.thumbnailContainer}>
          <img
            src={catalogItem.thumbnailUrl}
            alt={catalogItem.name}
            className={styles.thumbnail}
          />
        </div>
        <div className={styles.modelInfo}>
          <h3 className={styles.modelName}>{catalogItem.name}</h3>
          <p className={styles.modelDimensions}>
            {catalogItem.dimensions.width}' × {catalogItem.dimensions.height}' × {catalogItem.dimensions.depth}'
          </p>
        </div>
      </div>

      {/* Position Controls */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Position</h4>
        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="position-x" className={styles.label}>X</label>
            <input
              id="position-x"
              type="number"
              step="0.1"
              value={positionX}
              onChange={(e) => setPositionX(e.target.value)}
              onBlur={(e) => handlePositionChange('x', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePositionChange('x', positionX);
                }
              }}
              className={styles.input}
              aria-label="Position X coordinate"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="position-y" className={styles.label}>Y</label>
            <input
              id="position-y"
              type="number"
              step="0.1"
              value={positionY}
              onChange={(e) => setPositionY(e.target.value)}
              onBlur={(e) => handlePositionChange('y', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePositionChange('y', positionY);
                }
              }}
              className={styles.input}
              aria-label="Position Y coordinate"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="position-z" className={styles.label}>Z</label>
            <input
              id="position-z"
              type="number"
              step="0.1"
              value={positionZ}
              onChange={(e) => setPositionZ(e.target.value)}
              onBlur={(e) => handlePositionChange('z', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePositionChange('z', positionZ);
                }
              }}
              className={styles.input}
              aria-label="Position Z coordinate"
            />
          </div>
        </div>
      </div>

      {/* Rotation Controls */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Rotation (degrees)</h4>
        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="rotation-x" className={styles.label}>X</label>
            <input
              id="rotation-x"
              type="number"
              step="1"
              value={rotationX}
              onChange={(e) => setRotationX(e.target.value)}
              onBlur={(e) => handleRotationChange('x', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRotationChange('x', rotationX);
                }
              }}
              className={styles.input}
              aria-label="Rotation X angle in degrees"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="rotation-y" className={styles.label}>Y</label>
            <input
              id="rotation-y"
              type="number"
              step="1"
              value={rotationY}
              onChange={(e) => setRotationY(e.target.value)}
              onBlur={(e) => handleRotationChange('y', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRotationChange('y', rotationY);
                }
              }}
              className={styles.input}
              aria-label="Rotation Y angle in degrees"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="rotation-z" className={styles.label}>Z</label>
            <input
              id="rotation-z"
              type="number"
              step="1"
              value={rotationZ}
              onChange={(e) => setRotationZ(e.target.value)}
              onBlur={(e) => handleRotationChange('z', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRotationChange('z', rotationZ);
                }
              }}
              className={styles.input}
              aria-label="Rotation Z angle in degrees"
            />
          </div>
        </div>
      </div>

      {/* Scale Controls */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Scale</h4>
        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="scale-x" className={styles.label}>X</label>
            <input
              id="scale-x"
              type="number"
              step="0.1"
              min="0.1"
              max="10.0"
              value={scaleX}
              onChange={(e) => setScaleX(e.target.value)}
              onBlur={(e) => handleScaleChange('x', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleScaleChange('x', scaleX);
                }
              }}
              className={styles.input}
              aria-label="Scale X multiplier"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="scale-y" className={styles.label}>Y</label>
            <input
              id="scale-y"
              type="number"
              step="0.1"
              min="0.1"
              max="10.0"
              value={scaleY}
              onChange={(e) => setScaleY(e.target.value)}
              onBlur={(e) => handleScaleChange('y', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleScaleChange('y', scaleY);
                }
              }}
              className={styles.input}
              aria-label="Scale Y multiplier"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="scale-z" className={styles.label}>Z</label>
            <input
              id="scale-z"
              type="number"
              step="0.1"
              min="0.1"
              max="10.0"
              value={scaleZ}
              onChange={(e) => setScaleZ(e.target.value)}
              onBlur={(e) => handleScaleChange('z', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleScaleChange('z', scaleZ);
                }
              }}
              className={styles.input}
              aria-label="Scale Z multiplier"
            />
          </div>
        </div>
      </div>

      {/* Quantity Display */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Quantity</h4>
        {isEditingQuantity ? (
          <div className={styles.quantityEdit}>
            <input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={(e) => {
                handleQuantityChange(e.target.value);
                setIsEditingQuantity(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleQuantityChange(quantity);
                  setIsEditingQuantity(false);
                } else if (e.key === 'Escape') {
                  setQuantity(selectedModel.quantity.toString());
                  setIsEditingQuantity(false);
                }
              }}
              className={styles.input}
              aria-label="Quantity"
              autoFocus
            />
            <button
              onClick={() => {
                setQuantity(selectedModel.quantity.toString());
                setIsEditingQuantity(false);
              }}
              className={styles.cancelButton}
              aria-label="Cancel quantity edit"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className={styles.quantityDisplay}>
            <span className={styles.quantityValue}>{selectedModel.quantity}</span>
            <span className={styles.quantityUnit}>pieces</span>
            {selectedModel.manualQuantity && (
              <span className={styles.manualBadge} title="Manually adjusted quantity">
                Manual
              </span>
            )}
            <button
              onClick={() => setIsEditingQuantity(true)}
              className={styles.editButton}
              aria-label="Edit quantity"
              title="Edit Quantity"
            >
              ✎
            </button>
            {selectedModel.manualQuantity && (
              <button
                onClick={handleClearManualQuantity}
                className={styles.clearButton}
                aria-label="Clear manual quantity and recalculate"
                title="Recalculate"
              >
                ↺
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button
          onClick={handleDuplicate}
          className={styles.actionButton}
          aria-label="Duplicate model"
          title="Duplicate"
        >
          <span className={styles.buttonIcon}>⎘</span>
          <span className={styles.buttonText}>Duplicate</span>
        </button>
        <button
          onClick={handleResetTransform}
          className={styles.actionButton}
          aria-label="Reset transform"
          title="Reset Transform"
        >
          <span className={styles.buttonIcon}>↺</span>
          <span className={styles.buttonText}>Reset</span>
        </button>
        <button
          onClick={handleDelete}
          className={`${styles.actionButton} ${styles.deleteButton}`}
          aria-label="Delete model"
          title="Delete"
        >
          <span className={styles.buttonIcon}>🗑</span>
          <span className={styles.buttonText}>Delete</span>
        </button>
      </div>
    </div>
  );
};
