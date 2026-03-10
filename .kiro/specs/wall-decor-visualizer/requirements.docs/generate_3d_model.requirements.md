# 3D Model Generation Feature - Requirements Document

## Feature Overview
Generate 3D models from dimension-marked wall images using Gemini API to create Blender scripts, execute them on the backend, and display the resulting 3D models in an interactive viewer.

---

## User Stories and Acceptance Criteria

### User Story 1: Blender Script Generation via Gemini API

**As a user**, I want the system to automatically generate a Blender script from my dimension-marked wall image using AI, so that I can create a 3D model without manual scripting.

#### Acceptance Criteria

1. **WHEN** the user clicks "Save" or "Skip" button on the dimension marking page, **THEN** the system **SHALL** navigate to the 3D model generation page
2. **WHEN** the 3D model generation page loads, **THEN** the system **SHALL** display a progress bar showing "Generating 3D model..."
3. **WHEN** the page loads, **THEN** the system **SHALL** send the dimension-marked image data to the Gemini API
4. **WHEN** sending to Gemini API, **THEN** the system **SHALL** use the prompt from `.kiro/specs/wall-decor-visualizer/prompts/model_generator_3d.prompt`
5. **WHEN** sending to Gemini API, **THEN** the system **SHALL** use Gemini Flash 3.0 model
6. **WHEN** Gemini API responds, **THEN** the system **SHALL** extract the Blender script from the response
7. **WHEN** the Blender script is received, **THEN** the system **SHALL** validate that it contains valid Python code
8. **IF** Gemini API fails or returns invalid script, **THEN** the system **SHALL** display an error message with retry option
9. **WHEN** a valid Blender script is generated, **THEN** the system **SHALL** send it to the backend for execution

#### Navigation Flow
- **From**: Dimension marking page (after clicking Save/Skip)
- **To**: 3D model generation page (progress bar)
- **After**: Redirect to 3D model viewer page (after Blender execution completes)

#### Global Header
The global header **SHALL** display navigation buttons:
- Upload (navigate to upload page)
- Dimension (navigate to dimension marking page)
- Model (navigate to 3D model viewer page)
- Logout (logout and return to login page)

---

### User Story 2: Progress Tracking During Generation

**As a user**, I want to see real-time progress while my 3D model is being generated, so that I know the system is working and how long it might take.

#### Acceptance Criteria

1. **WHEN** the generation process starts, **THEN** the system **SHALL** display a full-page progress bar
2. **WHEN** calling Gemini API, **THEN** the progress bar **SHALL** show "Generating Blender script..." (0-50%)
3. **WHEN** Gemini API responds, **THEN** the progress bar **SHALL** update to "Executing Blender script..." (50-100%)
4. **WHEN** the progress updates, **THEN** the system **SHALL** animate the progress bar smoothly
5. **WHEN** the process completes, **THEN** the system **SHALL** automatically redirect to the 3D model viewer
6. **IF** any step fails, **THEN** the system **SHALL** display the error message on the progress page with a retry button

---

### User Story 3: Backend Blender Script Execution

**As a user**, I want the generated Blender script to be executed on the backend server, so that I don't need to install Blender locally.

#### Acceptance Criteria

1. **WHEN** a valid Blender script is received, **THEN** the backend **SHALL** queue the execution request in the job queue
2. **WHEN** the job is queued, **THEN** the backend **SHALL** return a `job_id` to the client for status tracking
3. **WHEN** the job is processed, **THEN** the backend **SHALL** execute the Blender script in headless mode
4. **WHEN** the script executes successfully, **THEN** the backend **SHALL** export the resulting model in glTF format
5. **WHEN** the model is exported, **THEN** the backend **SHALL** store the model file and update the job status to "completed"
6. **IF** the script execution fails, **THEN** the backend **SHALL** capture the error message and update the job status to "failed"
7. **WHEN** a job fails, **THEN** the backend **SHALL** record the error with timestamp, job_id, and error details
8. **WHEN** the client polls for job status, **THEN** the backend **SHALL** return the current status and `model_id` if completed
9. **WHILE** Blender is executing, **THEN** the frontend **SHALL** poll the backend every 2 seconds for status updates

---

### User Story 4: 3D Model Viewer Display

**As a user**, I want to view the generated 3D model in an interactive viewer, so that I can see the wall from different angles.

#### Acceptance Criteria

1. **WHEN** a `model_id` is available, **THEN** the 3D viewer **SHALL** request the model from the backend via `/api/models/{model_id}` endpoint
2. **WHEN** the backend receives a model request, **THEN** the backend **SHALL** retrieve the model file and stream it to the client
3. **WHEN** the model is received, **THEN** the 3D viewer **SHALL** load and render the model in the viewport
4. **WHEN** the model is loaded, **THEN** the 3D viewer **SHALL** display the model with default lighting and materials
5. **WHEN** the model is displayed, **THEN** the 3D viewer **SHALL** render the model at a scale that fits within the viewport
6. **WHILE** the model is loading, **THEN** the 3D viewer **SHALL** display a loading indicator
7. **IF** the model fails to load, **THEN** the 3D viewer **SHALL** display an error message with a retry option

---

### User Story 5: Viewport Rotation Control

**As a user**, I want to rotate the 3D model in the viewport, so that I can view it from different angles.

#### Acceptance Criteria

1. **WHEN** the user clicks and drags on the model with the left mouse button, **THEN** the viewport **SHALL** rotate the model based on mouse movement
2. **WHEN** the user rotates the model, **THEN** the viewport **SHALL** update the view in real-time with smooth animation
3. **WHEN** the user releases the mouse button, **THEN** the viewport **SHALL** stop rotation and maintain the current view
4. **WHEN** the user performs a rotation, **THEN** the viewport **SHALL** constrain rotation to prevent the model from becoming inverted

---

### User Story 6: Viewport Zoom Control

**As a user**, I want to zoom in and out on the 3D model, so that I can examine details or see the entire model.

#### Acceptance Criteria

1. **WHEN** the user scrolls the mouse wheel, **THEN** the viewport **SHALL** zoom in or out based on scroll direction
2. **WHEN** the user zooms, **THEN** the viewport **SHALL** update the camera distance from the model in real-time
3. **WHEN** the user zooms, **THEN** the viewport **SHALL** maintain the zoom level within reasonable bounds (min/max distance)
4. **WHEN** the user zooms to the maximum level, **THEN** the viewport **SHALL** prevent further zooming in
5. **WHEN** the user zooms to the minimum level, **THEN** the viewport **SHALL** prevent further zooming out

---

### User Story 7: Viewport Pan Control

**As a user**, I want to pan the view across the 3D model, so that I can focus on specific areas.

#### Acceptance Criteria

1. **WHEN** the user clicks and drags with the middle mouse button or right mouse button, **THEN** the viewport **SHALL** pan the view
2. **WHEN** the user pans, **THEN** the viewport **SHALL** move the camera position based on mouse movement
3. **WHEN** the user releases the mouse button, **THEN** the viewport **SHALL** stop panning and maintain the current view

---

## Technical Requirements

### API Integration
- **Gemini API**: Use Gemini Flash 3.0 model for Blender script generation
- **Prompt**: Load from `.kiro/specs/wall-decor-visualizer/prompts/model_generator_3d.prompt`
- **Input**: Dimension-marked image data from sessionStorage
- **Output**: Valid Python Blender script

### Backend Processing
- **Job Queue**: Implement job queue for Blender script execution
- **Headless Blender**: Execute scripts in headless mode on backend server
- **Model Format**: Export models in glTF format
- **Storage**: Store generated models with unique `model_id`
- **Status Tracking**: Provide job status API for polling

### Frontend Components
- **Progress Page**: Full-page progress bar with status messages
- **3D Viewer**: Interactive 3D model viewer with Three.js or similar
- **Global Header**: Navigation buttons (Upload, Dimension, Model, Logout)
- **Error Handling**: Display errors with retry options

### Data Flow
1. User clicks Save/Skip → Navigate to progress page
2. Progress page → Call Gemini API with image data
3. Gemini API → Return Blender script
4. Frontend → Send script to backend
5. Backend → Queue job and return job_id
6. Frontend → Poll for job status
7. Backend → Execute Blender script in headless mode
8. Backend → Export glTF model and update status
9. Frontend → Redirect to 3D viewer with model_id
10. 3D Viewer → Load and display model

---

## Non-Functional Requirements

### Performance
- Gemini API response time: < 30 seconds
- Blender script execution: < 60 seconds
- Model loading time: < 5 seconds
- Progress bar updates: Every 2 seconds

### Reliability
- Retry mechanism for failed API calls (max 3 retries)
- Error logging for all failures
- Graceful degradation if Blender execution fails

### Usability
- Clear progress indicators at each step
- Informative error messages
- Smooth animations and transitions
- Responsive 3D viewer controls

### Security
- Validate Blender scripts before execution
- Sanitize user input before sending to Gemini API
- Authenticate all backend API calls
- Prevent malicious script execution

---

## Out of Scope

The following are explicitly out of scope for this feature:
- Editing the generated Blender script manually
- Downloading the Blender script
- Exporting the 3D model in formats other than glTF
- Applying custom materials or textures to the model
- Saving multiple versions of the same model
- Sharing models with other users
