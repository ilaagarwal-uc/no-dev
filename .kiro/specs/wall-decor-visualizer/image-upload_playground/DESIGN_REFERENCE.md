# Image Upload Feature - Design Reference Guide

This document consolidates all design specifications from the global design document, DDD architecture rules, and test plan to serve as a comprehensive reference for implementation.

---

## 1. ARCHITECTURE OVERVIEW

### Service Structure (DDD Pattern)

The application follows Domain-Driven Design with two isolated services:

**Backend (data-service)**
- Handles all data operations, business logic, and API contracts
- Manages image storage in GCP Cloud Storage
- Handles authentication and authorization
- Executes business rules and validations

**Frontend (page-service)**
- Handles UI pages and components
- Manages user interactions and state
- Communicates with backend via API contracts
- Displays results and handles errors

### Key Principle: No Cross-Layer Type Dependencies
- Domain types (business models) are NEVER imported into application layer
- Application types (API contracts) are NEVER imported into domain layer
- Each layer owns its type definitions

---

## 2. BACKEND ARCHITECTURE (data-service)

### Directory Structure

```
backend/src/data-service/
├── application/
│   ├── image-upload/
│   │   ├── upload_image.api.ts
│   │   └── index.ts
│   ├── errors.ts (ALL errors go here)
│   └── index.ts
└── domain/
    ├── image-upload/
    │   ├── image_schema.ts (REQUIRED - types only)
    │   ├── index.ts (domain logic functions)
    │   └── interface.ts (optional)
    └── index.ts
```

### Domain Layer: image-upload

**File: `image_schema.ts`** (Types only - no logic)

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

**File: `index.ts`** (Domain logic functions)

Pure, stateless functions for business logic:
- `validateImageFormat(mimeType: string): boolean`
- `validateImageSize(fileSize: number): boolean`
- `generateImageId(): string`
- `extractImageMetadata(file: File): IImageMetadata`
- `sanitizeFilename(filename: string): string`

### Application Layer: image-upload

**File: `upload_image.api.ts`** (API contract and implementation)

```typescript
// API contract types (separate from domain types)
export interface IUploadImageRequest {
  image: File;
  userId: string;
}

export interface IUploadImageResponse {
  success: boolean;
  imageId?: string;
  gcpUrl?: string;
  error?: string;
}

// API implementation
export async function uploadImage(request: IUploadImageRequest): Promise<IUploadImageResponse> {
  // 1. Validate image format using domain function
  // 2. Validate image size using domain function
  // 3. Generate imageId using domain function
  // 4. Upload to GCP Cloud Storage
  // 5. Store metadata in MongoDB
  // 6. Return response
}
```

### Error Handling

**File: `application/errors.ts`** (ALL errors in one file)

```typescript
export class ImageUploadError extends Error {}
export class InvalidImageFormatError extends Error {}
export class InvalidImageSizeError extends Error {}
export class GCPUploadError extends Error {}
export class ImageMetadataError extends Error {}
```

### Import Pattern: Namespace Imports

Application layer MUST import domain as namespace:

```typescript
// ✅ CORRECT
import * as ImageUploadDomain from '../../domain/image-upload/index.js';

export async function uploadImageHandler(req: Request, res: Response): Promise<void> {
  const { image, userId } = req.body;
  
  // Validate using domain namespace
  if (!ImageUploadDomain.validateImageFormat(image.mimeType)) {
    res.status(400).json({ error: 'Invalid image format' });
    return;
  }
  
  // Call domain business logic
  const imageId = ImageUploadDomain.generateImageId();
  // ...
}
```

---

## 3. FRONTEND ARCHITECTURE (page-service)

### Directory Structure

```
frontend/src/page-service/
├── application/
│   ├── upload/
│   │   ├── upload_page.api.ts
│   │   └── index.ts
│   ├── errors.ts (ALL errors go here)
│   └── index.ts
└── domain/
    ├── upload-page/
    │   ├── UploadPage.tsx (page component)
    │   ├── ImageUploader.tsx (component - FLAT, no nested folders)
    │   ├── CameraCapture.tsx (component - FLAT, no nested folders)
    │   ├── upload_page_logic.ts (optional - page logic)
    │   ├── upload_page.module.css
    │   ├── index.ts (page logic functions)
    │   └── interface.ts (optional)
    └── index.ts
```

### Key Rules for Frontend

- ✅ All components FLAT in page domain folder (NO nested component folders)
- ✅ One API file per page: `upload_page.api.ts`
- ✅ Page logic in `index.ts`
- ✅ All errors in `application/errors.ts`
- ✅ Optional `{component}_logic.ts` for component-specific logic
- ❌ NO schema files for pages or components
- ❌ NO nested folders for components
- ❌ NO separate `components/` folder in src/
- ❌ NO separate `pages/` folder in src/

### Component Structure

**UploadPage.tsx** (Main page component)
- Manages upload state and flow
- Displays upload options (file selection or camera capture)
- Handles success/error states
- Integrates ImageUploader and CameraCapture components

**ImageUploader.tsx** (File upload component)
- Drag-and-drop functionality
- Click-to-select file browser
- Image preview display
- Upload progress tracking
- Error handling

**CameraCapture.tsx** (Camera capture component)
- Camera permission handling
- Live camera feed display
- Image capture functionality
- Capture preview with confirm/retake options
- Error handling for camera unavailability

---

## 4. IMAGE VALIDATION SPECIFICATIONS

### Format Validation

**Supported Formats:**
- JPEG (image/jpeg)
- PNG (image/png)
- WebP (image/webp)

**Validation Approach:**
- MIME type check: `image/jpeg`, `image/png`, `image/webp`
- File extension check: `.jpg`, `.jpeg`, `.png`, `.webp`
- Magic number check: Verify file content matches extension (not just extension spoofing)

### Size Validation

**Size Limits:**
- Maximum size: 10MB (10,485,760 bytes)
- Minimum size: 1KB (1,024 bytes)

**Validation Location:**
- Frontend: Pre-upload validation for user feedback
- Backend: Final validation before storage (security)

### Validation Functions (Domain Layer)

```typescript
export function validateImageFormat(mimeType: string): boolean {
  const supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
  return supportedFormats.includes(mimeType);
}

export function validateImageSize(fileSize: number): boolean {
  const MIN_SIZE = 1024; // 1KB
  const MAX_SIZE = 10485760; // 10MB
  return fileSize >= MIN_SIZE && fileSize <= MAX_SIZE;
}

export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  // Remove special characters
  // Preserve original extension
  return sanitized;
}
```

---

## 5. API SPECIFICATIONS

### Upload Image Endpoint

**Endpoint:** `POST /api/images/upload`

**Authentication:** Required (JWT token)

**Request:**
```typescript
{
  image: File,
  userId: string
}
```

**Response (Success):**
```typescript
{
  success: true,
  imageId: string,
  gcpUrl: string
}
```

**Response (Error):**
```typescript
{
  success: false,
  error: {
    message: string,
    code: string
  }
}
```

**Error Codes:**
- `INVALID_IMAGE_FORMAT` - Unsupported image format
- `IMAGE_SIZE_EXCEEDS_LIMIT` - File size > 10MB
- `IMAGE_SIZE_BELOW_MINIMUM` - File size < 1KB
- `EMPTY_FILE` - File is empty
- `UNAUTHORIZED` - Missing or invalid authentication token
- `GCP_UPLOAD_FAILED` - GCP Cloud Storage upload failed
- `METADATA_STORAGE_FAILED` - MongoDB metadata storage failed

### Retrieve Image Endpoint

**Endpoint:** `GET /api/images/{imageId}`

**Authentication:** Required (JWT token)

**Response (Success):**
- Image file with appropriate Content-Type header
- Cache-Control headers for browser caching

**Response (Error):**
- 404: Image not found
- 401: Unauthorized
- 503: Service temporarily unavailable

### Image Metadata Endpoint

**Endpoint:** `GET /api/images/{imageId}/metadata`

**Authentication:** Required (JWT token)

**Response:**
```typescript
{
  id: string,
  userId: string,
  filename: string,
  gcpObjectPath: string,
  uploadedAt: Date,
  fileSize: number,
  mimeType: string
}
```

---

## 6. GCP CLOUD STORAGE INTEGRATION

### Storage Configuration

**Bucket Name:** `wall-decor-visualizer-images` (or configured via env var)

**Object Path Structure:**
```
{userId}/{imageId}/{filename}
```

**Access Control:**
- Private by default
- Authenticated users can access their own images
- Cross-user access prevented via backend authorization

### Upload Process

1. Generate unique `imageId` using domain function
2. Sanitize filename using domain function
3. Construct GCP object path: `{userId}/{imageId}/{sanitizedFilename}`
4. Upload file to GCP Cloud Storage
5. Store metadata in MongoDB with GCP object path reference
6. Return imageId and GCP URL to client

### Retrieval Process

1. Validate authentication token
2. Verify user owns the image (userId match)
3. Retrieve image from GCP using stored object path
4. Stream image to client with appropriate headers
5. Handle GCP errors gracefully

---

## 7. AUTHENTICATION & AUTHORIZATION

### Authentication Flow

1. User enters phone number
2. Backend generates OTP (fixed "2213" for demo, random for production)
3. OTP stored in MongoDB with 10-minute TTL
4. User enters OTP
5. Backend validates OTP and generates JWT token
6. Token stored in localStorage and HTTP-only cookies
7. User authenticated and redirected to upload page

### Authorization for Image Upload

- JWT token required in Authorization header: `Bearer {token}`
- Token validated before processing upload
- User ID extracted from token and associated with image
- Cross-user access prevented: Users can only access their own images

### Token Management

- JWT expiration: 1 hour (configurable via JWT_EXPIRY env var)
- Token refresh: Automatic refresh before expiration
- Token storage: localStorage + HTTP-only cookies
- Session persistence: 30-day cookie expiration

---

## 8. UI/UX DESIGN SPECIFICATIONS

### Color Palette

**Primary Colors (Pastel Harmony):**
- Primary Accent: `#97B3AE` (Muted Teal) - Buttons, links, focus states
- Secondary Accent: `#F2C3B9` (Soft Rose) - Hover states, highlights
- Main Background: `#F0EEEA` (Off-white) - Page background
- Light Background: `#F0DDD6` (Warm Beige) - Cards, sections
- Subtle Background: `#D2E0D3` (Soft Sage) - Depth variations
- Borders: `#D6CBBF` (Taupe) - Borders, dividers

**Text Colors:**
- Primary Text: `#2d3748` (Soft Charcoal)
- Secondary Text: `#78716c` (Warm Gray)

**Utility Colors:**
- Error: `#ef4444` (Soft Red)
- Success: `#10b981` (Soft Green)
- Warning: `#f59e0b` (Soft Amber)
- Loading: `#C1E1C1` (Soft Mint Green)

### Typography

**Font Family:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen'`

**Font Sizes:**
- H1: 2.5rem (40px), Bold (700)
- H2: 2rem (32px), Bold (700)
- H3: 1.5rem (24px), Semi-bold (600)
- Body: 1rem (16px), Regular (400)
- Small: 0.875rem (14px), Regular (400)
- Caption: 0.75rem (12px), Regular (400)

### Component Specifications

**Input Field:**
```css
height: 2.75rem (44px)
padding: 0.75rem 1rem
border: 1px solid #D6CBBF
border-radius: 0.5rem (8px)
font-size: 1rem (16px)
transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1)

focus:
  border-color: #97B3AE
  box-shadow: 0 0 0 3px rgba(151, 179, 174, 0.1)

error:
  border-color: #ef4444
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1)
```

**Button (Primary):**
```css
height: 2.75rem (44px)
padding: 0.75rem 1.5rem
background: #97B3AE
color: white
border: none
border-radius: 0.5rem (8px)
font-size: 1rem (16px)
font-weight: 600
cursor: pointer
transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)

hover:
  background: #86a29d
  transform: translateY(-2px) scale(1.02)
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2)

active:
  transform: translateY(0) scale(0.98)

disabled:
  opacity: 0.5
  cursor: not-allowed
```

**Drop Zone:**
```css
border: 2px dashed #97B3AE
border-radius: 16px
padding: 3rem
text-align: center
cursor: pointer
transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)
background-color: #ffffff

hover:
  background-color: #ffffff
  border-color: #97B3AE
  box-shadow: 0 10px 30px rgba(151, 179, 174, 0.12)
  transform: translateY(-2px)
```

### Animations

**Transitions:**
- Button hover: 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)
- Input focus: 0.25s cubic-bezier(0.4, 0, 0.2, 1)
- Card hover: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)

**Keyframes:**
- Fade in: 0.6s ease-in-out
- Slide up: 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)
- Pulse: 2s ease-in-out infinite

### Responsive Design

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Adjustments:**
- Single column layout
- Larger touch targets (min 44px)
- Reduced padding
- Full-width buttons
- Simplified navigation

---

## 9. ERROR HANDLING DESIGN

### Error Display Strategies

**Inline Errors (Form validation):**
- Display below form field
- Red text color (#ef4444)
- Clear, actionable message

**Toast Notifications (API errors):**
- Display at top or bottom of screen
- Auto-dismiss after 5 seconds
- User-friendly message

**Error Boundaries (React errors):**
- Catch and display gracefully
- Log error for debugging
- Provide retry option

### Error Messages (User-Friendly)

- "Invalid image format. Please upload JPG, PNG, or WebP."
- "File size exceeds 10MB limit. Please choose a smaller file."
- "File is too small. Minimum size is 1KB."
- "Camera access denied. Please enable camera permissions."
- "Camera not available on this device."
- "Upload failed. Please check your connection and try again."
- "Network error. Please try again."

### Error Codes (For Client Handling)

- `INVALID_IMAGE_FORMAT`
- `IMAGE_SIZE_EXCEEDS_LIMIT`
- `IMAGE_SIZE_BELOW_MINIMUM`
- `EMPTY_FILE`
- `UNAUTHORIZED`
- `GCP_UPLOAD_FAILED`
- `METADATA_STORAGE_FAILED`
- `CAMERA_PERMISSION_DENIED`
- `CAMERA_NOT_AVAILABLE`
- `NETWORK_ERROR`

---

## 10. SECURITY SPECIFICATIONS

### Authentication & Authorization

- JWT token required for all image operations
- Token validated on every request
- User ID extracted from token
- Cross-user access prevented via backend authorization

### File Upload Security

- File type verification: Magic number check (not just extension)
- File size validation: Both frontend and backend
- Filename sanitization: Remove path traversal attempts
- MIME type validation: Whitelist approach

### Data Protection

- Phone numbers: SHA256 hash in logs (never plain text)
- Images: Stored in GCP with access controls
- Tokens: HTTP-only cookies + localStorage
- HTTPS: Enforced in production

### Rate Limiting

- Phone number: 3 OTP requests per 10 minutes
- IP address: 10 OTP requests per hour
- Implementation: MongoDB tracking with TTL indexes

---

## 11. PERFORMANCE SPECIFICATIONS

### Frontend Performance

- Image preview renders within 500ms
- Camera view opens within 1 second
- Upload progress updates at least 10 times per second
- Drag-and-drop responds within 100ms

### Backend Performance

- Image upload completes within 10 seconds (5MB on 4G)
- Image retrieval completes within 2 seconds
- Metadata retrieval for 100 images completes within 2 seconds
- API response time: < 200ms for validation

### Optimization Strategies

- Image compression before upload
- Lazy loading for images
- WebP format with JPEG fallback
- Response compression (gzip)
- CDN for static assets
- Database indexes on frequently queried fields

---

## 12. ACCESSIBILITY SPECIFICATIONS

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text on background: 4.5:1 minimum
- Interactive elements: 3:1 minimum
- Large text (18px+): 3:1 minimum

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

## 13. TESTING SPECIFICATIONS

### Test Coverage Requirements

- Backend: Minimum 90% code coverage
- Frontend: Minimum 85% code coverage
- Critical paths: 100% coverage required

### Test Categories

**Unit Tests:**
- Domain layer validation functions
- Component rendering and state
- API request/response handling

**Integration Tests:**
- Complete upload flow (file selection to success)
- Complete upload flow (camera capture to success)
- Error handling and recovery
- Authentication integration

**E2E Tests:**
- Complete user journey: Login → Upload → View
- Multiple uploads
- Session persistence
- Upload with logout/login

**Performance Tests:**
- Upload 5MB image completes within 10 seconds
- Image preview renders within 500ms
- Camera view opens within 1 second
- Multiple concurrent uploads (3) complete within 30 seconds

**Security Tests:**
- Prevent unauthorized image access
- Prevent cross-user image access
- Prevent file type spoofing
- Prevent path traversal attacks

**Accessibility Tests:**
- Keyboard navigation
- Screen reader compatibility
- Color contrast compliance
- Motion preferences respected

---

## 14. LOGGING & MONITORING

### Logger File Location

- Backend: `src/logger.ts` (single file at root of src/)
- Frontend: `src/logger.ts` (single file at root of src/)

### Logging Strategy

**Backend Logging:**
- API request/response logging
- Error logging with stack traces
- Performance metrics
- Authentication events

**Frontend Logging:**
- API call logging
- Error logging
- User interaction tracking
- Performance metrics

### Sensitive Data Masking

- Phone numbers: SHA256 hash only
- Tokens: Never logged
- Passwords: Never logged
- User IDs: Logged as hash

---

## 15. DEPLOYMENT CONSIDERATIONS

### Environment Configuration

**Development:**
- Local MongoDB
- Local GCP emulator (optional)
- Debug logging enabled
- Hot module replacement

**Staging:**
- Staging MongoDB
- Staging GCP bucket
- Info logging
- Similar to production

**Production:**
- Production MongoDB
- Production GCP bucket
- Error logging only
- Performance monitoring
- HTTPS enforced

### Build Process

**Frontend:**
```bash
npm run build
# Output: dist/
# - Minified JS/CSS
# - Optimized images
# - Source maps (optional)
```

**Backend:**
```bash
npm run build
# Output: dist/
# - Compiled TypeScript
# - Source maps
```

---

## 16. IMPLEMENTATION CHECKLIST

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

## 17. QUICK REFERENCE: KEY DECISIONS

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Image Formats | JPEG, PNG, WebP | Common web formats, good compression |
| Max File Size | 10MB | Balance between quality and upload speed |
| Min File Size | 1KB | Prevent empty/corrupted files |
| Storage | GCP Cloud Storage | Scalable, secure, managed service |
| Metadata DB | MongoDB | Flexible schema, good for metadata |
| Authentication | JWT + OTP | Secure, stateless, phone-based |
| Token Expiry | 1 hour | Balance between security and UX |
| Error Handling | User-friendly messages | Improve user experience |
| Validation | Frontend + Backend | UX feedback + security |
| Logging | Single logger.ts file | Centralized, maintainable |
| Architecture | DDD with namespace imports | Clear separation, maintainability |

---

## 18. REFERENCES

- **Design Document:** `.kiro/specs/wall-decor-visualizer/design.md`
- **DDD Rules:** `.kiro/specs/wall-decor-visualizer/global-setup/DDD_RULES_REFERENCE.md`
- **Test Plan:** `.kiro/specs/wall-decor-visualizer/image-upload_playground/test_plan.md`
- **UI Mockup:** `.kiro/specs/wall-decor-visualizer/image-upload_playground/ui_mockup_reference.html`
- **Requirements:** `.kiro/specs/wall-decor-visualizer/requirements.md`

