# 3D Model Generation Feature - DDD Architecture

**Feature**: 3D Model Generation from Dimension-Marked Images
**Created**: 2024-01-15
**Architecture Pattern**: DDD (Domain-Driven Design) with data-service and page-service
**Scope**: Full-stack (Backend API + Frontend UI)

---

## Architecture Overview

The 3D model generation feature follows the DDD pattern with clear separation between backend data-service (API operations, job processing, model storage) and frontend page-service (UI components, progress tracking, 3D viewer). The feature implements an async job queue system for long-running model generation tasks.

### Core Principles
- **Async Processing**: Model generation runs as background jobs with progress tracking
- **Job Queue System**: FIFO queue with retry logic and status management
- **Cloud Storage**: Models stored in GCP Cloud Storage with signed URLs
- **Progress Tracking**: Real-time updates via polling or WebSocket
- **3D Visualization**: Interactive Three.js viewer with multiple view modes
- **Error Handling**: Comprehensive error states with retry capability

---

## Directory Structure

### Backend src/ Structure
```
backend/src/
├── data-service/
│   ├── application/
│   │   ├── model-generation/
│   │   │   ├── generate_model.api.ts          (POST /api/model/generate)
│   │   │   ├── get_job_status.api.ts          (GET /api/model/job/:jobId)
│   │   │   ├── cancel_job.api.ts              (POST /api/model/job/:jobId/cancel)
│   │   │   ├── get_model.api.ts               (GET /api/model/:modelId)
│   │   │   ├── download_model.api.ts          (GET /api/model/:modelId/download)
│   │   │   └── index.ts                       (exports)
│   │   ├── errors.ts                          (ALL errors)
│   │   └── index.ts                           (service exports)
│   └── domain/
│       ├── model-generation/
│       │   ├── model_generation_schema.ts     (REQUIRED - type definitions)
│       │   ├── index.ts                       (domain logic functions)
│       │   └── interface.ts                   (optional - additional interfaces)
│       ├── gemini-service/
│       │   ├── gemini_service_schema.ts       (REQUIRED - type definitions)
│       │   ├── index.ts                       (Gemini API integration)
│       │   └── interface.ts                   (optional)
│       ├── blender-service/
│       │   ├── blender_service_schema.ts      (REQUIRED - type definitions)
│       │   ├── index.ts                       (Blender execution logic)
│       │   └── interface.ts                   (optional)
│       ├── job-queue/
│       │   ├── job_queue_schema.ts            (REQUIRED - type definitions)
│       │   ├── index.ts                       (job queue management)
│       │   └── interface.ts                   (optional)
│       └── model-storage/
│           ├── model_storage_schema.ts        (REQUIRED - type definitions)
│           ├── index.ts                       (GCP storage operations)
│           └── interface.ts                   (optional)
├── logger.ts                                  (API logging)
└── server.ts                                  (Express server)
```

### Frontend src/ Structure
```
frontend/src/
├── data-service/
│   ├── application/
│   │   ├── model-generation/
│   │   │   ├── generate_model.api.ts          (Call backend generate API)
│   │   │   ├── get_job_status.api.ts          (Poll job status)
│   │   │   ├── cancel_job.api.ts              (Cancel job)
│   │   │   ├── get_model.api.ts               (Get model URL)
│   │   │   ├── download_model.api.ts          (Download model file)
│   │   │   └── index.ts                       (exports)
│   │   ├── errors.ts                          (ALL errors)
│   │   └── index.ts                           (service exports)
│   └── domain/
│       ├── model-generation/
│       │   ├── model_generation_schema.ts     (REQUIRED - type definitions)
│       │   ├── index.ts                       (domain logic functions)
│       │   └── interface.ts                   (optional)
│       └── index.ts                           (domain exports)
├── page-service/
│   ├── application/
│   │   ├── model-generation/
│   │   │   ├── model_generation_page.api.ts   (Page API calls)
│   │   │   └── index.ts                       (exports)
│   │   ├── errors.ts                          (ALL errors)
│   │   └── index.ts                           (service exports)
│   └── domain/
│       ├── model-generation-page/
│       │   ├── ModelGenerationPage.tsx        (main page component)
│       │   ├── ProgressSection.tsx            (progress tracking UI)
│       │   ├── ProgressBar.tsx                (progress bar component)
│       │   ├── StagesList.tsx                 (stages list component)
│       │   ├── ModelViewer.tsx                (Three.js 3D viewer)
│       │   ├── ViewerControls.tsx             (zoom, reset, fullscreen)
│       │   ├── ViewModeSelector.tsx           (perspective, orthographic, wireframe)
│       │   ├── ModelInfoPanel.tsx             (model metadata display)
│       │   ├── ErrorDisplay.tsx               (error state component)
│       │   ├── model_generation_page.module.css
│       │   ├── progress_section.module.css
│       │   ├── model_viewer.module.css
│       │   ├── model_generation_logic.ts      (page-level logic)
│       │   ├── progress_tracking_logic.ts     (progress state management)
│       │   ├── viewer_logic.ts                (Three.js viewer logic)
│       │   ├── polling_logic.ts               (job status polling)
│       │   ├── index.ts                       (domain exports)
│       │   └── interface.ts                   (TypeScript interfaces)
│       └── index.ts                           (page-service exports)
├── App.tsx
├── logger.ts                                  (API logging)
└── main.tsx
```

---

## Backend Data-Service Architecture

### Purpose
The backend data-service handles all model generation operations including Gemini API integration, Blender script execution, job queue management, and model storage in GCP.


### Data-Service Domain: model-generation

**Location**: `backend/src/data-service/domain/model-generation/`

**Responsibility**: Define data structures and core business logic for model generation

#### Files

**model_generation_schema.ts** (REQUIRED - Type Definitions)
```typescript
// Type definitions for model generation domain
export interface IGenerateModelRequest {
  userId: string;
  imageId: string;
  dimensionData: IDimensionData;
  imageUrl: string;
}

export interface IGenerateModelResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface IDimensionData {
  elements: IElement[];
}

export interface IElement {
  id: string;
  category: ElementCategory;
  type: ElementType;
  origin: IPoint3D;
  dimensions: IDimensions;
  hostId?: string;
  side?: Side;
  direction?: Direction;
  archShape?: ArchShape;
  orientation?: Orientation;
  radius?: number;
}

export type ElementCategory = 'STRUCTURE' | 'ELECTRICAL';
export type ElementType = 'BEAM' | 'COLUMN' | 'DOOR_RECT' | 'DOOR_ARCH' | 
  'ARCH_OPENING' | 'MAIN_WALL' | 'RETURN_WALL' | 'WINDOW' | 
  'SWITCH_BOARD' | 'AC' | 'NICHE' | 'CUTOUT';
export type Side = 'LEFT' | 'RIGHT';
export type Direction = 'INWARD' | 'OUTWARD';
export type ArchShape = 'SEMI' | 'QUARTER';
export type Orientation = 'TL' | 'TR' | 'BL' | 'BR';

export interface IPoint3D {
  x: number;
  y: number;
  z: number;
}

export interface IDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface IJobStatus {
  jobId: string;
  userId: string;
  status: JobStatusType;
  progress: number;
  stage: string;
  modelId?: string;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export type JobStatusType = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface IModelMetadata {
  modelId: string;
  userId: string;
  jobId: string;
  gcpPath: string;
  fileSize: number;
  vertexCount?: number;
  faceCount?: number;
  createdAt: Date;
}
```

**index.ts** (Domain Logic Functions)
```typescript
// Domain logic for model generation validation and operations
import * as ModelGenerationSchema from './model_generation_schema.js';

// Validation functions
export function validateDimensionData(data: ModelGenerationSchema.IDimensionData): boolean {
  if (!data || !Array.isArray(data.elements)) {
    return false;
  }
  
  // Must have at least a main wall
  const hasMainWall = data.elements.some(el => el.type === 'MAIN_WALL');
  return hasMainWall && data.elements.length > 0;
}

export function validateElement(element: ModelGenerationSchema.IElement): boolean {
  return (
    element.id &&
    element.category &&
    element.type &&
    element.origin &&
    element.dimensions &&
    element.dimensions.width > 0 &&
    element.dimensions.height > 0 &&
    element.dimensions.depth >= 0
  );
}

export function validateGenerateRequest(
  request: ModelGenerationSchema.IGenerateModelRequest
): boolean {
  return (
    request.userId &&
    request.imageId &&
    request.imageUrl &&
    validateDimensionData(request.dimensionData)
  );
}

// Business logic functions
export function calculateModelComplexity(data: ModelGenerationSchema.IDimensionData): number {
  // Calculate complexity score based on number and types of elements
  let complexity = 0;
  
  data.elements.forEach(el => {
    if (el.type === 'MAIN_WALL' || el.type === 'RETURN_WALL') {
      complexity += 1;
    } else if (el.type === 'ARCH_OPENING' || el.type === 'DOOR_ARCH') {
      complexity += 3; // Arches are more complex
    } else {
      complexity += 2;
    }
  });
  
  return complexity;
}

export function estimateProcessingTime(complexity: number): number {
  // Estimate processing time in seconds based on complexity
  const baseTime = 10; // 10 seconds base
  const perElementTime = 2; // 2 seconds per complexity point
  return baseTime + (complexity * perElementTime);
}

// Export all schema types
export type {
  IGenerateModelRequest,
  IGenerateModelResponse,
  IDimensionData,
  IElement,
  ElementCategory,
  ElementType,
  Side,
  Direction,
  ArchShape,
  Orientation,
  IPoint3D,
  IDimensions,
  IJobStatus,
  JobStatusType,
  IModelMetadata
} from './model_generation_schema.js';
```


### Data-Service Domain: gemini-service

**Location**: `backend/src/data-service/domain/gemini-service/`

**Responsibility**: Gemini API integration for Blender script generation

#### Files

**gemini_service_schema.ts** (REQUIRED - Type Definitions)
```typescript
// Type definitions for Gemini service
export interface IGeminiRequest {
  dimensionData: any;
  imageData: string; // base64
  prompt: string;
}

export interface IGeminiResponse {
  script: string;
  metadata?: {
    tokensUsed: number;
    modelVersion: string;
  };
}

export interface IGeminiError {
  code: string;
  message: string;
  retryable: boolean;
}
```

**index.ts** (Gemini API Integration)
```typescript
// Gemini API integration logic
import * as GeminiSchema from './gemini_service_schema.js';

export async function generateBlenderScript(
  dimensionData: any,
  imageData: string
): Promise<string> {
  // Format prompt with dimension data
  const prompt = formatPrompt(dimensionData, imageData);
  
  // Call Gemini API
  const response = await callGeminiAPI(prompt);
  
  // Parse and validate script
  const script = parseGeminiResponse(response);
  validateBlenderScript(script);
  
  return script;
}

export function formatPrompt(dimensionData: any, imageData: string): string {
  // Format prompt using template from prompts/model_generator_3d.prompt
  return `Generate Blender Python script from: ${JSON.stringify(dimensionData)}`;
}

export async function callGeminiAPI(prompt: string): Promise<GeminiSchema.IGeminiResponse> {
  // Implement Gemini API call with retry logic
  // Handle rate limits, timeouts, authentication
  throw new Error('Not implemented');
}

export function parseGeminiResponse(response: GeminiSchema.IGeminiResponse): string {
  if (!response.script) {
    throw new Error('No script in Gemini response');
  }
  return response.script;
}

export function validateBlenderScript(script: string): void {
  // Validate script syntax and security
  if (!script.includes('import bpy')) {
    throw new Error('Invalid Blender script: missing bpy import');
  }
}

export type { IGeminiRequest, IGeminiResponse, IGeminiError } from './gemini_service_schema.js';
```

---

### Data-Service Domain: blender-service

**Location**: `backend/src/data-service/domain/blender-service/`

**Responsibility**: Blender script execution and glTF export

#### Files

**blender_service_schema.ts** (REQUIRED - Type Definitions)
```typescript
// Type definitions for Blender service
export interface IBlenderExecutionRequest {
  script: string;
  outputPath: string;
  timeout?: number; // milliseconds
}

export interface IBlenderExecutionResult {
  success: boolean;
  outputFile: string;
  executionTime: number;
  error?: string;
}

export interface IBlenderValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

**index.ts** (Blender Execution Logic)
```typescript
// Blender execution logic
import * as BlenderSchema from './blender_service_schema.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function executeBlenderScript(
  script: string,
  outputPath: string
): Promise<BlenderSchema.IBlenderExecutionResult> {
  const startTime = Date.now();
  
  // Validate script before execution
  const validation = validateScript(script);
  if (!validation.valid) {
    throw new Error(`Script validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Write script to temp file
  const scriptPath = await writeScriptToTempFile(script);
  
  try {
    // Execute Blender in headless mode
    const command = `blender --background --python ${scriptPath} -- ${outputPath}`;
    await execAsync(command, { timeout: 300000 }); // 5 minute timeout
    
    // Verify output file exists
    const fileExists = await verifyOutputFile(outputPath);
    if (!fileExists) {
      throw new Error('Blender execution did not produce output file');
    }
    
    return {
      success: true,
      outputFile: outputPath,
      executionTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      success: false,
      outputFile: '',
      executionTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    // Clean up temp script file
    await cleanupTempFile(scriptPath);
  }
}

export function validateScript(script: string): BlenderSchema.IBlenderValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for required imports
  if (!script.includes('import bpy')) {
    errors.push('Missing required import: bpy');
  }
  
  // Check for dangerous operations
  if (script.includes('os.system') || script.includes('subprocess')) {
    errors.push('Script contains dangerous operations');
  }
  
  // Check script length
  if (script.split('\n').length > 10000) {
    warnings.push('Script is very long (>10,000 lines)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

async function writeScriptToTempFile(script: string): Promise<string> {
  // Write script to temp file and return path
  throw new Error('Not implemented');
}

async function verifyOutputFile(path: string): Promise<boolean> {
  // Check if output file exists and is valid
  throw new Error('Not implemented');
}

async function cleanupTempFile(path: string): Promise<void> {
  // Delete temp file
}

export type {
  IBlenderExecutionRequest,
  IBlenderExecutionResult,
  IBlenderValidationResult
} from './blender_service_schema.js';
```


### Data-Service Domain: job-queue

**Location**: `backend/src/data-service/domain/job-queue/`

**Responsibility**: Job queue management with FIFO processing and retry logic

#### Files

**job_queue_schema.ts** (REQUIRED - Type Definitions)
```typescript
// Type definitions for job queue
export interface IJob {
  jobId: string;
  userId: string;
  imageId: string;
  dimensionData: any;
  imageUrl: string;
  status: JobStatus;
  progress: number;
  stage: string;
  modelId?: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface IJobUpdate {
  status?: JobStatus;
  progress?: number;
  stage?: string;
  modelId?: string;
  error?: string;
}

export interface IQueueStats {
  totalJobs: number;
  queuedJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
}
```

**index.ts** (Job Queue Management)
```typescript
// Job queue management logic
import * as JobQueueSchema from './job_queue_schema.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory job queue (replace with Redis/database in production)
const jobQueue: JobQueueSchema.IJob[] = [];
const MAX_CONCURRENT_JOBS = 3;

export async function queueJob(
  userId: string,
  imageId: string,
  dimensionData: any,
  imageUrl: string
): Promise<string> {
  const jobId = uuidv4();
  
  const job: JobQueueSchema.IJob = {
    jobId,
    userId,
    imageId,
    dimensionData,
    imageUrl,
    status: 'queued',
    progress: 0,
    stage: 'Queued',
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date()
  };
  
  jobQueue.push(job);
  
  // Start processing if capacity available
  processNextJob();
  
  return jobId;
}

export async function getJobStatus(jobId: string): Promise<JobQueueSchema.IJob | null> {
  const job = jobQueue.find(j => j.jobId === jobId);
  return job || null;
}

export async function updateJobStatus(
  jobId: string,
  update: JobQueueSchema.IJobUpdate
): Promise<void> {
  const job = jobQueue.find(j => j.jobId === jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }
  
  if (update.status) job.status = update.status;
  if (update.progress !== undefined) job.progress = update.progress;
  if (update.stage) job.stage = update.stage;
  if (update.modelId) job.modelId = update.modelId;
  if (update.error) job.error = update.error;
  
  if (update.status === 'processing' && !job.startedAt) {
    job.startedAt = new Date();
  }
  if (update.status === 'completed') {
    job.completedAt = new Date();
  }
  if (update.status === 'failed') {
    job.failedAt = new Date();
  }
}

export async function cancelJob(jobId: string): Promise<void> {
  const job = jobQueue.find(j => j.jobId === jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }
  
  if (job.status === 'completed') {
    throw new Error('Cannot cancel completed job');
  }
  
  job.status = 'cancelled';
}

async function processNextJob(): Promise<void> {
  const processingCount = jobQueue.filter(j => j.status === 'processing').length;
  
  if (processingCount >= MAX_CONCURRENT_JOBS) {
    return; // At capacity
  }
  
  const nextJob = jobQueue.find(j => j.status === 'queued');
  if (!nextJob) {
    return; // No jobs to process
  }
  
  // Process job (implementation in application layer)
  await updateJobStatus(nextJob.jobId, { status: 'processing', stage: 'Starting...' });
}

export function getQueueStats(): JobQueueSchema.IQueueStats {
  return {
    totalJobs: jobQueue.length,
    queuedJobs: jobQueue.filter(j => j.status === 'queued').length,
    processingJobs: jobQueue.filter(j => j.status === 'processing').length,
    completedJobs: jobQueue.filter(j => j.status === 'completed').length,
    failedJobs: jobQueue.filter(j => j.status === 'failed').length
  };
}

export type {
  IJob,
  JobStatus,
  IJobUpdate,
  IQueueStats
} from './job_queue_schema.js';
```


### Data-Service Domain: model-storage

**Location**: `backend/src/data-service/domain/model-storage/`

**Responsibility**: GCP Cloud Storage operations for 3D models

#### Files

**model_storage_schema.ts** (REQUIRED - Type Definitions)
```typescript
// Type definitions for model storage
export interface IUploadModelRequest {
  userId: string;
  jobId: string;
  modelFile: Buffer;
  fileName: string;
}

export interface IUploadModelResponse {
  modelId: string;
  gcpPath: string;
  fileSize: number;
  signedUrl: string;
}

export interface IGetModelRequest {
  modelId: string;
  userId: string;
}

export interface IGetModelResponse {
  modelId: string;
  signedUrl: string;
  expiresAt: Date;
  metadata: IModelMetadata;
}

export interface IModelMetadata {
  modelId: string;
  userId: string;
  jobId: string;
  gcpPath: string;
  fileSize: number;
  vertexCount?: number;
  faceCount?: number;
  createdAt: Date;
}
```

**index.ts** (GCP Storage Operations)
```typescript
// GCP Cloud Storage operations
import * as ModelStorageSchema from './model_storage_schema.js';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage();
const BUCKET_NAME = process.env.GCP_BUCKET_NAME || 'wall-decor-models';

export async function uploadModel(
  userId: string,
  jobId: string,
  modelFile: Buffer,
  fileName: string
): Promise<ModelStorageSchema.IUploadModelResponse> {
  const modelId = uuidv4();
  const gcpPath = `${userId}/${modelId}.gltf`;
  
  // Upload to GCP
  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(gcpPath);
  
  await file.save(modelFile, {
    contentType: 'model/gltf+json',
    metadata: {
      userId,
      jobId,
      modelId
    }
  });
  
  // Generate signed URL (1 hour expiry)
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 3600000 // 1 hour
  });
  
  // Store metadata in database
  await storeModelMetadata({
    modelId,
    userId,
    jobId,
    gcpPath,
    fileSize: modelFile.length,
    createdAt: new Date()
  });
  
  return {
    modelId,
    gcpPath,
    fileSize: modelFile.length,
    signedUrl
  };
}

export async function getModel(
  modelId: string,
  userId: string
): Promise<ModelStorageSchema.IGetModelResponse> {
  // Get metadata from database
  const metadata = await getModelMetadata(modelId);
  
  if (!metadata) {
    throw new Error(`Model not found: ${modelId}`);
  }
  
  if (metadata.userId !== userId) {
    throw new Error('Unauthorized access to model');
  }
  
  // Generate signed URL
  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(metadata.gcpPath);
  
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 3600000 // 1 hour
  });
  
  return {
    modelId,
    signedUrl,
    expiresAt: new Date(Date.now() + 3600000),
    metadata
  };
}

export async function deleteModel(modelId: string, userId: string): Promise<void> {
  const metadata = await getModelMetadata(modelId);
  
  if (!metadata) {
    throw new Error(`Model not found: ${modelId}`);
  }
  
  if (metadata.userId !== userId) {
    throw new Error('Unauthorized access to model');
  }
  
  // Delete from GCP
  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(metadata.gcpPath);
  await file.delete();
  
  // Delete metadata from database
  await deleteModelMetadata(modelId);
}

async function storeModelMetadata(metadata: ModelStorageSchema.IModelMetadata): Promise<void> {
  // Store in MongoDB (implementation depends on database setup)
  throw new Error('Not implemented');
}

async function getModelMetadata(modelId: string): Promise<ModelStorageSchema.IModelMetadata | null> {
  // Retrieve from MongoDB
  throw new Error('Not implemented');
}

async function deleteModelMetadata(modelId: string): Promise<void> {
  // Delete from MongoDB
  throw new Error('Not implemented');
}

export type {
  IUploadModelRequest,
  IUploadModelResponse,
  IGetModelRequest,
  IGetModelResponse,
  IModelMetadata
} from './model_storage_schema.js';
```


---

### Data-Service Application Layer: model-generation

**Location**: `backend/src/data-service/application/model-generation/`

**Responsibility**: Handle backend API endpoints for model generation

#### Files

**generate_model.api.ts** (POST /api/model/generate)
```typescript
// API endpoint for generating 3D model
import { Request, Response } from 'express';
import * as ModelGenerationDomain from '../../domain/model-generation/index.js';
import * as JobQueueDomain from '../../domain/job-queue/index.js';
import * as GeminiService from '../../domain/gemini-service/index.js';
import * as BlenderService from '../../domain/blender-service/index.js';
import * as ModelStorage from '../../domain/model-storage/index.js';

export async function generateModelHandler(req: Request, res: Response): Promise<void> {
  try {
    const { userId, imageId, dimensionData, imageUrl } = req.body;
    
    // Validate request
    const request: ModelGenerationDomain.IGenerateModelRequest = {
      userId,
      imageId,
      dimensionData,
      imageUrl
    };
    
    if (!ModelGenerationDomain.validateGenerateRequest(request)) {
      res.status(400).json({ success: false, error: 'Invalid request data' });
      return;
    }
    
    // Queue job for async processing
    const jobId = await JobQueueDomain.queueJob(userId, imageId, dimensionData, imageUrl);
    
    // Start processing job in background
    processModelGenerationJob(jobId);
    
    res.status(202).json({
      success: true,
      jobId,
      message: 'Model generation started'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function processModelGenerationJob(jobId: string): Promise<void> {
  try {
    const job = await JobQueueDomain.getJobStatus(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }
    
    // Stage 1: Validate dimension data (10%)
    await JobQueueDomain.updateJobStatus(jobId, {
      progress: 10,
      stage: 'Validating dimension data'
    });
    
    // Stage 2: Generate Blender script with Gemini (30%)
    await JobQueueDomain.updateJobStatus(jobId, {
      progress: 30,
      stage: 'Generating Blender script with Gemini AI'
    });
    const script = await GeminiService.generateBlenderScript(
      job.dimensionData,
      job.imageUrl
    );
    
    // Stage 3: Execute Blender script (60%)
    await JobQueueDomain.updateJobStatus(jobId, {
      progress: 60,
      stage: 'Executing Blender script'
    });
    const outputPath = `/tmp/${jobId}.gltf`;
    const result = await BlenderService.executeBlenderScript(script, outputPath);
    
    if (!result.success) {
      throw new Error(`Blender execution failed: ${result.error}`);
    }
    
    // Stage 4: Upload to GCP (80%)
    await JobQueueDomain.updateJobStatus(jobId, {
      progress: 80,
      stage: 'Uploading to cloud storage'
    });
    const modelFile = await readFile(result.outputFile);
    const uploadResult = await ModelStorage.uploadModel(
      job.userId,
      jobId,
      modelFile,
      `${jobId}.gltf`
    );
    
    // Stage 5: Complete (100%)
    await JobQueueDomain.updateJobStatus(jobId, {
      status: 'completed',
      progress: 100,
      stage: 'Generation complete',
      modelId: uploadResult.modelId
    });
  } catch (error) {
    await JobQueueDomain.updateJobStatus(jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function readFile(path: string): Promise<Buffer> {
  // Read file from filesystem
  throw new Error('Not implemented');
}
```


**get_job_status.api.ts** (GET /api/model/job/:jobId)
```typescript
// API endpoint for getting job status
import { Request, Response } from 'express';
import * as JobQueueDomain from '../../domain/job-queue/index.js';

export async function getJobStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;
    
    const job = await JobQueueDomain.getJobStatus(jobId);
    
    if (!job) {
      res.status(404).json({ success: false, error: 'Job not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      job: {
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
        stage: job.stage,
        modelId: job.modelId,
        error: job.error,
        createdAt: job.createdAt,
        completedAt: job.completedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

**cancel_job.api.ts** (POST /api/model/job/:jobId/cancel)
```typescript
// API endpoint for cancelling job
import { Request, Response } from 'express';
import * as JobQueueDomain from '../../domain/job-queue/index.js';

export async function cancelJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;
    
    await JobQueueDomain.cancelJob(jobId);
    
    res.status(200).json({
      success: true,
      message: 'Job cancelled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

**get_model.api.ts** (GET /api/model/:modelId)
```typescript
// API endpoint for getting model
import { Request, Response } from 'express';
import * as ModelStorage from '../../domain/model-storage/index.js';

export async function getModelHandler(req: Request, res: Response): Promise<void> {
  try {
    const { modelId } = req.params;
    const userId = req.user?.id; // From auth middleware
    
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    const model = await ModelStorage.getModel(modelId, userId);
    
    res.status(200).json({
      success: true,
      model: {
        modelId: model.modelId,
        signedUrl: model.signedUrl,
        expiresAt: model.expiresAt,
        metadata: model.metadata
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

**download_model.api.ts** (GET /api/model/:modelId/download)
```typescript
// API endpoint for downloading model
import { Request, Response } from 'express';
import * as ModelStorage from '../../domain/model-storage/index.js';

export async function downloadModelHandler(req: Request, res: Response): Promise<void> {
  try {
    const { modelId } = req.params;
    const userId = req.user?.id; // From auth middleware
    
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    const model = await ModelStorage.getModel(modelId, userId);
    
    // Redirect to signed URL for download
    res.redirect(model.signedUrl);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

**index.ts** (Application Layer Exports)
```typescript
// Export all model-generation application APIs
export { generateModelHandler } from './generate_model.api.js';
export { getJobStatusHandler } from './get_job_status.api.js';
export { cancelJobHandler } from './cancel_job.api.js';
export { getModelHandler } from './get_model.api.js';
export { downloadModelHandler } from './download_model.api.js';
```


### Data-Service Errors

**Location**: `backend/src/data-service/application/errors.ts`

**Add these error classes** (append to existing errors.ts):
```typescript
export class ModelGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelGenerationError';
  }
}

export class GeminiAPIError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

export class BlenderExecutionError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'BlenderExecutionError';
  }
}

export class JobQueueError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'JobQueueError';
  }
}

export class ModelStorageError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'ModelStorageError';
  }
}
```

---

## Frontend Data-Service Architecture

### Purpose
The frontend data-service handles all API calls to the backend for model generation, job status polling, and model retrieval.

### Data-Service Domain: model-generation

**Location**: `frontend/src/data-service/domain/model-generation/`

**Responsibility**: Define data structures and validation logic for frontend

#### Files

**model_generation_schema.ts** (REQUIRED - Type Definitions)
```typescript
// Type definitions for frontend model generation
export interface IGenerateModelRequest {
  userId: string;
  imageId: string;
  dimensionData: IDimensionData;
  imageUrl: string;
}

export interface IGenerateModelResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface IDimensionData {
  elements: IElement[];
}

export interface IElement {
  id: string;
  category: string;
  type: string;
  origin: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  hostId?: string;
  side?: string;
  direction?: string;
  archShape?: string;
  orientation?: string;
  radius?: number;
}

export interface IJobStatusResponse {
  success: boolean;
  job: IJobStatus;
}

export interface IJobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  stage: string;
  modelId?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface IModelResponse {
  success: boolean;
  model: IModel;
}

export interface IModel {
  modelId: string;
  signedUrl: string;
  expiresAt: string;
  metadata: IModelMetadata;
}

export interface IModelMetadata {
  modelId: string;
  userId: string;
  jobId: string;
  fileSize: number;
  vertexCount?: number;
  faceCount?: number;
  createdAt: string;
}
```

**index.ts** (Domain Logic Functions)
```typescript
// Domain logic for frontend model generation
import * as ModelGenerationSchema from './model_generation_schema.js';

export function validateGenerateRequest(
  request: ModelGenerationSchema.IGenerateModelRequest
): boolean {
  return (
    !!request.userId &&
    !!request.imageId &&
    !!request.imageUrl &&
    !!request.dimensionData &&
    Array.isArray(request.dimensionData.elements)
  );
}

export function isJobComplete(status: string): boolean {
  return status === 'completed' || status === 'failed' || status === 'cancelled';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type {
  IGenerateModelRequest,
  IGenerateModelResponse,
  IDimensionData,
  IElement,
  IJobStatusResponse,
  IJobStatus,
  IModelResponse,
  IModel,
  IModelMetadata
} from './model_generation_schema.js';
```


### Data-Service Application Layer: model-generation

**Location**: `frontend/src/data-service/application/model-generation/`

**Responsibility**: Handle frontend API calls to backend

#### Files

**generate_model.api.ts** (Call Backend Generate API)
```typescript
// API call for generating 3D model
import * as ModelGenerationDomain from '../../domain/model-generation/index.js';
import { GenerateModelError } from '../errors.js';
import { logAPICall, logAPIResponse, logAPIError } from '../../../logger.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function generateModelApi(
  request: ModelGenerationDomain.IGenerateModelRequest
): Promise<ModelGenerationDomain.IGenerateModelResponse> {
  const apiName = '/api/model/generate';
  const method = 'POST';
  const startTime = logAPICall({ apiName, method, params: request });
  
  try {
    // Validate request
    if (!ModelGenerationDomain.validateGenerateRequest(request)) {
      throw new GenerateModelError('Invalid generate request');
    }
    
    const response = await fetch(`${API_BASE_URL}${apiName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new GenerateModelError(`Generate failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    const duration = Date.now() - startTime;
    logAPIResponse({ apiName, method, status: response.status, duration, response: data });
    
    return data as ModelGenerationDomain.IGenerateModelResponse;
  } catch (error) {
    logAPIError({ apiName, method, error });
    if (error instanceof GenerateModelError) {
      throw error;
    }
    throw new GenerateModelError(
      `Failed to generate model: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function getAuthToken(): string {
  // Get auth token from storage
  return localStorage.getItem('authToken') || '';
}
```

**get_job_status.api.ts** (Poll Job Status)
```typescript
// API call for getting job status
import * as ModelGenerationDomain from '../../domain/model-generation/index.js';
import { JobStatusError } from '../errors.js';
import { logAPICall, logAPIResponse, logAPIError } from '../../../logger.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function getJobStatusApi(
  jobId: string
): Promise<ModelGenerationDomain.IJobStatusResponse> {
  const apiName = `/api/model/job/${jobId}`;
  const method = 'GET';
  const startTime = logAPICall({ apiName, method });
  
  try {
    const response = await fetch(`${API_BASE_URL}${apiName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new JobStatusError(`Get job status failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    const duration = Date.now() - startTime;
    logAPIResponse({ apiName, method, status: response.status, duration, response: data });
    
    return data as ModelGenerationDomain.IJobStatusResponse;
  } catch (error) {
    logAPIError({ apiName, method, error });
    if (error instanceof JobStatusError) {
      throw error;
    }
    throw new JobStatusError(
      `Failed to get job status: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function getAuthToken(): string {
  return localStorage.getItem('authToken') || '';
}
```

**cancel_job.api.ts** (Cancel Job)
```typescript
// API call for cancelling job
import { CancelJobError } from '../errors.js';
import { logAPICall, logAPIResponse, logAPIError } from '../../../logger.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function cancelJobApi(jobId: string): Promise<{ success: boolean }> {
  const apiName = `/api/model/job/${jobId}/cancel`;
  const method = 'POST';
  const startTime = logAPICall({ apiName, method });
  
  try {
    const response = await fetch(`${API_BASE_URL}${apiName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new CancelJobError(`Cancel job failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    const duration = Date.now() - startTime;
    logAPIResponse({ apiName, method, status: response.status, duration, response: data });
    
    return data;
  } catch (error) {
    logAPIError({ apiName, method, error });
    throw new CancelJobError(
      `Failed to cancel job: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function getAuthToken(): string {
  return localStorage.getItem('authToken') || '';
}
```


**get_model.api.ts** (Get Model URL)
```typescript
// API call for getting model
import * as ModelGenerationDomain from '../../domain/model-generation/index.js';
import { GetModelError } from '../errors.js';
import { logAPICall, logAPIResponse, logAPIError } from '../../../logger.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function getModelApi(
  modelId: string
): Promise<ModelGenerationDomain.IModelResponse> {
  const apiName = `/api/model/${modelId}`;
  const method = 'GET';
  const startTime = logAPICall({ apiName, method });
  
  try {
    const response = await fetch(`${API_BASE_URL}${apiName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new GetModelError(`Get model failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    const duration = Date.now() - startTime;
    logAPIResponse({ apiName, method, status: response.status, duration, response: data });
    
    return data as ModelGenerationDomain.IModelResponse;
  } catch (error) {
    logAPIError({ apiName, method, error });
    throw new GetModelError(
      `Failed to get model: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function getAuthToken(): string {
  return localStorage.getItem('authToken') || '';
}
```

**download_model.api.ts** (Download Model File)
```typescript
// API call for downloading model
import { DownloadModelError } from '../errors.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function downloadModelApi(modelId: string, fileName: string): Promise<void> {
  try {
    const url = `${API_BASE_URL}/api/model/${modelId}/download`;
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    throw new DownloadModelError(
      `Failed to download model: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
```

**index.ts** (Application Layer Exports)
```typescript
// Export all model-generation application APIs
export { generateModelApi } from './generate_model.api.js';
export { getJobStatusApi } from './get_job_status.api.js';
export { cancelJobApi } from './cancel_job.api.js';
export { getModelApi } from './get_model.api.js';
export { downloadModelApi } from './download_model.api.js';
```

### Data-Service Errors

**Location**: `frontend/src/data-service/application/errors.ts`

**Add these error classes** (append to existing errors.ts):
```typescript
export class ModelGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelGenerationError';
  }
}

export class GenerateModelError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'GenerateModelError';
  }
}

export class JobStatusError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'JobStatusError';
  }
}

export class CancelJobError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'CancelJobError';
  }
}

export class GetModelError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'GetModelError';
  }
}

export class DownloadModelError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'DownloadModelError';
  }
}
```


---

## Frontend Page-Service Architecture

### Purpose
The page-service layer handles all UI components for the model generation page, including progress tracking, 3D viewer, and user controls.

### Page-Service Domain: model-generation-page

**Location**: `frontend/src/page-service/domain/model-generation-page/`

**Responsibility**: UI components and page logic for model generation

#### Component Structure (FLAT - No Nested Folders)

All components are at the same level in the `model-generation-page/` folder:

1. **ModelGenerationPage.tsx** - Main page component
2. **ProgressSection.tsx** - Progress tracking UI
3. **ProgressBar.tsx** - Progress bar component
4. **StagesList.tsx** - Stages list component
5. **ModelViewer.tsx** - Three.js 3D viewer
6. **ViewerControls.tsx** - Zoom, reset, fullscreen controls
7. **ViewModeSelector.tsx** - Perspective, orthographic, wireframe
8. **ModelInfoPanel.tsx** - Model metadata display
9. **ErrorDisplay.tsx** - Error state component

#### Logic Files

1. **model_generation_logic.ts** - Page-level state management
2. **progress_tracking_logic.ts** - Progress state management
3. **viewer_logic.ts** - Three.js viewer logic
4. **polling_logic.ts** - Job status polling logic

#### Style Files

1. **model_generation_page.module.css** - Page layout
2. **progress_section.module.css** - Progress section styles
3. **model_viewer.module.css** - Viewer styles

---

### ModelGenerationPage (Main Page Component)

**File**: `ModelGenerationPage.tsx`
**Responsibility**: Orchestrate all sub-components and manage page-level state

**Props**: None (page component, gets data from URL params)

**State Management**:
- `jobId`: Current job ID (from URL or generation)
- `jobStatus`: Current job status object
- `modelUrl`: Signed URL for 3D model
- `isGenerating`: Whether generation is in progress
- `error`: Error message if generation failed
- `pollingInterval`: Interval ID for status polling

**Key Functions**:
- `startGeneration()`: Initiate model generation
- `pollJobStatus()`: Poll job status every 2 seconds
- `handleJobComplete()`: Handle job completion
- `handleJobFailed()`: Handle job failure
- `handleCancel()`: Cancel job
- `handleRetry()`: Retry failed generation
- `handleDownload()`: Download model file

**Component Structure**:
```typescript
export function ModelGenerationPage(): JSX.Element {
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<IJobStatus | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Start generation on mount
  useEffect(() => {
    startGeneration();
  }, []);
  
  // Poll job status
  useEffect(() => {
    if (jobId && !isJobComplete(jobStatus?.status)) {
      const interval = setInterval(() => {
        pollJobStatus();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [jobId, jobStatus]);
  
  return (
    <div className={styles.page}>
      <Header onCancel={handleCancel} onDownload={handleDownload} />
      
      {isGenerating && !error && (
        <ProgressSection jobStatus={jobStatus} />
      )}
      
      {modelUrl && !error && (
        <ModelViewer modelUrl={modelUrl} />
      )}
      
      {error && (
        <ErrorDisplay error={error} onRetry={handleRetry} />
      )}
    </div>
  );
}
```

---

### ProgressSection Component

**File**: `ProgressSection.tsx`
**Responsibility**: Display progress tracking UI with stages

**Props**:
```typescript
interface IProgressSectionProps {
  jobStatus: IJobStatus | null;
}
```

**Component Structure**:
```typescript
export function ProgressSection({ jobStatus }: IProgressSectionProps): JSX.Element {
  if (!jobStatus) {
    return <div>Initializing...</div>;
  }
  
  return (
    <div className={styles.progressSection}>
      <div className={styles.progressHeader}>
        <h2>Generating 3D Model</h2>
        <span className={styles.percentage}>{jobStatus.progress}%</span>
      </div>
      
      <ProgressBar progress={jobStatus.progress} />
      
      <p className={styles.stage}>{jobStatus.stage}</p>
      
      <StagesList currentStage={jobStatus.stage} progress={jobStatus.progress} />
    </div>
  );
}
```

---

### ProgressBar Component

**File**: `ProgressBar.tsx`
**Responsibility**: Animated progress bar

**Props**:
```typescript
interface IProgressBarProps {
  progress: number; // 0-100
}
```

---

### StagesList Component

**File**: `StagesList.tsx`
**Responsibility**: Display list of generation stages with status icons

**Props**:
```typescript
interface IStagesListProps {
  currentStage: string;
  progress: number;
}
```

**Stages**:
1. Validating dimension data (0-10%)
2. Generating Blender script with Gemini AI (10-30%)
3. Executing Blender script (30-60%)
4. Exporting glTF model (60-80%)
5. Uploading to cloud storage (80-100%)


---

### ModelViewer Component

**File**: `ModelViewer.tsx`
**Responsibility**: Three.js 3D model viewer with interactive controls

**Props**:
```typescript
interface IModelViewerProps {
  modelUrl: string;
}
```

**State**:
- `viewMode`: 'perspective' | 'orthographic' | 'wireframe'
- `isFullscreen`: boolean
- `modelInfo`: { vertexCount, faceCount, fileSize }

**Three.js Setup**:
- Scene with lighting
- Camera (perspective/orthographic)
- Controls (OrbitControls)
- glTF loader
- Renderer

**Key Functions**:
- `loadModel()`: Load glTF model from URL
- `setViewMode()`: Switch between view modes
- `zoomIn()`: Zoom camera in
- `zoomOut()`: Zoom camera out
- `resetView()`: Reset camera to default position
- `toggleFullscreen()`: Enter/exit fullscreen

**Component Structure**:
```typescript
export function ModelViewer({ modelUrl }: IModelViewerProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('perspective');
  const [modelInfo, setModelInfo] = useState<IModelInfo | null>(null);
  
  useEffect(() => {
    if (canvasRef.current) {
      initThreeJS(canvasRef.current);
      loadModel(modelUrl);
    }
  }, [modelUrl]);
  
  return (
    <div className={styles.viewerWrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
      
      <ViewModeSelector 
        viewMode={viewMode} 
        onViewModeChange={setViewMode} 
      />
      
      <ViewerControls 
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onFullscreen={handleFullscreen}
      />
      
      <ModelInfoPanel modelInfo={modelInfo} />
    </div>
  );
}
```

---

### ViewerControls Component

**File**: `ViewerControls.tsx`
**Responsibility**: Zoom, reset, fullscreen controls

**Props**:
```typescript
interface IViewerControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFullscreen: () => void;
}
```

---

### ViewModeSelector Component

**File**: `ViewModeSelector.tsx`
**Responsibility**: Switch between perspective, orthographic, wireframe

**Props**:
```typescript
interface IViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

type ViewMode = 'perspective' | 'orthographic' | 'wireframe';
```

---

### ModelInfoPanel Component

**File**: `ModelInfoPanel.tsx`
**Responsibility**: Display model metadata

**Props**:
```typescript
interface IModelInfoPanelProps {
  modelInfo: IModelInfo | null;
}

interface IModelInfo {
  vertexCount: number;
  faceCount: number;
  fileSize: number;
}
```

---

### ErrorDisplay Component

**File**: `ErrorDisplay.tsx`
**Responsibility**: Display error state with retry option

**Props**:
```typescript
interface IErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onGoBack?: () => void;
}
```

---

## Logic Files

### model_generation_logic.ts

**Responsibility**: Page-level state management and orchestration

**Key Functions**:
```typescript
export function initializeModelGeneration(
  dimensionData: IDimensionData,
  imageUrl: string
): IModelGenerationState

export function updateJobStatus(
  state: IModelGenerationState,
  jobStatus: IJobStatus
): IModelGenerationState

export function handleGenerationComplete(
  state: IModelGenerationState,
  modelId: string
): IModelGenerationState

export function handleGenerationFailed(
  state: IModelGenerationState,
  error: string
): IModelGenerationState

export function shouldPollStatus(state: IModelGenerationState): boolean

export function canDownloadModel(state: IModelGenerationState): boolean
```

---

### progress_tracking_logic.ts

**Responsibility**: Progress state management and stage tracking

**Key Functions**:
```typescript
export function calculateStageStatus(
  currentStage: string,
  progress: number
): IStageStatus[]

export function getStageIcon(status: 'pending' | 'active' | 'completed'): string

export function formatProgress(progress: number): string

export interface IStageStatus {
  id: number;
  text: string;
  status: 'pending' | 'active' | 'completed';
  icon: string;
}
```

---

### viewer_logic.ts

**Responsibility**: Three.js viewer initialization and controls

**Key Functions**:
```typescript
export function initThreeJS(canvas: HTMLCanvasElement): IThreeJSContext

export function loadGLTFModel(url: string, context: IThreeJSContext): Promise<void>

export function setViewMode(
  context: IThreeJSContext,
  mode: ViewMode
): void

export function zoomCamera(context: IThreeJSContext, direction: 'in' | 'out'): void

export function resetCamera(context: IThreeJSContext): void

export function extractModelInfo(model: any): IModelInfo

export interface IThreeJSContext {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
}
```

---

### polling_logic.ts

**Responsibility**: Job status polling logic

**Key Functions**:
```typescript
export function startPolling(
  jobId: string,
  onUpdate: (status: IJobStatus) => void,
  interval: number
): number

export function stopPolling(intervalId: number): void

export function shouldContinuePolling(status: IJobStatus): boolean

export function getPollingInterval(retryCount: number): number
```


---

## Data Structures (interface.ts)

### Page-Service Interfaces

**Location**: `frontend/src/page-service/domain/model-generation-page/interface.ts`

```typescript
// Page-level state
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
  progressRange: [number, number]; // [start%, end%]
}

export interface IThreeJSContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  controls: any; // OrbitControls
  model: THREE.Group | null;
}
```

---

## Styling Strategy

### model_generation_page.module.css

**Responsibility**: Page-level layout and spacing

**Key Classes**:
- `.page`: Main page wrapper (flex column, full height)
- `.header`: Header with title and actions
- `.mainContent`: Main content area (flex, full height)
- `.viewerContainer`: Viewer container (flex column)

---

### progress_section.module.css

**Responsibility**: Progress section styling

**Key Classes**:
- `.progressSection`: Progress section container
- `.progressHeader`: Header with title and percentage
- `.progressBar`: Progress bar container
- `.progressBarFill`: Animated progress bar fill
- `.stage`: Current stage text
- `.stagesList`: Stages list container
- `.stageItem`: Individual stage item
- `.stageIcon`: Stage status icon
- `.stageText`: Stage description text

---

### model_viewer.module.css

**Responsibility**: 3D viewer styling

**Key Classes**:
- `.viewerWrapper`: Viewer wrapper (relative positioning)
- `.canvas`: Three.js canvas (full size)
- `.viewerControls`: Controls panel (absolute, bottom-right)
- `.viewModeSelector`: View mode selector (absolute, top-left)
- `.modelInfoPanel`: Model info panel (absolute, top-right)
- `.controlBtn`: Control button styling
- `.viewModeBtn`: View mode button styling

---

## API Integration Flow

### 1. Generate Model Flow

```
User clicks "Generate 3D Model"
  ↓
Frontend: generateModelApi(request)
  ↓
Backend: POST /api/model/generate
  ↓
Backend: Queue job, return jobId
  ↓
Frontend: Start polling job status
  ↓
Backend: Process job in background
  - Generate Blender script (Gemini)
  - Execute Blender script
  - Upload model to GCP
  ↓
Frontend: Poll GET /api/model/job/:jobId
  ↓
Backend: Return job status with progress
  ↓
Frontend: Update progress UI
  ↓
Job completes with modelId
  ↓
Frontend: GET /api/model/:modelId
  ↓
Backend: Return signed URL
  ↓
Frontend: Load model in Three.js viewer
```

### 2. Polling Strategy

- Poll every 2 seconds while job is in progress
- Stop polling when job status is 'completed', 'failed', or 'cancelled'
- Exponential backoff on errors (2s, 4s, 8s)
- Max 5 minutes of polling before timeout

### 3. Error Handling

- Network errors: Retry with backoff
- API errors: Display error message with retry option
- Timeout errors: Display timeout message with retry option
- Validation errors: Display validation message, go back to dimension marking

---

## Key Design Decisions

### 1. Async Job Queue
- Long-running model generation runs as background job
- Immediate response with jobId
- Client polls for status updates
- Prevents timeout issues

### 2. GCP Cloud Storage
- Models stored in GCP for scalability
- Signed URLs for secure access
- 1-hour expiry on signed URLs
- Automatic cleanup of old models

### 3. Progress Tracking
- 5 distinct stages with progress ranges
- Real-time updates via polling
- Visual feedback with animated progress bar
- Stage-by-stage status indicators

### 4. Three.js Viewer
- Interactive 3D visualization
- Multiple view modes (perspective, orthographic, wireframe)
- Orbit controls for rotation and zoom
- Model info display (vertices, faces, file size)

### 5. Error Recovery
- Retry capability for failed generations
- Cancel capability for in-progress jobs
- Clear error messages with actionable steps
- Automatic cleanup on errors

### 6. Flat Component Structure
- All components at same level in page domain
- No nested component folders
- Easier to navigate and maintain
- Follows DDD page-service pattern

---

## Implementation Order

1. **Phase 1**: Backend infrastructure
   - Job queue domain
   - Model storage domain
   - API endpoints

2. **Phase 2**: Gemini & Blender integration
   - Gemini service domain
   - Blender service domain
   - Script generation and execution

3. **Phase 3**: Frontend data-service
   - API call functions
   - Error handling
   - Domain logic

4. **Phase 4**: Frontend page-service
   - ModelGenerationPage component
   - ProgressSection component
   - Polling logic

5. **Phase 5**: 3D Viewer
   - ModelViewer component
   - Three.js integration
   - View controls

6. **Phase 6**: Polish and optimization
   - Styling refinement
   - Performance optimization
   - Error handling improvements

---

## Notes

- All code follows DDD rules from global-setup
- No middleware, utils, or helpers folders
- All errors in application/errors.ts
- All styling in component-specific .module.css files
- Backend uses MongoDB for job/model metadata
- Frontend uses Three.js for 3D visualization
- Polling interval: 2 seconds
- Job timeout: 5 minutes
- Signed URL expiry: 1 hour
- Max concurrent jobs: 3
- Max retries: 3 with exponential backoff

