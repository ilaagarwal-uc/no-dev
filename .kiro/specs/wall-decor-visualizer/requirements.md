# Wall Decor Visualizer - Requirements Document

## Introduction

The Wall Decor Visualizer is a feature that enables users to transform 2D images of walls into interactive 3D models. Users can mark dimensions on an image, which are then used to generate a Blender script via an LLM. The resulting 3D model is displayed in an interactive viewer where users can manipulate the view, explore a catalog of decorative models, and apply them to the base wall model through drag-and-drop interactions.

## Glossary

- **Wall_Image**: A 2D photograph or image of a wall surface provided by the user
- **Dimension_Marker**: A visual annotation placed on the Wall_Image to indicate measurements (width, height, depth)
- **Dimension_Data**: Extracted numerical values and positions from Dimension_Markers
- **LLM_Prompt**: A structured text prompt sent to Google's Gemini API to generate code
- **Gemini_API**: Google's generative AI API used for generating Blender scripts from prompts
- **Blender_Script**: Python code compatible with Blender that defines 3D geometry and materials
- **Base_Model**: The 3D wall model generated from the Blender_Script
- **3D_Viewer**: An interactive component that renders and displays 3D models
- **Model_Catalog**: A collection of pre-made 3D decorative models available for application
- **Drag_Drop_Operation**: A user interaction where a model is selected and moved onto the Base_Model
- **Applied_Model**: A decorative model that has been positioned and attached to the Base_Model
- **Viewport_Control**: User interactions for manipulating the 3D view (rotation, zoom, pan)
- **Material_Quantity_Calculator**: A component that calculates the exact quantity of items needed based on marked dimensions and item specifications
- **Item_Specification**: Configuration data defining the dimensions and properties of a decorative item (width, height, depth)
- **Marked_Section**: A region on the wall image that has been designated for a specific item type
- **Quantity_Result**: The calculated number of items needed to fill a marked section
- **Bill_of_Materials**: A comprehensive report listing all items, their quantities, and specifications for a visualization
- **Quantity_Display**: UI component that shows calculated quantities for marked sections
- **Item_Type**: Category of decorative items (panels, bidding, lights, cove, other)
- **Backend_Server**: The server infrastructure hosting image storage, Gemini API integration, and headless Blender execution
- **Image_Storage_Service**: Backend service responsible for storing and retrieving uploaded wall images using GCP Cloud Storage
- **GCP_Cloud_Storage**: Google Cloud Platform's Cloud Storage service for storing and managing image files
- **GCP_Bucket**: A GCP Cloud Storage bucket configured for storing wall images with appropriate access controls
- **Headless_Blender**: Blender running in headless mode on the backend server without GUI
- **API_Endpoint**: HTTP endpoint on the backend server that handles requests for image upload, Gemini calls, and Blender execution
- **Job_Queue**: Asynchronous queue for managing long-running backend operations
- **Job_Status**: Current state of an asynchronous operation (pending, processing, completed, failed)
- **Backend_Error_Log**: Centralized logging system for backend errors and operations
- **User_Authentication**: System for verifying user identity and managing login sessions
- **Session_Token**: Secure token issued after successful login, used to maintain authenticated state
- **Session_Persistence**: Mechanism for storing and retrieving session tokens across browser sessions
- **Login_Credentials**: User-provided email/password or OAuth credentials for authentication
- **Authenticated_User**: A user who has successfully logged in and has a valid session token

## Requirements

### Requirement 0: User Authentication and Login

**User Story:** As a user, I want to log in to the web application with my credentials, so that I can access the wall visualization tool securely.

#### Acceptance Criteria

1. WHEN a user navigates to the web URL, THE Authentication_System SHALL check if a valid session token exists in local storage or cookies
2. IF a valid session token exists, THE Authentication_System SHALL automatically log the user in and redirect to the main application
3. IF no valid session token exists, THE Authentication_System SHALL display a login page with email and password fields
4. WHEN the user enters their credentials and clicks "Login", THE Authentication_System SHALL send the credentials to the Backend_Server via the /api/auth/login API_Endpoint
5. WHEN the Backend_Server receives login credentials, THE User_Authentication_Handler SHALL validate the credentials against the user database
6. IF the credentials are invalid, THEN THE Authentication_System SHALL display an error message and allow the user to retry
7. WHEN the credentials are valid, THE User_Authentication_Handler SHALL generate a Session_Token with an expiration time
8. WHEN a Session_Token is generated, THE Backend_Server SHALL return the token to the client
9. WHEN the Session_Token is received, THE Authentication_System SHALL store it in local storage and/or secure HTTP-only cookies
10. WHEN the Session_Token is stored, THE Authentication_System SHALL redirect the user to the main application dashboard

---

### Requirement 0.5: Session Persistence and Token Management

**User Story:** As a user, I want my login session to persist across browser sessions, so that I don't have to log in every time I visit the application.

#### Acceptance Criteria

1. WHEN a user logs in, THE Session_Persistence_Manager SHALL store the Session_Token in secure HTTP-only cookies with a long expiration time (e.g., 30 days)
2. WHEN a user closes and reopens the browser, THE Session_Persistence_Manager SHALL check for a valid Session_Token in cookies
3. IF a valid Session_Token exists, THE Session_Persistence_Manager SHALL automatically authenticate the user without requiring login
4. WHEN a Session_Token is about to expire, THE Session_Persistence_Manager SHALL attempt to refresh the token automatically
5. WHEN a Session_Token is refreshed, THE Backend_Server SHALL issue a new token with an updated expiration time
6. IF a Session_Token refresh fails, THEN THE Session_Persistence_Manager SHALL redirect the user to the login page
7. WHEN a user clicks "Logout", THE Session_Persistence_Manager SHALL delete the Session_Token from storage and cookies
8. WHEN the Session_Token is deleted, THE Authentication_System SHALL redirect the user to the login page
9. WHEN a Session_Token expires, THE Authentication_System SHALL automatically log the user out and redirect to the login page
10. WHEN the user is logged out, THE Authentication_System SHALL display a message indicating the session has expired

---

### Requirement 1: Image Upload and Backend Storage

**User Story:** As a user, I want to upload an image of a wall to the backend server, so that it can be stored securely and used for generating a 3D model.

#### Acceptance Criteria

1. WHEN the user clicks on the image upload area, THE Image_Uploader SHALL display two options: "Capture from Camera" and "Upload from Camera Roll"
2. WHEN the user selects "Upload from Camera Roll", THE Image_Uploader SHALL open a file browser dialog
3. WHEN the user selects an image file from the file browser, THE Image_Uploader SHALL accept image formats (JPEG, PNG, WebP)
4. WHEN the user selects "Capture from Camera", THE Image_Uploader SHALL request camera permissions and open the device camera view
5. WHEN the camera view is open, THE Camera_Capture_Handler SHALL display a live camera feed with capture button
6. WHEN the user clicks the capture button, THE Camera_Capture_Handler SHALL capture the image from the camera feed
7. WHEN an image is captured or selected, THE Image_Uploader SHALL send the image to the Backend_Server via the /api/images/upload API_Endpoint
8. WHEN the Backend_Server receives an image, THE Image_Storage_Service SHALL validate the file format and size
9. IF the file format is unsupported or size exceeds limits, THEN THE Image_Storage_Service SHALL return an error response with a descriptive message
10. WHEN an image is validated, THE Image_Storage_Service SHALL upload the image to the GCP_Bucket in GCP Cloud Storage
11. WHEN the image is uploaded to GCP, THE Image_Storage_Service SHALL generate a unique image_id and store the GCP object reference
12. WHEN an image_id is received, THE Image_Display SHALL retrieve the image from GCP_Bucket using the image_id
13. WHEN an image is retrieved from GCP, THE Image_Display SHALL render the image at full resolution within the editor viewport
14. WHEN an image is displayed, THE Image_Display SHALL maintain the original aspect ratio
15. IF the image retrieval from GCP fails, THEN THE Image_Display SHALL display an error message with a retry option

---

### Requirement 1.5: Camera Capture Functionality

**User Story:** As a user, I want to capture images directly from my device camera, so that I can quickly photograph a wall without needing to upload from my camera roll.

#### Acceptance Criteria

1. WHEN the user selects "Capture from Camera", THE Camera_Capture_Handler SHALL request camera permissions from the device
2. IF camera permissions are denied, THEN THE Camera_Capture_Handler SHALL display an error message explaining why camera access is needed
3. WHEN permissions are granted, THE Camera_Capture_Handler SHALL open a full-screen camera view with a live feed
4. WHEN the camera view is open, THE Camera_Capture_Handler SHALL display a prominent capture button in the center or bottom of the screen
5. WHEN the camera view is open, THE Camera_Capture_Handler SHALL display a cancel button to close the camera without capturing
6. WHEN the user clicks the capture button, THE Camera_Capture_Handler SHALL capture a high-resolution image from the camera feed
7. WHEN an image is captured, THE Camera_Capture_Handler SHALL display a preview of the captured image with options to "Confirm" or "Retake"
8. WHEN the user clicks "Confirm", THE Camera_Capture_Handler SHALL proceed with uploading the image to the backend
9. WHEN the user clicks "Retake", THE Camera_Capture_Handler SHALL return to the camera view for another capture attempt
10. WHEN the user clicks "Cancel" at any point, THE Camera_Capture_Handler SHALL close the camera view and return to the upload options

---

**User Story:** As a user, I want to mark dimensions on the wall image, so that the system can understand the scale and proportions of the wall.

#### Acceptance Criteria

1. WHEN the user activates the dimension marking tool, THE Dimension_Marker SHALL display a crosshair cursor
2. WHEN the user clicks two points on the image, THE Dimension_Marker SHALL draw a line between them with a label showing pixel distance
3. WHEN a dimension is marked, THE Dimension_Marker SHALL allow the user to input the real-world measurement (in cm or inches) for that dimension
4. WHEN a dimension is created, THE Dimension_Marker SHALL store the pixel distance and real-world measurement as Dimension_Data
5. WHEN the user hovers over a marked dimension, THE Dimension_Marker SHALL highlight it and display its stored measurement
6. WHEN the user clicks on a marked dimension, THE Dimension_Marker SHALL allow editing or deletion of that dimension
7. WHILE dimensions are being marked, THE Image_Display SHALL remain visible and interactive

---

### Requirement 3: Dimension Validation

**User Story:** As a user, I want the system to validate my dimension markings, so that I can ensure the measurements are reasonable before generating the 3D model.

#### Acceptance Criteria

1. WHEN dimensions are marked, THE Dimension_Validator SHALL verify that at least one dimension is marked before allowing model generation
2. IF a dimension measurement is zero or negative, THEN THE Dimension_Validator SHALL display an error and prevent model generation
3. WHEN dimensions are marked, THE Dimension_Validator SHALL check that marked dimensions are consistent (e.g., width and height are proportional to the image)
4. IF dimensions appear inconsistent, THEN THE Dimension_Validator SHALL display a warning but allow the user to proceed

---

### Requirement 4: Blender Script Generation via Gemini API

**User Story:** As a user, I want the system to generate a Blender script based on my marked dimensions using Google's Gemini API, so that a 3D model can be created automatically.

#### Acceptance Criteria

1. WHEN the user initiates model generation, THE LLM_Generator SHALL construct a prompt containing the Wall_Image, Dimension_Data, and generation parameters
2. WHEN the LLM_Generator sends a request, THE LLM_Generator SHALL call the /api/gemini/generate API_Endpoint on the Backend_Server
3. WHEN the Backend_Server receives a generation request, THE Gemini_API_Handler SHALL authenticate with Google's Gemini API using stored API credentials
4. WHEN authenticated, THE Gemini_API_Handler SHALL send the prompt to the Gemini_API with the Wall_Image encoded as base64
5. WHEN the Gemini_API returns a response, THE Blender_Script_Parser SHALL extract the Python code from the response
6. IF the Gemini_API response does not contain valid Python code, THEN THE Blender_Script_Parser SHALL display an error and request regeneration
7. WHEN a Blender_Script is generated, THE Backend_Server SHALL store the script with a unique script_id and return it to the client
8. WHILE the Gemini_API is processing, THE UI SHALL display a loading indicator
9. IF the Gemini_API call fails or times out, THEN THE Error_Handler SHALL display an error message and provide a retry option

---

### Requirement 5: Headless Blender Execution on Backend Server

**User Story:** As a user, I want the generated Blender script to be executed on the backend server in headless mode to create a 3D model, so that I can visualize the wall in 3D without requiring local Blender installation.

#### Acceptance Criteria

1. WHEN a valid Blender_Script is available, THE Backend_Server SHALL queue the execution request in the Job_Queue
2. WHEN the job is queued, THE Backend_Server SHALL return a job_id to the client for status tracking
3. WHEN the job is processed, THE Headless_Blender_Executor SHALL execute the Blender_Script in headless mode on the Backend_Server
4. WHEN the Blender_Script executes successfully, THE Headless_Blender_Executor SHALL export the resulting model in glTF format
5. WHEN the model is exported, THE Backend_Server SHALL store the exported model file and update the Job_Status to completed
6. IF the Blender_Script execution fails, THEN THE Headless_Blender_Executor SHALL capture the error message and update the Job_Status to failed
7. WHEN a job fails, THE Backend_Error_Log SHALL record the error with timestamp, job_id, and error details
8. WHEN the client polls for job status, THE Backend_Server SHALL return the current Job_Status and model_id if completed
9. WHILE Blender is executing, THE UI SHALL display a loading indicator with the ability to check job status

---

### Requirement 6: 3D Model Viewer Display with Backend Model Loading

**User Story:** As a user, I want to view the generated 3D model in an interactive viewer, so that I can see the wall from different angles.

#### Acceptance Criteria

1. WHEN a model_id is available, THE 3D_Viewer SHALL request the model from the Backend_Server via the /api/models/{model_id} API_Endpoint
2. WHEN the Backend_Server receives a model request, THE Backend_Server SHALL retrieve the model file and stream it to the client
3. WHEN the model is received, THE 3D_Viewer SHALL load and render the model in the viewport
4. WHEN the model is loaded, THE 3D_Viewer SHALL display the model with default lighting and materials
5. WHEN the model is displayed, THE 3D_Viewer SHALL render the model at a scale that fits within the viewport
6. WHILE the model is loading, THE 3D_Viewer SHALL display a loading indicator
7. IF the model fails to load, THEN THE 3D_Viewer SHALL display an error message with a retry option

---

### Requirement 7: Viewport Rotation Control

**User Story:** As a user, I want to rotate the 3D model in the viewport, so that I can view it from different angles.

#### Acceptance Criteria

1. WHEN the user clicks and drags on the model with the left mouse button, THE Viewport_Controller SHALL rotate the model based on mouse movement
2. WHEN the user rotates the model, THE Viewport_Controller SHALL update the view in real-time with smooth animation
3. WHEN the user releases the mouse button, THE Viewport_Controller SHALL stop rotation and maintain the current view
4. WHEN the user performs a rotation, THE Viewport_Controller SHALL constrain rotation to prevent the model from becoming inverted

---

### Requirement 8: Viewport Zoom Control

**User Story:** As a user, I want to zoom in and out on the 3D model, so that I can examine details or see the entire model.

#### Acceptance Criteria

1. WHEN the user scrolls the mouse wheel, THE Viewport_Controller SHALL zoom in or out based on scroll direction
2. WHEN the user zooms, THE Viewport_Controller SHALL update the camera distance from the model in real-time
3. WHEN the user zooms, THE Viewport_Controller SHALL maintain the zoom level within reasonable bounds (minimum and maximum distance)
4. WHEN the user zooms to the maximum level, THE Viewport_Controller SHALL prevent further zooming in
5. WHEN the user zooms to the minimum level, THE Viewport_Controller SHALL prevent further zooming out

---

### Requirement 9: Viewport Pan Control

**User Story:** As a user, I want to pan the view across the 3D model, so that I can focus on specific areas.

#### Acceptance Criteria

1. WHEN the user clicks and drags with the middle mouse button or right mouse button, THE Viewport_Controller SHALL pan the view
2. WHEN the user pans, THE Viewport_Controller SHALL move the camera position based on mouse movement
3. WHEN the user releases the mouse button, THE Viewport_Controller SHALL stop panning and maintain the current view

---

### Requirement 10: Model Catalog Display

**User Story:** As a user, I want to view a catalog of available decorative models, so that I can choose which models to apply to the wall.

#### Acceptance Criteria

1. WHEN the 3D_Viewer is active, THE Model_Catalog_Sidebar SHALL display a list or grid of available decorative models
2. WHEN the Model_Catalog_Sidebar displays models, THE Model_Catalog_Sidebar SHALL show a thumbnail preview for each model
3. WHEN the user scrolls the catalog, THE Model_Catalog_Sidebar SHALL load additional models if the catalog is paginated
4. WHEN a model is hovered in the catalog, THE Model_Catalog_Sidebar SHALL highlight it and display its name and description
5. IF the catalog fails to load, THEN THE Model_Catalog_Sidebar SHALL display an error message with a retry option

---

### Requirement 11: Drag and Drop Model Application

**User Story:** As a user, I want to drag decorative models from the catalog onto the base wall model, so that I can apply them to the wall.

#### Acceptance Criteria

1. WHEN the user clicks and holds a model in the Model_Catalog_Sidebar, THE Drag_Drop_Handler SHALL initiate a drag operation
2. WHEN the user drags a model over the 3D_Viewer, THE Drag_Drop_Handler SHALL display a visual indicator (ghost image or highlight) showing where the model will be placed
3. WHEN the user releases the mouse button over the 3D_Viewer, THE Drag_Drop_Handler SHALL apply the model to the Base_Model at the drop location
4. IF the drop location is invalid, THEN THE Drag_Drop_Handler SHALL display an error message and not apply the model
5. WHEN a model is applied, THE Applied_Model SHALL be positioned and attached to the Base_Model
6. WHEN a model is applied, THE 3D_Viewer SHALL update to show the Applied_Model on the Base_Model

---

### Requirement 12: Applied Model Manipulation

**User Story:** As a user, I want to manipulate applied models on the wall, so that I can adjust their position and appearance.

#### Acceptance Criteria

1. WHEN the user clicks on an Applied_Model in the viewport, THE Model_Selector SHALL select the model and display selection handles
2. WHEN a model is selected, THE Model_Manipulator SHALL allow the user to drag it to reposition it on the Base_Model
3. WHEN a model is selected, THE Model_Manipulator SHALL display controls to rotate the model
4. WHEN a model is selected, THE Model_Manipulator SHALL display controls to scale the model
5. WHEN the user right-clicks on an Applied_Model, THE Model_Manipulator SHALL display a context menu with options to delete or duplicate the model
6. WHEN the user deletes an Applied_Model, THE 3D_Viewer SHALL remove it from the viewport

---

### Requirement 13: Model Persistence

**User Story:** As a user, I want to save my wall visualization with applied models, so that I can return to it later.

#### Acceptance Criteria

1. WHEN the user has created a visualization with applied models, THE Model_Persistence_Manager SHALL provide a save option
2. WHEN the user saves a visualization, THE Model_Persistence_Manager SHALL store the Base_Model, Applied_Models, and their positions
3. WHEN the user loads a saved visualization, THE Model_Persistence_Manager SHALL restore the Base_Model and all Applied_Models with their original positions
4. WHEN a visualization is saved, THE Model_Persistence_Manager SHALL assign it a unique identifier and timestamp

---

### Requirement 14: Error Handling and Recovery

**User Story:** As a user, I want the system to handle errors gracefully, so that I can recover from failures without losing my work.

#### Acceptance Criteria

1. IF an error occurs during any operation, THEN THE Error_Handler SHALL display a user-friendly error message
2. WHEN an error occurs, THE Error_Handler SHALL log the error with a timestamp and error code for debugging
3. IF a critical operation fails, THEN THE Error_Handler SHALL provide a retry option
4. WHEN the user retries an operation, THE Error_Handler SHALL attempt the operation again without requiring the user to restart

---

### Requirement 15: Performance and Responsiveness

**User Story:** As a user, I want the application to be responsive and performant, so that I can work efficiently without delays.

#### Acceptance Criteria

1. WHEN the user interacts with the viewport, THE Viewport_Controller SHALL respond within 16ms (60 FPS) for smooth animation
2. WHEN the user marks dimensions, THE Dimension_Marker SHALL respond to clicks within 100ms
3. WHEN the user drags a model, THE Drag_Drop_Handler SHALL update the visual indicator in real-time without lag
4. WHEN a model is loaded, THE 3D_Viewer SHALL complete loading within 3 seconds for models under 10MB

---

### Requirement 16: Accessibility

**User Story:** As a user with accessibility needs, I want the application to be usable with keyboard and screen readers, so that I can interact with all features.

#### Acceptance Criteria

1. WHEN the user navigates with the keyboard, THE UI_Controller SHALL allow tabbing through all interactive elements
2. WHEN the user presses Enter on a button, THE UI_Controller SHALL activate the button
3. WHEN the user uses a screen reader, THE UI_Controller SHALL provide descriptive labels for all interactive elements
4. WHEN the user interacts with the 3D_Viewer, THE Viewport_Controller SHALL provide keyboard shortcuts for rotation, zoom, and pan

---

### Requirement 17: Gemini API Prompt Engineering

**User Story:** As a developer, I want the Gemini API prompt to be well-structured and comprehensive, so that the generated Blender scripts are accurate and functional.

#### Acceptance Criteria

1. WHEN the LLM_Prompt_Builder constructs a prompt, THE LLM_Prompt_Builder SHALL include the Wall_Image encoded as base64
2. WHEN the LLM_Prompt_Builder constructs a prompt, THE LLM_Prompt_Builder SHALL include all Dimension_Data with clear labels and units
3. WHEN the LLM_Prompt_Builder constructs a prompt, THE LLM_Prompt_Builder SHALL specify the output format as Python code for Blender
4. WHEN the LLM_Prompt_Builder constructs a prompt, THE LLM_Prompt_Builder SHALL include instructions for material and lighting setup
5. WHEN the LLM_Prompt_Builder constructs a prompt, THE LLM_Prompt_Builder SHALL include error handling instructions for the generated script
6. WHEN the prompt is sent to Gemini_API, THE Gemini_API_Handler SHALL use the appropriate Gemini model version (e.g., gemini-1.5-pro)
7. WHEN the Gemini_API returns a response, THE LLM_Prompt_Builder SHALL validate that the response contains valid Python code before returning to the client

---

### Requirement 18: Blender Script Validation

**User Story:** As a developer, I want generated Blender scripts to be validated before execution, so that invalid scripts do not cause crashes.

#### Acceptance Criteria

1. WHEN a Blender_Script is generated, THE Blender_Script_Validator SHALL parse the script for syntax errors
2. WHEN the Blender_Script_Validator validates a script, THE Blender_Script_Validator SHALL check for required Blender imports
3. IF the script contains syntax errors, THEN THE Blender_Script_Validator SHALL display the errors and prevent execution
4. WHEN the script is valid, THE Blender_Script_Validator SHALL allow execution to proceed

---

### Requirement 19: Model Export Formats

**User Story:** As a developer, I want the 3D models to be exported in standard formats, so that they can be used in other applications.

#### Acceptance Criteria

1. WHEN a Blender_Script executes successfully, THE Model_Exporter SHALL export the model in glTF 2.0 format
2. WHERE alternative formats are needed, THE Model_Exporter SHALL support USDZ format for Apple platforms
3. WHEN a model is exported, THE Model_Exporter SHALL include all materials and textures in the export
4. WHEN a model is exported, THE Model_Exporter SHALL optimize the file size for web delivery

---

### Requirement 20: Catalog Management

**User Story:** As an administrator, I want to manage the model catalog, so that I can add, remove, or update available models.

#### Acceptance Criteria

1. WHEN an administrator accesses the catalog management interface, THE Catalog_Manager SHALL display all available models
2. WHEN an administrator uploads a new model, THE Catalog_Manager SHALL validate the model format and store it
3. WHEN an administrator deletes a model, THE Catalog_Manager SHALL remove it from the catalog and prevent new applications
4. WHEN a model is added to the catalog, THE Catalog_Manager SHALL generate a thumbnail preview automatically



### Requirement 21: Item Specification Management

**User Story:** As an administrator, I want to define item specifications with configurable dimensions and properties, so that the system can accurately calculate material quantities.

#### Acceptance Criteria

1. WHEN an administrator accesses the item specification interface, THE Item_Specification_Manager SHALL display all configured item types
2. WHEN an administrator creates a new item specification, THE Item_Specification_Manager SHALL allow defining the Item_Type, width, height, and depth
3. WHEN an administrator saves an item specification, THE Item_Specification_Manager SHALL store the specification with a unique identifier
4. WHEN an item specification is saved, THE Item_Specification_Manager SHALL validate that all dimensions are positive numbers
5. IF a dimension is invalid, THEN THE Item_Specification_Manager SHALL display an error and prevent saving
6. WHEN an administrator edits an existing specification, THE Item_Specification_Manager SHALL allow modification of all dimension properties
7. WHEN an item specification is updated, THE Item_Specification_Manager SHALL apply the changes to future calculations

---

### Requirement 22: Material Quantity Calculation

**User Story:** As a user, I want the system to calculate the exact quantity of items needed based on marked dimensions and item specifications, so that I know how many materials to purchase.

#### Acceptance Criteria

1. WHEN a user marks a section on the wall image and assigns an Item_Type, THE Material_Quantity_Calculator SHALL retrieve the corresponding Item_Specification
2. WHEN the Material_Quantity_Calculator has the Marked_Section dimensions and Item_Specification, THE Material_Quantity_Calculator SHALL calculate the Quantity_Result by dividing the section area by the item area
3. WHEN calculating quantities, THE Material_Quantity_Calculator SHALL round up to the nearest whole number to ensure sufficient coverage
4. WHEN a Marked_Section is updated, THE Material_Quantity_Calculator SHALL recalculate the Quantity_Result automatically
5. IF an Item_Specification is missing or invalid, THEN THE Material_Quantity_Calculator SHALL display an error message
6. WHEN multiple items of the same type are marked, THE Material_Quantity_Calculator SHALL aggregate the quantities

---

### Requirement 23: Quantity Display in Visualization

**User Story:** As a user, I want to see calculated quantities displayed for each marked section, so that I can verify the material requirements at a glance.

#### Acceptance Criteria

1. WHEN a section is marked and a quantity is calculated, THE Quantity_Display SHALL show the Quantity_Result on or near the marked section
2. WHEN the user hovers over a Quantity_Display, THE Quantity_Display SHALL show additional details including item type and dimensions
3. WHEN a quantity is recalculated, THE Quantity_Display SHALL update in real-time
4. WHEN multiple quantities are displayed, THE Quantity_Display SHALL use distinct colors or labels to differentiate item types
5. WHEN the user clicks on a Quantity_Display, THE Quantity_Display SHALL highlight the corresponding Marked_Section

---

### Requirement 24: Quantity Persistence in Saved Visualizations

**User Story:** As a user, I want calculated quantities to be saved with my visualization, so that I can reference material requirements when I reload the project.

#### Acceptance Criteria

1. WHEN a visualization is saved, THE Model_Persistence_Manager SHALL store all Marked_Sections with their assigned Item_Types
2. WHEN a visualization is saved, THE Model_Persistence_Manager SHALL store all calculated Quantity_Results
3. WHEN a saved visualization is loaded, THE Model_Persistence_Manager SHALL restore all Marked_Sections and their quantities
4. WHEN a visualization is loaded, THE Quantity_Display SHALL display all previously calculated quantities
5. WHEN a visualization is loaded and an Item_Specification has changed, THE Material_Quantity_Calculator SHALL recalculate quantities based on the updated specification

---

### Requirement 25: Bill of Materials Export

**User Story:** As a user, I want to export a bill of materials report with all calculated quantities, so that I can share material requirements with suppliers or team members.

#### Acceptance Criteria

1. WHEN a visualization has marked sections with calculated quantities, THE Bill_of_Materials_Generator SHALL provide an export option
2. WHEN the user initiates a bill of materials export, THE Bill_of_Materials_Generator SHALL compile all Item_Types, Quantity_Results, and specifications into a Bill_of_Materials
3. WHEN a Bill_of_Materials is generated, THE Bill_of_Materials_Generator SHALL export it in CSV format with columns for item type, quantity, dimensions, and unit
4. WHERE alternative formats are needed, THE Bill_of_Materials_Generator SHALL support PDF format with formatted tables and summary totals
5. WHEN a Bill_of_Materials is exported, THE Bill_of_Materials_Generator SHALL include a timestamp and visualization identifier
6. WHEN the user exports a report, THE Bill_of_Materials_Generator SHALL allow customization of included fields and sorting options

---

### Requirement 26: Backend API Endpoint for Image Upload

**User Story:** As a developer, I want a dedicated API endpoint for image uploads, so that images are securely stored in GCP Cloud Storage.

#### Acceptance Criteria

1. THE Backend_Server SHALL provide a POST /api/images/upload API_Endpoint that accepts multipart form data
2. WHEN an image is uploaded to the endpoint, THE Image_Storage_Service SHALL validate the file format (JPEG, PNG, WebP)
3. WHEN an image is validated, THE Image_Storage_Service SHALL validate the file size does not exceed 50MB
4. IF validation fails, THEN THE API_Endpoint SHALL return a 400 Bad Request response with error details
5. WHEN validation succeeds, THE Image_Storage_Service SHALL authenticate with GCP using service account credentials
6. WHEN authenticated with GCP, THE Image_Storage_Service SHALL upload the image to the GCP_Bucket in GCP Cloud Storage
7. WHEN the image is uploaded to GCP, THE Image_Storage_Service SHALL generate a unique image_id and store the GCP object reference
8. WHEN the image is stored, THE API_Endpoint SHALL return a 200 OK response with the image_id and GCP object URL
9. WHEN an image is stored, THE Backend_Error_Log SHALL record the upload event with timestamp, image_id, and GCP object reference
10. IF the GCP upload fails, THEN THE API_Endpoint SHALL return a 503 Service Unavailable response with retry information

---

### Requirement 27: Backend API Endpoint for Gemini Script Generation

**User Story:** As a developer, I want a dedicated API endpoint for Gemini-based script generation, so that Blender scripts are generated securely on the backend.

#### Acceptance Criteria

1. THE Backend_Server SHALL provide a POST /api/gemini/generate API_Endpoint that accepts JSON payload with image_id and dimension_data
2. WHEN a generation request is received, THE Gemini_API_Handler SHALL authenticate with Google's Gemini API using stored API credentials
3. WHEN authenticated, THE Gemini_API_Handler SHALL retrieve the image from Image_Storage_Service using the image_id
4. WHEN the image is retrieved, THE Gemini_API_Handler SHALL construct a prompt with the image and dimension_data
5. WHEN the prompt is constructed, THE Gemini_API_Handler SHALL send the request to the Gemini_API
6. WHEN the Gemini_API returns a response, THE Blender_Script_Parser SHALL extract and validate the Python code
7. IF the response is invalid, THEN THE API_Endpoint SHALL return a 400 Bad Request response with error details
8. WHEN the script is valid, THE Backend_Server SHALL store the script with a unique script_id
9. WHEN the script is stored, THE API_Endpoint SHALL return a 200 OK response with the script_id
10. IF the Gemini_API call fails or times out, THEN THE API_Endpoint SHALL return a 503 Service Unavailable response with retry information

---

### Requirement 28: Backend API Endpoint for Headless Blender Execution

**User Story:** As a developer, I want a dedicated API endpoint for triggering headless Blender execution, so that 3D models are generated asynchronously on the backend.

#### Acceptance Criteria

1. THE Backend_Server SHALL provide a POST /api/blender/execute API_Endpoint that accepts JSON payload with script_id
2. WHEN an execution request is received, THE Backend_Server SHALL validate that the script_id exists and is valid
3. IF the script_id is invalid, THEN THE API_Endpoint SHALL return a 404 Not Found response
4. WHEN the script is valid, THE Backend_Server SHALL queue the execution request in the Job_Queue with a unique job_id
5. WHEN the job is queued, THE API_Endpoint SHALL return a 202 Accepted response with the job_id
6. WHEN the job is processed, THE Headless_Blender_Executor SHALL execute the Blender_Script in headless mode
7. WHEN execution completes, THE Backend_Server SHALL store the exported model with a unique model_id
8. WHEN the model is stored, THE Backend_Server SHALL update the Job_Status to completed with the model_id
9. IF execution fails, THEN THE Backend_Server SHALL update the Job_Status to failed with error details
10. WHEN a job fails, THE Backend_Error_Log SHALL record the failure with timestamp, job_id, and error message

---

### Requirement 29: Backend API Endpoint for Job Status Polling

**User Story:** As a developer, I want an API endpoint to check the status of asynchronous jobs, so that the client can track long-running operations.

#### Acceptance Criteria

1. THE Backend_Server SHALL provide a GET /api/jobs/{job_id} API_Endpoint that returns the current Job_Status
2. WHEN a status request is received, THE Backend_Server SHALL retrieve the job record from the Job_Queue
3. IF the job_id does not exist, THEN THE API_Endpoint SHALL return a 404 Not Found response
4. WHEN the job is found, THE API_Endpoint SHALL return a 200 OK response with the Job_Status (pending, processing, completed, or failed)
5. WHEN the Job_Status is completed, THE API_Endpoint SHALL include the model_id in the response
6. WHEN the Job_Status is failed, THE API_Endpoint SHALL include error details in the response
7. WHEN the Job_Status is processing, THE API_Endpoint SHALL include estimated time remaining if available

---

### Requirement 30: Backend API Endpoint for Model Retrieval

**User Story:** As a developer, I want an API endpoint to retrieve generated 3D models, so that the client can load models into the 3D viewer.

#### Acceptance Criteria

1. THE Backend_Server SHALL provide a GET /api/models/{model_id} API_Endpoint that streams the model file
2. WHEN a model request is received, THE Backend_Server SHALL validate that the model_id exists
3. IF the model_id does not exist, THEN THE API_Endpoint SHALL return a 404 Not Found response
4. WHEN the model is found, THE Backend_Server SHALL stream the model file with appropriate Content-Type header (model/gltf+json or model/gltf-binary)
5. WHEN the model is streamed, THE API_Endpoint SHALL include cache headers to optimize client-side caching
6. IF the model file is corrupted or missing, THEN THE API_Endpoint SHALL return a 500 Internal Server Error response

---

### Requirement 31: Asynchronous Job Queue Management

**User Story:** As a developer, I want the backend to manage asynchronous jobs in a queue, so that long-running operations do not block the client.

#### Acceptance Criteria

1. WHEN a Blender execution request is received, THE Job_Queue SHALL queue the job with a unique job_id and timestamp
2. WHEN jobs are queued, THE Job_Queue SHALL process jobs in FIFO order with configurable concurrency limits
3. WHEN a job is processing, THE Job_Queue SHALL update the Job_Status to processing
4. WHEN a job completes, THE Job_Queue SHALL update the Job_Status to completed with the result
5. IF a job fails, THEN THE Job_Queue SHALL update the Job_Status to failed with error details
6. WHEN a job is completed or failed, THE Job_Queue SHALL retain the job record for at least 24 hours for status queries
7. WHEN the Job_Queue reaches capacity, THE Backend_Server SHALL return a 429 Too Many Requests response to new requests

---

### Requirement 32: Backend Error Handling and Logging

**User Story:** As a developer, I want comprehensive error handling and logging on the backend, so that I can diagnose and fix issues quickly.

#### Acceptance Criteria

1. WHEN an error occurs in any backend operation, THE Error_Handler SHALL catch the exception and log it to the Backend_Error_Log
2. WHEN an error is logged, THE Backend_Error_Log SHALL record the timestamp, error type, error message, stack trace, and operation context
3. WHEN an API request fails, THE Error_Handler SHALL return an appropriate HTTP status code (4xx for client errors, 5xx for server errors)
4. WHEN an API request fails, THE Error_Handler SHALL return a JSON response with error_code and error_message fields
5. WHEN a critical error occurs, THE Error_Handler SHALL send an alert notification to the operations team
6. WHEN the Backend_Error_Log reaches a size threshold, THE Backend_Error_Log SHALL rotate to a new file and archive old logs
7. WHEN logs are archived, THE Backend_Error_Log SHALL retain archived logs for at least 30 days

---

### Requirement 37: Backend API Endpoint for User Login

**User Story:** As a developer, I want a dedicated API endpoint for user authentication, so that users can securely log in to the application.

#### Acceptance Criteria

1. THE Backend_Server SHALL provide a POST /api/auth/login API_Endpoint that accepts JSON payload with email and password
2. WHEN a login request is received, THE User_Authentication_Handler SHALL validate the email format
3. IF the email format is invalid, THEN THE API_Endpoint SHALL return a 400 Bad Request response
4. WHEN the email is valid, THE User_Authentication_Handler SHALL query the user database for the user account
5. IF the user account does not exist, THEN THE API_Endpoint SHALL return a 401 Unauthorized response without revealing whether the account exists
6. WHEN the user account is found, THE User_Authentication_Handler SHALL verify the password using secure hashing (bcrypt or similar)
7. IF the password is incorrect, THEN THE API_Endpoint SHALL return a 401 Unauthorized response
8. WHEN the password is correct, THE User_Authentication_Handler SHALL generate a Session_Token with an expiration time (e.g., 30 days)
9. WHEN a Session_Token is generated, THE API_Endpoint SHALL return a 200 OK response with the Session_Token and user information
10. WHEN a login attempt fails, THE Backend_Error_Log SHALL record the failed attempt with timestamp and IP address for security monitoring

---

### Requirement 38: Backend API Endpoint for Session Token Refresh

**User Story:** As a developer, I want an API endpoint to refresh expired session tokens, so that users can maintain their session without logging in again.

#### Acceptance Criteria

1. THE Backend_Server SHALL provide a POST /api/auth/refresh API_Endpoint that accepts a Session_Token
2. WHEN a refresh request is received, THE User_Authentication_Handler SHALL validate the Session_Token
3. IF the Session_Token is invalid or expired, THEN THE API_Endpoint SHALL return a 401 Unauthorized response
4. WHEN the Session_Token is valid, THE User_Authentication_Handler SHALL generate a new Session_Token with an updated expiration time
5. WHEN a new Session_Token is generated, THE API_Endpoint SHALL return a 200 OK response with the new Session_Token
6. WHEN a token refresh succeeds, THE Backend_Error_Log SHALL record the refresh event with timestamp and user_id

---

### Requirement 39: Backend API Endpoint for User Logout

**User Story:** As a developer, I want an API endpoint for user logout, so that users can securely end their session.

#### Acceptance Criteria

1. THE Backend_Server SHALL provide a POST /api/auth/logout API_Endpoint that accepts a Session_Token
2. WHEN a logout request is received, THE User_Authentication_Handler SHALL validate the Session_Token
3. IF the Session_Token is invalid, THEN THE API_Endpoint SHALL return a 401 Unauthorized response
4. WHEN the Session_Token is valid, THE User_Authentication_Handler SHALL invalidate the Session_Token in the backend
5. WHEN the Session_Token is invalidated, THE API_Endpoint SHALL return a 200 OK response
6. WHEN a logout succeeds, THE Backend_Error_Log SHALL record the logout event with timestamp and user_id

---

### Requirement 40: Session Token Validation for Protected API Endpoints

**User Story:** As a developer, I want all protected API endpoints to validate session tokens, so that only authenticated users can access the application features.

#### Acceptance Criteria

1. WHEN a request is made to any protected API endpoint (e.g., /api/images/upload, /api/gemini/generate), THE API_Middleware SHALL extract the Session_Token from the request headers
2. IF no Session_Token is present, THEN THE API_Middleware SHALL return a 401 Unauthorized response
3. WHEN a Session_Token is present, THE API_Middleware SHALL validate the token signature and expiration
4. IF the Session_Token is invalid or expired, THEN THE API_Middleware SHALL return a 401 Unauthorized response
5. WHEN the Session_Token is valid, THE API_Middleware SHALL extract the user_id and attach it to the request context
6. WHEN the request is processed, THE Backend_Error_Log SHALL record the API call with timestamp, user_id, and endpoint
7. WHEN a request fails authentication, THE Backend_Error_Log SHALL record the failed attempt with timestamp and IP address

---

### Requirement 36: GCP Cloud Storage Authentication and Configuration

**User Story:** As a developer, I want secure authentication with GCP Cloud Storage, so that images are stored safely in a managed cloud environment.

#### Acceptance Criteria

1. WHEN the Backend_Server starts, THE GCP_Storage_Handler SHALL load GCP service account credentials from secure environment variables or a secrets manager
2. WHEN credentials are loaded, THE GCP_Storage_Handler SHALL validate that the credentials are present and have appropriate permissions for Cloud Storage
3. IF credentials are missing or invalid, THEN THE Backend_Server SHALL log an error and disable image upload functionality
4. WHEN the Backend_Server initializes, THE GCP_Storage_Handler SHALL verify that the GCP_Bucket exists and is accessible
5. IF the GCP_Bucket does not exist, THEN THE Backend_Server SHALL log an error and attempt to create it with appropriate access controls
6. WHEN images are uploaded, THE GCP_Storage_Handler SHALL use the GCP_Bucket for all image storage operations
7. WHEN images are stored in GCP, THE GCP_Storage_Handler SHALL set appropriate access controls (private by default, accessible only via signed URLs)
8. WHEN credentials are rotated, THE Backend_Server SHALL reload credentials without requiring a restart
9. WHEN API requests are made to GCP, THE Backend_Error_Log SHALL record the request (without logging sensitive credentials) for audit purposes
10. WHEN GCP operations fail, THE GCP_Storage_Handler SHALL implement exponential backoff retry logic with configurable retry limits

**User Story:** As a developer, I want secure authentication with Google's Gemini API, so that API credentials are protected and requests are properly authenticated.

#### Acceptance Criteria

1. WHEN the Backend_Server starts, THE Gemini_API_Handler SHALL load Gemini API credentials from secure environment variables or a secrets manager
2. WHEN credentials are loaded, THE Gemini_API_Handler SHALL validate that the credentials are present and valid
3. IF credentials are missing or invalid, THEN THE Backend_Server SHALL log an error and disable Gemini functionality
4. WHEN a Gemini API request is made, THE Gemini_API_Handler SHALL include the API key in the request headers
5. WHEN the Gemini_API returns an authentication error, THE Gemini_API_Handler SHALL log the error and return a 503 Service Unavailable response
6. WHEN credentials are rotated, THE Backend_Server SHALL reload credentials without requiring a restart
7. WHEN API requests are made, THE Backend_Error_Log SHALL record the request (without logging sensitive credentials) for audit purposes

---

### Requirement 34: Backend Image Storage Security

**User Story:** As a developer, I want to ensure uploaded images are stored securely on the backend, so that user data is protected.

#### Acceptance Criteria

1. WHEN an image is stored, THE Image_Storage_Service SHALL store it in a secure directory with restricted file permissions
2. WHEN an image is stored, THE Image_Storage_Service SHALL generate a unique image_id that does not reveal the file path
3. WHEN an image is retrieved, THE Image_Storage_Service SHALL validate that the requester has permission to access the image
4. WHEN an image is no longer needed, THE Image_Storage_Service SHALL provide a mechanism to delete the image from storage
5. WHEN images are stored, THE Image_Storage_Service SHALL implement file size quotas to prevent storage exhaustion
6. WHEN the storage quota is exceeded, THE Image_Storage_Service SHALL return an error and prevent new uploads

---

### Requirement 35: Backend Performance Monitoring

**User Story:** As a developer, I want to monitor backend performance metrics, so that I can identify and resolve bottlenecks.

#### Acceptance Criteria

1. WHEN backend operations execute, THE Performance_Monitor SHALL track execution time for each API endpoint
2. WHEN operations complete, THE Performance_Monitor SHALL record metrics including response time, CPU usage, and memory usage
3. WHEN metrics are recorded, THE Performance_Monitor SHALL store them in a time-series database for analysis
4. WHEN performance degrades, THE Performance_Monitor SHALL log warnings if response times exceed thresholds
5. WHEN the Job_Queue processes jobs, THE Performance_Monitor SHALL track queue depth and job processing time
6. WHEN metrics are queried, THE Backend_Server SHALL provide a /api/metrics endpoint that returns current performance statistics
