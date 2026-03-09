// Page-level interfaces for model generation

export interface IModelGenerationState {
  jobId: string | null;
  jobStatus: IJobStatus | null;
  modelUrl: string | null;
  modelInfo: IModelInfo | null;
  isGenerating: boolean;
  error: string | null;
  pollingInterval: number | null;
}

export interface IJobStatus {
  jobId: string;
  status: JobStatusType;
  progress: number;
  stage: string;
  modelId?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export type JobStatusType = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface IModelInfo {
  vertexCount: number;
  faceCount: number;
  fileSize: number;
}

export type ViewMode = 'perspective' | 'orthographic' | 'wireframe';

export interface IStageStatus {
  id: number;
  text: string;
  status: 'pending' | 'active' | 'completed';
  icon: string;
  progressRange: [number, number];
}

export interface IProgressSectionProps {
  jobStatus: IJobStatus | null;
}

export interface IProgressBarProps {
  progress: number;
}

export interface IStagesListProps {
  currentStage: string;
  progress: number;
}

export interface IModelViewerProps {
  modelUrl: string;
}

export interface IViewerControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFullscreen: () => void;
}

export interface IViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export interface IModelInfoPanelProps {
  modelInfo: IModelInfo | null;
}

export interface IErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onGoBack?: () => void;
}
