# 3D Model Generation Feature - Implementation Tasks

## Overview
This task list follows the requirements-first workflow for implementing the 3D model generation feature. All tasks are organized by component and follow DDD architecture principles.

---

## Task 1: Backend - Gemini Service Domain

### 1.1 Create Gemini Service Schema
- [ ] Create `backend/src/data-service/domain/gemini-service/gemini_service_schema.ts`
- [ ] Define `IGeminiRequest` interface
- [ ] Define `IGeminiResponse` interface
- [ ] Define `IDimensions` interface
- [ ] Define `IAnnotation` interface
- [ ] Export all types

### 1.2 Implement Gemini Service Domain Logic
- [ ] Create `backend/src/data-service/domain/gemini-service/index.ts`
- [ ] Implement `loadPromptTemplate()` function
- [ ] Implement `formatPrompt()` function
- [ ] Implement `generateBlenderScript()` function with Gemini API integration
- [ ] Implement `validateBlenderScript()` function
- [ ] Add error handling with retry logic (3 attempts, exponential backoff)
- [ ] Export all functions

---

## Task 2: Backend - Blender Service Domain

### 2.1 Create Blender Service Schema
- [ ] Create `backend/src/data-service/domain/blender-service/blender_service_schema.ts`
- [ ] Define `IBlenderExecutionResult` interface
- [ ] Define `IBlenderScriptValidation` interface
- [ ] Define `IModelMetadata` interface
- [ ] Export all types

### 2.2 Implement Blender Service Domain Logic
- [ ] Create `backend/src/data-service/domain/blender-service/index.ts`
- [ ] Implement `validateScriptSafety()` function
- [ ] Implement `executeBlenderScript()` function (headless mode)
- [ ] Implement `exportToGLTF()` function
- [ ] Implement `cleanupTempFiles()` function
- [ ] Add timeout handling (60 seconds)
- [ ] Add error capture from stderr
- [ ] Export all functions

---

## Task 3: Backend - Job Queue Domain

### 3.1 Create Job Queue Schema
- [ ] Create `backend/src/data-service/domain/job-queue/job_queue_schema.ts`
- [ ] Define `JobStatus` type
- [ ] Define `IJob` interface
- [ ] Define `IJobStatusUpdate` interface
- [ ] Export all types

### 3.2 Implement Job Queue Domain Logic
- [ ] Create `backend/src/data-service/domain/job-queue/index.ts`
- [ ] Implement in-memory job queue (Map-based)
- [ ] Implement `queueJob()` function
- [ ] Implement `getJobStatus()` function
- [ ] Implement `updateJobStatus()` function
- [ ] Implement `processNextJob()` function with worker logic
- [ ] Implement `cancelJob()` function
- [ ] Add FIFO processing logic
- [ ] Export all functions

---

## Task 4: Backend - Model Generation Application Layer

### 4.1 Create Generate Model API
- [ ] Create `backend/src/data-service/application/model-generation/generate_model.api.ts`
- [ ] Define `IGenerateModelRequest` interface
- [ ] Define `IGenerateModelResponse` interface
- [ ] Implement `generateModelHandler()` function
- [ ] Validate request data
- [ ] Call Gemini service to generate script
- [ ] Queue job for Blender execution
- [ ] Return job_id to client
- [ ] Add error handling

### 4.2 Create Get Job Status API
- [ ] Create `backend/src/data-service/application/model-generation/get_job_status.api.ts`
- [ ] Define `IJobStatusResponse` interface
- [ ] Implement `getJobStatusHandler()` function
- [ ] Retrieve job status from queue
- [ ] Return status, progress, modelId, or error
- [ ] Add error handling

### 4.3 Create Get Model API
- [ ] Create `backend/src/data-service/application/model-generation/get_model.api.ts`
- [ ] Define `IModelResponse` interface
- [ ] Implement `getModelHandler()` function
- [ ] Retrieve model metadata
- [ ] Return model URL and metadata
- [ ] Add error handling

### 4.4 Create Download Model API
- [ ] Create `backend/src/data-service/application/model-generation/download_model.api.ts`
- [ ] Implement `downloadModelHandler()` function
- [ ] Stream model file to client
- [ ] Set appropriate headers (Content-Type, Content-Disposition)
- [ ] Add error handling

### 4.5 Create Cancel Job API
- [ ] Create `backend/src/data-service/application/model-generation/cancel_job.api.ts`
- [ ] Define `ICancelJobResponse` interface
- [ ] Implement `cancelJobHandler()` function
- [ ] Cancel job in queue
- [ ] Return success message
- [ ] Add error handling

### 4.6 Create Application Index
- [ ] Create `backend/src/data-service/application/model-generation/index.ts`
- [ ] Export all API handlers

---

## Task 5: Backend - Server Configuration

### 5.1 Register API Routes
- [ ] Update `backend/src/server.ts`
- [ ] Add route: `POST /api/models/generate` → `generateModelHandler`
- [ ] Add route: `GET /api/models/status/:jobId` → `getJobStatusHandler`
- [ ] Add route: `GET /api/models/:modelId` → `getModelHandler`
- [ ] Add route: `GET /api/models/:modelId/download` → `downloadModelHandler`
- [ ] Add route: `POST /api/models/cancel/:jobId` → `cancelJobHandler`
- [ ] Add JWT authentication middleware to all routes

### 5.2 Configure Environment Variables
- [ ] Add `GEMINI_API_KEY` to `.env.local` and `.env.production`
- [ ] Add `BLENDER_PATH` to environment files
- [ ] Add `MODEL_STORAGE_PATH` to environment files
- [ ] Add `MAX_JOB_QUEUE_SIZE` to environment files
- [ ] Add `JOB_TIMEOUT_SECONDS` to environment files

---

## Task 6: Frontend - Model Generation Page Domain

### 6.1 Create Model Generation Page Interfaces
- [ ] Create `frontend/src/page-service/domain/model-generation-page/interface.ts`
- [ ] Define `IModelGenerationState` interface
- [ ] Define `IProgressUpdate` interface
- [ ] Export all interfaces

### 6.2 Create Model Generation Page Logic
- [ ] Create `frontend/src/page-service/domain/model-generation-page/index.ts`
- [ ] Implement `loadImageFromSession()` function
- [ ] Implement `pollJobStatus()` function
- [ ] Implement `calculateProgress()` function
- [ ] Implement `handleGenerationError()` function
- [ ] Export all functions

### 6.3 Create Progress Bar Component
- [ ] Create `frontend/src/page-service/domain/model-generation-page/ProgressBar.tsx`
- [ ] Accept props: `progress`, `status`, `message`
- [ ] Render animated progress bar
- [ ] Display status message
- [ ] Add smooth animation transitions

### 6.4 Create Global Header Component
- [ ] Create `frontend/src/page-service/domain/model-generation-page/GlobalHeader.tsx`
- [ ] Add navigation buttons: Upload, Dimension, Model, Logout
- [ ] Implement navigation handlers
- [ ] Implement logout handler
- [ ] Style with pastel gradients matching upload page

### 6.5 Create Model Generation Page Component
- [ ] Create `frontend/src/page-service/domain/model-generation-page/ModelGenerationPage.tsx`
- [ ] Initialize state with `IModelGenerationState`
- [ ] Load image data from sessionStorage on mount
- [ ] Call generate model API
- [ ] Start polling for job status
- [ ] Update progress bar based on status
- [ ] Redirect to viewer page when completed
- [ ] Display error message if failed
- [ ] Render `ProgressBar` and `GlobalHeader` components

### 6.6 Create Model Generation Page Styles
- [ ] Create `frontend/src/page-service/domain/model-generation-page/model_generation_page.module.css`
- [ ] Style full-page layout
- [ ] Style progress bar with animations
- [ ] Style global header
- [ ] Add responsive design

---

## Task 7: Frontend - Model Viewer Page Domain

### 7.1 Create Model Viewer Page Interfaces
- [ ] Create `frontend/src/page-service/domain/model-viewer-page/interface.ts`
- [ ] Define `IModelViewerState` interface
- [ ] Define `ICameraState` interface
- [ ] Define `IViewportControls` interface
- [ ] Export all interfaces

### 7.2 Create Model Viewer Page Logic
- [ ] Create `frontend/src/page-service/domain/model-viewer-page/index.ts`
- [ ] Implement `loadModel()` function
- [ ] Implement `setupScene()` function
- [ ] Implement `setupCamera()` function
- [ ] Implement `setupLighting()` function
- [ ] Implement `handleRotation()` function
- [ ] Implement `handleZoom()` function
- [ ] Implement `handlePan()` function
- [ ] Export all functions

### 7.3 Create Three.js Viewer Component
- [ ] Create `frontend/src/page-service/domain/model-viewer-page/ThreeViewer.tsx`
- [ ] Initialize Three.js scene, camera, renderer
- [ ] Load glTF model using GLTFLoader
- [ ] Setup ambient and directional lighting
- [ ] Implement orbit controls (rotation, zoom, pan)
- [ ] Add mouse event handlers
- [ ] Implement animation loop
- [ ] Handle window resize
- [ ] Clean up on unmount

### 7.4 Create Viewport Controls Component
- [ ] Create `frontend/src/page-service/domain/model-viewer-page/ViewportControls.tsx`
- [ ] Display control instructions (rotate, zoom, pan)
- [ ] Add reset view button
- [ ] Add zoom in/out buttons
- [ ] Style controls overlay

### 7.5 Create Global Header Component
- [ ] Create `frontend/src/page-service/domain/model-viewer-page/GlobalHeader.tsx`
- [ ] Add navigation buttons: Upload, Dimension, Model, Logout
- [ ] Implement navigation handlers
- [ ] Implement logout handler
- [ ] Style with pastel gradients matching upload page

### 7.6 Create Model Viewer Page Component
- [ ] Create `frontend/src/page-service/domain/model-viewer-page/ModelViewerPage.tsx`
- [ ] Initialize state with `IModelViewerState`
- [ ] Get model_id from URL params or sessionStorage
- [ ] Call get model API
- [ ] Pass model URL to ThreeViewer
- [ ] Display loading indicator while loading
- [ ] Display error message if failed
- [ ] Render `ThreeViewer`, `ViewportControls`, and `GlobalHeader` components

### 7.7 Create Model Viewer Page Styles
- [ ] Create `frontend/src/page-service/domain/model-viewer-page/model_viewer_page.module.css`
- [ ] Style full-page layout
- [ ] Style Three.js canvas
- [ ] Style viewport controls overlay
- [ ] Style global header
- [ ] Add responsive design

---

## Task 8: Frontend - Application Layer

### 8.1 Create Model Generation API Client
- [ ] Create `frontend/src/page-service/application/model-generation/model_generation.api.ts`
- [ ] Define `IGenerateModelRequest` interface
- [ ] Define `IGenerateModelResponse` interface
- [ ] Define `IJobStatusResponse` interface
- [ ] Define `IModelResponse` interface
- [ ] Implement `generateModelApi()` function
- [ ] Implement `getJobStatusApi()` function
- [ ] Implement `getModelApi()` function
- [ ] Implement `cancelJobApi()` function
- [ ] Add API logging using `logger.ts`
- [ ] Add error handling

### 8.2 Create Application Index
- [ ] Create `frontend/src/page-service/application/model-generation/index.ts`
- [ ] Export all API functions

---

## Task 9: Frontend - Routing Configuration

### 9.1 Add Routes to App.tsx
- [ ] Update `frontend/src/App.tsx`
- [ ] Add route: `/model-generation` → `ModelGenerationPage`
- [ ] Add route: `/model-viewer` → `ModelViewerPage`
- [ ] Add route: `/model-viewer/:modelId` → `ModelViewerPage`

### 9.2 Update Navigation in Dimension Mark Page
- [ ] Update `frontend/src/page-service/domain/dimension-mark-page/dimension_mark_page.tsx`
- [ ] Change Save button navigation to `/model-generation`
- [ ] Change Skip button navigation to `/model-generation`

---

## Task 10: Testing - Backend Unit Tests

### 10.1 Test Gemini Service
- [ ] Create `backend/tests/unit/services/gemini_service.test.ts`
- [ ] Test `loadPromptTemplate()` function
- [ ] Test `formatPrompt()` function
- [ ] Test `generateBlenderScript()` function with mocked Gemini API
- [ ] Test `validateBlenderScript()` function
- [ ] Test error handling and retry logic
- [ ] Test timeout handling

### 10.2 Test Blender Service
- [ ] Create `backend/tests/unit/services/blender_service.test.ts`
- [ ] Test `validateScriptSafety()` function
- [ ] Test `executeBlenderScript()` function with mocked Blender
- [ ] Test `exportToGLTF()` function
- [ ] Test `cleanupTempFiles()` function
- [ ] Test error handling
- [ ] Test timeout handling

### 10.3 Test Job Queue Service
- [ ] Create `backend/tests/unit/services/job_queue_service.test.ts`
- [ ] Test `queueJob()` function
- [ ] Test `getJobStatus()` function
- [ ] Test `updateJobStatus()` function
- [ ] Test `processNextJob()` function
- [ ] Test `cancelJob()` function
- [ ] Test FIFO processing
- [ ] Test concurrent job handling

---

## Task 11: Testing - Backend Integration Tests

### 11.1 Test Model Generation API
- [ ] Create `backend/tests/integration/model-generation/generate_model.test.ts`
- [ ] Test POST /api/models/generate with valid data
- [ ] Test POST /api/models/generate with invalid data
- [ ] Test POST /api/models/generate without authentication
- [ ] Test job queuing
- [ ] Test error responses

### 11.2 Test Job Status API
- [ ] Create `backend/tests/integration/model-generation/get_job_status.test.ts`
- [ ] Test GET /api/models/status/:jobId with valid jobId
- [ ] Test GET /api/models/status/:jobId with invalid jobId
- [ ] Test status updates during job processing

### 11.3 Test Model API
- [ ] Create `backend/tests/integration/model-generation/get_model.test.ts`
- [ ] Test GET /api/models/:modelId with valid modelId
- [ ] Test GET /api/models/:modelId with invalid modelId
- [ ] Test GET /api/models/:modelId/download

---

## Task 12: Testing - Frontend Unit Tests

### 12.1 Test Model Generation Page Logic
- [ ] Create `frontend/tests/unit/domain/model_generation_logic.test.ts`
- [ ] Test `loadImageFromSession()` function
- [ ] Test `pollJobStatus()` function
- [ ] Test `calculateProgress()` function
- [ ] Test `handleGenerationError()` function

### 12.2 Test Model Viewer Page Logic
- [ ] Create `frontend/tests/unit/domain/model_viewer_logic.test.ts`
- [ ] Test `loadModel()` function
- [ ] Test `setupScene()` function
- [ ] Test `setupCamera()` function
- [ ] Test `setupLighting()` function
- [ ] Test `handleRotation()` function
- [ ] Test `handleZoom()` function
- [ ] Test `handlePan()` function

### 12.3 Test Progress Bar Component
- [ ] Create `frontend/tests/unit/components/progress_bar.test.tsx`
- [ ] Test rendering with different progress values
- [ ] Test rendering with different status messages
- [ ] Test animation transitions

### 12.4 Test Three.js Viewer Component
- [ ] Create `frontend/tests/unit/components/three_viewer.test.tsx`
- [ ] Test scene initialization
- [ ] Test model loading
- [ ] Test camera controls
- [ ] Test mouse event handlers
- [ ] Test cleanup on unmount

---

## Task 13: Testing - Frontend Integration Tests

### 13.1 Test Model Generation Flow
- [ ] Create `frontend/tests/integration/model-generation/generation_flow.test.tsx`
- [ ] Test complete generation flow from dimension page to viewer
- [ ] Test progress updates
- [ ] Test error handling
- [ ] Test retry functionality

### 13.2 Test Model Viewer Flow
- [ ] Create `frontend/tests/integration/model-viewer/viewer_flow.test.tsx`
- [ ] Test model loading from API
- [ ] Test viewport controls
- [ ] Test error handling

---

## Task 14: Testing - E2E Tests

### 14.1 Test Complete Feature Flow
- [ ] Create `backend/tests/feature/model-generation/feature.test.ts`
- [ ] Test complete flow: generate → queue → execute → download
- [ ] Test with real Gemini API (mocked)
- [ ] Test with real Blender execution (mocked)
- [ ] Test error scenarios

### 14.2 Test Frontend Feature Flow
- [ ] Create `frontend/tests/feature/model-generation/feature.test.tsx`
- [ ] Test complete user flow: dimension page → progress page → viewer page
- [ ] Test progress updates
- [ ] Test viewport controls
- [ ] Test error scenarios

---

## Task 15: Documentation and Deployment

### 15.1 Update Documentation
- [ ] Update README with 3D model generation feature
- [ ] Document Gemini API setup
- [ ] Document Blender installation requirements
- [ ] Document environment variables

### 15.2 Deployment Preparation
- [ ] Verify all environment variables are set
- [ ] Verify Blender is installed on backend server
- [ ] Verify model storage directory exists
- [ ] Test deployment on staging environment

### 15.3 Create Deployment Guide
- [ ] Create deployment checklist
- [ ] Document rollback procedure
- [ ] Document monitoring setup

---

## Task 16: Code Review and Merge

### 16.1 Code Review
- [ ] Review all code for DDD compliance
- [ ] Review all code for security issues
- [ ] Review all code for performance issues
- [ ] Review all tests for coverage

### 16.2 Merge Request
- [ ] Create merge request
- [ ] Add description and screenshots
- [ ] Request code review
- [ ] Address review comments
- [ ] Merge to main branch

---

## Summary

**Total Tasks**: 16 main tasks with 100+ sub-tasks
**Estimated Effort**: 3-4 weeks
**Priority**: High
**Dependencies**: Gemini API access, Blender installation, Three.js library

**Key Milestones**:
1. Backend domain logic complete (Tasks 1-3)
2. Backend API complete (Tasks 4-5)
3. Frontend pages complete (Tasks 6-7)
4. Frontend API integration complete (Tasks 8-9)
5. All tests passing (Tasks 10-14)
6. Deployment ready (Task 15)
7. Code merged (Task 16)
