# Image Upload Feature - Detailed Design Specifications

## 1. FEATURE OVERVIEW

The image upload feature allows authenticated users to upload wall images for visualization and processing. Users can upload images via file selection (drag-and-drop or click-to-browse) or camera capture. The feature integrates seamlessly with the existing authentication system and includes a global header with logout functionality.

### Key Capabilities
- File upload via drag-and-drop
- File upload via click-to-browse
- Camera capture functionality
- Image validation (format, size)
- Upload progress tracking
- Error handling and recovery
- Session persistence
- Global header with logout

---

## 2. SYSTEM ARCHITECTURE

### Service Decomposition

The application follows Domain-Driven Design (DDD) with two isolated services:

**Backend (data-service)**
- Handles image upload API endpoints
- Manages GCP Cloud Storage integration
- Stores image metadata in MongoDB
- Enforces authentication and authorization
- Executes business logic and validation

**Frontend (page-service)**
- Renders upload page and components
- Manages user interactions and state
- Communicates with backend via API contracts
- Displays results and error messages
- Manages global header and logout

### Data Flow

```
User Action (Upload/Camera)
    ↓
Frontend Validation (format, size)
    ↓
API Request (multipart/form-data)
    ↓
Backend Validation (format, size, auth)
    ↓
GCP Cloud Storage Upload
    ↓
MongoDB Metadata Storage
    ↓
API Response (imageId, gcpUrl)
    ↓
Frontend Success Display
```

---

## 3. BACKEND ARCHITECTURE

### Directory Structure

```
backend/src/data-service/
├── application/
│   ├── image-upload/
│   │   ├── upload_image.api.ts
│   │   ├── retrieve_image.api.ts
│   │   ├── image_metadata.api.ts
│   │   └── index.ts
│   ├── errors.ts
│   └── index.ts
└── domain/
    ├── image-upload/
    │   ├── image_schema.ts
    │   ├── index.ts
    │   └── interface.ts
    └── index.ts
```

### Domain Layer (image-upload)

**image_schema.ts** - Type definitions only

```typescript
export interface IImage {
  id: string;
  userId: string;
  filename: string;
  gcpObjectPath: string;
  uploadedAt: Date;
  fileSize: number;
  mimeType: string;
}

export type ImageFormat = 'jpeg' | 'png' | 'webp';
export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';
```

**index.ts** - Domain business logic

Pure, stateless functions for:
- Image format validation
- Image size validation
- Image ID generation
- Filename sanitization
- Image metadata extraction
- Magic number verification

### Application Layer (image-upload)

**upload_image.api.ts** - Upload endpoint

- Receives multipart/form-data request
- Validates authentication token
- Calls domain validation functions
- Uploads to GCP Cloud Storage
- Stores metadata in MongoDB
- Returns imageId and gcpUrl

**retrieve_image.api.ts** - Retrieval endpoint

- Validates authentication token
- Verifies user ownership
- Retrieves image from GCP
- Returns image with cache headers

**image_metadata.api.ts** - Metadata endpoint

- Validates authentication token
- Verifies user ownership
- Retrieves metadata from MongoDB
- Returns image metadata

### Error Handling

All errors defined in `application/errors.ts`:
- `ImageUploadError`
- `InvalidImageFormatError`
- `InvalidImageSizeError`
- `GCPUploadError`
- `ImageMetadataError`
- `UnauthorizedError`
- `ForbiddenError`

---

## 4. FRONTEND ARCHITECTURE

### Directory Structure

```
frontend/src/page-service/
├── application/
│   ├── upload/
│   │   ├── upload_page.api.ts
│   │   └── index.ts
│   ├── errors.ts
│   └── index.ts
└── domain/
    ├── upload-page/
    │   ├── UploadPage.tsx
    │   ├── ImageUploader.tsx
    │   ├── CameraCapture.tsx
    │   ├── GlobalHeader.tsx
    │   ├── upload_page.module.css
    │   ├── index.ts
    │   └── interface.ts
    └── index.ts
```

### Component Hierarchy

```
UploadPage (Main page component)
├── GlobalHeader (Header with logout)
├── ImageUploader (File upload component)
│   ├── DropZone
│   ├── ImagePreview
│   └── UploadProgress
└── CameraCapture (Camera capture component)
    ├── CameraView
    ├── CapturePreview
    └── CaptureControls
```

### Component Specifications

**UploadPage.tsx**
- Manages upload state and flow
- Displays upload options (file or camera)
- Handles success/error states
- Integrates GlobalHeader, ImageUploader, CameraCapture

**ImageUploader.tsx**
- Drag-and-drop functionality
- Click-to-select file browser
- Image preview display
- Upload progress tracking
- Error handling

**CameraCapture.tsx**
- Camera permission handling
- Live camera feed display
- Image capture functionality
- Capture preview with confirm/retake
- Error handling

**GlobalHeader.tsx**
- Displays user information
- Logout button
- Navigation links
- Responsive design

---

## 5. INTEGRATION WITH LOGIN PAGE

### Authentication Flow

1. **Login Page** → User enters phone number
2. **OTP Verification** → User enters OTP
3. **JWT Token Generation** → Backend generates JWT token
4. **Token Storage** → Token stored in localStorage and HTTP-only cookies
5. **Upload Page Redirect** → User redirected to upload page
6. **Token Validation** → Upload page validates token on load
7. **API Requests** → All API requests include JWT token in Authorization header

### Session Persistence

- JWT token stored in localStorage (for client-side access)
- JWT token stored in HTTP-only cookie (for server-side validation)
- Token expiration: 1 hour
- Token refresh: Automatic before expiration
- Session cookie expiration: 30 days

### Authentication Middleware

All API requests include:
```
Authorization: Bearer {jwt_token}
```

Backend validates:
- Token presence
- Token signature
- Token expiration
- User ID in token

---

## 6. GLOBAL HEADER & LOGOUT FLOW

### Header Components

**User Information**
- Display user's phone number (masked: +1 (***) ***-7890)
- Display upload count (optional)
- Display storage usage (optional)

**Logout Button**
- Prominent logout button
- Confirmation dialog before logout
- Clear session data on logout

### Logout Flow

1. User clicks logout button
2. Confirmation dialog appears
3. User confirms logout
4. Frontend clears localStorage and cookies
5. Frontend clears session state
6. Frontend redirects to login page
7. Backend invalidates session (optional)

### Header Styling

- Fixed position at top of page
- Full width
- Height: 60px
- Background: Primary color (#97B3AE)
- Text: White
- Responsive on mobile (hamburger menu optional)

---

## 7. PAGE LAYOUT & DESIGN

### Upload Page Layout

```
┌─────────────────────────────────────────┐
│  Global Header (User Info | Logout)     │
├─────────────────────────────────────────┤
│                                         │
│  Upload Page Title                      │
│  "Upload Your Wall Image"               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Upload Options                 │   │
│  │  ┌─────────────────────────────┐│   │
│  │  │ Drag & Drop Zone            ││   │
│  │  │ or Click to Select          ││   │
│  │  │ [Image Preview]             ││   │
│  │  │ [Upload Progress]           ││   │
│  │  └─────────────────────────────┘│   │
│  │                                 │   │
│  │  OR                             │   │
│  │                                 │   │
│  │  [Capture from Camera Button]   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Success Message / Error Message]      │
│                                         │
└─────────────────────────────────────────┘
```

### Responsive Breakpoints

**Mobile (< 640px)**
- Single column layout
- Full-width buttons
- Larger touch targets (44px minimum)
- Simplified header (hamburger menu)
- Reduced padding

**Tablet (640px - 1024px)**
- Two column layout (optional)
- Proportional sizing
- Standard touch targets
- Full header

**Desktop (> 1024px)**
- Two column layout (file upload + camera)
- Optimal spacing
- Standard sizing
- Full header

---

## 8. USER INTERACTION FLOWS

### File Upload Flow

```
User Action: Click Drop Zone or Select File
    ↓
File Browser Opens (or drag-drop detected)
    ↓
User Selects Image File
    ↓
Frontend Validates Format & Size
    ↓
Image Preview Displayed
    ↓
User Clicks Upload Button
    ↓
Upload Progress Shown
    ↓
Backend Validates & Stores
    ↓
Success Message Displayed
    ↓
Image ID Returned
```

### Camera Capture Flow

```
User Action: Click "Capture from Camera"
    ↓
Camera Permission Requested
    ↓
User Grants Permission
    ↓
Camera View Opens (Full Screen)
    ↓
Live Camera Feed Displayed
    ↓
User Clicks Capture Button
    ↓
Image Captured from Feed
    ↓
Capture Preview Displayed
    ↓
User Clicks Confirm or Retake
    ↓
If Confirm: Upload Begins
    ↓
Upload Progress Shown
    ↓
Backend Validates & Stores
    ↓
Success Message Displayed
```

### Error Recovery Flow

```
Error Occurs (Format, Size, Network, etc.)
    ↓
Error Message Displayed
    ↓
User Sees Actionable Message
    ↓
User Can Retry or Select Different File
    ↓
If Retry: Upload Resumes
    ↓
If Different File: Return to Upload Options
```

---

## 9. API SPECIFICATIONS

### Upload Image Endpoint

**POST /api/images/upload**

Request:
```typescript
{
  image: File,
  userId: string
}
```

Response (Success):
```typescript
{
  success: true,
  imageId: string,
  gcpUrl: string
}
```

Response (Error):
```typescript
{
  success: false,
  error: {
    message: string,
    code: string
  }
}
```

### Retrieve Image Endpoint

**GET /api/images/{imageId}**

Response: Image file with Content-Type header

### Image Metadata Endpoint

**GET /api/images/{imageId}/metadata**

Response:
```typescript
{
  id: string,
  userId: string,
  filename: string,
  gcpObjectPath: string,
  uploadedAt: string,
  fileSize: number,
  mimeType: string
}
```

---

## 10. VALIDATION SPECIFICATIONS

### Image Format Validation

**Supported Formats:**
- JPEG (image/jpeg)
- PNG (image/png)
- WebP (image/webp)

**Validation Strategy:**
1. MIME type check
2. File extension check
3. Magic number verification (prevent spoofing)

### Image Size Validation

**Size Limits:**
- Minimum: 1KB
- Maximum: 10MB

**Validation Location:**
- Frontend: Pre-upload feedback
- Backend: Final security validation

### Filename Sanitization

- Remove path traversal attempts
- Remove special characters (except -, _, .)
- Preserve original extension
- Limit to 255 characters
- Convert to lowercase

---

## 11. ERROR HANDLING DESIGN

### Error Categories

**Validation Errors (400)**
- Invalid image format
- Image size exceeds limit
- Image size below minimum
- Empty file

**Authentication Errors (401)**
- Missing authentication token
- Invalid or expired token

**Authorization Errors (403)**
- User doesn't own image

**Not Found Errors (404)**
- Image not found

**Service Errors (5xx)**
- GCP upload failed
- Metadata storage failed
- Database error

### Error Display Strategy

**Inline Errors** (Form validation)
- Display below form field
- Red text color
- Clear, actionable message

**Toast Notifications** (API errors)
- Display at top of screen
- Auto-dismiss after 5 seconds
- User-friendly message

**Error Boundaries** (React errors)
- Catch and display gracefully
- Log error for debugging
- Provide retry option

---

## 12. SECURITY SPECIFICATIONS

### Authentication & Authorization

- JWT token required for all operations
- Token validated on every request
- User ID extracted from token
- Cross-user access prevented

### File Upload Security

- File type verification (magic number check)
- File size validation (frontend + backend)
- Filename sanitization
- MIME type whitelist

### Data Protection

- Phone numbers: SHA256 hash in logs
- Images: Stored in GCP with access controls
- Tokens: HTTP-only cookies + localStorage
- HTTPS: Enforced in production

---

## 13. PERFORMANCE SPECIFICATIONS

### Frontend Performance

- Image preview renders within 500ms
- Camera view opens within 1 second
- Upload progress updates 10+ times per second
- Drag-and-drop responds within 100ms

### Backend Performance

- Image upload completes within 10 seconds (5MB on 4G)
- Image retrieval completes within 2 seconds
- Metadata retrieval completes within 2 seconds
- API response time: < 200ms for validation

### Optimization Strategies

- Image compression before upload
- Lazy loading for images
- WebP format with JPEG fallback
- Response compression (gzip)
- CDN for static assets
- Database indexes on frequently queried fields

---

## 14. ACCESSIBILITY SPECIFICATIONS

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text on background: 4.5:1 minimum
- Interactive elements: 3:1 minimum

**Keyboard Navigation:**
- Tab order follows visual flow
- All interactive elements keyboard accessible
- Escape key closes modals
- Enter key submits forms

**Screen Readers:**
- Semantic HTML (button, input, label)
- ARIA labels for icon-only buttons
- Form labels associated with inputs
- Error messages linked to inputs
- Proper heading hierarchy

**Motion:**
- Respect prefers-reduced-motion
- No auto-playing animations
- Animations can be disabled

---

## 15. TESTING STRATEGY

### Test Coverage

- Backend: 90% minimum code coverage
- Frontend: 85% minimum code coverage
- Critical paths: 100% coverage

### Test Categories

**Unit Tests**
- Domain validation functions
- Component rendering and state
- API request/response handling

**Integration Tests**
- Complete upload flow
- Error handling and recovery
- Authentication integration

**E2E Tests**
- Complete user journey: Login → Upload → View
- Multiple uploads
- Session persistence

**Performance Tests**
- Upload 5MB image within 10 seconds
- Image preview within 500ms
- Camera view within 1 second

**Security Tests**
- Prevent unauthorized access
- Prevent cross-user access
- Prevent file type spoofing
- Prevent path traversal

**Accessibility Tests**
- Keyboard navigation
- Screen reader compatibility
- Color contrast compliance

---

## 16. DEPLOYMENT CONSIDERATIONS

### Environment Configuration

**Development**
- Local MongoDB
- Local GCP emulator (optional)
- Debug logging enabled

**Staging**
- Staging MongoDB
- Staging GCP bucket
- Info logging

**Production**
- Production MongoDB
- Production GCP bucket
- Error logging only
- HTTPS enforced

### Build Process

**Frontend**
```bash
npm run build
# Output: dist/
# - Minified JS/CSS
# - Optimized images
# - Source maps (optional)
```

**Backend**
```bash
npm run build
# Output: dist/
# - Compiled TypeScript
# - Source maps
```

---

## 17. IMPLEMENTATION CHECKLIST

### Backend Implementation

- [ ] Create domain layer with validation functions
- [ ] Create application layer with API endpoints
- [ ] Implement GCP Cloud Storage integration
- [ ] Implement MongoDB metadata storage
- [ ] Implement authentication/authorization
- [ ] Implement error handling
- [ ] Implement logging
- [ ] Write unit tests (90% coverage)
- [ ] Write integration tests
- [ ] Write security tests

### Frontend Implementation

- [ ] Create UploadPage component
- [ ] Create ImageUploader component
- [ ] Create CameraCapture component
- [ ] Create GlobalHeader component
- [ ] Implement drag-and-drop functionality
- [ ] Implement file browser integration
- [ ] Implement camera capture
- [ ] Implement image preview
- [ ] Implement upload progress tracking
- [ ] Implement error handling
- [ ] Implement accessibility features
- [ ] Write component tests (85% coverage)
- [ ] Write integration tests
- [ ] Write E2E tests

### Testing & Quality

- [ ] Run all unit tests
- [ ] Run all integration tests
- [ ] Run all E2E tests
- [ ] Verify code coverage meets requirements
- [ ] Run security tests
- [ ] Run accessibility tests
- [ ] Run performance tests
- [ ] Browser compatibility testing
- [ ] Mobile responsiveness testing

---

## 18. REFERENCES

- **API Parameters:** `.kiro/specs/wall-decor-visualizer/image-upload_playground/API_PARAMETERS.md`
- **Design Reference:** `.kiro/specs/wall-decor-visualizer/image-upload_playground/DESIGN_REFERENCE.md`
- **DDD Architecture:** `.kiro/specs/wall-decor-visualizer/image-upload_playground/DDD_ARCHITECTURE.md`
- **Test Plan:** `.kiro/specs/wall-decor-visualizer/image-upload_playground/test_plan.md`
- **Global DDD Rules:** `.kiro/specs/wall-decor-visualizer/global-setup/DDD_RULES_REFERENCE.md`

