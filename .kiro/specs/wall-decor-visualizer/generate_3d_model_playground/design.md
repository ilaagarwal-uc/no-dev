# 3D Model Generation Feature - Design Document

## Overview
This document describes the technical design for the 3D model generation feature, which uses Gemini API to generate Blender scripts from dimension-marked images, executes them on the backend, and displays the resulting 3D models in an interactive viewer.

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Progress Page   │  │  3D Viewer Page  │  │ Global Header│  │
│  │  - Progress Bar  │  │  - Three.js      │  │ - Navigation │  │
│  │  - Status Poll   │  │  - Controls      │  │ - Logout     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Express + Node.js)                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Model Gen API   │  │  Job Queue       │  │ Model API    │  │
│  │  - Generate      │  │  - Queue Jobs    │  │ - Get Model  │  │
│  │  - Get Status    │  │  - Process Jobs  │  │ - Download   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │  Gemini API      │  │  Headless Blender│                     │
│  │  - Script Gen    │  │  - Execute Script│                     │
│  └──────────────────┘  └──────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Domain-Driven Design Structure

### Backend Structure

```
backend/src/
├── data-service/
│   ├── application/
│   │   ├── model-generation/
│   │   │   ├── generate_model.api.ts       # POST /api/models/generate
│   │   │   ├── get_job_status.api.ts       # GET /api/models/status/:jobId
│   │   │   ├── get_model.api.ts            # GET /api/models/:modelId
│   │   │   ├── download_model.api.ts       # GET /api/models/:modelId/download
│   │   │   ├── cancel_job.api.ts           # POST /api/models/cancel/:jobId
│   │   │   └── index.ts
│   │   └── errors.ts
│   └── domain/
│       ├── gemini-service/
│       │   ├── gemini_service_schema.ts    # Types for Gemini API
│       │   └── index.ts                    # Gemini API integration logic
│       ├── blender-service/
│       │   ├── blender_service_schema.ts   # Types for Blender execution
│       │   └── index.ts                    # Blender execution logic
│       └── job-queue/
│           ├── job_queue_schema.ts         # Job queue types
│           └── index.ts                    # Job queue logic
├── logger.ts                               # API logging
└── server.ts                               # Express server setup
```

### Frontend Structure

```
frontend/src/
├── page-service/
│   ├── application/
│   │   ├── model-generation/
│   │   │   ├── model_generation.api.ts     # API calls to backend
│   │   │   └── index.ts
│   │   └── errors.ts
│   └── domain/
│       ├── model-generation-page/
│       │   ├── ModelGenerationPage.tsx     # Progress page component
│       │   ├── ProgressBar.tsx             # Progress bar component
│       │   ├── GlobalHeader.tsx            # Global header component
│       │   ├── model_generation_page.module.css
│       │   ├── index.ts                    # Page logic
│       │   └── interface.ts                # Page interfaces
│       └── model-viewer-page/
│           ├── ModelViewerPage.tsx         # 3D viewer page component
│           ├── ThreeViewer.tsx             # Three.js viewer component
│           ├── ViewportControls.tsx        # Rotation/zoom/pan controls
│           ├── GlobalHeader.tsx            # Global header component
│           ├── model_viewer_page.module.css
│           ├── index.ts                    # Page logic
│           └── interface.ts                # Page interfaces
├── logger.ts                               # API logging
└── App.tsx                                 # Route configuration
```

---

## Component Design

### 1. Progress Page (Frontend)

**Purpose**: Display progress while generating 3D model

**Components**:
- `ModelGenerationPage.tsx`: Main page component
- `ProgressBar.tsx`: Animated progress bar
- `GlobalHeader.tsx`: Navigation header

**State Management**:
```typescript
interface IModelGenerationState {
  status: 'generating_script' | 'executing_blender' | 'completed' | 'failed';
  progress: number; // 0-100
  jobId: string | null;
  modelId: string | null;
  error: string | null;
}
```

**Flow**:
1. Load dimension-marked image from sessionStorage
2. Call backend API to generate model
3. Receive job_id from backend
4. Poll backend every 2 seconds for status
5. Update progress bar based on status
6. Redirect to viewer page when completed

---

### 2. 3D Viewer Page (Frontend)

**Purpose**: Display and interact with generated 3D model

**Components**:
- `ModelViewerPage.tsx`: Main page component
- `ThreeViewer.tsx`: Three.js canvas and scene setup
- `ViewportControls.tsx`: UI controls for rotation/zoom/pan
- `GlobalHeader.tsx`: Navigation header

**State Management**:
```typescript
interface IModelViewerState {
  modelId: string;
  modelUrl: string | null;
  loading: boolean;
  error: string | null;
  cameraPosition: { x: number; y: number; z: number };
  cameraRotation: { x: number; y: number; z: number };
  zoom: number;
}
```

**Three.js Setup**:
- Scene with ambient and directional lighting
- Perspective camera with orbit controls
- glTF loader for model loading
- WebGL renderer with antialiasing

**Controls**:
- Left mouse drag: Rotate model
- Mouse wheel: Zoom in/out
- Right mouse drag: Pan view

---

### 3. Backend API Endpoints

#### POST /api/models/generate
**Purpose**: Generate 3D model from dimension-marked image

**Request**:
```typescript
interface IGenerateModelRequest {
  imageData: string; // Base64 encoded image
  dimensions: {
    width: number;
    height: number;
    annotations: IAnnotation[];
  };
}
```

**Response**:
```typescript
interface IGenerateModelResponse {
  success: boolean;
  jobId: string;
  message: string;
}
```

**Flow**:
1. Validate request data
2. Call Gemini API to generate Blender script
3. Validate Blender script
4. Queue job for Blender execution
5. Return job_id to client

---

#### GET /api/models/status/:jobId
**Purpose**: Get status of model generation job

**Response**:
```typescript
interface IJobStatusResponse {
  success: boolean;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  modelId?: string; // Only if completed
  error?: string; // Only if failed
}
```

---

#### GET /api/models/:modelId
**Purpose**: Get model metadata

**Response**:
```typescript
interface IModelResponse {
  success: boolean;
  modelId: string;
  modelUrl: string;
  createdAt: string;
  fileSize: number;
}
```

---

#### GET /api/models/:modelId/download
**Purpose**: Download model file (glTF)

**Response**: Binary file stream (glTF format)

---

#### POST /api/models/cancel/:jobId
**Purpose**: Cancel a running job

**Response**:
```typescript
interface ICancelJobResponse {
  success: boolean;
  message: string;
}
```

---

## Domain Logic Design

### 1. Gemini Service (Backend Domain)

**File**: `backend/src/data-service/domain/gemini-service/index.ts`

**Functions**:
```typescript
// Generate Blender script from image
export async function generateBlenderScript(
  imageData: string,
  dimensions: IDimensions
): Promise<string>;

// Validate Blender script
export function validateBlenderScript(script: string): boolean;

// Load prompt template
export function loadPromptTemplate(): string;

// Format prompt with image data
export function formatPrompt(
  template: string,
  imageData: string,
  dimensions: IDimensions
): string;
```

**Gemini API Integration**:
- Model: `gemini-2.5-flash` (Gemini Flash 3.0)
- Input: Prompt + base64 image
- Output: Blender Python script
- Timeout: 30 seconds
- Retry: 3 attempts with exponential backoff

---

### 2. Blender Service (Backend Domain)

**File**: `backend/src/data-service/domain/blender-service/index.ts`

**Functions**:
```typescript
// Execute Blender script in headless mode
export async function executeBlenderScript(
  script: string,
  jobId: string
): Promise<string>; // Returns model file path

// Validate script before execution
export function validateScriptSafety(script: string): boolean;

// Export model to glTF format
export async function exportToGLTF(
  blenderFile: string,
  outputPath: string
): Promise<void>;

// Clean up temporary files
export function cleanupTempFiles(jobId: string): void;
```

**Blender Execution**:
- Command: `blender --background --python script.py`
- Timeout: 60 seconds
- Output: glTF file
- Error handling: Capture stderr and log errors

---

### 3. Job Queue Service (Backend Domain)

**File**: `backend/src/data-service/domain/job-queue/index.ts`

**Functions**:
```typescript
// Add job to queue
export async function queueJob(
  jobId: string,
  script: string,
  imageData: string
): Promise<void>;

// Get job status
export async function getJobStatus(jobId: string): Promise<IJobStatus>;

// Update job status
export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  progress: number,
  modelId?: string,
  error?: string
): Promise<void>;

// Process next job in queue
export async function processNextJob(): Promise<void>;

// Cancel job
export async function cancelJob(jobId: string): Promise<void>;
```

**Job Queue Implementation**:
- In-memory queue for MVP (can be replaced with Redis/Bull later)
- FIFO processing
- Single worker thread
- Status tracking in memory (can be replaced with database later)

---

## Data Models

### Job Status Schema

```typescript
// backend/src/data-service/domain/job-queue/job_queue_schema.ts

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface IJob {
  jobId: string;
  status: JobStatus;
  progress: number; // 0-100
  script: string;
  imageData: string;
  modelId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJobStatusUpdate {
  status: JobStatus;
  progress: number;
  modelId?: string;
  error?: string;
}
```

---

### Gemini Service Schema

```typescript
// backend/src/data-service/domain/gemini-service/gemini_service_schema.ts

export interface IGeminiRequest {
  model: string;
  prompt: string;
  imageData: string;
  maxTokens: number;
  temperature: number;
}

export interface IGeminiResponse {
  script: string;
  tokensUsed: number;
  finishReason: string;
}

export interface IDimensions {
  width: number;
  height: number;
  annotations: IAnnotation[];
}

export interface IAnnotation {
  type: 'dimension' | 'label' | 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  label?: string;
  value?: number;
  unit?: string;
}
```

---

### Blender Service Schema

```typescript
// backend/src/data-service/domain/blender-service/blender_service_schema.ts

export interface IBlenderExecutionResult {
  success: boolean;
  modelPath?: string;
  error?: string;
  executionTime: number;
}

export interface IBlenderScriptValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface IModelMetadata {
  modelId: string;
  filePath: string;
  fileSize: number;
  format: 'gltf';
  createdAt: Date;
}
```

---

## API Flow Diagrams

### Model Generation Flow

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│ Frontend│                │ Backend │                │ Gemini  │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ POST /api/models/generate│                          │
     │─────────────────────────>│                          │
     │                          │                          │
     │                          │ Generate Blender Script  │
     │                          │─────────────────────────>│
     │                          │                          │
     │                          │<─────────────────────────│
     │                          │      Blender Script      │
     │                          │                          │
     │                          │ Queue Job                │
     │                          │──────────┐               │
     │                          │          │               │
     │                          │<─────────┘               │
     │                          │                          │
     │<─────────────────────────│                          │
     │    { jobId: "..." }      │                          │
     │                          │                          │
     │ GET /api/models/status/:jobId (poll every 2s)      │
     │─────────────────────────>│                          │
     │                          │                          │
     │<─────────────────────────│                          │
     │  { status: "processing" }│                          │
     │                          │                          │
```

### Blender Execution Flow

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│Job Queue│                │ Blender │                │ Storage │
└────┬────┘                │ Service │                └────┬────┘
     │                     └────┬────┘                     │
     │ Process Next Job         │                          │
     │─────────────────────────>│                          │
     │                          │                          │
     │                          │ Execute Script           │
     │                          │──────────┐               │
     │                          │          │               │
     │                          │<─────────┘               │
     │                          │                          │
     │                          │ Export to glTF           │
     │                          │──────────┐               │
     │                          │          │               │
     │                          │<─────────┘               │
     │                          │                          │
     │                          │ Save Model File          │
     │                          │─────────────────────────>│
     │                          │                          │
     │<─────────────────────────│                          │
     │  { modelId, modelPath }  │                          │
     │                          │                          │
     │ Update Job Status        │                          │
     │──────────┐               │                          │
     │          │               │                          │
     │<─────────┘               │                          │
     │                          │                          │
```

---

## Error Handling

### Error Types

```typescript
// backend/src/data-service/application/errors.ts

export class GeminiAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

export class BlenderExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlenderExecutionError';
  }
}

export class JobQueueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JobQueueError';
  }
}

export class ModelNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelNotFoundError';
  }
}
```

### Error Handling Strategy

1. **Gemini API Errors**:
   - Retry 3 times with exponential backoff
   - If all retries fail, mark job as failed
   - Log error details for debugging

2. **Blender Execution Errors**:
   - Capture stderr output
   - Mark job as failed
   - Store error message for user display
   - Clean up temporary files

3. **Job Queue Errors**:
   - Log error and continue processing other jobs
   - Mark failed job as failed
   - Notify user of failure

4. **Model Loading Errors**:
   - Display error message with retry button
   - Log error for debugging
   - Provide fallback UI

---

## Security Considerations

### Script Validation
- Validate Blender script before execution
- Check for malicious code patterns
- Sanitize file paths
- Limit script execution time

### API Authentication
- All backend APIs require JWT authentication
- Validate JWT token on every request
- Check user permissions

### Input Validation
- Validate image data format
- Check image size limits
- Sanitize dimension annotations
- Validate job IDs and model IDs

### File Storage
- Store models in secure directory
- Generate unique model IDs
- Prevent directory traversal attacks
- Set file size limits

---

## Performance Optimization

### Frontend
- Lazy load Three.js library
- Use Web Workers for heavy computations
- Implement progressive model loading
- Cache loaded models in memory

### Backend
- Use streaming for large file downloads
- Implement job queue with worker threads
- Cache Gemini API responses (if applicable)
- Clean up old models periodically

### Database (Future)
- Index job IDs and model IDs
- Use TTL for job status records
- Implement pagination for model lists

---

## Testing Strategy

### Unit Tests (70%)
- Gemini service functions
- Blender service functions
- Job queue functions
- Validation functions
- Error handling

### Integration Tests (25%)
- API endpoint testing
- Gemini API integration
- Blender execution integration
- Job queue processing
- File storage operations

### E2E Tests (5%)
- Complete model generation flow
- Progress page functionality
- 3D viewer functionality
- Error scenarios

---

## Deployment Considerations

### Environment Variables
```
GEMINI_API_KEY=<api_key>
BLENDER_PATH=/usr/bin/blender
MODEL_STORAGE_PATH=/var/models
MAX_JOB_QUEUE_SIZE=100
JOB_TIMEOUT_SECONDS=60
```

### Dependencies
- Blender installed on backend server
- Three.js library for frontend
- Gemini API access
- File storage (local or cloud)

### Monitoring
- Log all API calls
- Track job queue size
- Monitor Blender execution time
- Alert on failures

---

## Future Enhancements

1. **Persistent Job Queue**: Replace in-memory queue with Redis/Bull
2. **Database Storage**: Store job status and model metadata in database
3. **Cloud Storage**: Store models in S3/GCS instead of local filesystem
4. **Multiple Workers**: Scale Blender execution with multiple workers
5. **Model Caching**: Cache frequently accessed models
6. **Advanced Viewer**: Add material editing, lighting controls, and export options
7. **Model Versioning**: Support multiple versions of the same model
8. **Collaborative Features**: Share models with other users
