import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { CatalogSidebar } from './CatalogSidebar';
import { ModelViewer } from './ModelViewer';
import { PropertiesPanel } from './PropertiesPanel';
import { SaveLookModal } from './SaveLookModal';
import { ShareModal } from './ShareModal';
import { BOMModal } from './BOMModal';
import { ViewerControls } from './ViewerControls';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorDisplay } from './ErrorDisplay';
import { ScreenReaderAnnouncer, useScreenReaderAnnouncer } from './ScreenReaderAnnouncer';
import {
  ICatalogItem,
  IAppliedModel,
  ITransform,
  IModelMetadata,
  ViewMode,
} from './interface';
import { getCatalogModels } from '../../../data-service/application/catalog/get_catalog_models.api';
import { saveLook, updateLook } from '../../../data-service/application/look-persistence/look_persistence.api';
import {
  calculateQuantity,
  recalculateQuantityOnScaleChange,
} from '../../../data-service/application/create-look/quantity_calculator';
import styles from './create_look_page.module.css';

interface ICreateLookPageProps {
  baseModelId?: string;
}

export const CreateLookPage: React.FC<ICreateLookPageProps> = ({ baseModelId: propBaseModelId }) => {
  const { baseModelId: paramBaseModelId } = useParams<{ baseModelId: string }>();
  const navigate = useNavigate();
  const baseModelId = propBaseModelId || paramBaseModelId;

  // State management
  const [baseModelUrl, setBaseModelUrl] = useState<string | null>(null);
  const [baseModelMetadata, setBaseModelMetadata] = useState<IModelMetadata | null>(null);
  const [catalogItems, setCatalogItems] = useState<ICatalogItem[]>([]);
  const [appliedModels, setAppliedModels] = useState<IAppliedModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  
  // Marked dimensions from dimension marking phase (default values for now)
  const [markedDimensions] = useState({
    width: 10, // feet
    height: 8, // feet
    area: 80, // square feet
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // View settings
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('perspective');
  const [isCatalogCollapsed, setIsCatalogCollapsed] = useState(false);
  
  // Modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBOMModal, setShowBOMModal] = useState(false);
  const [currentLookId, setCurrentLookId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<ICatalogItem | null>(null);

  // Screen reader announcements
  const { announcement, politeness, announce } = useScreenReaderAnnouncer();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z for undo (placeholder - would need undo/redo implementation)
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        announce('Undo not yet implemented', 'polite');
      }
      
      // Ctrl+Y for redo (placeholder - would need undo/redo implementation)
      if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        announce('Redo not yet implemented', 'polite');
      }
      
      // Escape to deselect
      if (event.key === 'Escape') {
        if (selectedModelId) {
          setSelectedModelId(null);
          announce('Model deselected', 'polite');
        }
      }
      
      // Delete key to delete selected model
      if (event.key === 'Delete' && selectedModelId) {
        handleDelete(selectedModelId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedModelId, handleDelete, announce]);

  // Initialize page - fetch base model and catalog
  useEffect(() => {
    initializePage();
  }, [baseModelId]);

  const initializePage = async () => {
    if (!baseModelId) {
      setError('No base model ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Stage 1: Fetch base model
      setLoadingStage('Loading base model...');
      setLoadingProgress(10);
      
      // TODO: Implement actual base model fetching from backend
      // For now, use a placeholder
      const mockBaseModelUrl = `/api/models/${baseModelId}/model.glb`;
      setBaseModelUrl(mockBaseModelUrl);
      setLoadingProgress(30);
      
      // Stage 2: Load catalog items
      setLoadingStage('Loading catalog...');
      setLoadingProgress(50);
      
      const catalog = await getCatalogModels();
      setCatalogItems(catalog);
      setLoadingProgress(70);
      
      // Stage 3: Initialize complete
      setLoadingStage('Initializing viewer...');
      setLoadingProgress(85);
      
      // Wait for viewer to initialize (handled by ModelViewer component)
      setLoadingProgress(100);
      setLoadingStage('Complete');
      
      // Small delay before hiding loading screen
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
      
    } catch (err) {
      console.error('Failed to initialize page:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize page';
      setError(errorMessage);
      setIsLoading(false);
      
      // Log error to backend
      logErrorToBackend('page_initialization', errorMessage);
    }
  };

  // Handle model drop from catalog
  const handleModelDrop = useCallback((item: ICatalogItem, position: THREE.Vector3) => {
    try {
      // Create initial model with scale 1.0
      const tempModel: IAppliedModel = {
        id: generateUUID(),
        catalogItemId: item.id,
        position: { x: position.x, y: position.y, z: position.z },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        quantity: 1,
        manualQuantity: false,
        placementMethod: 'pen',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Calculate quantity
      const quantityResult = calculateQuantity(tempModel, item, markedDimensions);
      
      // Create final model with calculated quantity
      const newModel: IAppliedModel = {
        ...tempModel,
        quantity: quantityResult.quantity,
      };

      setAppliedModels(prev => [...prev, newModel]);
      setSelectedModelId(newModel.id);
      setIsDragging(false);
      setDraggedItem(null);
      
      // Announce to screen readers
      announce(`Model ${item.name} placed on wall at position ${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}. Quantity: ${quantityResult.quantity}`, 'polite');
    } catch (err) {
      console.error('Failed to place model:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to place model';
      setError(errorMessage);
      logErrorToBackend('model_placement', errorMessage);
    }
  }, [markedDimensions, announce]);

  // Handle model selection
  const handleModelSelect = useCallback((modelId: string | null) => {
    setSelectedModelId(modelId);
  }, []);

  // Handle model transform
  const handleModelTransform = useCallback((modelId: string, transform: ITransform) => {
    setAppliedModels(prev =>
      prev.map(model => {
        if (model.id !== modelId) return model;
        
        const updatedModel = {
          ...model,
          ...transform,
          updatedAt: new Date().toISOString(),
        };
        
        // Recalculate quantity if scale changed and not manually set
        if (transform.scale && !model.manualQuantity) {
          const catalogItem = catalogItems.find(c => c.id === model.catalogItemId);
          
          if (catalogItem) {
            const quantityResult = recalculateQuantityOnScaleChange(
              updatedModel,
              catalogItem,
              markedDimensions
            );
            updatedModel.quantity = quantityResult.quantity;
          }
        }
        
        return updatedModel;
      })
    );
    
    // Announce transform changes to screen readers
    const model = appliedModels.find(m => m.id === modelId);
    if (model) {
      const catalogItem = catalogItems.find(c => c.id === model.catalogItemId);
      if (catalogItem && transform.position) {
        announce(`${catalogItem.name} moved to ${transform.position.x.toFixed(1)}, ${transform.position.y.toFixed(1)}, ${transform.position.z.toFixed(1)}`, 'polite');
      } else if (catalogItem && transform.rotation) {
        announce(`${catalogItem.name} rotated`, 'polite');
      } else if (catalogItem && transform.scale) {
        announce(`${catalogItem.name} scaled`, 'polite');
      }
    }
  }, [appliedModels, catalogItems, markedDimensions, announce]);

  // Handle property change from properties panel
  const handlePropertyChange = useCallback((modelId: string, property: string, value: any) => {
    setAppliedModels(prev =>
      prev.map(model => {
        if (model.id !== modelId) return model;
        
        const updatedModel = {
          ...model,
          [property]: value,
          updatedAt: new Date().toISOString(),
        };
        
        // Recalculate quantity if scale changed and not manually set
        if (property === 'scale' && !model.manualQuantity) {
          const catalogItem = catalogItems.find(c => c.id === model.catalogItemId);
          
          if (catalogItem) {
            const quantityResult = recalculateQuantityOnScaleChange(
              updatedModel,
              catalogItem,
              markedDimensions
            );
            updatedModel.quantity = quantityResult.quantity;
          }
        }
        
        // Recalculate quantity if manual flag is cleared
        if (property === 'manualQuantity' && value === false) {
          const catalogItem = catalogItems.find(c => c.id === model.catalogItemId);
          
          if (catalogItem) {
            const quantityResult = calculateQuantity(
              updatedModel,
              catalogItem,
              markedDimensions
            );
            updatedModel.quantity = quantityResult.quantity;
          }
        }
        
        return updatedModel;
      })
    );
  }, [catalogItems, markedDimensions]);

  // Handle model deletion
  const handleDelete = useCallback((modelId: string) => {
    const model = appliedModels.find(m => m.id === modelId);
    const catalogItem = model ? catalogItems.find(c => c.id === model.catalogItemId) : null;
    
    setAppliedModels(prev => prev.filter(model => model.id !== modelId));
    if (selectedModelId === modelId) {
      setSelectedModelId(null);
    }
    
    // Announce deletion to screen readers
    if (catalogItem) {
      announce(`${catalogItem.name} deleted from wall`, 'polite');
    }
  }, [selectedModelId, appliedModels, catalogItems, announce]);

  // Handle model duplication
  const handleDuplicate = useCallback((modelId: string) => {
    const modelToDuplicate = appliedModels.find(m => m.id === modelId);
    if (!modelToDuplicate) return;

    const catalogItem = catalogItems.find(c => c.id === modelToDuplicate.catalogItemId);
    
    const duplicatedModel: IAppliedModel = {
      ...modelToDuplicate,
      id: generateUUID(),
      position: {
        x: modelToDuplicate.position.x + 0.5,
        y: modelToDuplicate.position.y,
        z: modelToDuplicate.position.z + 0.5,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAppliedModels(prev => [...prev, duplicatedModel]);
    setSelectedModelId(duplicatedModel.id);
    
    // Announce duplication to screen readers
    if (catalogItem) {
      announce(`${catalogItem.name} duplicated`, 'polite');
    }
  }, [appliedModels, catalogItems, announce]);

  // Handle transform reset
  const handleResetTransform = useCallback((modelId: string) => {
    setAppliedModels(prev =>
      prev.map(model =>
        model.id === modelId
          ? {
              ...model,
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 },
              updatedAt: new Date().toISOString(),
            }
          : model
      )
    );
  }, []);

  // Handle drag start from catalog
  const handleDragStart = useCallback((item: ICatalogItem, event: PointerEvent) => {
    setIsDragging(true);
    setDraggedItem(item);
  }, []);

  // Handle catalog item select
  const handleItemSelect = useCallback((item: ICatalogItem) => {
    console.log('Catalog item selected:', item);
  }, []);

  // Handle save look
  const handleSaveLook = async (name: string, description: string) => {
    try {
      // TODO: Capture thumbnail from viewer
      const thumbnailUrl = ''; // Placeholder
      
      const lookData = {
        name,
        description,
        baseModelId: baseModelId!,
        appliedModels,
        thumbnailUrl,
      };

      if (currentLookId) {
        // Update existing look
        await updateLook(currentLookId, lookData);
      } else {
        // Save new look
        const result = await saveLook(lookData);
        setCurrentLookId(result.lookId);
        setShareLink(result.shareLink);
      }

      setShowSaveModal(false);
      // Show success message or navigate
    } catch (err) {
      console.error('Failed to save look:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save look';
      setError(errorMessage);
      logErrorToBackend('look_save', errorMessage);
    }
  };

  // Handle load progress from viewer
  const handleLoadProgress = useCallback((progress: number, stage: string) => {
    setLoadingProgress(progress);
    setLoadingStage(stage);
  }, []);

  // Handle load complete from viewer
  const handleLoadComplete = useCallback((metadata: IModelMetadata) => {
    setBaseModelMetadata(metadata);
  }, []);

  // Handle load error from viewer
  const handleLoadError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    logErrorToBackend('model_load', errorMessage);
  }, []);

  // Handle BOM export to PDF
  const handleExportPDF = useCallback(() => {
    try {
      // Use browser's print functionality to generate PDF
      // The BOM modal has print styles defined in its CSS
      window.print();
      announce('Opening print dialog for PDF export', 'polite');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to export PDF';
      setError(errorMessage);
      logErrorToBackend('pdf_export', errorMessage);
    }
  }, [announce]);

  // Handle BOM export to CSV
  const handleExportCSV = useCallback(() => {
    try {
      // Generate CSV content
      const csvRows: string[] = [];
      
      // Header row
      csvRows.push('Category,Item Name,Dimensions,Quantity,Unit Cost,Total Cost,Coverage Area,Instances');
      
      // Data rows
      for (const model of appliedModels) {
        const catalogItem = catalogItems.find(c => c.id === model.catalogItemId);
        if (!catalogItem) continue;
        
        const dimensions = `${catalogItem.dimensions.width}' × ${catalogItem.dimensions.height}' × ${catalogItem.dimensions.depth}'`;
        const unitCost = catalogItem.unitCost !== undefined ? catalogItem.unitCost.toFixed(2) : 'N/A';
        const totalCost = catalogItem.unitCost !== undefined ? (model.quantity * catalogItem.unitCost).toFixed(2) : 'N/A';
        const coverageArea = (model.quantity * catalogItem.dimensions.width * catalogItem.dimensions.height).toFixed(2);
        
        csvRows.push(
          `${catalogItem.category},${catalogItem.name},"${dimensions}",${model.quantity},${unitCost},${totalCost},${coverageArea},1`
        );
      }
      
      // Create CSV blob
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bom_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      announce('Bill of Materials exported to CSV', 'polite');
    } catch (err) {
      console.error('Failed to export CSV:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to export CSV';
      setError(errorMessage);
      logErrorToBackend('csv_export', errorMessage);
    }
  }, [appliedModels, catalogItems, announce]);

  // Handle retry
  const handleRetry = () => {
    if (retryCount >= 3) {
      setError('Maximum retry attempts reached. Please refresh the page.');
      return;
    }
    setRetryCount(prev => prev + 1);
    setError(null);
    initializePage();
  };

  // Get selected model and catalog item
  const selectedModel = appliedModels.find(m => m.id === selectedModelId) || null;
  const selectedCatalogItem = selectedModel
    ? catalogItems.find(c => c.id === selectedModel.catalogItemId) || null
    : null;

  // Render loading screen
  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingIndicator
          progress={loadingProgress}
          stage={loadingStage}
        />
      </div>
    );
  }

  // Render error screen
  if (error && !baseModelUrl) {
    return (
      <div className={styles.container}>
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
          retryDisabled={retryCount >= 3}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Catalog Sidebar */}
      <CatalogSidebar
        catalogItems={catalogItems}
        isCollapsed={isCatalogCollapsed}
        onToggleCollapse={() => setIsCatalogCollapsed(!isCatalogCollapsed)}
        onDragStart={handleDragStart}
        onItemSelect={handleItemSelect}
      />

      {/* Main Viewer Area */}
      <div className={styles.viewerContainer}>
        {baseModelUrl && (
          <ModelViewer
            baseModelUrl={baseModelUrl}
            appliedModels={appliedModels}
            selectedModelId={selectedModelId}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            viewMode={viewMode}
            onLoadProgress={handleLoadProgress}
            onLoadComplete={handleLoadComplete}
            onLoadError={handleLoadError}
            onModelDrop={handleModelDrop}
            onModelSelect={handleModelSelect}
            onModelTransform={handleModelTransform}
          />
        )}

        {/* Viewer Controls Overlay */}
        <ViewerControls
          viewMode={viewMode}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          onViewModeChange={setViewMode}
          onGridToggle={() => setShowGrid(!showGrid)}
          onSnapToggle={() => setSnapToGrid(!snapToGrid)}
          onResetView={() => {
            // TODO: Implement reset view
          }}
          onSave={() => setShowSaveModal(true)}
          onShare={() => setShowShareModal(true)}
          onShowBOM={() => setShowBOMModal(true)}
        />
      </div>

      {/* Properties Panel */}
      {selectedModel && (
        <PropertiesPanel
          selectedModel={selectedModel}
          catalogItem={selectedCatalogItem}
          onPropertyChange={handlePropertyChange}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onResetTransform={handleResetTransform}
        />
      )}

      {/* Modals */}
      {showSaveModal && (
        <SaveLookModal
          currentLook={null}
          onSave={handleSaveLook}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {showShareModal && shareLink && (
        <ShareModal
          shareLink={shareLink}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showBOMModal && (
        <BOMModal
          isOpen={showBOMModal}
          appliedModels={appliedModels}
          catalogItems={catalogItems}
          onClose={() => setShowBOMModal(false)}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
        />
      )}

      {/* Error Toast */}
      {error && baseModelUrl && (
        <div className={styles.errorToast}>
          {error}
          <button onClick={() => setError(null)} className={styles.closeButton}>
            ×
          </button>
        </div>
      )}

      {/* Screen Reader Announcements */}
      <ScreenReaderAnnouncer message={announcement} politeness={politeness} />
    </div>
  );
};

// Helper functions
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function logErrorToBackend(errorType: string, errorMessage: string): void {
  // TODO: Implement actual error logging to backend
  console.error(`[${errorType}]`, errorMessage);
}
