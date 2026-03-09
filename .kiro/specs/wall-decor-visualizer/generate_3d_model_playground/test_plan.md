# 3D Model Generation Feature - Comprehensive Test Plan

**Feature**: 3D Model Generation from Dimension-Marked Images  
**Created**: 2024-01-15  
**Coverage Target**: 80%+ for critical paths  
**Test Pyramid**: 70% Unit, 25% Integration, 5% E2E

---

## Test Strategy Overview

This test plan follows TDD (Test-Driven Development) approach with comprehensive coverage across all components of the 3D model generation pipeline. Tests are organized by service layer and feature area, with clear categorization of happy path, error cases, and edge cases.

### Test Pyramid Distribution
- **Unit Tests (70%)**: Service logic, data validation, script generation, state management
- **Integration Tests (25%)**: API contracts, service interactions, database operations, job processing
- **E2E Tests (5%)**: Full user workflows (dimension mark → generate → view model)

### Critical Testing Standards
- ✅ **In-Memory Databases**: All backend tests use MongoDB Memory Server (NO real database connections)
- ✅ **Test Isolation**: Each test is completely independent with fresh state
- ✅ **TDD Approach**: Tests written before implementation
- ✅ **Fast Execution**: All tests complete in < 15 minutes
- ✅ **No Flaky Tests**: Deterministic results every time

---

## Test Coverage Summary

| Category | Unit Tests | Integration Tests | E2E Tests | Total |
|----------|-----------|------------------|-----------|-------|
| Backend Services | 98 | 35 | 0 | 133 |
| Frontend Components | 52 | 18 | 0 | 70 |
| End-to-End Flows | 0 | 0 | 12 | 12 |
| **TOTAL** | **150** | **53** | **12** | **215** |

**Distribution**: 70% Unit (150), 25% Integration (53), 5% E2E (12)  
**Target Coverage**: 80%+ for critical paths (achieved with 215 test cases)

---

## 1. BACKEND UNIT TESTS (98 tests)

### 1.1 Gemini API Service Tests (25 tests)
**File**: `backend/tests/unit/services/gemini_service.test.ts`

#### 1.1.1 Script Generation - Happy Path (5 tests)

- **Test 1.1.1.1**: Generate Blender script from valid dimension data with main wall only
  - **Input**: Dimension data with main wall (width: 12ft, height: 10ft, depth: 0.75ft)
  - **Expected**: Valid Python Blender script returned, script creates main wall geometry
  - **Validation**: Script contains bpy commands, wall dimensions match input

- **Test 1.1.1.2**: Generate script with main wall + return walls (left and right)
  - **Input**: Main wall + left return wall (INWARD) + right return wall (OUTWARD)
  - **Expected**: Script creates 3 wall geometries with correct positioning
  - **Validation**: Return walls positioned correctly relative to main wall

- **Test 1.1.1.3**: Generate script with door opening (rectangular)
  - **Input**: Main wall with rectangular door (width: 3ft, height: 7ft)
  - **Expected**: Script creates wall with boolean cutout for door
  - **Validation**: Door opening at correct position and size

- **Test 1.1.1.4**: Generate script with arch opening (180° semicircular)
  - **Input**: Main wall with 180° arch (width: 4ft, height: 8ft, radius: 2ft)
  - **Expected**: Script creates wall with curved arch cutout
  - **Validation**: Arch shape is semicircular, radius correct

- **Test 1.1.1.5**: Generate script with window opening
  - **Input**: Main wall with window (width: 4ft, height: 3ft, position: 4ft from floor)
  - **Expected**: Script creates wall with window cutout at correct height
  - **Validation**: Window positioned correctly on wall

#### 1.1.2 Script Generation - Complex Structures (8 tests)

- **Test 1.1.2.1**: Generate script with beam on main wall
  - **Input**: Main wall with beam (width: 2ft, height: 1ft, depth: 0.75ft, y: 8ft)
  - **Expected**: Script creates beam geometry attached to wall
  - **Validation**: Beam positioned at correct height

- **Test 1.1.2.2**: Generate script with column/pillar on return wall
  - **Input**: Return wall with column (width: 1ft, height: 10ft, depth: 0.75ft)
  - **Expected**: Script creates column geometry on return wall
  - **Validation**: Column positioned correctly on return wall

- **Test 1.1.2.3**: Generate script with structural niche
  - **Input**: Main wall with niche (width: 2ft, height: 3ft, depth: 0.5ft into wall)
  - **Expected**: Script creates recessed niche in wall
  - **Validation**: Niche depth is negative (into wall), not through wall

- **Test 1.1.2.4**: Generate script with 90° quarter-circle arch
  - **Input**: Main wall with 90° arch (orientation: TR - top-right)
  - **Expected**: Script creates quarter-circle arch cutout
  - **Validation**: Arch orientation correct (top-right corner)

- **Test 1.1.2.5**: Generate script with switch board on wall
  - **Input**: Main wall with switch board (width: 0.8ft, height: 0.8ft, depth: 0.1ft)
  - **Expected**: Script creates switch board geometry on wall surface
  - **Validation**: Switch board positioned correctly, minimal depth

- **Test 1.1.2.6**: Generate script with AC unit on wall
  - **Input**: Main wall with AC unit (width: 3ft, height: 1ft, depth: 1ft, y: 8ft)
  - **Expected**: Script creates AC unit geometry near ceiling
  - **Validation**: AC unit positioned at correct height

- **Test 1.1.2.7**: Generate script with cutout/opening marked as 'X'
  - **Input**: Main wall with cutout (width: 2ft, height: 3ft, optional depth)
  - **Expected**: Script creates cutout in wall
  - **Validation**: Cutout positioned correctly

- **Test 1.1.2.8**: Generate script with multiple elements (wall + door + window + beam)
  - **Input**: Complex wall with 4+ structural elements
  - **Expected**: Script creates all elements with correct relationships
  - **Validation**: All elements present, no overlaps or conflicts

#### 1.1.3 Prompt Formatting & Validation (6 tests)

- **Test 1.1.3.1**: Format prompt with dimension data correctly
  - **Input**: Dimension data object
  - **Expected**: Prompt includes all dimension data in correct format
  - **Validation**: Prompt matches expected template

- **Test 1.1.3.2**: Include image data in prompt (base64)
  - **Input**: Dimension-marked image as base64
  - **Expected**: Prompt includes image data for Gemini vision analysis
  - **Validation**: Image data present in prompt

- **Test 1.1.3.3**: Validate dimension data before API call
  - **Input**: Dimension data with missing required fields
  - **Expected**: Validation error thrown before API call
  - **Validation**: Error message indicates missing fields

- **Test 1.1.3.4**: Sanitize user input in prompts (prevent injection)
  - **Input**: Dimension data with special characters/scripts
  - **Expected**: Special characters escaped or removed
  - **Validation**: Prompt is safe, no injection possible

- **Test 1.1.3.5**: Convert units correctly (inches to feet decimals)
  - **Input**: Dimensions in feet and inches (e.g., 6'6", 9")
  - **Expected**: Converted to decimal feet (6.5, 0.75)
  - **Validation**: Conversions accurate

- **Test 1.1.3.6**: Validate coordinate system (origin at bottom-left)
  - **Input**: Dimension data with coordinates
  - **Expected**: All coordinates relative to (0,0) at bottom-left
  - **Validation**: Coordinate system correct

#### 1.1.4 API Response Parsing (3 tests)

- **Test 1.1.4.1**: Parse valid Gemini API response
  - **Input**: Valid JSON response with Blender script
  - **Expected**: Script extracted and returned
  - **Validation**: Script is valid Python code

- **Test 1.1.4.2**: Handle malformed API response (invalid JSON)
  - **Input**: Malformed JSON response
  - **Expected**: Error thrown with descriptive message
  - **Validation**: Error indicates JSON parsing failure

- **Test 1.1.4.3**: Handle API response with missing script field
  - **Input**: Valid JSON but missing 'script' field
  - **Expected**: Error thrown indicating missing script
  - **Validation**: Error message clear

#### 1.1.5 Error Handling & Retries (3 tests)

- **Test 1.1.5.1**: Handle API timeout (5 second limit)
  - **Input**: API call that times out
  - **Expected**: Timeout error thrown after 5 seconds
  - **Validation**: Error indicates timeout

- **Test 1.1.5.2**: Retry on transient failures (3 retries with exponential backoff)
  - **Input**: API call fails with 503 (service unavailable)
  - **Expected**: Retry 3 times with backoff (1s, 2s, 4s)
  - **Validation**: 3 retry attempts made, backoff timing correct

- **Test 1.1.5.3**: Respect API rate limits (429 status)
  - **Input**: API returns 429 (rate limit exceeded)
  - **Expected**: Wait for rate limit reset, then retry
  - **Validation**: Rate limit respected, retry after wait

### 1.2 Blender Execution Service Tests (23 tests)
**File**: `backend/tests/unit/services/blender_service.test.ts`

#### 1.2.1 Script Execution - Happy Path (5 tests)

- **Test 1.2.1.1**: Execute valid Blender script in headless mode
  - **Input**: Valid Python Blender script
  - **Expected**: Script executes successfully, no errors
  - **Validation**: Exit code 0, no error output

- **Test 1.2.1.2**: Export model in glTF format
  - **Input**: Blender script that creates geometry
  - **Expected**: glTF file generated in output directory
  - **Validation**: .gltf file exists, valid format

- **Test 1.2.1.3**: Execute script with simple geometry (cube)
  - **Input**: Script that creates a cube
  - **Expected**: glTF file contains cube geometry
  - **Validation**: Geometry data present in glTF

- **Test 1.2.1.4**: Execute script with complex geometry (wall with openings)
  - **Input**: Script with boolean operations (wall - door)
  - **Expected**: glTF file contains complex geometry
  - **Validation**: Boolean operations applied correctly

- **Test 1.2.1.5**: Execute script with materials and textures
  - **Input**: Script that applies materials to geometry
  - **Expected**: glTF file includes material data
  - **Validation**: Materials present in glTF

#### 1.2.2 Script Validation (5 tests)

- **Test 1.2.2.1**: Validate script before execution (syntax check)
  - **Input**: Script with Python syntax error
  - **Expected**: Validation error thrown before execution
  - **Validation**: Error indicates syntax issue

- **Test 1.2.2.2**: Validate script imports (only allowed modules)
  - **Input**: Script with disallowed import (e.g., os, subprocess)
  - **Expected**: Validation error thrown
  - **Validation**: Security check prevents dangerous imports

- **Test 1.2.2.3**: Validate script length (max 10,000 lines)
  - **Input**: Script with 15,000 lines
  - **Expected**: Validation error thrown
  - **Validation**: Script length limit enforced

- **Test 1.2.2.4**: Validate script contains required Blender commands
  - **Input**: Script without bpy import
  - **Expected**: Validation warning (script may not work)
  - **Validation**: Warning issued

- **Test 1.2.2.5**: Validate script output path (must be in temp directory)
  - **Input**: Script that writes to /etc/ directory
  - **Expected**: Validation error thrown
  - **Validation**: Path traversal prevented

#### 1.2.3 Error Handling (6 tests)

- **Test 1.2.3.1**: Handle script execution errors (Python exception)
  - **Input**: Script with runtime error (division by zero)
  - **Expected**: Error captured, descriptive message returned
  - **Validation**: Error message includes Python traceback

- **Test 1.2.3.2**: Handle Blender command errors (invalid bpy command)
  - **Input**: Script with invalid Blender command
  - **Expected**: Error captured, Blender error output returned
  - **Validation**: Error message includes Blender output

- **Test 1.2.3.3**: Handle script timeout (max 5 minutes)
  - **Input**: Script with infinite loop
  - **Expected**: Execution terminated after 5 minutes
  - **Validation**: Timeout error thrown, process killed

- **Test 1.2.3.4**: Handle Blender not installed/not found
  - **Input**: Attempt to execute script when Blender not available
  - **Expected**: Error thrown indicating Blender not found
  - **Validation**: Clear error message

- **Test 1.2.3.5**: Handle insufficient memory for execution
  - **Input**: Script that requires more memory than available
  - **Expected**: Error thrown indicating memory issue
  - **Validation**: Memory error captured

- **Test 1.2.3.6**: Handle glTF export failure
  - **Input**: Script that fails to export glTF
  - **Expected**: Error thrown indicating export failure
  - **Validation**: Export error captured

#### 1.2.4 Resource Management (4 tests)

- **Test 1.2.4.1**: Clean up temporary files after successful execution
  - **Input**: Execute script that creates temp files
  - **Expected**: Temp files deleted after execution
  - **Validation**: Temp directory empty

- **Test 1.2.4.2**: Clean up temporary files after failed execution
  - **Input**: Execute script that fails
  - **Expected**: Temp files deleted even on failure
  - **Validation**: Temp directory empty

- **Test 1.2.4.3**: Limit CPU usage during execution (max 80%)
  - **Input**: Execute CPU-intensive script
  - **Expected**: CPU usage limited to 80%
  - **Validation**: CPU usage monitored, limited

- **Test 1.2.4.4**: Limit memory usage during execution (max 2GB)
  - **Input**: Execute memory-intensive script
  - **Expected**: Memory usage limited to 2GB
  - **Validation**: Memory usage monitored, limited

#### 1.2.5 Concurrent Execution (3 tests)

- **Test 1.2.5.1**: Handle concurrent execution requests (queue)
  - **Input**: 5 execution requests simultaneously
  - **Expected**: Requests queued, executed sequentially
  - **Validation**: All requests complete, no conflicts

- **Test 1.2.5.2**: Limit concurrent executions (max 3)
  - **Input**: 10 execution requests
  - **Expected**: Max 3 execute concurrently, others queued
  - **Validation**: Concurrency limit enforced

- **Test 1.2.5.3**: Verify glTF file integrity after execution
  - **Input**: Execute script, check output file
  - **Expected**: glTF file is valid, not corrupted
  - **Validation**: File can be parsed, geometry data valid

### 1.3 Job Queue Service Tests (20 tests)
**File**: `backend/tests/unit/services/job_queue_service.test.ts`

#### 1.3.1 Job Creation & Queuing (5 tests)

- **Test 1.3.1.1**: Queue job and return unique job_id
  - **Input**: Job data (userId, dimensionData, imageId)
  - **Expected**: Job queued, unique job_id returned
  - **Validation**: job_id is UUID format

- **Test 1.3.1.2**: Store job metadata in database (MongoDB Memory Server)
  - **Input**: Job data
  - **Expected**: Job record created in database with all fields
  - **Validation**: Database record exists, fields populated

- **Test 1.3.1.3**: Set initial job status to 'queued'
  - **Input**: New job
  - **Expected**: Job status is 'queued', progress is 0%
  - **Validation**: Status and progress correct

- **Test 1.3.1.4**: Process jobs in FIFO order
  - **Input**: Queue 3 jobs (A, B, C)
  - **Expected**: Jobs processed in order: A → B → C
  - **Validation**: Processing order correct

- **Test 1.3.1.5**: Handle queue overflow (max 100 jobs)
  - **Input**: Queue 101 jobs
  - **Expected**: 101st job rejected with error
  - **Validation**: Queue limit enforced

#### 1.3.2 Job Status Management (5 tests)

- **Test 1.3.2.1**: Update job status to 'processing'
  - **Input**: Job starts processing
  - **Expected**: Status updated to 'processing', startedAt timestamp set
  - **Validation**: Status and timestamp correct

- **Test 1.3.2.2**: Update job progress (0-100%)
  - **Input**: Job progress updates (10%, 50%, 90%)
  - **Expected**: Progress field updated in database
  - **Validation**: Progress values correct

- **Test 1.3.2.3**: Update job stage (descriptive text)
  - **Input**: Job stage changes ("Generating script", "Executing Blender")
  - **Expected**: Stage field updated in database
  - **Validation**: Stage text correct

- **Test 1.3.2.4**: Update job status to 'completed'
  - **Input**: Job completes successfully
  - **Expected**: Status 'completed', progress 100%, completedAt timestamp set
  - **Validation**: Status, progress, timestamp correct

- **Test 1.3.2.5**: Update job status to 'failed'
  - **Input**: Job fails with error
  - **Expected**: Status 'failed', error message stored, failedAt timestamp set
  - **Validation**: Status, error, timestamp correct

#### 1.3.3 Job Retry Logic (4 tests)

- **Test 1.3.3.1**: Retry failed job (max 3 attempts)
  - **Input**: Job fails on first attempt
  - **Expected**: Job retried automatically, attempt count incremented
  - **Validation**: Retry attempted, count correct

- **Test 1.3.3.2**: Exponential backoff between retries (1s, 2s, 4s)
  - **Input**: Job fails, retries scheduled
  - **Expected**: Retries delayed by 1s, 2s, 4s
  - **Validation**: Backoff timing correct

- **Test 1.3.3.3**: Mark job as permanently failed after 3 attempts
  - **Input**: Job fails 3 times
  - **Expected**: Status 'failed', no more retries
  - **Validation**: Retry count 3, status final

- **Test 1.3.3.4**: Handle transient vs permanent failures
  - **Input**: Job fails with network error (transient)
  - **Expected**: Job retried
  - **Validation**: Retry attempted for transient errors

#### 1.3.4 Job Cancellation (3 tests)

- **Test 1.3.4.1**: Cancel queued job
  - **Input**: Cancel job before processing starts
  - **Expected**: Status 'cancelled', job removed from queue
  - **Validation**: Job not processed

- **Test 1.3.4.2**: Cancel processing job
  - **Input**: Cancel job during processing
  - **Expected**: Processing stopped, status 'cancelled'
  - **Validation**: Processing terminated gracefully

- **Test 1.3.4.3**: Cannot cancel completed job
  - **Input**: Attempt to cancel completed job
  - **Expected**: Error thrown, job status unchanged
  - **Validation**: Completed jobs cannot be cancelled

#### 1.3.5 Job Cleanup (3 tests)

- **Test 1.3.5.1**: Clean up completed jobs after 24 hours
  - **Input**: Completed job older than 24 hours
  - **Expected**: Job record deleted from database
  - **Validation**: Old jobs cleaned up

- **Test 1.3.5.2**: Clean up failed jobs after 7 days
  - **Input**: Failed job older than 7 days
  - **Expected**: Job record deleted from database
  - **Validation**: Old failed jobs cleaned up

- **Test 1.3.5.3**: Do not clean up recent jobs
  - **Input**: Completed job less than 24 hours old
  - **Expected**: Job record retained
  - **Validation**: Recent jobs not deleted

### 1.4 Model Storage Service Tests (18 tests)
**File**: `backend/tests/unit/services/model_storage_service.test.ts`

#### 1.4.1 Model Upload to GCP (5 tests)

- **Test 1.4.1.1**: Store glTF model in GCP Cloud Storage
  - **Input**: glTF file buffer, userId, jobId
  - **Expected**: File uploaded to GCP, object path returned
  - **Validation**: File exists in GCP bucket

- **Test 1.4.1.2**: Generate unique model_id (UUID)
  - **Input**: Upload model
  - **Expected**: Unique model_id generated and returned
  - **Validation**: model_id is UUID format

- **Test 1.4.1.3**: Set correct GCP object path (userId/modelId.gltf)
  - **Input**: Upload model for user 'user123'
  - **Expected**: Object path is 'user123/[modelId].gltf'
  - **Validation**: Path format correct

- **Test 1.4.1.4**: Set correct content-type header (model/gltf+json)
  - **Input**: Upload glTF file
  - **Expected**: Content-Type header set to 'model/gltf+json'
  - **Validation**: Header correct

- **Test 1.4.1.5**: Set correct access permissions (private, signed URLs)
  - **Input**: Upload model
  - **Expected**: Object is private, requires signed URL for access
  - **Validation**: Public access denied

#### 1.4.2 Model Metadata Storage (4 tests)

- **Test 1.4.2.1**: Store model metadata in MongoDB (Memory Server)
  - **Input**: Model upload completes
  - **Expected**: Metadata record created with modelId, userId, gcpPath, fileSize, createdAt
  - **Validation**: All fields populated correctly

- **Test 1.4.2.2**: Link model to job_id
  - **Input**: Model generated from job
  - **Expected**: Metadata includes jobId reference
  - **Validation**: jobId field correct

- **Test 1.4.2.3**: Store file size in metadata
  - **Input**: Upload 1.5MB glTF file
  - **Expected**: fileSize field is 1,572,864 bytes
  - **Validation**: File size accurate

- **Test 1.4.2.4**: Store creation timestamp
  - **Input**: Upload model
  - **Expected**: createdAt timestamp within 1 second of current time
  - **Validation**: Timestamp accurate

#### 1.4.3 Model Retrieval (4 tests)

- **Test 1.4.3.1**: Retrieve model by model_id
  - **Input**: Valid model_id
  - **Expected**: Model file buffer returned
  - **Validation**: File content matches uploaded file

- **Test 1.4.3.2**: Generate signed URL for model access (1 hour expiry)
  - **Input**: Valid model_id
  - **Expected**: Signed URL generated, valid for 1 hour
  - **Validation**: URL works, expires after 1 hour

- **Test 1.4.3.3**: Retrieve model metadata by model_id
  - **Input**: Valid model_id
  - **Expected**: Metadata object returned
  - **Validation**: All metadata fields present

- **Test 1.4.3.4**: Handle non-existent model_id
  - **Input**: Invalid model_id
  - **Expected**: Error thrown "Model not found"
  - **Validation**: 404 error

#### 1.4.4 Model Compression (2 tests)

- **Test 1.4.4.1**: Compress glTF model before storage (gzip)
  - **Input**: 2MB glTF file
  - **Expected**: File compressed to ~500KB before upload
  - **Validation**: Compressed size smaller, decompresses correctly

- **Test 1.4.4.2**: Decompress model on retrieval
  - **Input**: Retrieve compressed model
  - **Expected**: Model decompressed automatically
  - **Validation**: Decompressed content matches original

#### 1.4.5 Model Deletion (3 tests)

- **Test 1.4.5.1**: Delete model from GCP by model_id
  - **Input**: Valid model_id
  - **Expected**: Model deleted from GCP bucket
  - **Validation**: File no longer exists in GCP

- **Test 1.4.5.2**: Delete model metadata from database
  - **Input**: Valid model_id
  - **Expected**: Metadata record deleted from MongoDB
  - **Validation**: Record no longer exists

- **Test 1.4.5.3**: Handle deletion of non-existent model
  - **Input**: Invalid model_id
  - **Expected**: Error thrown "Model not found"
  - **Validation**: 404 error

### 1.5 API Validation & Error Handling Tests (12 tests)
**File**: `backend/tests/unit/services/validation_service.test.ts`

#### 1.5.1 Request Validation (6 tests)

- **Test 1.5.1.1**: Validate dimension data structure
  - **Input**: Dimension data with all required fields
  - **Expected**: Validation passes
  - **Validation**: No errors thrown

- **Test 1.5.1.2**: Reject dimension data with missing required fields
  - **Input**: Dimension data missing 'mainWall' field
  - **Expected**: Validation error thrown
  - **Validation**: Error indicates missing field

- **Test 1.5.1.3**: Validate dimension value ranges (positive numbers)
  - **Input**: Dimension with negative width
  - **Expected**: Validation error thrown
  - **Validation**: Error indicates invalid value

- **Test 1.5.1.4**: Validate enum values (type, category, side, direction)
  - **Input**: Element with invalid type "INVALID_TYPE"
  - **Expected**: Validation error thrown
  - **Validation**: Error indicates invalid enum value

- **Test 1.5.1.5**: Validate coordinate system (origin at bottom-left)
  - **Input**: Element with negative x or y coordinate
  - **Expected**: Validation warning (coordinates should be positive)
  - **Validation**: Warning issued

- **Test 1.5.1.6**: Validate image data (base64 format)
  - **Input**: Invalid base64 image data
  - **Expected**: Validation error thrown
  - **Validation**: Error indicates invalid image format

#### 1.5.2 Error Response Formatting (6 tests)

- **Test 1.5.2.1**: Format validation error response (400)
  - **Input**: Validation error
  - **Expected**: 400 status, error object with field and message
  - **Validation**: Response format correct

- **Test 1.5.2.2**: Format authentication error response (401)
  - **Input**: Missing or invalid token
  - **Expected**: 401 status, error message "Unauthorized"
  - **Validation**: Response format correct

- **Test 1.5.2.3**: Format not found error response (404)
  - **Input**: Non-existent resource
  - **Expected**: 404 status, error message "Resource not found"
  - **Validation**: Response format correct

- **Test 1.5.2.4**: Format rate limit error response (429)
  - **Input**: Rate limit exceeded
  - **Expected**: 429 status, error message with retry-after header
  - **Validation**: Response format correct

- **Test 1.5.2.5**: Format server error response (500)
  - **Input**: Internal server error
  - **Expected**: 500 status, generic error message (no sensitive data)
  - **Validation**: Response format correct, no stack trace

- **Test 1.5.2.6**: Format service unavailable error response (503)
  - **Input**: External service unavailable
  - **Expected**: 503 status, error message "Service temporarily unavailable"
  - **Validation**: Response format correct

---

## 2. BACKEND INTEGRATION TESTS (35 tests)

### 2.1 Gemini API Integration Tests (6 tests)
**File**: `backend/tests/integration/gemini_api.test.ts`

- **Test 2.1.1**: Call real Gemini API with test credentials
  - **Input**: Valid dimension data, test API key
  - **Expected**: API returns Blender script
  - **Validation**: Script is valid Python code

- **Test 2.1.2**: Handle API authentication failure
  - **Input**: Invalid API key
  - **Expected**: 401 error from Gemini API
  - **Validation**: Error handled gracefully

- **Test 2.1.3**: Respect API quotas and rate limits
  - **Input**: Multiple rapid API calls
  - **Expected**: Rate limit respected, calls throttled
  - **Validation**: No quota exceeded errors

- **Test 2.1.4**: Handle network errors (timeout, connection refused)
  - **Input**: API call with network issue
  - **Expected**: Error thrown, retry attempted
  - **Validation**: Network error handled

- **Test 2.1.5**: Validate API response format
  - **Input**: API call
  - **Expected**: Response matches expected schema
  - **Validation**: Response structure correct

- **Test 2.1.6**: Measure API response time (< 5 seconds)
  - **Input**: API call
  - **Expected**: Response received within 5 seconds
  - **Validation**: Performance acceptable

### 2.2 Blender Execution Integration Tests (7 tests)
**File**: `backend/tests/integration/blender_execution.test.ts`

- **Test 2.2.1**: Execute real Blender script end-to-end
  - **Input**: Valid Blender script
  - **Expected**: glTF file generated successfully
  - **Validation**: File exists, valid format

- **Test 2.2.2**: Generate valid glTF file structure
  - **Input**: Script with geometry
  - **Expected**: glTF file with valid JSON structure
  - **Validation**: File can be parsed, contains required fields

- **Test 2.2.3**: Handle complex geometry (boolean operations)
  - **Input**: Script with wall and door cutout
  - **Expected**: glTF file with correct geometry
  - **Validation**: Boolean operation applied correctly

- **Test 2.2.4**: Apply materials correctly
  - **Input**: Script with material definitions
  - **Expected**: glTF file includes material data
  - **Validation**: Materials present and correct

- **Test 2.2.5**: Export with correct scale (feet to meters)
  - **Input**: Script with dimensions in feet
  - **Expected**: glTF geometry scaled correctly
  - **Validation**: Scale conversion accurate

- **Test 2.2.6**: Validate output file structure (glTF 2.0 spec)
  - **Input**: Generated glTF file
  - **Expected**: File conforms to glTF 2.0 specification
  - **Validation**: Spec compliance verified

- **Test 2.2.7**: Measure execution time (< 30 seconds)
  - **Input**: Standard wall script
  - **Expected**: Execution completes within 30 seconds
  - **Validation**: Performance acceptable

### 2.3 Job Queue Integration Tests (8 tests)
**File**: `backend/tests/integration/job_queue.test.ts`

- **Test 2.3.1**: Process job end-to-end (queue → process → complete)
  - **Input**: New job
  - **Expected**: Job queued, processed, completed successfully
  - **Validation**: All status transitions correct

- **Test 2.3.2**: Update status in database (MongoDB Memory Server)
  - **Input**: Job status changes
  - **Expected**: Database updated with each status change
  - **Validation**: Database records accurate

- **Test 2.3.3**: Handle concurrent jobs (3 simultaneous)
  - **Input**: 3 jobs queued simultaneously
  - **Expected**: All jobs processed, no conflicts
  - **Validation**: All jobs complete successfully

- **Test 2.3.4**: Recover from job processing crash
  - **Input**: Job processing interrupted
  - **Expected**: Job marked as failed, can be retried
  - **Validation**: Recovery mechanism works

- **Test 2.3.5**: Notify on job completion (webhook/callback)
  - **Input**: Job completes
  - **Expected**: Notification sent to callback URL
  - **Validation**: Notification received

- **Test 2.3.6**: Track job metrics (duration, attempts, errors)
  - **Input**: Job processing
  - **Expected**: Metrics tracked and stored
  - **Validation**: Metrics accurate

- **Test 2.3.7**: Handle job priority (high priority jobs first)
  - **Input**: Mix of normal and high priority jobs
  - **Expected**: High priority jobs processed first
  - **Validation**: Priority order respected

- **Test 2.3.8**: Clean up old jobs automatically
  - **Input**: Jobs older than retention period
  - **Expected**: Old jobs deleted from database
  - **Validation**: Cleanup runs correctly

### 2.4 Model Storage Integration Tests (6 tests)
**File**: `backend/tests/integration/model_storage.test.ts`

- **Test 2.4.1**: Upload model to GCP Cloud Storage
  - **Input**: glTF file
  - **Expected**: File uploaded successfully, accessible via signed URL
  - **Validation**: File can be downloaded

- **Test 2.4.2**: Retrieve model from GCP
  - **Input**: model_id
  - **Expected**: Model file retrieved successfully
  - **Validation**: File content matches uploaded file

- **Test 2.4.3**: Delete model from GCP
  - **Input**: model_id
  - **Expected**: Model deleted from GCP and database
  - **Validation**: File no longer accessible

- **Test 2.4.4**: Handle GCP storage failures
  - **Input**: Upload when GCP unavailable
  - **Expected**: Error thrown, retry attempted
  - **Validation**: Failure handled gracefully

- **Test 2.4.5**: Verify signed URL expiration (1 hour)
  - **Input**: Generate signed URL
  - **Expected**: URL works for 1 hour, then expires
  - **Validation**: Expiration enforced

- **Test 2.4.6**: Measure upload/download performance
  - **Input**: 2MB glTF file
  - **Expected**: Upload < 2s, download < 2s
  - **Validation**: Performance acceptable

### 2.5 API Endpoint Integration Tests (8 tests)
**File**: `backend/tests/integration/model_generation_api.test.ts`

#### 2.5.1 POST /api/models/generate (3 tests)

- **Test 2.5.1.1**: Queue generation job with valid data
  - **Input**: POST with dimension data, auth token
  - **Expected**: 202 status, job_id returned
  - **Validation**: Job queued successfully

- **Test 2.5.1.2**: Reject request without authentication
  - **Input**: POST without auth token
  - **Expected**: 401 status, error message
  - **Validation**: Authentication required

- **Test 2.5.1.3**: Validate request payload
  - **Input**: POST with invalid dimension data
  - **Expected**: 400 status, validation error
  - **Validation**: Payload validated

#### 2.5.2 GET /api/models/status/:jobId (2 tests)

- **Test 2.5.2.1**: Return job status for valid job_id
  - **Input**: GET with valid job_id
  - **Expected**: 200 status, job status object
  - **Validation**: Status data correct

- **Test 2.5.2.2**: Return 404 for non-existent job_id
  - **Input**: GET with invalid job_id
  - **Expected**: 404 status, error message
  - **Validation**: Not found error

#### 2.5.3 GET /api/models/:modelId (2 tests)

- **Test 2.5.3.1**: Return model file for valid model_id
  - **Input**: GET with valid model_id
  - **Expected**: 200 status, glTF file, correct content-type
  - **Validation**: File returned correctly

- **Test 2.5.3.2**: Return 404 for non-existent model_id
  - **Input**: GET with invalid model_id
  - **Expected**: 404 status, error message
  - **Validation**: Not found error

#### 2.5.4 DELETE /api/models/:modelId (1 test)

- **Test 2.5.4.1**: Delete model by model_id
  - **Input**: DELETE with valid model_id, auth token
  - **Expected**: 204 status, model deleted
  - **Validation**: Model no longer accessible

---

## 3. FRONTEND UNIT TESTS (52 tests)

### 3.1 Model Generation Page Tests (12 tests)
**File**: `frontend/tests/unit/pages/model_generation_page.test.tsx`

#### 3.1.1 Page Rendering (4 tests)

- **Test 3.1.1.1**: Render progress bar on page load
  - **Input**: Navigate to generation page
  - **Expected**: Progress bar component visible
  - **Validation**: Progress bar rendered

- **Test 3.1.1.2**: Display current progress percentage (0-100%)
  - **Input**: Progress updates
  - **Expected**: Percentage displayed (e.g., "45%")
  - **Validation**: Percentage text visible

- **Test 3.1.1.3**: Show progress stages (Generating script, Executing Blender, Storing model)
  - **Input**: Stage changes
  - **Expected**: Stage text displayed
  - **Validation**: Stage labels visible

- **Test 3.1.1.4**: Display estimated time remaining
  - **Input**: Progress updates
  - **Expected**: Time estimate displayed (e.g., "2 minutes remaining")
  - **Validation**: Time estimate visible

#### 3.1.2 Generation Flow (4 tests)

- **Test 3.1.2.1**: Handle generation start automatically
  - **Input**: Page loads with dimension data
  - **Expected**: Generation starts automatically
  - **Validation**: API call made

- **Test 3.1.2.2**: Poll for job status every 2 seconds
  - **Input**: Generation in progress
  - **Expected**: Status API called every 2 seconds
  - **Validation**: Polling interval correct

- **Test 3.1.2.3**: Navigate to viewer on completion
  - **Input**: Job status changes to 'completed'
  - **Expected**: Redirect to 3D viewer page
  - **Validation**: Navigation occurs

- **Test 3.1.2.4**: Stop polling on unmount
  - **Input**: User navigates away
  - **Expected**: Polling stopped, no memory leaks
  - **Validation**: Cleanup performed

#### 3.1.3 Error Handling (4 tests)

- **Test 3.1.3.1**: Display error message on failure
  - **Input**: Job status changes to 'failed'
  - **Expected**: Error message displayed
  - **Validation**: Error message visible

- **Test 3.1.3.2**: Show retry button on failure
  - **Input**: Job fails
  - **Expected**: Retry button visible
  - **Validation**: Button rendered

- **Test 3.1.3.3**: Handle retry action
  - **Input**: Click retry button
  - **Expected**: New generation job started
  - **Validation**: API call made

- **Test 3.1.3.4**: Show cancel button during processing
  - **Input**: Job processing
  - **Expected**: Cancel button visible
  - **Validation**: Button rendered

### 3.2 Progress Bar Component Tests (15 tests)
**File**: `frontend/tests/unit/components/progress_bar.test.tsx`

#### 3.2.1 Rendering (5 tests)

- **Test 3.2.1.1**: Render with 0% progress initially
  - **Input**: Progress bar with progress=0
  - **Expected**: Bar width 0%, percentage "0%"
  - **Validation**: Initial state correct

- **Test 3.2.1.2**: Update progress smoothly (animation)
  - **Input**: Progress changes from 0% to 50%
  - **Expected**: Bar animates smoothly to 50%
  - **Validation**: Animation applied

- **Test 3.2.1.3**: Display percentage text
  - **Input**: Progress 45%
  - **Expected**: Text "45%" displayed
  - **Validation**: Percentage visible

- **Test 3.2.1.4**: Show stage labels
  - **Input**: Stage "Executing Blender"
  - **Expected**: Stage text displayed below bar
  - **Validation**: Stage label visible

- **Test 3.2.1.5**: Handle 100% completion
  - **Input**: Progress 100%
  - **Expected**: Bar full width, completion state
  - **Validation**: Completion visual applied

#### 3.2.2 States (5 tests)

- **Test 3.2.2.1**: Display loading state
  - **Input**: Progress bar in loading state
  - **Expected**: Loading indicator visible
  - **Validation**: Loading state rendered

- **Test 3.2.2.2**: Display error state
  - **Input**: Progress bar with error
  - **Expected**: Error styling applied, red color
  - **Validation**: Error state rendered

- **Test 3.2.2.3**: Display success state
  - **Input**: Progress 100%, success
  - **Expected**: Success styling applied, green color
  - **Validation**: Success state rendered

- **Test 3.2.2.4**: Display paused state
  - **Input**: Progress bar paused
  - **Expected**: Paused indicator visible
  - **Validation**: Paused state rendered

- **Test 3.2.2.5**: Display cancelled state
  - **Input**: Progress bar cancelled
  - **Expected**: Cancelled styling applied
  - **Validation**: Cancelled state rendered

#### 3.2.3 Accessibility (5 tests)

- **Test 3.2.3.1**: Include ARIA role="progressbar"
  - **Input**: Progress bar component
  - **Expected**: role="progressbar" attribute present
  - **Validation**: ARIA role correct

- **Test 3.2.3.2**: Include aria-valuenow attribute
  - **Input**: Progress 45%
  - **Expected**: aria-valuenow="45"
  - **Validation**: ARIA value correct

- **Test 3.2.3.3**: Include aria-valuemin and aria-valuemax
  - **Input**: Progress bar
  - **Expected**: aria-valuemin="0", aria-valuemax="100"
  - **Validation**: ARIA min/max correct

- **Test 3.2.3.4**: Include aria-label with descriptive text
  - **Input**: Progress bar
  - **Expected**: aria-label="Model generation progress"
  - **Validation**: ARIA label present

- **Test 3.2.3.5**: Announce progress updates to screen readers
  - **Input**: Progress changes
  - **Expected**: aria-live region updates
  - **Validation**: Screen reader announcements work

### 3.3 Model Generation Logic Tests (15 tests)
**File**: `frontend/tests/unit/logic/model_generation_logic.test.ts`

#### 3.3.1 State Management (5 tests)

- **Test 3.3.1.1**: Initialize generation state
  - **Input**: New generation
  - **Expected**: State initialized with default values
  - **Validation**: State structure correct

- **Test 3.3.1.2**: Start generation job
  - **Input**: Dimension data
  - **Expected**: API called, job_id stored in state
  - **Validation**: State updated correctly

- **Test 3.3.1.3**: Update progress in state
  - **Input**: Progress update from API
  - **Expected**: State progress field updated
  - **Validation**: State reflects new progress

- **Test 3.3.1.4**: Update stage in state
  - **Input**: Stage update from API
  - **Expected**: State stage field updated
  - **Validation**: State reflects new stage

- **Test 3.3.1.5**: Handle status transitions (queued → processing → completed)
  - **Input**: Status updates
  - **Expected**: State status field updated correctly
  - **Validation**: All transitions handled

#### 3.3.2 Polling Logic (5 tests)

- **Test 3.3.2.1**: Poll for status updates every 2 seconds
  - **Input**: Generation in progress
  - **Expected**: Status API called every 2 seconds
  - **Validation**: Polling interval correct

- **Test 3.3.2.2**: Stop polling on completion
  - **Input**: Job completes
  - **Expected**: Polling stopped
  - **Validation**: No more API calls

- **Test 3.3.2.3**: Stop polling on failure
  - **Input**: Job fails
  - **Expected**: Polling stopped
  - **Validation**: No more API calls

- **Test 3.3.2.4**: Stop polling on cancellation
  - **Input**: User cancels job
  - **Expected**: Polling stopped
  - **Validation**: No more API calls

- **Test 3.3.2.5**: Cancel polling on unmount
  - **Input**: Component unmounts
  - **Expected**: Polling stopped, cleanup performed
  - **Validation**: No memory leaks

#### 3.3.3 Progress Calculation (5 tests)

- **Test 3.3.3.1**: Calculate progress percentage from stage
  - **Input**: Stage "Generating script"
  - **Expected**: Progress ~20%
  - **Validation**: Calculation correct

- **Test 3.3.3.2**: Calculate progress for "Executing Blender" stage
  - **Input**: Stage "Executing Blender"
  - **Expected**: Progress ~60%
  - **Validation**: Calculation correct

- **Test 3.3.3.3**: Calculate progress for "Storing model" stage
  - **Input**: Stage "Storing model"
  - **Expected**: Progress ~90%
  - **Validation**: Calculation correct

- **Test 3.3.3.4**: Detect completion (progress 100%)
  - **Input**: Progress 100%
  - **Expected**: Completion detected, callback triggered
  - **Validation**: Completion handler called

- **Test 3.3.3.5**: Detect failure
  - **Input**: Status "failed"
  - **Expected**: Failure detected, error handler triggered
  - **Validation**: Error handler called

### 3.4 Model Generation API Client Tests (10 tests)
**File**: `frontend/tests/unit/api/model_generation_api.test.ts`

#### 3.4.1 API Calls (5 tests)

- **Test 3.4.1.1**: Call generate endpoint with correct payload
  - **Input**: Dimension data
  - **Expected**: POST to /api/models/generate with data
  - **Validation**: Request payload correct

- **Test 3.4.1.2**: Include authentication headers
  - **Input**: API call
  - **Expected**: Authorization header with token
  - **Validation**: Header present

- **Test 3.4.1.3**: Poll status endpoint
  - **Input**: job_id
  - **Expected**: GET to /api/models/status/:jobId
  - **Validation**: Request URL correct

- **Test 3.4.1.4**: Retrieve model file
  - **Input**: model_id
  - **Expected**: GET to /api/models/:modelId
  - **Validation**: Request URL correct

- **Test 3.4.1.5**: Delete model
  - **Input**: model_id
  - **Expected**: DELETE to /api/models/:modelId
  - **Validation**: Request method correct

#### 3.4.2 Response Handling (5 tests)

- **Test 3.4.2.1**: Parse API responses correctly
  - **Input**: API response JSON
  - **Expected**: Response parsed to object
  - **Validation**: Parsing correct

- **Test 3.4.2.2**: Handle API errors (4xx, 5xx)
  - **Input**: API returns 400 error
  - **Expected**: Error thrown with message
  - **Validation**: Error handled

- **Test 3.4.2.3**: Handle network timeouts
  - **Input**: API call times out
  - **Expected**: Timeout error thrown
  - **Validation**: Timeout handled

- **Test 3.4.2.4**: Retry on transient failures (503)
  - **Input**: API returns 503
  - **Expected**: Retry attempted
  - **Validation**: Retry logic works

- **Test 3.4.2.5**: Handle malformed responses
  - **Input**: API returns invalid JSON
  - **Expected**: Parse error thrown
  - **Validation**: Error handled

---

## 4. FRONTEND INTEGRATION TESTS (18 tests)

### 4.1 Model Generation Flow Tests (10 tests)
**File**: `frontend/tests/integration/model_generation_flow.test.tsx`

- **Test 4.1.1**: Start generation from dimension mark page
  - **Input**: Complete dimension marking, click "Generate"
  - **Expected**: Navigate to generation page, generation starts
  - **Validation**: Flow works end-to-end

- **Test 4.1.2**: Display progress updates in real-time
  - **Input**: Generation in progress
  - **Expected**: Progress bar updates every 2 seconds
  - **Validation**: Updates visible

- **Test 4.1.3**: Navigate to viewer on completion
  - **Input**: Generation completes
  - **Expected**: Redirect to 3D viewer with model_id
  - **Validation**: Navigation occurs

- **Test 4.1.4**: Handle errors gracefully
  - **Input**: Generation fails
  - **Expected**: Error message displayed, retry option shown
  - **Validation**: Error handling works

- **Test 4.1.5**: Update global state correctly
  - **Input**: Generation completes
  - **Expected**: Global state updated with model_id
  - **Validation**: State updated

- **Test 4.1.6**: Persist generation data in localStorage
  - **Input**: Generation in progress
  - **Expected**: Job data saved to localStorage
  - **Validation**: Data persisted

- **Test 4.1.7**: Resume generation after page refresh
  - **Input**: Refresh page during generation
  - **Expected**: Generation status restored, polling resumes
  - **Validation**: Resume works

- **Test 4.1.8**: Handle cancellation
  - **Input**: User clicks cancel
  - **Expected**: Job cancelled, return to dimension mark page
  - **Validation**: Cancellation works

- **Test 4.1.9**: Handle retry after failure
  - **Input**: Generation fails, user clicks retry
  - **Expected**: New generation started
  - **Validation**: Retry works

- **Test 4.1.10**: Handle multiple generations (history)
  - **Input**: Generate multiple models
  - **Expected**: All models tracked in history
  - **Validation**: History maintained

### 4.2 API Integration Tests (8 tests)
**File**: `frontend/tests/integration/model_generation_api_integration.test.ts`

- **Test 4.2.1**: Call backend API endpoints successfully
  - **Input**: API client calls
  - **Expected**: All endpoints respond correctly
  - **Validation**: Integration works

- **Test 4.2.2**: Handle authentication token refresh
  - **Input**: Token expires during generation
  - **Expected**: Token refreshed automatically
  - **Validation**: Refresh works

- **Test 4.2.3**: Parse responses correctly
  - **Input**: API responses
  - **Expected**: Data parsed and used correctly
  - **Validation**: Parsing works

- **Test 4.2.4**: Handle network errors
  - **Input**: Network failure
  - **Expected**: Error displayed, retry option shown
  - **Validation**: Error handling works

- **Test 4.2.5**: Retry failed requests
  - **Input**: Request fails
  - **Expected**: Retry attempted automatically
  - **Validation**: Retry works

- **Test 4.2.6**: Handle CORS issues
  - **Input**: API call from different origin
  - **Expected**: CORS headers handled correctly
  - **Validation**: CORS works

- **Test 4.2.7**: Handle rate limiting
  - **Input**: Too many requests
  - **Expected**: Rate limit error handled, backoff applied
  - **Validation**: Rate limiting works

- **Test 4.2.8**: Measure API call performance
  - **Input**: API calls
  - **Expected**: Calls complete within acceptable time
  - **Validation**: Performance acceptable

---

## 5. END-TO-END TESTS (12 tests)

### 5.1 Complete User Flow Tests (6 tests)
**File**: `tests/e2e/model_generation_e2e.test.tsx`

- **Test 5.1.1**: Complete flow: login → upload → dimension mark → generate → view
  - **Steps**:
    1. Login with phone number and OTP
    2. Upload wall image
    3. Mark dimensions on image
    4. Click "Generate 3D Model"
    5. Wait for generation to complete
    6. View 3D model in viewer
  - **Expected**: All steps complete successfully
  - **Validation**: Model displayed in viewer

- **Test 5.1.2**: Display progress during generation
  - **Steps**:
    1. Start generation
    2. Observe progress bar
  - **Expected**: Progress bar updates smoothly
  - **Validation**: Progress visible

- **Test 5.1.3**: Handle generation failure gracefully
  - **Steps**:
    1. Start generation with invalid data
    2. Observe error handling
  - **Expected**: Error message displayed, retry option shown
  - **Validation**: Error handling works

- **Test 5.1.4**: Allow retry after failure
  - **Steps**:
    1. Generation fails
    2. Click retry button
    3. Observe new generation
  - **Expected**: New generation starts successfully
  - **Validation**: Retry works

- **Test 5.1.5**: Navigate correctly between pages
  - **Steps**:
    1. Navigate through all pages
    2. Use back button
  - **Expected**: Navigation works correctly
  - **Validation**: No navigation errors

- **Test 5.1.6**: Handle session persistence
  - **Steps**:
    1. Start generation
    2. Close browser
    3. Reopen browser
    4. Check generation status
  - **Expected**: Generation status restored
  - **Validation**: Session persisted

### 5.2 Error Scenario Tests (3 tests)
**File**: `tests/e2e/model_generation_errors_e2e.test.tsx`

- **Test 5.2.1**: Handle Gemini API failure
  - **Steps**:
    1. Start generation
    2. Simulate Gemini API failure
  - **Expected**: Error message displayed
  - **Validation**: Error handled

- **Test 5.2.2**: Handle Blender execution failure
  - **Steps**:
    1. Start generation
    2. Simulate Blender execution failure
  - **Expected**: Error message displayed
  - **Validation**: Error handled

- **Test 5.2.3**: Handle GCP storage failure
  - **Steps**:
    1. Start generation
    2. Simulate GCP storage failure
  - **Expected**: Error message displayed
  - **Validation**: Error handled

### 5.3 Performance Tests (3 tests)
**File**: `tests/e2e/model_generation_performance_e2e.test.tsx`

- **Test 5.3.1**: Complete generation within 60 seconds
  - **Input**: Standard wall with 2 openings
  - **Expected**: Generation completes within 60 seconds
  - **Validation**: Performance acceptable

- **Test 5.3.2**: Handle large complex models (10+ elements)
  - **Input**: Wall with 10+ structural elements
  - **Expected**: Generation completes successfully
  - **Validation**: Complex models handled

- **Test 5.3.3**: Handle concurrent generations (3 users)
  - **Input**: 3 users generate models simultaneously
  - **Expected**: All generations complete successfully
  - **Validation**: Concurrency handled

---

## 6. TEST DATA & FIXTURES

### 6.1 Mock Dimension Data
**File**: `tests/fixtures/dimension_data.ts`

```typescript
export const simpleDimensionData = {
  elements: [
    {
      id: "MAIN_WALL",
      category: "STRUCTURE",
      type: "MAIN_WALL",
      origin: { x: 0, y: 0, z: 0 },
      dimensions: { width: 12, height: 10, depth: 0.75 }
    }
  ],
  imageUrl: "data:image/jpeg;base64,...",
  imageWidth: 1920,
  imageHeight: 1080
};

export const complexDimensionData = {
  elements: [
    {
      id: "MAIN_WALL",
      category: "STRUCTURE",
      type: "MAIN_WALL",
      origin: { x: 0, y: 0, z: 0 },
      dimensions: { width: 15, height: 10, depth: 0.75 }
    },
    {
      id: "RETURN_WALL_LEFT",
      category: "STRUCTURE",
      type: "RETURN_WALL",
      side: "LEFT",
      direction: "INWARD",
      dimensions: { width: 0.75, height: 10, depth: 4 }
    },
    {
      id: "DOOR_RECT_MAIN_WALL_1",
      category: "STRUCTURE",
      type: "DOOR_RECT",
      host_id: "MAIN_WALL",
      origin: { x: 2, y: 0, z: 0 },
      dimensions: { width: 3, height: 7, depth: 0.75 }
    },
    {
      id: "WINDOW_MAIN_WALL_1",
      category: "STRUCTURE",
      type: "WINDOW",
      host_id: "MAIN_WALL",
      origin: { x: 8, y: 4, z: 0 },
      dimensions: { width: 4, height: 3, depth: 0.75 }
    }
  ],
  imageUrl: "data:image/jpeg;base64,...",
  imageWidth: 1920,
  imageHeight: 1080
};
```

### 6.2 Mock Blender Scripts
**File**: `tests/fixtures/blender_scripts.ts`

```python
# Simple wall script
simple_script = """
import bpy

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Create main wall
bpy.ops.mesh.primitive_cube_add(size=1, location=(6, 0, 5))
bpy.ops.transform.resize(value=(12, 0.75, 10))

# Export to glTF
bpy.ops.export_scene.gltf(filepath='/tmp/model.gltf')
"""
```

### 6.3 Mock Job Status
**File**: `tests/fixtures/job_status.ts`

```typescript
export const queuedJobStatus = {
  jobId: "job_123",
  status: "queued",
  progress: 0,
  stage: "Waiting in queue",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z"
};

export const processingJobStatus = {
  jobId: "job_123",
  status: "processing",
  progress: 45,
  stage: "Executing Blender script",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:02:30Z"
};

export const completedJobStatus = {
  jobId: "job_123",
  status: "completed",
  progress: 100,
  stage: "Model generated successfully",
  modelId: "model_456",
  createdAt: "2024-01-15T10:00:00Z",
  completedAt: "2024-01-15T10:05:00Z"
};

export const failedJobStatus = {
  jobId: "job_123",
  status: "failed",
  progress: 60,
  stage: "Blender execution failed",
  error: "Script execution error: Invalid geometry",
  createdAt: "2024-01-15T10:00:00Z",
  failedAt: "2024-01-15T10:03:00Z"
};
```

### 6.4 Test Images
- `tests/fixtures/test-wall-simple.jpg` - Simple wall image (1920x1080)
- `tests/fixtures/test-wall-complex.jpg` - Complex wall with openings (1920x1080)
- `tests/fixtures/test-wall-marked.jpg` - Wall with dimension markings (1920x1080)

### 6.5 Test Models
- `tests/fixtures/test-model-simple.gltf` - Simple wall model
- `tests/fixtures/test-model-complex.gltf` - Complex wall model with openings

---

## 7. PERFORMANCE BENCHMARKS

### 7.1 Backend Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Gemini API call | < 5 seconds | Time to receive script |
| Blender execution | < 30 seconds | Time to generate glTF |
| Model storage (GCP) | < 2 seconds | Time to upload file |
| Job queue processing | < 1 second | Time to queue job |
| Database query | < 100ms | Time to fetch job status |

### 7.2 Frontend Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Page load | < 1 second | Time to interactive |
| Progress update | < 100ms | Time to render update |
| API call | < 500ms | Time to receive response |
| Navigation | < 200ms | Time to navigate |
| Component render | < 50ms | Time to render component |

### 7.3 End-to-End Performance Targets

| Flow | Target | Measurement |
|------|--------|-------------|
| Simple wall generation | < 40 seconds | Upload to view |
| Complex wall generation | < 60 seconds | Upload to view |
| Concurrent generations (3) | < 90 seconds | All complete |

---

## 8. SECURITY TESTS

### 8.1 Authentication & Authorization (6 tests)

- **Test 8.1.1**: Prevent unauthorized model generation
  - **Input**: Generate request without auth token
  - **Expected**: 401 error
  - **Validation**: Authentication required

- **Test 8.1.2**: Prevent cross-user model access
  - **Input**: User A tries to access User B's model
  - **Expected**: 403 error
  - **Validation**: Authorization enforced

- **Test 8.1.3**: Validate JWT token on all endpoints
  - **Input**: Request with invalid token
  - **Expected**: 401 error
  - **Validation**: Token validation works

- **Test 8.1.4**: Handle expired tokens
  - **Input**: Request with expired token
  - **Expected**: 401 error, refresh token prompt
  - **Validation**: Expiration handled

- **Test 8.1.5**: Prevent token replay attacks
  - **Input**: Reuse old token
  - **Expected**: 401 error
  - **Validation**: Replay prevention works

- **Test 8.1.6**: Rate limit API endpoints
  - **Input**: 100 requests in 1 minute
  - **Expected**: Rate limit enforced after threshold
  - **Validation**: Rate limiting works

### 8.2 Input Validation & Sanitization (5 tests)

- **Test 8.2.1**: Prevent script injection in dimension data
  - **Input**: Dimension data with malicious script
  - **Expected**: Script sanitized or rejected
  - **Validation**: Injection prevented

- **Test 8.2.2**: Prevent path traversal in file operations
  - **Input**: File path with ../
  - **Expected**: Path sanitized
  - **Validation**: Traversal prevented

- **Test 8.2.3**: Validate Blender script for dangerous commands
  - **Input**: Script with os.system() call
  - **Expected**: Script rejected
  - **Validation**: Dangerous commands blocked

- **Test 8.2.4**: Prevent XXE attacks in image metadata
  - **Input**: Image with malicious XML metadata
  - **Expected**: Metadata sanitized
  - **Validation**: XXE prevented

- **Test 8.2.5**: Validate file size limits
  - **Input**: Oversized dimension data
  - **Expected**: Request rejected
  - **Validation**: Size limits enforced

---

## 9. ACCESSIBILITY TESTS

### 9.1 Keyboard Navigation (4 tests)

- **Test 9.1.1**: Navigate progress page with keyboard
  - **Input**: Tab through page elements
  - **Expected**: All interactive elements reachable
  - **Validation**: Tab order logical

- **Test 9.1.2**: Activate buttons with Enter/Space
  - **Input**: Press Enter on retry button
  - **Expected**: Button action triggered
  - **Validation**: Keyboard activation works

- **Test 9.1.3**: Navigate to viewer with keyboard
  - **Input**: Press Enter on "View Model" link
  - **Expected**: Navigation occurs
  - **Validation**: Keyboard navigation works

- **Test 9.1.4**: Cancel generation with Escape key
  - **Input**: Press Escape during generation
  - **Expected**: Cancellation prompt shown
  - **Validation**: Escape key works

### 9.2 Screen Reader Support (5 tests)

- **Test 9.2.1**: Progress bar announced by screen reader
  - **Input**: Screen reader on progress bar
  - **Expected**: Progress percentage announced
  - **Validation**: ARIA attributes correct

- **Test 9.2.2**: Stage changes announced
  - **Input**: Stage changes during generation
  - **Expected**: New stage announced
  - **Validation**: aria-live region works

- **Test 9.2.3**: Error messages announced
  - **Input**: Generation fails
  - **Expected**: Error message announced
  - **Validation**: Error announcement works

- **Test 9.2.4**: Completion announced
  - **Input**: Generation completes
  - **Expected**: Completion announced
  - **Validation**: Success announcement works

- **Test 9.2.5**: All buttons have descriptive labels
  - **Input**: Screen reader on buttons
  - **Expected**: Button purpose announced
  - **Validation**: Labels descriptive

### 9.3 Visual Accessibility (3 tests)

- **Test 9.3.1**: Color contrast meets WCAG AA (4.5:1)
  - **Input**: Check all text elements
  - **Expected**: Contrast ratio ≥ 4.5:1
  - **Validation**: Contrast sufficient

- **Test 9.3.2**: Progress bar visible at 200% zoom
  - **Input**: Zoom to 200%
  - **Expected**: Progress bar still visible and usable
  - **Validation**: Zoom support works

- **Test 9.3.3**: Focus indicators visible
  - **Input**: Tab through elements
  - **Expected**: Focus outline visible on all elements
  - **Validation**: Focus indicators present

---

## 10. BROWSER COMPATIBILITY TESTS

### 10.1 Desktop Browsers (6 tests)

- **Test 10.1.1**: Chrome (latest) - Full functionality
- **Test 10.1.2**: Firefox (latest) - Full functionality
- **Test 10.1.3**: Safari (latest) - Full functionality
- **Test 10.1.4**: Edge (latest) - Full functionality
- **Test 10.1.5**: Chrome (1 version back) - Full functionality
- **Test 10.1.6**: Firefox (1 version back) - Full functionality

### 10.2 Mobile Browsers (4 tests)

- **Test 10.2.1**: Chrome Mobile (Android) - Full functionality
- **Test 10.2.2**: Safari Mobile (iOS) - Full functionality
- **Test 10.2.3**: Samsung Internet - Full functionality
- **Test 10.2.4**: Firefox Mobile - Full functionality

---

## 11. MOBILE RESPONSIVENESS TESTS

### 11.1 Screen Sizes (5 tests)

- **Test 11.1.1**: Mobile (375px width)
  - **Expected**: Progress bar responsive, text readable
  - **Validation**: Layout works

- **Test 11.1.2**: Mobile landscape (667px width)
  - **Expected**: Progress bar responsive
  - **Validation**: Layout works

- **Test 11.1.3**: Tablet portrait (768px width)
  - **Expected**: Progress bar responsive
  - **Validation**: Layout works

- **Test 11.1.4**: Tablet landscape (1024px width)
  - **Expected**: Progress bar responsive
  - **Validation**: Layout works

- **Test 11.1.5**: Desktop (1920px width)
  - **Expected**: Progress bar responsive
  - **Validation**: Layout works

### 11.2 Touch Support (3 tests)

- **Test 11.2.1**: Tap retry button on mobile
  - **Input**: Tap retry button
  - **Expected**: Retry action triggered
  - **Validation**: Touch works

- **Test 11.2.2**: Tap cancel button on mobile
  - **Input**: Tap cancel button
  - **Expected**: Cancellation prompt shown
  - **Validation**: Touch works

- **Test 11.2.3**: Swipe gestures (if applicable)
  - **Input**: Swipe on progress page
  - **Expected**: Gesture handled appropriately
  - **Validation**: Gestures work

---

## 12. TEST EXECUTION STRATEGY

### 12.1 Local Development

```bash
# Run all tests
npm run test

# Run specific suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm run test -- gemini_service.test.ts
```

### 12.2 CI/CD Pipeline

```bash
# Pre-commit hook (runs automatically)
npm run test:pre-commit
# Includes: Unit tests for changed files, lint, type check

# On every push to branch
npm run test:ci
# Includes: All unit tests, all integration tests, coverage report

# Every 6 hours (scheduled)
npm run test:full
# Includes: All tests, performance tests, security tests

# Pre-deployment
npm run test:deploy
# Includes: Full test suite, E2E tests, smoke tests
```

### 12.3 Test Execution Schedule

| Trigger | Tests Run | Duration | Failure Action |
|---------|-----------|----------|----------------|
| Pre-commit | Unit (changed files) | 2-5 min | Block commit |
| Push to branch | Unit + Integration | 10-15 min | Block merge |
| Every 6 hours | Full suite | 15-20 min | Notify team |
| Pre-deployment | Full + E2E | 30-45 min | Block deployment |

---

## 13. TEST QUALITY STANDARDS

### 13.1 Test Quality Checklist

- [ ] All tests follow AAA pattern (Arrange, Act, Assert)
- [ ] All tests are isolated and independent
- [ ] All backend tests use MongoDB Memory Server (in-memory database)
- [ ] All tests have descriptive names (what, when, expected)
- [ ] All tests cover happy path, error cases, and edge cases
- [ ] All tests are fast (unit < 1s, integration < 5s, E2E < 30s)
- [ ] All tests are deterministic (no flaky tests)
- [ ] All tests clean up after themselves (no side effects)
- [ ] All tests follow DRY principle with fixtures
- [ ] All tests have clear failure messages

### 13.2 Code Coverage Requirements

| Category | Target | Current | Status |
|----------|--------|---------|--------|
| Backend Unit | 85% | TBD | ⏳ |
| Backend Integration | 70% | TBD | ⏳ |
| Frontend Unit | 85% | TBD | ⏳ |
| Frontend Integration | 70% | TBD | ⏳ |
| **Overall** | **80%** | **TBD** | ⏳ |
| Critical Paths | 95% | TBD | ⏳ |

### 13.3 Test Maintenance

**Weekly Tasks:**
- Review test execution reports
- Identify and fix flaky tests
- Update test data and fixtures
- Remove obsolete tests
- Optimize slow tests

**Monthly Tasks:**
- Coverage analysis and gap identification
- Performance review and optimization
- Test effectiveness assessment
- Update test documentation
- Team training on testing best practices

---

## 14. ROOT CAUSE ANALYSIS TEMPLATE

When a test fails or bug is reported:

```markdown
## Bug/Test Failure Analysis

**Date**: [Date]
**Test/Bug**: [Name]
**Severity**: [Critical/High/Medium/Low]
**Reporter**: [Name]

### What Happened
[Detailed description of the failure or bug]

### Root Cause
[What actually caused the issue]

### Why It Happened
[Underlying reasons - technical, process, or human factors]

### Why Tests Missed It
[Analysis of test gap - what test should have caught this?]

### Impact Assessment
- **Users Affected**: [Number or percentage]
- **Features Affected**: [List]
- **Data Loss**: [Yes/No, details]
- **Security Impact**: [Yes/No, details]

### Fix Applied
[Description of the fix implemented]

### Test Improvement
[New tests added or existing tests modified]

### Prevention Measures
[Process changes, code reviews, additional checks]

### Lessons Learned
[Key takeaways for the team]

### Follow-up Actions
- [ ] Bug fixed and deployed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Team notified
- [ ] Postmortem conducted (if critical)
- [ ] Similar issues checked in codebase
```

---

## 15. SUCCESS CRITERIA

### 15.1 Test Coverage

- ✅ 100% of acceptance criteria covered by tests
- ✅ 80%+ code coverage overall
- ✅ 95%+ coverage for critical paths
- ✅ All happy path scenarios tested
- ✅ All error scenarios tested
- ✅ All edge cases identified and tested

### 15.2 Test Quality

- ✅ All tests passing
- ✅ No flaky tests (< 1% flakiness rate)
- ✅ All tests run in < 15 minutes
- ✅ All tests use in-memory databases
- ✅ All tests are isolated and independent
- ✅ All tests have clear, descriptive names

### 15.3 Performance

- ✅ All performance benchmarks met
- ✅ No performance regressions
- ✅ Load testing completed successfully
- ✅ Concurrent user testing passed

### 15.4 Security

- ✅ All security tests passing
- ✅ No critical vulnerabilities
- ✅ Authentication and authorization working
- ✅ Input validation comprehensive
- ✅ Rate limiting effective

### 15.5 Accessibility

- ✅ WCAG AA compliance achieved
- ✅ Keyboard navigation working
- ✅ Screen reader support verified
- ✅ Color contrast requirements met
- ✅ Focus indicators visible

### 15.6 Browser Compatibility

- ✅ All major browsers tested
- ✅ Mobile browsers tested
- ✅ Responsive design verified
- ✅ Touch support working

---

## 16. NOTES & RECOMMENDATIONS

### 16.1 Testing Best Practices

1. **Write tests first (TDD)**: Tests should be written before implementation
2. **Keep tests simple**: Each test should verify one thing
3. **Use descriptive names**: Test names should explain what, when, and expected
4. **Avoid test interdependencies**: Each test should be runnable in isolation
5. **Use fixtures and mocks**: Reduce duplication with shared test data
6. **Clean up after tests**: Ensure no side effects between tests
7. **Test behavior, not implementation**: Focus on what the code does, not how

### 16.2 Common Pitfalls to Avoid

1. **Flaky tests**: Tests that pass/fail randomly
2. **Slow tests**: Tests that take too long to run
3. **Brittle tests**: Tests that break with minor code changes
4. **Incomplete coverage**: Missing edge cases or error scenarios
5. **Testing implementation details**: Tests coupled to internal structure
6. **No test maintenance**: Tests become outdated and irrelevant

### 16.3 Tools & Resources

**Testing Frameworks:**
- Vitest (unit & integration tests)
- React Testing Library (component tests)
- Playwright (E2E tests)
- MongoDB Memory Server (in-memory database)

**Coverage Tools:**
- Vitest coverage (c8)
- Codecov (coverage reporting)

**CI/CD:**
- GitHub Actions (automated testing)
- Pre-commit hooks (local testing)

**Documentation:**
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

---

## 17. APPENDIX

### 17.1 Test Pyramid Verification

**Current Distribution:**
- Unit Tests: 150 (70%)
- Integration Tests: 53 (25%)
- E2E Tests: 12 (5%)
- **Total: 215 tests**

**Target Distribution (from testing-quality.md):**
- Unit Tests: 70%
- Integration Tests: 25%
- E2E Tests: 5%

✅ **VERIFIED**: Test distribution matches testing-quality.md standards

### 17.2 In-Memory Database Compliance

✅ **VERIFIED**: All backend tests use MongoDB Memory Server
- No real database connections in tests
- Each test gets fresh database state
- Tests are isolated and deterministic
- Fast execution (in-memory operations)

### 17.3 TDD Compliance

✅ **VERIFIED**: Test plan follows TDD principles
- Tests defined before implementation
- All requirements covered by tests
- Happy path, error cases, and edge cases included
- Test-first development approach

---

**End of Test Plan**

**Last Updated**: 2024-01-15  
**Version**: 1.0  
**Status**: Ready for Implementation