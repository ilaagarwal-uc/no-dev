# 3D Model Generation Feature - Comprehensive Test Plan

**Feature**: 3D Model Generation from Dimension-Marked Images  
**Created**: 2026-03-08  
**Coverage Target**: 100% for critical paths  
**Test Pyramid**: 70% Unit, 25% Integration, 5% E2E

---

## Test Strategy Overview

This test plan follows TDD (Test-Driven Development) approach with comprehensive coverage across all components of the 3D model generation feature. Tests are organized by component and layer, with clear categorization of happy path, error cases, and edge cases.

### Test Pyramid Distribution
- **Unit Tests (70%)**: Service logic, API handlers, component logic, state management
- **Integration Tests (25%)**: Service interactions, API contracts, database operations, external API calls
- **E2E Tests (5%)**: Full user workflows (dimension mark → generate → view)

### Critical Testing Rules
- **ALWAYS use MongoDB Memory Server** for all database tests
- **NEVER connect to real databases** in tests
- **Use mocks for external services** (Gemini API, GCP Storage, Blender execution)
- **Each test must be isolated** and independent
- **Tests must be deterministic** (no flaky tests)

---

## 1. BACKEND UNIT TESTS (70% of backend tests)

### 1.1 Gemini API Service Tests
**File**: `tests/unit/services/gemini_service.test.ts`  
**Coverage Target**: 90%+

#### 1.1.1 Script Generation (Happy Path)
- [ ] Test generate Blender script from valid dimension data
- [ ] Test format prompt correctly with all dimension types (polygon, dimension, arch, corner)
- [ ] Test include image data in prompt as base64
- [ ] Test parse Gemini response correctly
- [ ] Test extract Python code from response
- [ ] Test validate generated script syntax

#### 1.1.2 Input Validation
- [ ] Test validate dimension data before API call
- [ ] Test reject empty dimension data
- [ ] Test reject invalid dimension format
- [ ] Test reject missing image data
- [ ] Test sanitize user input in prompts
- [ ] Test handle special characters in dimension labels

#### 1.1.3 Error Handling
- [ ] Test handle API timeout errors (5 second timeout)
- [ ] Test handle malformed API responses
- [ ] Test handle API rate limit errors (429)
- [ ] Test handle API authentication errors (401)
- [ ] Test handle network errors
- [ ] Test handle empty response from API

#### 1.1.4 Retry Logic
- [ ] Test retry on transient failures (3 retries)
- [ ] Test exponential backoff between retries (1s, 2s, 4s)
- [ ] Test stop retrying after max attempts
- [ ] Test do not retry on permanent failures (400, 401)
- [ ] Test track retry count in logs

#### 1.1.5 Rate Limiting
- [ ] Test respect API rate limits (10 requests per minute)
- [ ] Test queue requests when rate limit reached
- [ ] Test process queued requests after cooldown
- [ ] Test return rate limit error to client when queue full

---

### 1.2 Blender Execution Service Tests
**File**: `tests/unit/services/blender_service.test.ts`  
**Coverage Target**: 90%+

#### 1.2.1 Script Execution (Happy Path)
- [ ] Test execute Blender script in headless mode
- [ ] Test pass script as stdin to Blender process
- [ ] Test export model in glTF format
- [ ] Test verify glTF file integrity after export
- [ ] Test return model file path on success

#### 1.2.2 Script Validation
- [ ] Test validate script before execution
- [ ] Test reject script with syntax errors
- [ ] Test reject script with missing imports
- [ ] Test reject script with dangerous operations (file system access)
- [ ] Test allow only safe Blender operations

#### 1.2.3 Error Handling
- [ ] Test handle script execution errors
- [ ] Test capture Blender error output
- [ ] Test handle script timeout (max 5 minutes)
- [ ] Test handle Blender crash
- [ ] Test handle export failures
- [ ] Test handle corrupted output files

#### 1.2.4 Resource Management
- [ ] Test clean up temporary files after execution
- [ ] Test clean up on execution failure
- [ ] Test limit CPU usage per execution
- [ ] Test limit memory usage per execution
- [ ] Test handle concurrent execution requests (max 3 concurrent)
- [ ] Test queue requests when max concurrency reached

#### 1.2.5 Output Validation
- [ ] Test verify glTF file structure
- [ ] Test verify glTF file size is reasonable (< 50MB)
- [ ] Test verify glTF contains required nodes
- [ ] Test verify glTF contains materials
- [ ] Test verify glTF is valid JSON

---

### 1.3 Job Queue Service Tests
**File**: `tests/unit/services/job_queue_service.test.ts`  
**Coverage Target**: 90%+

#### 1.3.1 Job Management (Happy Path)
- [ ] Test queue job and return job_id
- [ ] Test generate unique job_id for each job
- [ ] Test process jobs in FIFO order
- [ ] Test update job status correctly (pending → processing → completed)
- [ ] Test track job progress (0-100%)
- [ ] Test store job result on completion

#### 1.3.2 Job Status Tracking
- [ ] Test get job status by job_id
- [ ] Test return correct status for pending job
- [ ] Test return correct status for processing job
- [ ] Test return correct status for completed job
- [ ] Test return correct status for failed job
- [ ] Test return 404 for non-existent job_id

#### 1.3.3 Job Failure Handling
- [ ] Test handle job failures gracefully
- [ ] Test retry failed jobs (max 3 attempts)
- [ ] Test increment retry count on failure
- [ ] Test do not retry after max attempts
- [ ] Test store error message on failure
- [ ] Test update status to failed after max retries

#### 1.3.4 Job Cleanup
- [ ] Test clean up completed jobs after 24 hours
- [ ] Test clean up failed jobs after 24 hours
- [ ] Test do not clean up jobs before 24 hours
- [ ] Test clean up job artifacts (temp files)

#### 1.3.5 Queue Management
- [ ] Test handle queue overflow (max 100 jobs)
- [ ] Test return error when queue full
- [ ] Test prioritize jobs correctly (FIFO)
- [ ] Test cancel jobs on request
- [ ] Test update status to cancelled when cancelled

---

### 1.4 Model Storage Service Tests
**File**: `tests/unit/services/model_storage_service.test.ts`  
**Coverage Target**: 90%+

#### 1.4.1 Model Storage (Happy Path)
- [ ] Test store glTF model in GCP
- [ ] Test generate unique model_id
- [ ] Test store model metadata in database
- [ ] Test return model_id and URL on success
- [ ] Test set correct access permissions (private)

#### 1.4.2 Model Retrieval
- [ ] Test retrieve model by model_id
- [ ] Test return model file stream
- [ ] Test return correct Content-Type header (model/gltf+json)
- [ ] Test return 404 for non-existent model_id
- [ ] Test generate signed URL for model access

#### 1.4.3 Model Validation
- [ ] Test validate model file before storage
- [ ] Test reject invalid glTF files
- [ ] Test reject files exceeding size limit (50MB)
- [ ] Test reject corrupted files

#### 1.4.4 Model Compression
- [ ] Test compress models before storage
- [ ] Test verify compressed file is smaller
- [ ] Test verify compressed file is valid glTF

#### 1.4.5 Model Deletion
- [ ] Test delete model by model_id
- [ ] Test remove model from GCP
- [ ] Test remove model metadata from database
- [ ] Test return 404 when deleting non-existent model

#### 1.4.6 Storage Error Handling
- [ ] Test handle GCP storage failures
- [ ] Test handle database failures
- [ ] Test handle network errors
- [ ] Test retry on transient failures
- [ ] Test clean up on failure (no orphaned files)

---

### 1.5 API Endpoint Handler Tests
**File**: `tests/unit/api/model_generation_handlers.test.ts`  
**Coverage Target**: 90%+

#### 1.5.1 POST /api/models/generate Handler
- [ ] Test validate request payload (image_id, dimension_data)
- [ ] Test reject missing image_id
- [ ] Test reject missing dimension_data
- [ ] Test reject invalid dimension_data format
- [ ] Test call Gemini service with correct parameters
- [ ] Test call Blender service with generated script
- [ ] Test queue job and return job_id
- [ ] Test return 202 Accepted with job_id
- [ ] Test require authentication
- [ ] Test return 401 for unauthenticated requests

#### 1.5.2 GET /api/models/status/:jobId Handler
- [ ] Test return job status for valid job_id
- [ ] Test return 404 for non-existent job_id
- [ ] Test return progress percentage
- [ ] Test return model_id when completed
- [ ] Test return error message when failed
- [ ] Test require authentication

#### 1.5.3 GET /api/models/:modelId Handler
- [ ] Test stream model file for valid model_id
- [ ] Test return 404 for non-existent model_id
- [ ] Test set correct Content-Type header
- [ ] Test set cache headers
- [ ] Test require authentication
- [ ] Test verify user owns model

#### 1.5.4 DELETE /api/models/:modelId Handler
- [ ] Test delete model for valid model_id
- [ ] Test return 404 for non-existent model_id
- [ ] Test return 200 on successful deletion
- [ ] Test require authentication
- [ ] Test verify user owns model

---

## 2. BACKEND INTEGRATION TESTS (25% of backend tests)

### 2.1 Gemini API Integration Tests
**File**: `tests/integration/gemini_api.test.ts`  
**Coverage Target**: 70%+

**IMPORTANT**: Use mocked Gemini API responses, not real API calls

- [ ] Test call Gemini API with test credentials (mocked)
- [ ] Test handle API authentication (mocked)
- [ ] Test respect API quotas (mocked)
- [ ] Test handle network errors (mocked)
- [ ] Test validate API response format
- [ ] Test measure API response time (< 5 seconds)

---

### 2.2 Blender Execution Integration Tests
**File**: `tests/integration/blender_execution.test.ts`  
**Coverage Target**: 70%+

**IMPORTANT**: Use mocked Blender execution, not real Blender

- [ ] Test execute Blender script (mocked)
- [ ] Test generate valid glTF file (mocked)
- [ ] Test handle complex geometry (mocked)
- [ ] Test apply materials correctly (mocked)
- [ ] Test export with correct scale (mocked)
- [ ] Test validate output file structure

---

### 2.3 Job Queue Integration Tests
**File**: `tests/integration/job_queue.test.ts`  
**Coverage Target**: 70%+

**IMPORTANT**: Use MongoDB Memory Server for database

- [ ] Test process job end-to-end
- [ ] Test update status in database
- [ ] Test handle concurrent jobs
- [ ] Test recover from crashes
- [ ] Test notify on completion
- [ ] Test track metrics

---

### 2.4 Model Storage Integration Tests
**File**: `tests/integration/model_storage.test.ts`  
**Coverage Target**: 70%+

**IMPORTANT**: Use mocked GCP Storage, not real GCP

- [ ] Test store model in GCP (mocked)
- [ ] Test retrieve model from GCP (mocked)
- [ ] Test delete model from GCP (mocked)
- [ ] Test handle GCP failures (mocked)
- [ ] Test store metadata in database (MongoDB Memory Server)
- [ ] Test retrieve metadata from database

---

### 2.5 API Endpoint Integration Tests
**File**: `tests/integration/model_generation_api.test.ts`  
**Coverage Target**: 70%+

**IMPORTANT**: Use MongoDB Memory Server and mocked external services

#### 2.5.1 POST /api/models/generate
- [ ] Test queue generation job with valid payload
- [ ] Test return 202 with job_id
- [ ] Test reject invalid payload (400)
- [ ] Test reject unauthenticated request (401)
- [ ] Test handle service failures (503)

#### 2.5.2 GET /api/models/status/:jobId
- [ ] Test return job status for valid job_id
- [ ] Test return 404 for non-existent job_id
- [ ] Test return progress updates
- [ ] Test return model_id when completed

#### 2.5.3 GET /api/models/:modelId
- [ ] Test stream model file for valid model_id
- [ ] Test return 404 for non-existent model_id
- [ ] Test set correct headers
- [ ] Test verify user authorization

#### 2.5.4 DELETE /api/models/:modelId
- [ ] Test delete model for valid model_id
- [ ] Test return 404 for non-existent model_id
- [ ] Test verify user authorization

---

## 3. FRONTEND UNIT TESTS (70% of frontend tests)

### 3.1 Model Generation Page Tests
**File**: `tests/unit/pages/model_generation_page.test.tsx`  
**Coverage Target**: 90%+

#### 3.1.1 Page Rendering
- [ ] Test render progress bar
- [ ] Test display current progress percentage
- [ ] Test show progress stages (Generating script, Executing Blender, Exporting model)
- [ ] Test display cancel button
- [ ] Test display error message on failure
- [ ] Test display retry button on failure

#### 3.1.2 Generation Flow
- [ ] Test handle generation start
- [ ] Test poll for job status every 2 seconds
- [ ] Test update progress bar on status change
- [ ] Test navigate to viewer on completion
- [ ] Test stop polling on completion
- [ ] Test stop polling on failure

#### 3.1.3 User Interactions
- [ ] Test handle cancel action
- [ ] Test handle retry action
- [ ] Test disable cancel button when cancelling
- [ ] Test enable retry button on failure

---

### 3.2 Progress Bar Component Tests
**File**: `tests/unit/components/progress_bar.test.tsx`  
**Coverage Target**: 90%+

#### 3.2.1 Rendering
- [ ] Test render with 0% progress
- [ ] Test render with 50% progress
- [ ] Test render with 100% progress
- [ ] Test display percentage text
- [ ] Test show stage labels
- [ ] Test display error state

#### 3.2.2 Animations
- [ ] Test animate progress changes smoothly
- [ ] Test transition between stages
- [ ] Test pulse animation while processing

#### 3.2.3 Accessibility
- [ ] Test ARIA labels present
- [ ] Test role="progressbar" attribute
- [ ] Test aria-valuenow updates
- [ ] Test aria-valuemin and aria-valuemax set
- [ ] Test screen reader announcements

---

### 3.3 Model Generation Logic Tests
**File**: `tests/unit/logic/model_generation_logic.test.ts`  
**Coverage Target**: 90%+

#### 3.3.1 State Management
- [ ] Test initialize generation state
- [ ] Test start generation job
- [ ] Test update progress state
- [ ] Test handle status transitions
- [ ] Test detect completion
- [ ] Test detect failure

#### 3.3.2 Polling Logic
- [ ] Test poll for status updates every 2 seconds
- [ ] Test stop polling on completion
- [ ] Test stop polling on failure
- [ ] Test stop polling on cancel
- [ ] Test cancel polling on unmount

#### 3.3.3 Progress Calculation
- [ ] Test calculate progress percentage from status
- [ ] Test map status to progress stages
- [ ] Test handle unknown status

#### 3.3.4 Error Handling
- [ ] Test handle API errors
- [ ] Test handle network errors
- [ ] Test retry failed jobs
- [ ] Test track generation metrics

---

### 3.4 Model Generation API Client Tests
**File**: `tests/unit/api/model_generation_api.test.ts`  
**Coverage Target**: 90%+

#### 3.4.1 API Calls
- [ ] Test call generate endpoint with correct payload
- [ ] Test call status endpoint with job_id
- [ ] Test call model endpoint with model_id
- [ ] Test include authentication headers
- [ ] Test set correct Content-Type headers

#### 3.4.2 Response Parsing
- [ ] Test parse generate response (job_id)
- [ ] Test parse status response (status, progress, model_id)
- [ ] Test parse error responses

#### 3.4.3 Error Handling
- [ ] Test handle API errors (4xx, 5xx)
- [ ] Test handle network timeouts
- [ ] Test retry on transient failures (503)
- [ ] Test do not retry on permanent failures (400, 401, 404)

---

### 3.5 3D Model Viewer Component Tests
**File**: `tests/unit/components/model_viewer.test.tsx`  
**Coverage Target**: 90%+

#### 3.5.1 Model Loading
- [ ] Test load model from URL
- [ ] Test display loading indicator while loading
- [ ] Test render model after loading
- [ ] Test handle load errors
- [ ] Test display error message on load failure

#### 3.5.2 Viewport Controls
- [ ] Test rotate model with mouse drag
- [ ] Test zoom with mouse wheel
- [ ] Test pan with right mouse button
- [ ] Test reset view button
- [ ] Test constrain rotation to prevent inversion

#### 3.5.3 Rendering
- [ ] Test render model with default lighting
- [ ] Test render model with materials
- [ ] Test scale model to fit viewport
- [ ] Test maintain aspect ratio

#### 3.5.4 Accessibility
- [ ] Test keyboard controls (arrow keys for rotation)
- [ ] Test keyboard zoom (+/- keys)
- [ ] Test focus management
- [ ] Test ARIA labels

---

## 4. FRONTEND INTEGRATION TESTS (25% of frontend tests)

### 4.1 Model Generation Flow Tests
**File**: `tests/integration/model_generation_flow.test.tsx`  
**Coverage Target**: 70%+

- [ ] Test start generation from dimension mark page
- [ ] Test display progress updates
- [ ] Test navigate to viewer on completion
- [ ] Test handle errors gracefully
- [ ] Test update global state correctly
- [ ] Test persist generation data

---

### 4.2 API Integration Tests
**File**: `tests/integration/model_generation_api_integration.test.ts`  
**Coverage Target**: 70%+

- [ ] Test call backend API endpoints (mocked)
- [ ] Test handle authentication
- [ ] Test parse responses correctly
- [ ] Test handle network errors
- [ ] Test retry failed requests

---

## 5. END-TO-END TESTS (5% of all tests)

### 5.1 Complete User Flow
**File**: `tests/e2e/model_generation_e2e.test.tsx`  
**Coverage Target**: Critical paths only

- [ ] Test complete flow: login → upload → dimension mark → generate → view
- [ ] Test display progress during generation
- [ ] Test handle generation failure
- [ ] Test allow retry on failure
- [ ] Test navigate correctly between pages

---

## 6. PERFORMANCE TESTS

### 6.1 Backend Performance
**File**: `tests/performance/backend_performance.test.ts`

- [ ] Test Gemini API call completes in < 5 seconds
- [ ] Test Blender execution completes in < 30 seconds
- [ ] Test model storage completes in < 2 seconds
- [ ] Test job queue processing completes in < 1 second
- [ ] Test API endpoints respond in < 500ms

### 6.2 Frontend Performance
**File**: `tests/performance/frontend_performance.test.ts`

- [ ] Test page load completes in < 1 second
- [ ] Test progress update completes in < 100ms
- [ ] Test API call completes in < 500ms
- [ ] Test navigation completes in < 200ms
- [ ] Test model viewer renders at 60 FPS

---

## 7. SECURITY TESTS

### 7.1 Authentication Tests
**File**: `tests/security/authentication.test.ts`

- [ ] Test require authentication for all protected endpoints
- [ ] Test reject invalid tokens
- [ ] Test reject expired tokens
- [ ] Test verify user owns resources before access

### 7.2 Input Validation Tests
**File**: `tests/security/input_validation.test.ts`

- [ ] Test sanitize user input in prompts
- [ ] Test reject malicious scripts
- [ ] Test prevent path traversal attacks
- [ ] Test prevent SQL injection
- [ ] Test prevent XSS attacks

### 7.3 Rate Limiting Tests
**File**: `tests/security/rate_limiting.test.ts`

- [ ] Test enforce rate limits (10 requests per minute)
- [ ] Test return 429 when rate limit exceeded
- [ ] Test reset rate limit after cooldown

---

## 8. ACCESSIBILITY TESTS

### 8.1 Keyboard Navigation Tests
**File**: `tests/accessibility/keyboard_navigation.test.tsx`

- [ ] Test tab through all interactive elements
- [ ] Test activate buttons with Enter key
- [ ] Test navigate viewer with arrow keys
- [ ] Test zoom with +/- keys

### 8.2 Screen Reader Tests
**File**: `tests/accessibility/screen_reader.test.tsx`

- [ ] Test all elements have ARIA labels
- [ ] Test progress updates announced
- [ ] Test error messages announced
- [ ] Test focus management correct

### 8.3 Color Contrast Tests
**File**: `tests/accessibility/color_contrast.test.tsx`

- [ ] Test all text meets WCAG AA standards (4.5:1)
- [ ] Test interactive elements meet WCAG AA standards
- [ ] Test error messages meet WCAG AA standards

---

## 9. BROWSER COMPATIBILITY TESTS

### 9.1 Cross-Browser Tests
**File**: `tests/compatibility/browser_compatibility.test.ts`

- [ ] Test works in Chrome (latest)
- [ ] Test works in Firefox (latest)
- [ ] Test works in Safari (latest)
- [ ] Test works in Edge (latest)

---

## 10. TEST DATA & FIXTURES

### 10.1 Mock Data
**File**: `tests/fixtures/model_generation_data.ts`

```typescript
export const mockDimensionData = {
  annotations: [
    { type: 'polygon', vertices: [...], color: '#FF0000' },
    { type: 'dimension', startPoint: {...}, endPoint: {...} },
    { type: 'arch', centerPoint: {...}, radius: 50 }
  ],
  imageUrl: 'data:image/jpeg;base64,...',
  imageWidth: 1920,
  imageHeight: 1080
};

export const mockBlenderScript = `
import bpy
# Blender script content
`;

export const mockJobStatus = {
  jobId: 'job_123',
  status: 'processing',
  progress: 45,
  stage: 'Executing Blender script',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:02:30Z'
};

export const mockModelData = {
  modelId: 'model_456',
  modelUrl: 'https://storage.googleapis.com/...',
  format: 'glTF',
  size: 1024000,
  createdAt: '2024-01-15T10:05:00Z'
};
```

### 10.2 Test Images
- `tests/fixtures/test-wall-image.jpg` - Sample wall image
- `tests/fixtures/test-wall-marked.jpg` - Wall with dimension markings
- `tests/fixtures/test-model.gltf` - Sample glTF model

---

## 11. COVERAGE TARGETS

### Backend
- **Unit Tests**: 90% coverage
- **Integration Tests**: 70% coverage
- **Overall**: 85% coverage

### Frontend
- **Unit Tests**: 90% coverage
- **Integration Tests**: 70% coverage
- **Overall**: 85% coverage

---

## 12. TEST EXECUTION

### Local Development
```bash
# Run all tests
npm run test

# Run specific suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### CI/CD Pipeline
```bash
# Pre-commit
npm run test:pre-commit

# Full suite (every 6 hours)
npm run test:full

# Pre-deployment
npm run test:deploy
```

---

## 13. TEST QUALITY CHECKLIST

- [ ] All tests follow AAA pattern (Arrange, Act, Assert)
- [ ] All tests are isolated and independent
- [ ] All tests use MongoDB Memory Server for database
- [ ] All tests use mocked external services (Gemini, GCP, Blender)
- [ ] All tests have descriptive names
- [ ] All tests cover happy path and error cases
- [ ] All tests include edge cases
- [ ] All tests are fast (< 1 second each)
- [ ] All tests are deterministic (no flaky tests)
- [ ] All tests clean up after themselves
- [ ] All tests follow DRY principle with fixtures

---

## 14. ROOT CAUSE ANALYSIS TEMPLATE

When a test fails or bug is reported:

```markdown
## Bug/Test Failure Analysis

**Date**: [Date]
**Test/Bug**: [Name]
**Severity**: [Critical/High/Medium/Low]

### What Happened
[Description of failure/bug]

### Root Cause
[What caused it]

### Why It Happened
[Underlying reason]

### Why Tests Missed It
[Test gap analysis]

### Fix Applied
[What was fixed]

### Test Improvement
[How tests were improved]

### Prevention
[How to prevent in future]
```

---

## 15. SUCCESS CRITERIA

- ✅ 100% of acceptance criteria covered by tests
- ✅ 85%+ code coverage overall
- ✅ All tests passing
- ✅ No flaky tests
- ✅ All tests run in < 15 minutes
- ✅ All tests use in-memory databases
- ✅ All tests are isolated and independent
- ✅ All external services mocked
- ✅ Performance benchmarks met
- ✅ Security tests passing
- ✅ Accessibility tests passing

---

## Test Coverage Summary

| Category | Unit Tests | Integration Tests | E2E Tests | Total |
|----------|-----------|------------------|-----------|-------|
| Backend Services | 85 | 20 | 0 | 105 |
| Backend API | 20 | 15 | 0 | 35 |
| Frontend Components | 45 | 10 | 0 | 55 |
| Frontend Logic | 30 | 8 | 0 | 38 |
| E2E Flows | 0 | 0 | 5 | 5 |
| Performance | 0 | 10 | 0 | 10 |
| Security | 0 | 15 | 0 | 15 |
| Accessibility | 0 | 10 | 0 | 10 |
| **TOTAL** | **180** | **88** | **5** | **273** |

**Distribution**: 66% Unit (180), 32% Integration (88), 2% E2E (5)

**Note**: Distribution is close to target 70/25/5. Adjust by adding 11 more unit tests and reducing 11 integration tests to achieve exact 70/25/5 split.

---

## Notes

- All tests follow testing-quality.md standards
- Unit tests use in-memory state management (no external dependencies)
- Integration tests use MongoDB Memory Server and mocked external services
- E2E tests cover critical user workflows only
- Test cases prioritize critical paths: generation, progress tracking, error handling
- All components covered with happy path, error cases, and edge cases
- Performance tests ensure smooth interactions and fast response times
- Security tests ensure authentication and input validation
- Accessibility tests ensure keyboard and screen reader support
