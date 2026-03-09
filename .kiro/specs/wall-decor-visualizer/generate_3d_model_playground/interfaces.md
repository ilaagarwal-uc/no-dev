# 3D Model Generation - TypeScript Interfaces and Data Structures

**Feature**: 3D Model Generation from Dimension-Marked Images
**Created**: 2024-01-15
**Purpose**: Define all TypeScript interfaces, data structures, and API contracts for 3D model generation

---

## Table of Contents

1. [Overview](#overview)
2. [Backend Domain Interfaces](#backend-domain-interfaces)
3. [Backend API Contracts](#backend-api-contracts)
4. [Frontend Domain Interfaces](#frontend-domain-interfaces)
5. [Frontend Page Interfaces](#frontend-page-interfaces)
6. [Shared Type Definitions](#shared-type-definitions)
7. [Validation Rules](#validation-rules)
8. [Examples](#examples)

---

## Overview

This document defines all TypeScript interfaces, types, and API parameters for the 3D Model Generation feature. The feature follows DDD architecture with clear separation between backend data-service and frontend page-service layers.

### Key Principles
- All coordinates use 3D space (x, y, z) with origin at bottom-left
- Dimensions are in feet (decimal format)
- Job processing is asynchronous with status polling
- Models are stored in GCP Cloud Storage with signed URLs
- All timestamps are ISO 8601 strings

---

## Backend Domain Interfaces

### Model Generation Domain

**Location**: `backend/src/data-service/domain/model-generation/model_generation_schema.ts`

#### IGenerateModelRequest
Request to generate a 3D model from dimension data.

```typescript
interface IGenerateModelRequest {
  /**
   * User ID who requested the generation
   * Used for authorization and model ownership
   */
  userId: string;

  /**
   * ID of the uploaded image with dimension marks
   * Links model to original image
   */
  imageId: string;

  /**
   * Dimension data extracted from dimension marking
   * Contains all structural elements and measurements
   */
  dimensionData: IDimensionData;

  /**
   * URL of the dimension-marked image
   * Used by Gemini API for visual context
   */
  imageUrl: string;
}
```

#### IGenerateModelResponse
Response from model generation request.

```typescript
interface IGenerateModelResponse {
  /**
   * Indicates if the request was accepted
   * true: Job queued successfully
   * false: Request rejected (validation error)
   */
  success: boolean;

  /**
   * Unique job ID for tracking generation progress
   * Format: UUID v4
   * Example: "550e8400-e29b-41d4-a716-446655440000"
   */
  jobId: string;

  /**
   * Human-readable message
   * Success: "Model generation started"
   * Error: Descriptive error message
   */
  message: string;
}
```

#### IDimensionData
Complete dimension data structure for 3D model generation.

```typescript
interface IDimensionData {
  /**
   * Array of structural elements
   * Must contain at least one MAIN_WALL element
   * Elements can reference each other via hostId
   */
  elements: IElement[];
}
```

#### IElement
Individual structural element in the dimension data.

```typescript
interface IElement {
  /**
   * Unique identifier for this element
   * Format: "element_${timestamp}_${randomString}"
   * Example: "element_1709769600000_a1b2c3d4e"
   */
  id: string;

  /**
   * Category of the element
   * STRUCTURE: Walls, beams, columns, openings
   * ELECTRICAL: Switches, AC units
   */
  category: ElementCategory;

  /**
   * Specific type of element
   * Determines geometry and behavior
   */
  type: ElementType;

  /**
   * 3D origin point of the element
   * Coordinates relative to bottom-left corner (0,0,0)
   * Units: feet (decimal)
   */
  origin: IPoint3D;

  /**
   * Dimensions of the element
   * Units: feet (decimal)
   */
  dimensions: IDimensions;

  /**
   * ID of the host element (optional)
   * Used for elements attached to walls (doors, windows, beams)
   * References another element's id
   */
  hostId?: string;

  /**
   * Side placement for return walls (optional)
   * LEFT: Return wall on left side of main wall
   * RIGHT: Return wall on right side of main wall
   */
  side?: Side;

  /**
   * Direction for return walls (optional)
   * INWARD: Return wall extends into the room
   * OUTWARD: Return wall extends away from room
   */
  direction?: Direction;

  /**
   * Arch shape for arch openings (optional)
   * SEMI: 180° semicircular arch
   * QUARTER: 90° quarter-circle arch
   */
  archShape?: ArchShape;

  /**
   * Orientation for quarter-circle arches (optional)
   * TL: Top-left, TR: Top-right, BL: Bottom-left, BR: Bottom-right
   */
  orientation?: Orientation;

  /**
   * Radius for arch openings (optional)
   * Units: feet (decimal)
   * Used for ARCH_OPENING and DOOR_ARCH types
   */
  radius?: number;
}
```

#### Type Definitions

```typescript
/**
 * Element category types
 */
type ElementCategory = 'STRUCTURE' | 'ELECTRICAL';

/**
 * Element type definitions
 * Each type has specific geometry and rendering rules
 */
type ElementType = 
  | 'BEAM'           // Horizontal structural beam
  | 'COLUMN'         // Vertical structural column/pillar
  | 'DOOR_RECT'      // Rectangular door opening
  | 'DOOR_ARCH'      // Arched door opening
  | 'ARCH_OPENING'   // Decorative arch opening
  | 'MAIN_WALL'      // Primary wall (required)
  | 'RETURN_WALL'    // Side wall extending from main wall
  | 'WINDOW'         // Window opening
  | 'SWITCH_BOARD'   // Electrical switch board
  | 'AC'             // Air conditioning unit
  | 'NICHE'          // Recessed niche in wall
  | 'CUTOUT';        // Generic cutout/opening

/**
 * Side placement for return walls
 */
type Side = 'LEFT' | 'RIGHT';

/**
 * Direction for return walls
 */
type Direction = 'INWARD' | 'OUTWARD';

/**
 * Arch shape types
 */
type ArchShape = 'SEMI' | 'QUARTER';

/**
 * Orientation for quarter-circle arches
 */
type Orientation = 'TL' | 'TR' | 'BL' | 'BR';
```

#### IPoint3D
3D coordinate point.

```typescript
interface IPoint3D {
  /**
   * X coordinate (horizontal, left-right)
   * Origin: 0 at left edge
   * Units: feet (decimal)
   */
  x: number;

  /**
   * Y coordinate (vertical, bottom-top)
   * Origin: 0 at floor level
   * Units: feet (decimal)
   */
  y: number;

  /**
   * Z coordinate (depth, front-back)
   * Origin: 0 at front face of main wall
   * Units: feet (decimal)
   */
  z: number;
}
```

#### IDimensions
3D dimensions for elements.

```typescript
interface IDimensions {
  /**
   * Width (horizontal extent)
   * Units: feet (decimal)
   * Must be > 0
   */
  width: number;

  /**
   * Height (vertical extent)
   * Units: feet (decimal)
   * Must be > 0
   */
  height: number;

  /**
   * Depth (front-back extent)
   * Units: feet (decimal)
   * Can be 0 for flat elements
   * Negative values indicate recessed elements (niches)
   */
  depth: number;
}
```

### Job Queue Domain

**Location**: `backend/src/data-service/domain/job-queue/job_queue_schema.ts`

#### IJob
Complete job record with all metadata.

```typescript
interface IJob {
  /**
   * Unique job identifier
   * Format: UUID v4
   */
  jobId: string;

  /**
   * User who owns this job
   */
  userId: string;

  /**
   * Image ID associated with this job
   */
  imageId: string;

  /**
   * Dimension data for model generation
   */
  dimensionData: IDimensionData;

  /**
   * URL of the dimension-marked image
   */
  imageUrl: string;

  /**
   * Current job status
   */
  status: JobStatus;

  /**
   * Progress percentage (0-100)
   */
  progress: number;

  /**
   * Current processing stage description
   * Examples: "Queued", "Generating Blender script", "Executing Blender"
   */
  stage: string;

  /**
   * Generated model ID (set when job completes)
   */
  modelId?: string;

  /**
   * Error message (set when job fails)
   */
  error?: string;

  /**
   * Number of retry attempts made
   */
  retryCount: number;

  /**
   * Maximum retry attempts allowed
   * Default: 3
   */
  maxRetries: number;

  /**
   * Job creation timestamp
   */
  createdAt: Date;

  /**
   * Job processing start timestamp
   */
  startedAt?: Date;

  /**
   * Job completion timestamp
   */
  completedAt?: Date;

  /**
   * Job failure timestamp
   */
  failedAt?: Date;
}
```

#### JobStatus
Job status type definition.

```typescript
/**
 * Job status values
 * - queued: Job waiting to be processed
 * - processing: Job currently being processed
 * - completed: Job finished successfully
 * - failed: Job failed after all retries
 * - cancelled: Job cancelled by user
 */
type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
```

#### IJobUpdate
Partial update for job status.

```typescript
interface IJobUpdate {
  /**
   * New job status (optional)
   */
  status?: JobStatus;

  /**
   * New progress value (optional)
   */
  progress?: number;

  /**
   * New stage description (optional)
   */
  stage?: string;

  /**
   * Model ID when generation completes (optional)
   */
  modelId?: string;

  /**
   * Error message when job fails (optional)
   */
  error?: string;
}
```

#### IQueueStats
Queue statistics for monitoring.

```typescript
interface IQueueStats {
  /**
   * Total number of jobs in system
   */
  totalJobs: number;

  /**
   * Number of jobs waiting to be processed
   */
  queuedJobs: number;

  /**
   * Number of jobs currently processing
   */
  processingJobs: number;

  /**
   * Number of completed jobs
   */
  completedJobs: number;

  /**
   * Number of failed jobs
   */
  failedJobs: number;
}
```

### Model Storage Domain

**Location**: `backend/src/data-service/domain/model-storage/model_storage_schema.ts`

#### IUploadModelRequest
Request to upload a model to GCP.

```typescript
interface IUploadModelRequest {
  /**
   * User ID who owns the model
   */
  userId: string;

  /**
   * Job ID that generated this model
   */
  jobId: string;

  /**
   * Model file as buffer
   * Format: glTF binary data
   */
  modelFile: Buffer;

  /**
   * Original filename
   * Example: "model_123.gltf"
   */
  fileName: string;
}
```

#### IUploadModelResponse
Response from model upload.

```typescript
interface IUploadModelResponse {
  /**
   * Unique model identifier
   * Format: UUID v4
   */
  modelId: string;

  /**
   * GCP Cloud Storage path
   * Format: "userId/modelId.gltf"
   */
  gcpPath: string;

  /**
   * File size in bytes
   */
  fileSize: number;

  /**
   * Signed URL for immediate access
   * Valid for 1 hour
   */
  signedUrl: string;
}
```

#### IGetModelRequest
Request to retrieve a model.

```typescript
interface IGetModelRequest {
  /**
   * Model ID to retrieve
   */
  modelId: string;

  /**
   * User ID for authorization
   */
  userId: string;
}
```

#### IGetModelResponse
Response with model access information.

```typescript
interface IGetModelResponse {
  /**
   * Model identifier
   */
  modelId: string;

  /**
   * Signed URL for downloading model
   * Valid for 1 hour
   */
  signedUrl: string;

  /**
   * URL expiration timestamp
   */
  expiresAt: Date;

  /**
   * Model metadata
   */
  metadata: IModelMetadata;
}
```

#### IModelMetadata
Model metadata stored in database.

```typescript
interface IModelMetadata {
  /**
   * Unique model identifier
   */
  modelId: string;

  /**
   * User who owns the model
   */
  userId: string;

  /**
   * Job that generated this model
   */
  jobId: string;

  /**
   * GCP Cloud Storage path
   */
  gcpPath: string;

  /**
   * File size in bytes
   */
  fileSize: number;

  /**
   * Number of vertices in model (optional)
   * Extracted from glTF file
   */
  vertexCount?: number;

  /**
   * Number of faces in model (optional)
   * Extracted from glTF file
   */
  faceCount?: number;

  /**
   * Model creation timestamp
   */
  createdAt: Date;
}
```

### Gemini Service Domain

**Location**: `backend/src/data-service/domain/gemini-service/gemini_service_schema.ts`

#### IGeminiRequest
Request to Gemini API for script generation.

```typescript
interface IGeminiRequest {
  /**
   * Dimension data to convert to Blender script
   */
  dimensionData: IDimensionData;

  /**
   * Base64-encoded image data
   * Used for visual context in script generation
   */
  imageData: string;

  /**
   * Prompt template for Gemini
   * Includes instructions and dimension data
   */
  prompt: string;
}
```

#### IGeminiResponse
Response from Gemini API.

```typescript
interface IGeminiResponse {
  /**
   * Generated Blender Python script
   * Complete executable script
   */
  script: string;

  /**
   * Optional metadata about generation
   */
  metadata?: {
    /**
     * Number of tokens used in generation
     */
    tokensUsed: number;

    /**
     * Gemini model version used
     * Example: "gemini-pro-vision"
     */
    modelVersion: string;
  };
}
```

#### IGeminiError
Error from Gemini API.

```typescript
interface IGeminiError {
  /**
   * Error code from Gemini
   * Examples: "RATE_LIMIT", "INVALID_REQUEST", "API_ERROR"
   */
  code: string;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Whether error is retryable
   * true: Transient error, can retry
   * false: Permanent error, do not retry
   */
  retryable: boolean;
}
```

### Blender Service Domain

**Location**: `backend/src/data-service/domain/blender-service/blender_service_schema.ts`

#### IBlenderExecutionRequest
Request to execute Blender script.

```typescript
interface IBlenderExecutionRequest {
  /**
   * Python Blender script to execute
   */
  script: string;

  /**
   * Output file path for glTF export
   * Example: "/tmp/model_123.gltf"
   */
  outputPath: string;

  /**
   * Execution timeout in milliseconds (optional)
   * Default: 300000 (5 minutes)
   */
  timeout?: number;
}
```

#### IBlenderExecutionResult
Result from Blender script execution.

```typescript
interface IBlenderExecutionResult {
  /**
   * Whether execution succeeded
   */
  success: boolean;

  /**
   * Path to generated output file
   * Empty string if execution failed
   */
  outputFile: string;

  /**
   * Execution time in milliseconds
   */
  executionTime: number;

  /**
   * Error message if execution failed
   */
  error?: string;
}
```

#### IBlenderValidationResult
Result from script validation.

```typescript
interface IBlenderValidationResult {
  /**
   * Whether script is valid
   */
  valid: boolean;

  /**
   * Validation errors (blocking issues)
   */
  errors: string[];

  /**
   * Validation warnings (non-blocking issues)
   */
  warnings: string[];
}
```

---

## Backend API Contracts

### Generate Model API

**Endpoint**: `POST /api/model/generate`
**Location**: `backend/src/data-service/application/model-generation/generate_model.api.ts`

#### Request Body
```typescript
{
  userId: string;
  imageId: string;
  dimensionData: IDimensionData;
  imageUrl: string;
}
```

#### Response (202 Accepted)
```typescript
{
  success: true;
  jobId: string;
  message: "Model generation started";
}
```

#### Error Response (400 Bad Request)
```typescript
{
  success: false;
  error: string;
}
```

### Get Job Status API

**Endpoint**: `GET /api/model/job/:jobId`
**Location**: `backend/src/data-service/application/model-generation/get_job_status.api.ts`

#### Response (200 OK)
```typescript
{
  success: true;
  job: {
    jobId: string;
    status: JobStatus;
    progress: number;
    stage: string;
    modelId?: string;
    error?: string;
    createdAt: string;  // ISO 8601
    completedAt?: string;  // ISO 8601
  };
}
```

#### Error Response (404 Not Found)
```typescript
{
  success: false;
  error: "Job not found";
}
```

### Cancel Job API

**Endpoint**: `POST /api/model/job/:jobId/cancel`
**Location**: `backend/src/data-service/application/model-generation/cancel_job.api.ts`

#### Response (200 OK)
```typescript
{
  success: true;
  message: "Job cancelled";
}
```

#### Error Response (400 Bad Request)
```typescript
{
  success: false;
  error: string;
}
```

### Get Model API

**Endpoint**: `GET /api/model/:modelId`
**Location**: `backend/src/data-service/application/model-generation/get_model.api.ts`

#### Response (200 OK)
```typescript
{
  success: true;
  model: {
    modelId: string;
    signedUrl: string;
    expiresAt: string;  // ISO 8601
    metadata: {
      modelId: string;
      userId: string;
      jobId: string;
      fileSize: number;
      vertexCount?: number;
      faceCount?: number;
      createdAt: string;  // ISO 8601
    };
  };
}
```

#### Error Response (404 Not Found)
```typescript
{
  success: false;
  error: "Model not found";
}
```

### Download Model API

**Endpoint**: `GET /api/model/:modelId/download`
**Location**: `backend/src/data-service/application/model-generation/download_model.api.ts`

#### Response
Redirects to signed GCP URL for direct download.

---

## Frontend Domain Interfaces

### Model Generation Domain

**Location**: `frontend/src/data-service/domain/model-generation/model_generation_schema.ts`

#### IGenerateModelRequest
Frontend request to generate model.

```typescript
interface IGenerateModelRequest {
  /**
   * User ID from authentication
   */
  userId: string;

  /**
   * Image ID from upload
   */
  imageId: string;

  /**
   * Dimension data from dimension marking page
   */
  dimensionData: IDimensionData;

  /**
   * Image URL from upload
   */
  imageUrl: string;
}
```

#### IGenerateModelResponse
Frontend response from generate API.

```typescript
interface IGenerateModelResponse {
  /**
   * Request success status
   */
  success: boolean;

  /**
   * Job ID for tracking
   */
  jobId: string;

  /**
   * Response message
   */
  message: string;
}
```

#### IJobStatusResponse
Frontend response from job status API.

```typescript
interface IJobStatusResponse {
  /**
   * Request success status
   */
  success: boolean;

  /**
   * Job status data
   */
  job: IJobStatus;
}
```

#### IJobStatus
Frontend job status data.

```typescript
interface IJobStatus {
  /**
   * Job identifier
   */
  jobId: string;

  /**
   * Current status
   */
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

  /**
   * Progress percentage (0-100)
   */
  progress: number;

  /**
   * Current stage description
   */
  stage: string;

  /**
   * Model ID when completed
   */
  modelId?: string;

  /**
   * Error message when failed
   */
  error?: string;

  /**
   * Creation timestamp (ISO 8601)
   */
  createdAt: string;

  /**
   * Completion timestamp (ISO 8601)
   */
  completedAt?: string;
}
```

#### IModelResponse
Frontend response from get model API.

```typescript
interface IModelResponse {
  /**
   * Request success status
   */
  success: boolean;

  /**
   * Model data
   */
  model: IModel;
}
```

#### IModel
Frontend model data.

```typescript
interface IModel {
  /**
   * Model identifier
   */
  modelId: string;

  /**
   * Signed URL for model access
   */
  signedUrl: string;

  /**
   * URL expiration timestamp (ISO 8601)
   */
  expiresAt: string;

  /**
   * Model metadata
   */
  metadata: IModelMetadata;
}
```

#### IModelMetadata
Frontend model metadata.

```typescript
interface IModelMetadata {
  /**
   * Model identifier
   */
  modelId: string;

  /**
   * Owner user ID
   */
  userId: string;

  /**
   * Source job ID
   */
  jobId: string;

  /**
   * File size in bytes
   */
  fileSize: number;

  /**
   * Vertex count (optional)
   */
  vertexCount?: number;

  /**
   * Face count (optional)
   */
  faceCount?: number;

  /**
   * Creation timestamp (ISO 8601)
   */
  createdAt: string;
}
```

---

## Frontend Page Interfaces

### Model Generation Page

**Location**: `frontend/src/page-service/domain/model-generation-page/interface.ts`

#### IModelGenerationState
Complete page state for model generation.

```typescript
interface IModelGenerationState {
  /**
   * Current job ID being tracked
   * null if no job started
   */
  jobId: string | null;

  /**
   * Current job status
   * null if no job started
   */
  jobStatus: IJobStatus | null;

  /**
   * Signed URL for generated model
   * null until model is ready
   */
  modelUrl: string | null;

  /**
   * Model information for display
   * null until model is loaded
   */
  modelInfo: IModelInfo | null;

  /**
   * Whether generation is in progress
   */
  isGenerating: boolean;

  /**
   * Error message if generation failed
   * null if no error
   */
  error: string | null;

  /**
   * Polling interval ID
   * null if not polling
   */
  pollingInterval: number | null;
}
```

#### IModelInfo
Model information for UI display.

```typescript
interface IModelInfo {
  /**
   * Number of vertices in model
   */
  vertexCount: number;

  /**
   * Number of faces in model
   */
  faceCount: number;

  /**
   * File size in bytes
   */
  fileSize: number;
}
```

#### IStageStatus
Status of a generation stage.

```typescript
interface IStageStatus {
  /**
   * Stage number (1-5)
   */
  id: number;

  /**
   * Stage description text
   */
  text: string;

  /**
   * Current status
   * - pending: Not started yet
   * - active: Currently processing
   * - completed: Finished successfully
   */
  status: 'pending' | 'active' | 'completed';

  /**
   * Icon name for status indicator
   */
  icon: string;

  /**
   * Progress range for this stage
   * [startPercent, endPercent]
   * Example: [0, 10] for stage 1 (0-10%)
   */
  progressRange: [number, number];
}
```

#### ViewMode
3D viewer mode type.

```typescript
/**
 * 3D viewer camera mode
 * - perspective: Perspective projection (realistic depth)
 * - orthographic: Orthographic projection (no depth distortion)
 * - wireframe: Wireframe rendering (edges only)
 */
type ViewMode = 'perspective' | 'orthographic' | 'wireframe';
```

#### IThreeJSContext
Three.js viewer context.

```typescript
interface IThreeJSContext {
  /**
   * Three.js scene containing all objects
   */
  scene: THREE.Scene;

  /**
   * Camera for viewing the scene
   * Can be PerspectiveCamera or OrthographicCamera
   */
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;

  /**
   * WebGL renderer
   */
  renderer: THREE.WebGLRenderer;

  /**
   * Orbit controls for camera manipulation
   */
  controls: any; // OrbitControls type

  /**
   * Loaded 3D model
   * null if no model loaded
   */
  model: THREE.Group | null;
}
```

### Component Props Interfaces

#### IProgressSectionProps
Props for ProgressSection component.

```typescript
interface IProgressSectionProps {
  /**
   * Current job status
   * null if no job started
   */
  jobStatus: IJobStatus | null;
}
```

#### IProgressBarProps
Props for ProgressBar component.

```typescript
interface IProgressBarProps {
  /**
   * Progress percentage (0-100)
   */
  progress: number;
}
```

#### IStagesListProps
Props for StagesList component.

```typescript
interface IStagesListProps {
  /**
   * Current stage description
   */
  currentStage: string;

  /**
   * Current progress percentage
   */
  progress: number;
}
```

#### IModelViewerProps
Props for ModelViewer component.

```typescript
interface IModelViewerProps {
  /**
   * Signed URL of the glTF model
   */
  modelUrl: string;
}
```

#### IViewerControlsProps
Props for ViewerControls component.

```typescript
interface IViewerControlsProps {
  /**
   * Callback for zoom in action
   */
  onZoomIn: () => void;

  /**
   * Callback for zoom out action
   */
  onZoomOut: () => void;

  /**
   * Callback for reset view action
   */
  onReset: () => void;

  /**
   * Callback for fullscreen toggle
   */
  onFullscreen: () => void;
}
```

#### IViewModeSelectorProps
Props for ViewModeSelector component.

```typescript
interface IViewModeSelectorProps {
  /**
   * Current view mode
   */
  viewMode: ViewMode;

  /**
   * Callback when view mode changes
   */
  onViewModeChange: (mode: ViewMode) => void;
}
```

#### IModelInfoPanelProps
Props for ModelInfoPanel component.

```typescript
interface IModelInfoPanelProps {
  /**
   * Model information to display
   * null if no model loaded
   */
  modelInfo: IModelInfo | null;
}
```

#### IErrorDisplayProps
Props for ErrorDisplay component.

```typescript
interface IErrorDisplayProps {
  /**
   * Error message to display
   */
  error: string;

  /**
   * Callback for retry action
   */
  onRetry: () => void;

  /**
   * Optional callback for go back action
   */
  onGoBack?: () => void;
}
```

---

## Shared Type Definitions

### Generation Stages

```typescript
/**
 * Generation stage definitions
 * Each stage has a specific progress range
 */
const GENERATION_STAGES = [
  {
    id: 1,
    text: 'Validating dimension data',
    progressRange: [0, 10] as [number, number],
    icon: 'check-circle'
  },
  {
    id: 2,
    text: 'Generating Blender script with Gemini AI',
    progressRange: [10, 30] as [number, number],
    icon: 'code'
  },
  {
    id: 3,
    text: 'Executing Blender script',
    progressRange: [30, 60] as [number, number],
    icon: 'cube'
  },
  {
    id: 4,
    text: 'Exporting glTF model',
    progressRange: [60, 80] as [number, number],
    icon: 'download'
  },
  {
    id: 5,
    text: 'Uploading to cloud storage',
    progressRange: [80, 100] as [number, number],
    icon: 'cloud-upload'
  }
] as const;
```

### Error Types

```typescript
/**
 * Error type definitions for model generation
 */
enum ModelGenerationErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  GEMINI_API_ERROR = 'GEMINI_API_ERROR',
  BLENDER_EXECUTION_ERROR = 'BLENDER_EXECUTION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

### Constants

```typescript
/**
 * Configuration constants
 */
const MODEL_GENERATION_CONFIG = {
  /**
   * Job status polling interval (milliseconds)
   */
  POLLING_INTERVAL: 2000,

  /**
   * Maximum polling duration (milliseconds)
   * 5 minutes
   */
  MAX_POLLING_DURATION: 300000,

  /**
   * Maximum concurrent jobs
   */
  MAX_CONCURRENT_JOBS: 3,

  /**
   * Maximum job queue size
   */
  MAX_QUEUE_SIZE: 100,

  /**
   * Job retry attempts
   */
  MAX_RETRIES: 3,

  /**
   * Blender execution timeout (milliseconds)
   * 5 minutes
   */
  BLENDER_TIMEOUT: 300000,

  /**
   * Gemini API timeout (milliseconds)
   * 30 seconds
   */
  GEMINI_TIMEOUT: 30000,

  /**
   * Signed URL expiry (milliseconds)
   * 1 hour
   */
  SIGNED_URL_EXPIRY: 3600000,

  /**
   * Model file size limit (bytes)
   * 50 MB
   */
  MAX_MODEL_SIZE: 52428800,

  /**
   * GCP bucket name
   */
  GCP_BUCKET_NAME: 'wall-decor-models'
} as const;
```

---

## Validation Rules

### Backend Validation

#### Dimension Data Validation

```typescript
/**
 * Validate dimension data structure
 */
function validateDimensionData(data: IDimensionData): boolean {
  // Must have elements array
  if (!data || !Array.isArray(data.elements)) {
    return false;
  }

  // Must have at least one main wall
  const hasMainWall = data.elements.some(el => el.type === 'MAIN_WALL');
  if (!hasMainWall) {
    return false;
  }

  // All elements must be valid
  return data.elements.every(el => validateElement(el));
}

/**
 * Validate individual element
 */
function validateElement(element: IElement): boolean {
  // Required fields
  if (!element.id || !element.category || !element.type) {
    return false;
  }

  // Valid origin
  if (!element.origin || typeof element.origin.x !== 'number' ||
      typeof element.origin.y !== 'number' || typeof element.origin.z !== 'number') {
    return false;
  }

  // Valid dimensions
  if (!element.dimensions || element.dimensions.width <= 0 ||
      element.dimensions.height <= 0) {
    return false;
  }

  // Type-specific validation
  if (element.type === 'RETURN_WALL' && (!element.side || !element.direction)) {
    return false;
  }

  if ((element.type === 'ARCH_OPENING' || element.type === 'DOOR_ARCH') &&
      (!element.archShape || !element.radius || element.radius <= 0)) {
    return false;
  }

  if (element.archShape === 'QUARTER' && !element.orientation) {
    return false;
  }

  return true;
}
```

#### Job Validation

```typescript
/**
 * Validate job can be cancelled
 */
function canCancelJob(job: IJob): boolean {
  return job.status === 'queued' || job.status === 'processing';
}

/**
 * Validate job can be retried
 */
function canRetryJob(job: IJob): boolean {
  return job.status === 'failed' && job.retryCount < job.maxRetries;
}

/**
 * Check if job is complete
 */
function isJobComplete(status: JobStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'cancelled';
}
```

#### Model Validation

```typescript
/**
 * Validate model file size
 */
function validateModelSize(fileSize: number): boolean {
  return fileSize > 0 && fileSize <= MODEL_GENERATION_CONFIG.MAX_MODEL_SIZE;
}

/**
 * Validate glTF file format
 */
function validateGLTFFormat(buffer: Buffer): boolean {
  try {
    const json = JSON.parse(buffer.toString());
    return json.asset && json.asset.version === '2.0';
  } catch {
    return false;
  }
}
```

### Frontend Validation

#### Request Validation

```typescript
/**
 * Validate generate model request
 */
function validateGenerateRequest(request: IGenerateModelRequest): boolean {
  return (
    !!request.userId &&
    !!request.imageId &&
    !!request.imageUrl &&
    !!request.dimensionData &&
    Array.isArray(request.dimensionData.elements) &&
    request.dimensionData.elements.length > 0
  );
}
```

#### State Validation

```typescript
/**
 * Check if polling should continue
 */
function shouldPollStatus(state: IModelGenerationState): boolean {
  if (!state.jobId || !state.jobStatus) {
    return false;
  }

  return !isJobComplete(state.jobStatus.status);
}

/**
 * Check if model can be downloaded
 */
function canDownloadModel(state: IModelGenerationState): boolean {
  return (
    state.jobStatus?.status === 'completed' &&
    !!state.jobStatus.modelId &&
    !!state.modelUrl
  );
}
```

### Validation Error Messages

```typescript
/**
 * Validation error messages
 */
const VALIDATION_ERRORS = {
  MISSING_MAIN_WALL: 'Dimension data must include at least one main wall',
  INVALID_DIMENSIONS: 'Element dimensions must be positive numbers',
  INVALID_ELEMENT_TYPE: 'Invalid element type',
  MISSING_REQUIRED_FIELD: 'Missing required field',
  INVALID_RETURN_WALL: 'Return wall must specify side and direction',
  INVALID_ARCH: 'Arch opening must specify arch shape and radius',
  INVALID_QUARTER_ARCH: 'Quarter-circle arch must specify orientation',
  INVALID_HOST_ID: 'Invalid host element reference',
  FILE_TOO_LARGE: 'Model file exceeds maximum size limit',
  INVALID_GLTF: 'Invalid glTF file format',
  INVALID_USER_ID: 'Invalid user ID',
  INVALID_IMAGE_ID: 'Invalid image ID',
  INVALID_JOB_ID: 'Invalid job ID',
  JOB_NOT_FOUND: 'Job not found',
  MODEL_NOT_FOUND: 'Model not found',
  CANNOT_CANCEL_COMPLETED: 'Cannot cancel completed job',
  UNAUTHORIZED: 'Unauthorized access to resource'
} as const;
```

---

## Examples

### Example 1: Generate Model Request

```typescript
const generateRequest: IGenerateModelRequest = {
  userId: 'user_123456',
  imageId: 'img_789012',
  imageUrl: 'https://storage.googleapis.com/wall-decor-uploads/user_123456/img_789012.jpg',
  dimensionData: {
    elements: [
      {
        id: 'element_1709769600000_main',
        category: 'STRUCTURE',
        type: 'MAIN_WALL',
        origin: { x: 0, y: 0, z: 0 },
        dimensions: { width: 12, height: 10, depth: 0.75 }
      },
      {
        id: 'element_1709769601000_door',
        category: 'STRUCTURE',
        type: 'DOOR_RECT',
        origin: { x: 4, y: 0, z: 0 },
        dimensions: { width: 3, height: 7, depth: 0.75 },
        hostId: 'element_1709769600000_main'
      },
      {
        id: 'element_1709769602000_window',
        category: 'STRUCTURE',
        type: 'WINDOW',
        origin: { x: 8, y: 4, z: 0 },
        dimensions: { width: 3, height: 3, depth: 0.75 },
        hostId: 'element_1709769600000_main'
      }
    ]
  }
};
```

### Example 2: Generate Model Response

```typescript
const generateResponse: IGenerateModelResponse = {
  success: true,
  jobId: '550e8400-e29b-41d4-a716-446655440000',
  message: 'Model generation started'
};
```

### Example 3: Job Status Response (Processing)

```typescript
const jobStatusProcessing: IJobStatusResponse = {
  success: true,
  job: {
    jobId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'processing',
    progress: 45,
    stage: 'Executing Blender script',
    createdAt: '2024-01-15T10:30:00.000Z'
  }
};
```

### Example 4: Job Status Response (Completed)

```typescript
const jobStatusCompleted: IJobStatusResponse = {
  success: true,
  job: {
    jobId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'completed',
    progress: 100,
    stage: 'Generation complete',
    modelId: '660f9511-f3ac-52e5-b827-557766551111',
    createdAt: '2024-01-15T10:30:00.000Z',
    completedAt: '2024-01-15T10:31:30.000Z'
  }
};
```

### Example 5: Job Status Response (Failed)

```typescript
const jobStatusFailed: IJobStatusResponse = {
  success: true,
  job: {
    jobId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'failed',
    progress: 35,
    stage: 'Generating Blender script with Gemini AI',
    error: 'Gemini API rate limit exceeded',
    createdAt: '2024-01-15T10:30:00.000Z'
  }
};
```

### Example 6: Get Model Response

```typescript
const modelResponse: IModelResponse = {
  success: true,
  model: {
    modelId: '660f9511-f3ac-52e5-b827-557766551111',
    signedUrl: 'https://storage.googleapis.com/wall-decor-models/user_123456/660f9511-f3ac-52e5-b827-557766551111.gltf?X-Goog-Algorithm=...',
    expiresAt: '2024-01-15T11:31:30.000Z',
    metadata: {
      modelId: '660f9511-f3ac-52e5-b827-557766551111',
      userId: 'user_123456',
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      fileSize: 1572864,
      vertexCount: 2456,
      faceCount: 1892,
      createdAt: '2024-01-15T10:31:30.000Z'
    }
  }
};
```

### Example 7: Complex Dimension Data with Return Walls

```typescript
const complexDimensionData: IDimensionData = {
  elements: [
    // Main wall
    {
      id: 'element_main',
      category: 'STRUCTURE',
      type: 'MAIN_WALL',
      origin: { x: 0, y: 0, z: 0 },
      dimensions: { width: 15, height: 10, depth: 0.75 }
    },
    // Left return wall (inward)
    {
      id: 'element_return_left',
      category: 'STRUCTURE',
      type: 'RETURN_WALL',
      origin: { x: 0, y: 0, z: 0 },
      dimensions: { width: 5, height: 10, depth: 0.75 },
      side: 'LEFT',
      direction: 'INWARD',
      hostId: 'element_main'
    },
    // Right return wall (outward)
    {
      id: 'element_return_right',
      category: 'STRUCTURE',
      type: 'RETURN_WALL',
      origin: { x: 15, y: 0, z: 0 },
      dimensions: { width: 4, height: 10, depth: 0.75 },
      side: 'RIGHT',
      direction: 'OUTWARD',
      hostId: 'element_main'
    },
    // Arch opening (180° semicircular)
    {
      id: 'element_arch',
      category: 'STRUCTURE',
      type: 'ARCH_OPENING',
      origin: { x: 6, y: 0, z: 0 },
      dimensions: { width: 4, height: 8, depth: 0.75 },
      archShape: 'SEMI',
      radius: 2,
      hostId: 'element_main'
    },
    // Beam on main wall
    {
      id: 'element_beam',
      category: 'STRUCTURE',
      type: 'BEAM',
      origin: { x: 0, y: 8.5, z: 0 },
      dimensions: { width: 15, height: 1.5, depth: 0.75 },
      hostId: 'element_main'
    },
    // Niche (recessed)
    {
      id: 'element_niche',
      category: 'STRUCTURE',
      type: 'NICHE',
      origin: { x: 11, y: 4, z: 0 },
      dimensions: { width: 2, height: 3, depth: -0.5 },
      hostId: 'element_main'
    },
    // AC unit
    {
      id: 'element_ac',
      category: 'ELECTRICAL',
      type: 'AC',
      origin: { x: 1, y: 8.5, z: 0 },
      dimensions: { width: 3, height: 1, depth: 1 },
      hostId: 'element_main'
    }
  ]
};
```

### Example 8: Model Generation State (Frontend)

```typescript
const modelGenerationState: IModelGenerationState = {
  jobId: '550e8400-e29b-41d4-a716-446655440000',
  jobStatus: {
    jobId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'processing',
    progress: 65,
    stage: 'Exporting glTF model',
    createdAt: '2024-01-15T10:30:00.000Z'
  },
  modelUrl: null,
  modelInfo: null,
  isGenerating: true,
  error: null,
  pollingInterval: 12345
};
```

### Example 9: Stage Status Array

```typescript
const stageStatuses: IStageStatus[] = [
  {
    id: 1,
    text: 'Validating dimension data',
    status: 'completed',
    icon: 'check-circle',
    progressRange: [0, 10]
  },
  {
    id: 2,
    text: 'Generating Blender script with Gemini AI',
    status: 'completed',
    icon: 'code',
    progressRange: [10, 30]
  },
  {
    id: 3,
    text: 'Executing Blender script',
    status: 'completed',
    icon: 'cube',
    progressRange: [30, 60]
  },
  {
    id: 4,
    text: 'Exporting glTF model',
    status: 'active',
    icon: 'download',
    progressRange: [60, 80]
  },
  {
    id: 5,
    text: 'Uploading to cloud storage',
    status: 'pending',
    icon: 'cloud-upload',
    progressRange: [80, 100]
  }
];
```

### Example 10: Error Response

```typescript
const errorResponse = {
  success: false,
  error: 'Validation failed: Dimension data must include at least one main wall'
};
```

---

## Summary

This interfaces document defines:

1. **Backend Domain Interfaces**: Complete type definitions for model generation, job queue, model storage, Gemini service, and Blender service
2. **Backend API Contracts**: Request/response structures for all API endpoints
3. **Frontend Domain Interfaces**: Type definitions for frontend data-service layer
4. **Frontend Page Interfaces**: Component props and page state interfaces
5. **Shared Types**: Constants, enums, and configuration values
6. **Validation Rules**: Comprehensive validation functions and error messages
7. **Examples**: Real-world examples of all major data structures

All interfaces follow TypeScript best practices with:
- Complete JSDoc comments
- Strict type definitions
- Clear validation rules
- Comprehensive examples
- DDD architecture alignment

The interfaces support the complete 3D model generation workflow:
1. User submits dimension data
2. Backend queues job and starts processing
3. Frontend polls job status
4. Backend generates Blender script via Gemini
5. Backend executes Blender script
6. Backend uploads model to GCP
7. Frontend retrieves model and displays in 3D viewer
