// Interfaces for Create Look feature

import * as THREE from 'three';

export type ViewMode = 'perspective' | 'orthographic' | 'wireframe';
export type CatalogCategory = 'panels' | 'lights' | 'cove' | 'bidding' | 'artwork' | 'other';

export interface ICatalogItem {
  id: string;
  name: string;
  description: string;
  category: CatalogCategory;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  unitCost?: number;
  thumbnailUrl: string;
  modelUrl: string;
  filePath: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface IAppliedModel {
  id: string;
  catalogItemId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  quantity: number;
  manualQuantity: boolean;
  penPressure?: number;
  placementMethod: 'pen' | 'mouse' | 'touch';
  isLocked?: boolean; // Lock position to prevent accidental movement
  createdAt: string;
  updatedAt: string;
}

export interface ITransform {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

export interface IModelViewerProps {
  baseModelUrl: string;
  appliedModels: IAppliedModel[];
  selectedModelId: string | null;
  showGrid: boolean;
  snapToGrid: boolean;
  viewMode: ViewMode;
  isReadOnly?: boolean;
  onLoadProgress: (progress: number, stage: string) => void;
  onLoadComplete: (metadata: IModelMetadata) => void;
  onLoadError: (error: string) => void;
  onModelDrop: (item: ICatalogItem, position: THREE.Vector3) => void;
  onModelSelect: (modelId: string | null) => void;
  onModelTransform: (modelId: string, transform: ITransform) => void;
}

export interface IModelMetadata {
  vertexCount: number;
  faceCount: number;
  fileSize: number;
  boundingBox: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
}

export interface IMarkedDimensions {
  width: number; // In feet
  height: number; // In feet
  area: number; // In square feet
}

export interface ICatalogSidebarProps {
  catalogItems: ICatalogItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onDragStart: (item: ICatalogItem, event: PointerEvent) => void;
  onItemSelect: (item: ICatalogItem) => void;
}

export interface ICatalogItemCardProps {
  item: ICatalogItem;
  onDragStart: (item: ICatalogItem, event: PointerEvent) => void;
  onTap: (item: ICatalogItem) => void;
  onLongPress: (item: ICatalogItem) => void;
}

export interface IPropertiesPanelProps {
  selectedModel: IAppliedModel | null;
  catalogItem: ICatalogItem | null;
  onPropertyChange: (modelId: string, property: string, value: any) => void;
  onDelete: (modelId: string) => void;
  onDuplicate: (modelId: string) => void;
  onResetTransform: (modelId: string) => void;
  onLockPosition?: (modelId: string) => void;
}

