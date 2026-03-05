# Image Upload Feature - DDD Architecture Implementation Guide

This document applies the universal DDD (Domain-Driven Design) rules from `global-setup/DDD_RULES_REFERENCE.md` specifically to the image upload feature implementation.

---

## 1. BACKEND ARCHITECTURE (data-service)

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

### Key DDD Rules Applied

#### RULE 1: src/ Directory Structure
- ✅ ONLY `data-service/` and `page-service/` folders in src/
- ❌ NO `components/`, `pages/`, `errors/`, `validators/`, `helpers/`, `utils/` folders
- ❌ NO `middleware/`, `guards/`, `interceptors/`, `decorators/` folders

#### RULE 2: data-service Structure
- ✅ One API file per endpoint: `upload_image.api.ts`
- ✅ Domain types in `image_schema.ts` (REQUIRED)
- ✅ Domain logic + validation in `index.ts`
- ✅ All errors in `application/errors.ts`
- ❌ NO nested domain folders
- ❌ NO importing domain types into application layer
- ❌ NO cross-domain imports

#### RULE 1.5: NO Abstraction Folders
- ❌ NO `middleware/` folder for authentication
- ❌ NO `validators/` folder for validation logic
- ❌ NO `helpers/` or `utils/` folders

**CORRECT PATTERN:**
- Authentication logic → `data-service/application/auth/authenticate_jwt.api.ts`
- Validation logic → `data-service/domain/image-upload/index.ts`
- File utilities → `data-service/domain/image-upload/index.ts`

---

## 2. DOMAIN LAYER (image-upload)

### File: `domain/image-upload/image_schema.ts`

**Purpose:** Type definitions only - NO logic

```typescript
// Domain types (business models)
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

**Key Rules:**
- ✅ Types only - no functions
- ✅ Represents core business models
- ✅ NEVER imported into application layer
- ❌ NO logic or functions
- ❌ NO error classes

### File: `domain/image-upload/index.ts`

**Purpose:** Domain business logic and validation functions

```typescript
// Domain logic functions (pure, stateless)
export function validateImageFormat(mimeType: string): boolean { }
export function validateImageSize(fileSize: number): boolean { }
export function generateImageId(): string { }
export function sanitizeFilename(filename: string): string { }
export function extractImageMetadata(file: File): IImageMetadata { }
```

**Key Rules:**
- ✅ Pure, stateless functions
- ✅ Business logic and validation
- ✅ Called from application layer via namespace import
- ✅ Can use types from `image_schema.ts`
- ❌ NO HTTP/API logic
- ❌ NO database operations (those go in application layer)
- ❌ NO error throwing (validation returns boolean)

### File: `domain/image-upload/interface.ts` (Optional)

**Purpose:** Additional interfaces if needed

```typescript
export interface IImageMetadata {
  id: string;
  userId: string;
  filename: string;
  // ... other fields
}
```

---

## 3. APPLICATION LAYER (image-upload)

### File: `application/image-upload/upload_image.api.ts`

**Purpose:** API contract and endpoint implementation

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
export async function uploadImageHandler(req: Request, res: Response): Promise<void> {
  // 1. Validate input
  // 2. Call domain functions via namespace
  // 3. Handle database operations
  // 4. Return response
}
```

**Key Rules:**
- ✅ API contract types (IUploadImageRequest, IUploadImageResponse)
- ✅ Thin layer focused on HTTP mapping
- ✅ Calls domain functions via namespace import
- ✅ Handles database operations
- ✅ Handles error mapping to HTTP responses
- ❌ NO business logic (that's in domain)
- ❌ NO importing domain types (IImage, etc.)

### File: `application/image-upload/index.ts`

**Purpose:** Export API functions

```typescript
export { uploadImageHandler } from './upload_image.api.js';
```

---

## 4. ERROR HANDLING

### File: `application/errors.ts`

**Purpose:** ALL errors for data-service in one file

```typescript
export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export class InvalidImageFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidImageFormatError';
  }
}

export class InvalidImageSizeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidImageSizeError';
  }
}

export class GCPUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GCPUploadError';
  }
}
```

**Key Rules:**
- ✅ All errors in `application/errors.ts`
- ✅ One error class per error type
- ✅ Error classes extend Error
- ✅ Named descriptively: `{Feature}Error`
- ❌ NO separate `errors/` folder
- ❌ NO error files scattered across domains

---

## 5. IMPORT PATTERN: Namespace Imports

### RULE 13: Domain Import Pattern

**Application layer MUST import domain as namespace:**

```typescript
// ✅ CORRECT - Import domain as namespace
import * as ImageUploadDomain from '../../domain/image-upload/index.js';

export async function uploadImageHandler(req: Request, res: Response): Promise<void> {
  const { image, userId } = req.body;
  
  // Validate using domain namespace
  if (!ImageUploadDomain.validateImageFormat(image.mimeType)) {
    res.status(400).json({ error: 'Invalid image format' });
    return;
  }
  
  // Sanitize using domain namespace
  const sanitized = ImageUploadDomain.sanitizeFilename(image.name);
  
  // Generate ID using domain namespace
  const imageId = ImageUploadDomain.generateImageId();
  
  // Call domain business logic
  const metadata = ImageUploadDomain.extractImageMetadata(image);
  
  res.status(200).json({ success: true, imageId });
}
```

**Key Rules:**
- ✅ Import domain as namespace: `import * as DomainName`
- ✅ Call methods through namespace: `DomainName.method()`
- ✅ Makes domain calls explicit and traceable
- ❌ NO individual function imports from domain
- ❌ NO destructured imports from domain

---

## 6. TYPE SYSTEM & INTERFACES

### RULE 6: Type Definition Strategy

**Domain Types (Internal Business Models):**
- Location: `domain/image-upload/image_schema.ts`
- Examples: `IImage`, `ImageFormat`, `UploadStatus`
- Usage: Internal domain logic only
- Import: ❌ NEVER import into application layer

**Application Types (API Contracts):**
- Location: `application/image-upload/upload_image.api.ts`
- Examples: `IUploadImageRequest`, `IUploadImageResponse`
- Usage: API request/response handling
- Import: ❌ NEVER import into domain layer

**Example - CORRECT:**

```typescript
// ✅ CORRECT - Separate types for each layer

// domain/image-upload/image_schema.ts
export interface IImage {
  id: string;
  userId: string;
  filename: string;
  gcpObjectPath: string;
  uploadedAt: Date;
  fileSize: number;
  mimeType: string;
}

// application/image-upload/upload_image.api.ts
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

// ❌ INCORRECT - Importing domain types to application
import { IImage } from '../../domain/image-upload/image_schema.ts';
export const handleUpload = (image: IImage): void => { };
```

---

## 7. FUNCTION PARAMETER RULES

### RULE 7: Parameter Organization

**1-3 Parameters: Use Individual Parameters**
```typescript
export const validateImageFormat = (mimeType: string, fileSize: number): boolean => {
  return !!mimeType && fileSize > 0;
};
```

**4+ Parameters: Use Destructured Object**
```typescript
export const createImageMetadata = ({ 
  id, 
  userId, 
  filename, 
  gcpObjectPath, 
  fileSize 
}: {
  id: string;
  userId: string;
  filename: string;
  gcpObjectPath: string;
  fileSize: number;
}): IImage => {
  return { id, userId, filename, gcpObjectPath, fileSize };
};
```

**External API Requests: Always Use Typed Object**
```typescript
export interface IUploadImageRequest {
  image: File;
  userId: string;
}

export const uploadImageApi = async (request: IUploadImageRequest): Promise<IUploadImageResponse> => {
  const response = await api.post('/api/images/upload', request);
  return response.data;
};
```

---

## 8. TYPESCRIPT TYPES-ONLY APPROACH

### RULE 8: No Classes for Domain Models

**✅ CORRECT - Types only:**
```typescript
export type ImageFormat = 'jpeg' | 'png' | 'webp';
export interface IImage {
  id: string;
  userId: string;
  filename: string;
}
```

**❌ INCORRECT - Classes not allowed for domain models:**
```typescript
export class Image {
  id: string;
  userId: string;
  filename: string;
}
```

**Exception: Error Classes Are Allowed**
```typescript
// ✅ CORRECT - Error classes are allowed
export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadError';
  }
}
```

---

## 9. FRONTEND ARCHITECTURE (page-service)

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
    │   ├── ImageUploader.tsx (component - FLAT)
    │   ├── CameraCapture.tsx (component - FLAT)
    │   ├── upload_page.module.css
    │   ├── index.ts (page logic functions)
    │   └── interface.ts (optional)
    └── index.ts
```

### RULE 3: page-service Structure

**Key Rules:**
- ✅ All components FLAT in page domain folder
- ✅ NO nested component folders
- ✅ One API file per page: `upload_page.api.ts`
- ✅ Page logic in `index.ts`
- ✅ All errors in `application/errors.ts`
- ✅ Optional `{component}_logic.ts` for component-specific logic
- ❌ NO schema files for pages or components
- ❌ NO nested folders for components
- ❌ NO separate `components/` folder in src/
- ❌ NO separate `pages/` folder in src/

### Component Structure - FLAT (No Nested Folders)

**UploadPage.tsx** (Main page component)
- Manages upload state and flow
- Displays upload options
- Integrates ImageUploader and CameraCapture

**ImageUploader.tsx** (File upload component - FLAT)
- Drag-and-drop functionality
- Click-to-select file browser
- Image preview display

**CameraCapture.tsx** (Camera capture component - FLAT)
- Camera permission handling
- Live camera feed display
- Image capture functionality

**upload_page.module.css** (Styles)
- All styles for upload page and components

**index.ts** (Page logic functions)
- Page-specific utility functions
- State management helpers

---

## 10. NAMING CONVENTIONS

### RULE 4: File Naming Conventions

**Backend API naming:**
- API names reflect what the SERVER DOES, not the UI action
- Example: "Send OTP" button → `generate_otp` API (not `send_otp`)
- Example: "Upload Image" button → `upload_image` API

**Folder Names:**
- ALWAYS kebab-case: `data-service`, `page-service`, `image-upload`, `upload-page`

**Frontend File Names:**
| Type | Pattern | Example |
|------|---------|---------|
| API files | `{feature}.api.ts` | `upload_image.api.ts` |
| Schema files | `{domain}_schema.ts` | `image_schema.ts` |
| Interface files | `interface.ts` | `interface.ts` |
| Domain logic | `index.ts` | `index.ts` |
| Styles | `*.module.css` | `upload_page.module.css` |
| Tests | `*.test.tsx` | `ImageUploader.test.tsx` |

**Backend File Names:**
| Type | Pattern | Example |
|------|---------|---------|
| Schema files | `{domain}_schema.ts` | `image_schema.ts` |
| Interface files | `interface.ts` | `interface.ts` |
| Domain logic | `index.ts` | `index.ts` |
| Tests | `*.test.ts` | `image_upload.test.ts` |

**Functions & Variables:**
- Functions: `camelCase` → `validateImageFormat()`, `generateImageId()`
- Components: `PascalCase` → `ImageUploader`, `CameraCapture`
- Constants: `UPPER_SNAKE_CASE` → `MAX_FILE_SIZE`, `SUPPORTED_FORMATS`

---

## 11. LOGGER FILE CREATION

### RULE 14: Logger File Location

**Backend:** `src/logger.ts` (single file at root of src/)
**Frontend:** `src/logger.ts` (single file at root of src/)

**Key Rules:**
- ✅ Only ONE logger.ts file per project
- ✅ Located at `src/logger.ts` (root of src folder)
- ✅ Exports logging functions for API calls, responses, and errors
- ✅ Used in application layer for HTTP logging
- ❌ NO separate `loggers/` folder
- ❌ NO feature-specific logger files
- ❌ NO logging in domain layer (only application layer)

---

## 12. NO GENERIC/HELPER FILES

### RULE 10: Feature-Specific Files Only

**❌ FORBIDDEN:**
- `helpers.ts`, `utils.ts`, `manager.ts`, `common.ts`
- `common/` folder
- `validators/` folder (validation goes in domain layer)
- Any generic catch-all files

**✅ CORRECT PATTERN:**
- Feature-specific files: `date_formatter.ts` (NOT `formatters.ts`)
- Validation logic: In domain layer `index.ts`
- File utilities: In domain layer `index.ts`

---

## 13. ERROR HANDLING - NO SILENT FAILURES

### RULE 12: Error Handling Best Practices

**❌ WRONG - Silent error suppression:**
```typescript
try {
  await processUpload(file);
} catch (error) {
  // Empty catch - error is silently ignored!
}

try {
  return mongoose.model('Image', ImageSchema);
} catch (error) {
  console.log('Error occurred'); // Logged but not handled
  return null; // Silent failure
}
```

**✅ CORRECT:**
```typescript
// Conditional check instead of try-catch
if (mongoose.models.Image) {
  return mongoose.models.Image;
}
return mongoose.model('Image', ImageSchema);

// Catch specific error and re-throw others
try {
  await processUpload(file);
} catch (error) {
  if (error instanceof InvalidImageFormatError) {
    return { success: false, error: error.message };
  }
  // Re-throw unexpected errors
  throw error;
}
```

**Key Rules:**
- ✅ Use conditional logic for existence checks
- ✅ Catch only errors you can handle
- ✅ Re-throw unexpected errors
- ✅ Let errors bubble up if you can't handle them
- ❌ NO empty catch blocks
- ❌ NO silent error suppression
- ❌ NO catching all errors without re-throwing

---

## 14. IMPLEMENTATION CHECKLIST

### Backend Implementation

- [ ] Create domain folder: `data-service/domain/image-upload/`
- [ ] Create `image_schema.ts` with type definitions (REQUIRED)
- [ ] Create `index.ts` with domain logic functions
- [ ] Create `interface.ts` if needed (optional)
- [ ] Create API file: `data-service/application/image-upload/upload_image.api.ts`
- [ ] Add error classes to `data-service/application/errors.ts`
- [ ] Export domain from `data-service/domain/index.ts`
- [ ] Export API from `data-service/application/index.ts`
- [ ] Implement namespace imports in application layer
- [ ] Implement error handling and mapping
- [ ] Add logging to application layer

### Frontend Implementation

- [ ] Create page domain folder: `page-service/domain/upload-page/`
- [ ] Create `UploadPage.tsx` component
- [ ] Create `ImageUploader.tsx` component (FLAT)
- [ ] Create `CameraCapture.tsx` component (FLAT)
- [ ] Create `upload_page.module.css` styles
- [ ] Create `index.ts` with page logic functions
- [ ] Create `interface.ts` if needed (optional)
- [ ] Create API file: `page-service/application/upload/upload_page.api.ts`
- [ ] Add error classes to `page-service/application/errors.ts`
- [ ] Export page domain from `page-service/domain/index.ts`
- [ ] Export API from `page-service/application/index.ts`
- [ ] Implement error handling
- [ ] Add logging to application layer

### Verification Checklist

- [ ] NO folders in `src/` except `data-service/`, `page-service/`, and root files
- [ ] NO `middleware/`, `guards/`, `validators/`, `helpers/`, `utils/` folders
- [ ] All domain types in `{domain}_schema.ts`
- [ ] All domain logic in `domain/{domain}/index.ts`
- [ ] All errors in `application/errors.ts`
- [ ] Application layer uses namespace imports for domain
- [ ] NO domain types imported into application layer
- [ ] All components FLAT in page domain (no nested folders)
- [ ] Only ONE `logger.ts` file at `src/logger.ts`
- [ ] All feature-specific files (no generic helpers)

---

## 15. QUICK REFERENCE: DDD PRINCIPLES

| Principle | Application | Violation |
|-----------|-------------|-----------|
| Separation of Concerns | Domain logic separate from HTTP logic | Mixing business logic with API handling |
| Type Safety | Domain types ≠ API types | Importing domain types into application |
| Namespace Imports | `import * as Domain` | Individual function imports |
| Error Handling | Specific error classes | Generic catch-all errors |
| File Organization | Feature-specific files | Generic `utils/`, `helpers/` folders |
| Component Structure | FLAT components in page domain | Nested component folders |
| Logger Centralization | Single `logger.ts` file | Feature-specific logger files |
| No Silent Failures | Catch and re-throw | Empty catch blocks |

---

## 16. REFERENCES

- **Global DDD Rules:** `.kiro/specs/wall-decor-visualizer/global-setup/DDD_RULES_REFERENCE.md`
- **Design Reference:** `.kiro/specs/wall-decor-visualizer/image-upload_playground/DESIGN_REFERENCE.md`
- **API Parameters:** `.kiro/specs/wall-decor-visualizer/image-upload_playground/API_PARAMETERS.md`
- **Test Plan:** `.kiro/specs/wall-decor-visualizer/image-upload_playground/test_plan.md`
