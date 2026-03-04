# Wall Decor Visualizer - Code Architecture

This document defines the code structure, organization patterns, and conventions for the Wall Decor Visualizer project using Domain-Driven Design (DDD).

---

## Frontend Architecture (DDD Pattern)

### Folder Structure

```
wall-decor-visualizer-frontend/
├── .gitlab/
│   └── merge-request-templates/
│       └── mr_description.md
│
├── configs/
│   ├── development/
│   │   ├── api_config.json
│   │   └── app_config.json
│   ├── production/
│   │   ├── api_config.json
│   │   └── app_config.json
│   └── global_config.json
│
├── schema/
│   ├── user_schema.json
│   ├── image_schema.json
│   └── visualization_schema.json
│
├── scripts/
│   ├── setup.ts
│   └── build.ts
│
├── src/
│   ├── data-service/
│   │   ├── application/
│   │   │   ├── auth/
│   │   │   │   ├── login.api.ts
│   │   │   │   ├── logout.api.ts
│   │   │   │   ├── refresh.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── image/
│   │   │   │   ├── upload_image.api.ts
│   │   │   │   ├── get_image.api.ts
│   │   │   │   ├── delete_image.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── gemini/
│   │   │   │   ├── generate_script.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── blender/
│   │   │   │   ├── execute_blender.api.ts
│   │   │   │   ├── get_job_status.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── errors.ts
│   │   │   └── index.ts
│   │   └── domain/
│   │       ├── auth/
│   │       │   ├── auth_schema.ts
│   │       │   ├── interface.ts (optional)
│   │       │   └── index.ts
│   │       ├── image/
│   │       │   ├── image_schema.ts
│   │       │   ├── interface.ts (optional)
│   │       │   └── index.ts
│   │       ├── gemini/
│   │       │   ├── gemini_schema.ts
│   │       │   ├── interface.ts (optional)
│   │       │   └── index.ts
│   │       ├── blender/
│   │       │   ├── blender_schema.ts
│   │       │   ├── interface.ts (optional)
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── page-service/
│   │   ├── application/
│   │   │   ├── login/
│   │   │   │   ├── login_page.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── upload/
│   │   │   │   ├── upload_page.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── viewer/
│   │   │   │   ├── viewer_page.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard_page.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── errors.ts
│   │   │   └── index.ts
│   │   └── domain/
│   │       ├── session/
│   │       │   └── index.ts
│   │       ├── login-page/
│   │       │   ├── LoginPage.tsx
│   │       │   ├── LoginForm.tsx
│   │       │   ├── login_form.module.css
│   │       │   ├── login_form_logic.ts (optional)
│   │       │   ├── index.ts
│   │       │   └── interface.ts (optional)
│   │       ├── upload-page/
│   │       │   ├── UploadPage.tsx
│   │       │   ├── ImageUpload.tsx
│   │       │   ├── CameraCapture.tsx
│   │       │   ├── FileUpload.tsx
│   │       │   ├── UploadProgress.tsx
│   │       │   ├── image_upload.module.css
│   │       │   ├── image_upload_logic.ts (optional)
│   │       │   ├── index.ts
│   │       │   └── interface.ts (optional)
│   │       ├── viewer-page/
│   │       │   ├── ViewerPage.tsx
│   │       │   ├── ModelViewer.tsx
│   │       │   ├── ViewportControls.tsx
│   │       │   ├── ModelCatalog.tsx
│   │       │   ├── model_viewer.module.css
│   │       │   ├── model_viewer_logic.ts (optional)
│   │       │   ├── index.ts
│   │       │   └── interface.ts (optional)
│   │       ├── dashboard-page/
│   │       │   ├── DashboardPage.tsx
│   │       │   ├── index.ts
│   │       │   └── interface.ts (optional)
│   │       ├── not-found-page/
│   │       │   ├── NotFoundPage.tsx
│   │       │   ├── index.ts
│   │       │   └── interface.ts (optional)
│   │       └── index.ts
│   │
│   ├── App.tsx
│   ├── app.module.css
│   ├── main.tsx
│   └── vite_env.d.ts
│
├── formatters/
│   ├── date_formatter.ts
│   ├── image_formatter.ts
│   └── dimension_formatter.ts
│
├── constants/
│   ├── api_constants.ts
│   ├── validation_constants.ts
│   └── ui_constants.ts
│
├── hooks/
│   ├── use_auth.ts
│   ├── use_image_upload.ts
│   ├── use_camera.ts
│   ├── use_api.ts
│   └── use_local_storage.ts
│
├── store/
│   ├── slices/
│   │   ├── auth_slice.ts
│   │   ├── upload_slice.ts
│   │   ├── viewer_slice.ts
│   │   └── ui_slice.ts
│   ├── store.ts
│   └── hooks.ts
│
├── types/
│   ├── index.ts
│   ├── api.ts
│   └── models.ts
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── reset.css
│
├── dist/
├── test/
│   ├── unit/
│   │   ├── data-service/
│   │   │   ├── domain/
│   │   │   └── application/
│   │   ├── page-service/
│   │   │   ├── domain/
│   │   │   └── application/
│   │   └── fixtures/
│   ├── integration/
│   │   ├── auth.test.tsx
│   │   ├── upload.test.tsx
│   │   └── viewer.test.tsx
│   └── fixtures/
│       └── mock_data.ts
│
├── test-reports/
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── .env.example
├── .env.local
├── .env.production
├── vite.config.ts
├── tsconfig.json
├── package.json
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```

---

## Backend Architecture

### Folder Structure

```
wall-decor-visualizer-backend/
├── .gitlab/
│   └── merge-request-templates/
│       └── mr_description.md
│
├── configs/
│   ├── development/
│   │   ├── database_config.json
│   │   ├── gcp_config.json
│   │   └── gemini_config.json
│   ├── production/
│   │   ├── database_config.json
│   │   ├── gcp_config.json
│   │   └── gemini_config.json
│   ├── global_config.json
│   └── environment.ts
│
├── schema/
│   ├── user_schema.json
│   ├── session_schema.json
│   ├── image_schema.json
│   ├── visualization_schema.json
│   └── job_schema.json
│
├── scripts/
│   ├── seed_database.ts
│   ├── migrations.ts
│   └── setup.ts
│
├── src/
│   ├── data-service/
│   │   ├── application/
│   │   │   ├── auth/
│   │   │   │   ├── login.api.ts
│   │   │   │   ├── logout.api.ts
│   │   │   │   ├── refresh.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── image/
│   │   │   │   ├── upload_image.api.ts
│   │   │   │   ├── get_image.api.ts
│   │   │   │   ├── delete_image.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── gemini/
│   │   │   │   ├── generate_script.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── blender/
│   │   │   │   ├── execute_blender.api.ts
│   │   │   │   ├── get_job_status.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── errors.ts
│   │   │   └── index.ts
│   │   └── domain/
│   │       ├── auth/
│   │       │   ├── auth_schema.ts
│   │       │   ├── interface.ts (optional)
│   │       │   └── index.ts
│   │       ├── image/
│   │       │   ├── image_schema.ts
│   │       │   ├── interface.ts (optional)
│   │       │   └── index.ts
│   │       ├── gemini/
│   │       │   ├── gemini_schema.ts
│   │       │   ├── interface.ts (optional)
│   │       │   └── index.ts
│   │       ├── blender/
│   │       │   ├── blender_schema.ts
│   │       │   ├── interface.ts (optional)
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── page-service/
│   │   ├── application/
│   │   │   ├── login/
│   │   │   │   ├── login_page.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── upload/
│   │   │   │   ├── upload_page.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── viewer/
│   │   │   │   ├── viewer_page.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard_page.api.ts
│   │   │   │   └── index.ts
│   │   │   ├── errors.ts
│   │   │   └── index.ts
│   │   └── domain/
│   │       ├── session/
│   │       │   └── index.ts
│   │       ├── login-page/
│   │       │   ├── index.ts
│   │       │   └── interface.ts (optional)
│   │       ├── upload-page/
│   │       │   ├── index.ts
│   │       │   └── interface.ts (optional)
│   │       ├── viewer-page/
│   │       │   ├── index.ts
│   │       │   └── interface.ts (optional)
│   │       ├── dashboard-page/
│   │       │   ├── index.ts
│   │       │   └── interface.ts (optional)
│   │       └── index.ts
│   │
│   └── server.ts
│
├── formatters/
│   ├── date_formatter.ts
│   ├── image_formatter.ts
│   └── dimension_formatter.ts
│
├── constants/
│   ├── api_constants.ts
│   ├── validation_constants.ts
│   └── database_constants.ts
│
├── logger/
│   ├── request_logger.ts
│   ├── error_logger.ts
│   └── performance_logger.ts
│
├── dist/
├── test/
│   ├── unit/
│   │   ├── data-service/
│   │   │   ├── domain/
│   │   │   └── application/
│   │   ├── page-service/
│   │   │   ├── domain/
│   │   │   └── application/
│   │   └── fixtures/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── images.test.ts
│   │   ├── gemini.test.ts
│   │   └── blender.test.ts
│   └── fixtures/
│       └── test_data.ts
│
├── test-reports/
├── .env.example
├── .env.local
├── .env.production
├── tsconfig.json
├── package.json
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```

---

## Domain-Driven Design (DDD) Architecture

### Core Principles

**Service Isolation:**
- data-service and page-service are completely isolated
- No direct imports between services
- Communication only through API calls

**Application Layer:**
- Contains all API calls to backend
- One file per API endpoint
- Named as `{feature}.api.ts`
- Exports all APIs through `index.ts`

**Domain Layer:**
- Contains core business logic for each domain
- Each domain has exactly 3 files:
  - `{domain}_schema.ts`: Type definitions and interfaces (TypeScript types only, no classes)
  - `interface.ts`: Additional interface definitions if needed
  - `index.ts`: Domain logic and functions
- Domains are isolated - cannot import from other domains

**Domain Layer Rules:**

**data-service domains (MUST have schema files):**
- Each domain has exactly 3 files:
  - `{domain}_schema.ts`: Type definitions and interfaces (TypeScript types only, no classes)
  - `interface.ts`: Additional interface definitions if needed
  - `index.ts`: Domain logic and functions
- Domains are isolated - cannot import from other domains
- Cannot import domain types into application layer

**page-service domains (NO schema files required):**
- Each component domain contains:
  - `index.ts`: Component logic functions ONLY
  - `interface.ts`: Optional - only if additional interfaces are needed
  - NO schema files required
- Domains are isolated from each other
- Can call data-service domains to fetch data
- Logic functions work with inline types or data-service types

### Example: data-service Structure

**Application Layer (API Calls):**
```typescript
// data-service/application/auth/login.api.ts
import { api } from '@validators/email_validator';

// Application layer defines its own request/response types
export interface ILoginApiRequest {
  email: string;
  password: string;
}

export interface ILoginApiResponse {
  success: boolean;
  token: string;
  userId: string;
}

export const loginApi = async (credentials: ILoginApiRequest): Promise<ILoginApiResponse> => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};
```

**Domain Layer (Business Logic):**
```typescript
// data-service/domain/auth/auth_schema.ts
// Domain defines its own types - separate from application layer
export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface IAuthToken {
  token: string;
  expiresAt: number;
  userId: string;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'expired';

// data-service/domain/auth/index.ts
import { IUser, IAuthToken } from './auth_schema';

// Domain logic works with domain types only
export const validateUserCredentials = (user: IUser, password: string): boolean => {
  return !!user.id && !!user.passwordHash;
};

export const generateAuthToken = (userId: string): IAuthToken => {
  return {
    token: generateToken(),
    expiresAt: Date.now() + 3600000,
    userId
  };
};
```

**Key Principle:**
- Application layer has `ILoginApiRequest` and `ILoginApiResponse`
- Domain layer has `IUser` and `IAuthToken`
- Application layer does NOT import domain types
- Each layer owns its type definitions

### Example: page-service Structure

**Important: Components as Domains in page-service**

In page-service, each component can be treated as a domain. This means:
- Each UI component (LoginForm, ImageUpload, etc.) can have its own domain folder
- Each component domain contains the component logic, state management, and UI rendering
- Component domains can call data-service domains to fetch data
- Component domains are isolated from each other

**Application Layer (Page Orchestration):**
```typescript
// page-service/application/login/login_page.api.ts
import { loginApi } from '@data-service/application/auth';
import { validateLoginResponse } from '@data-service/domain/auth';
import { storeUserSession } from '../domain/session/index';

export const handleLoginPage = async (email: string, password: string) => {
  const response = await loginApi({ email, password });
  
  if (validateLoginResponse(response)) {
    storeUserSession(response.user, response.token);
    return { success: true, user: response.user };
  }
  
  return { success: false, error: 'Login failed' };
};
```

**Domain Layer (Page Logic & Component Domains):**

Each component can be a domain in page-service. Page-service domains do NOT require schema files - they only contain logic.

```typescript
// page-service/domain/session/index.ts
// Session domain logic (no schema file needed)
export const storeUserSession = (user: IUser, token: string) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

export const getStoredSession = () => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  return { user: user ? JSON.parse(user) : null, token };
};

// page-service/domain/login-form/index.ts
// Component domain for LoginForm component (no schema file needed)
export const initializeLoginForm = () => {
  return {
    email: '',
    password: '',
    isLoading: false,
    error: null
  };
};

export const validateLoginForm = (state: { email: string; password: string }): boolean => {
  return !!state.email && !!state.password && state.email.includes('@');
};

export const handleLoginFormSubmit = async (
  state: { email: string; password: string },
  onSubmit: (email: string, password: string) => Promise<void>,
  onError: (error: string) => void
): Promise<void> => {
  if (!validateLoginForm(state)) {
    onError('Invalid email or password');
    return;
  }
  
  try {
    await onSubmit(state.email, state.password);
  } catch (error) {
    onError(error.message);
  }
};

// page-service/domain/image-upload/index.ts
// Component domain for ImageUpload component (no schema file needed)
export const initializeImageUpload = () => {
  return {
    files: [],
    uploadProgress: 0,
    isUploading: false,
    error: null
  };
};

export const validateImageFile = (
  file: File,
  maxSize: number,
  acceptedFormats: string[]
): boolean => {
  if (file.size > maxSize) {
    return false;
  }
  
  const extension = file.name.split('.').pop()?.toLowerCase();
  return acceptedFormats.includes(extension || '');
};

export const handleImageUpload = async (
  files: File[],
  maxSize: number,
  acceptedFormats: string[],
  onUploadComplete: (files: File[]) => Promise<void>
): Promise<void> => {
  const validFiles = files.filter(file => validateImageFile(file, maxSize, acceptedFormats));
  
  if (validFiles.length === 0) {
    throw new Error('No valid files to upload');
  }
  
  await onUploadComplete(validFiles);
};
```

**Key Principle: Components as Domains in page-service**
- Each component in page-service can have its own domain folder
- Page-service component domains contain:
  - `index.ts`: Component logic functions ONLY (no schema file required)
  - `interface.ts`: Optional - only if additional interfaces are needed
- Component domains are isolated from each other
- Component domains can call data-service domains to fetch data
- This keeps component logic organized and testable
- **Important**: page-service domains do NOT require schema files - they only contain logic functions

---

## Backend Architecture (DDD Pattern)

The backend follows the same DDD architecture as the frontend with data-service and page-service separation.

### Core Principles

**Service Isolation:**
- data-service: Handles all data operations (auth, images, gemini, blender)
- page-service: Handles page-level UI construction by calling data-service
- No direct imports between services
- Communication only through API calls

**Application Layer:**
- Contains all API endpoint handlers
- One file per API endpoint
- Named as `{feature}.api.ts`
- Exports all APIs through `index.ts`

**Domain Layer:**
- data-service domains: Contain core business logic for data operations
- page-service domains: Represent pages shown to users, orchestrate data-service calls to build UI
- Each domain has exactly 3 files:
  - `{domain}_schema.ts`: Type definitions and interfaces (TypeScript types only, no classes)
  - `interface.ts`: Additional interface definitions if needed
  - `index.ts`: Domain logic and functions
- Domains are isolated - cannot import from other domains in same service
- page-service domains CAN call data-service domains to fetch data for UI construction

### Example: Backend data-service Structure

**Application Layer (API Handlers):**
```typescript
// data-service/application/auth/login.api.ts
import { Request, Response } from 'express';
import { validateLoginRequest } from '../domain/auth/index';
import { ILoginRequest, ILoginResponse } from '../domain/auth/auth_schema';

export const handleLogin = async (req: Request, res: Response): Promise<void> => {
  const credentials: ILoginRequest = req.body;
  
  if (!validateLoginRequest(credentials)) {
    res.status(400).json({ error: 'Invalid credentials' });
    return;
  }
  
  const response: ILoginResponse = await authenticateUser(credentials);
  res.json(response);
};
```

**Domain Layer (Business Logic):**
```typescript
// data-service/domain/auth/auth_schema.ts
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  success: boolean;
  user: IUser;
  token: string;
  expiresIn: number;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'expired';

// data-service/domain/auth/index.ts
import { ILoginRequest } from './auth_schema';

export const validateLoginRequest = (request: ILoginRequest): boolean => {
  return !!request.email && !!request.password;
};
```

### Example: Backend page-service Structure

**Page-service Purpose:**
- Domains in page-service call data-service to fetch data and build the UI response
- Each domain represents a page shown to the user
- Domains orchestrate data-service calls to construct complete page data

**Application Layer (Page Handlers):**
```typescript
// page-service/application/login/login_page.api.ts
import { Request, Response } from 'express';
import { buildLoginPageUI } from '../domain/login-page/index';

export const handleLoginPageRequest = async (req: Request, res: Response): Promise<void> => {
  const pageData = await buildLoginPageUI();
  res.json(pageData);
};
```

**Domain Layer (Page UI Construction):**
```typescript
// page-service/domain/login-page/login_page_schema.ts
export interface ILoginPageUI {
  title: string;
  form: ILoginForm;
  footer: IFooter;
}

export interface ILoginForm {
  fields: IFormField[];
  submitButton: IButton;
}

// page-service/domain/login-page/index.ts
import { loginApi } from '@data-service/application/auth';
import { ILoginPageUI } from './login_page_schema';

export const buildLoginPageUI = async (): Promise<ILoginPageUI> => {
  // Call data-service to get auth data
  const authData = await loginApi();
  
  // Build UI structure for login page
  return {
    title: 'Login',
    form: {
      fields: [
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'password', type: 'password', label: 'Password' }
      ],
      submitButton: { text: 'Login', action: 'submit' }
    },
    footer: { text: 'Forgot password?' }
  };
};
```

**Example: Upload Page Domain (Calls data-service)**
```typescript
// page-service/domain/upload-page/upload_page_schema.ts
export interface IUploadPageUI {
  title: string;
  uploadArea: IUploadArea;
  recentImages: IImage[];
  catalog: ICatalog;
}

// page-service/domain/upload-page/index.ts
import { getImages } from '@data-service/application/image';
import { getCatalog } from '@data-service/application/catalog';
import { IUploadPageUI } from './upload_page_schema';

export const buildUploadPageUI = async (userId: string): Promise<IUploadPageUI> => {
  // Call data-service to fetch user's images
  const userImages = await getImages(userId);
  
  // Call data-service to fetch catalog
  const catalog = await getCatalog();
  
  // Build complete upload page UI
  return {
    title: 'Upload & Visualize',
    uploadArea: { maxSize: 10485760, acceptedFormats: ['jpg', 'png'] },
    recentImages: userImages.slice(0, 5),
    catalog: catalog
  };
};
```

---

## Naming Conventions

### Folders

- **Kebab-case** for all folder names (e.g., `data-service`, `page-service`, `auth`, `image-upload`)
- Applies to all directory levels: services, domains, components, utilities

### Files

**Frontend:**
- Components: `PascalCase.tsx` (e.g., `LoginForm.tsx`)
- Hooks: `use_xxx.ts` (e.g., `use_auth.ts`)
- API files: `{feature}.api.ts` (e.g., `login.api.ts`)
- Schema files: `{domain}_schema.ts` (e.g., `auth_schema.ts`) - TypeScript types and interfaces only
- Interface files: `interface.ts` (e.g., in `auth/interface.ts`)
- Domain logic: `index.ts`
- Styles: `*.module.css` (e.g., `login_form.module.css`)
- Tests: `*.test.tsx` or `*.spec.tsx`
- Redux slices: `{feature}_slice.ts` (e.g., `auth_slice.ts`)
- Validators: `{feature}_validator.ts` (e.g., `email_validator.ts`)
- Formatters: `{feature}_formatter.ts` (e.g., `date_formatter.ts`)
- Constants: `{feature}_constants.ts` (e.g., `api_constants.ts`)
- Errors: `{feature}_error.ts` (e.g., `auth_error.ts`)

**Backend:**
- Controllers: `{feature}_controller.ts` (e.g., `auth_controller.ts`)
- Services: `{feature}_service.ts` (e.g., `image_service.ts`)
- Models: `PascalCase.ts` (e.g., `User.ts`, `Session.ts`)
- Routes: `{feature}.ts` (e.g., `auth.ts`, `images.ts`)
- Middleware: `{feature}.ts` (e.g., `auth.ts`, `error_handler.ts`)
- Schema files: `{domain}_schema.ts` (e.g., `auth_schema.ts`) - TypeScript types and interfaces only
- Interface files: `interface.ts` (e.g., in `auth/interface.ts`)
- Domain logic: `index.ts`
- Validators: `{feature}_validator.ts` (e.g., `email_validator.ts`)
- Formatters: `{feature}_formatter.ts` (e.g., `date_formatter.ts`)
- Constants: `{feature}_constants.ts` (e.g., `api_constants.ts`)
- Errors: `{feature}_error.ts` (e.g., `auth_error.ts`)
- Loggers: `{feature}_logger.ts` (e.g., `request_logger.ts`)
- Tests: `*.test.ts` or `*.spec.ts`

### Functions & Variables

- camelCase for functions and variables
- PascalCase for components and classes
- UPPER_SNAKE_CASE for constants

---

## Import Patterns

**Allowed Imports:**
```typescript
// ✅ Own domain logic
import { validateUserCredentials } from '../domain/auth/index';

// ✅ Own application types
import { ILoginApiRequest, ILoginApiResponse } from './login.api';

// ✅ Validators, formatters, errors (feature-specific)
import { validateEmail } from '@validators/email_validator';
import { formatDate } from '@formatters/date_formatter';
import { AuthError } from '@errors/auth_error';

// ✅ From other service (only in page-service)
import { loginApi } from '@data-service/application/auth';
```

**Forbidden Imports:**
```typescript
// ❌ Domain types in application layer
import { IUser, IAuthToken } from '../domain/auth/auth_schema';

// ❌ Cross-domain in same service
import { validateImageFile } from '../image/index';

// ❌ Direct imports between services (except page-service calling data-service)
import { authDomain } from '@data-service/domain/auth';

// ❌ Generic utility files
import { helpers } from '@utils/helpers';
import { manager } from '@utils/manager';

// ❌ Circular imports
```

---

## Clean Code Principles

**Minimize Shared Code Between Layers:**
- Domain layer: Owns its types, logic, and business rules
- Application layer: Owns its request/response types and API handling
- Avoid sharing domain types with application layer
- Each layer defines types for its specific concerns

**Type Definition Strategy:**
- Domain types: Internal business models (e.g., `IUser`, `IAuthToken`)
- Application types: API contracts (e.g., `ILoginApiRequest`, `ILoginApiResponse`)
- Never import domain types into application layer
- Application layer can call domain functions but should not depend on domain types

**Function Parameters:**
- For 1-3 parameters: Use individual parameters
- For 4+ parameters: Use destructured object only
- Never create wrapper objects for simple parameter passing
- Exception: External API requests/responses always use defined type objects

**Examples:**

```typescript
// ✅ CORRECT - 3 or fewer parameters
export const validateUser = (email: string, password: string, userId: string): boolean => {
  return !!email && !!password && !!userId;
};

// ✅ CORRECT - 4+ parameters use destructured object
export const createUser = ({ email, password, firstName, lastName, role }: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}): IUser => {
  return { email, password, firstName, lastName, role };
};

// ✅ CORRECT - External API always uses typed object
export interface ILoginApiRequest {
  email: string;
  password: string;
}

export const loginApi = async (request: ILoginApiRequest): Promise<ILoginApiResponse> => {
  const response = await api.post('/api/auth/login', request);
  return response.data;
};

// ❌ INCORRECT - Unnecessary wrapper object for 2 parameters
export const validateUser = (params: { email: string; password: string }): boolean => {
  return !!params.email && !!params.password;
};

// ❌ INCORRECT - Importing domain types to application
import { IUser } from '../domain/auth/auth_schema';
export const handleLogin = (user: IUser): void => { };
```

**Benefits:**
- Clear separation of concerns
- Easier to refactor domain logic without affecting API contracts
- Prevents tight coupling between layers
- Simplifies testing - each layer can be tested independently
- Reduces code duplication and shared dependencies
- Cleaner function signatures for simple operations
- Consistent API contracts for external clients

---

## Folder Structure Constraints in src/

**CRITICAL RULE: Only These Folders Allowed in src/**

The `src/` directory can ONLY contain the following folders:
1. `data-service/` - Data service with application and domain layers
2. `page-service/` - Page service with application and domain layers
3. `errors/` - Error definitions (error.ts files)

**Everything else MUST be placed outside src/ directory:**
- `validators/` → Move to root level or configs/
- `formatters/` → Move to root level or configs/
- `constants/` → Move to root level or configs/
- `logger/` → Move to root level or configs/
- `types/` → Move to root level or configs/
- `styles/` → Move to root level or configs/
- `hooks/` → Move to root level or configs/
- `store/` → Move to root level or configs/
- `components/` → Move to root level or configs/
- `pages/` → Move to root level or configs/
- `public/` → Move to root level
- Any other folders → Move outside src/

**Allowed Structure in src/:**
```
src/
├── data-service/
│   ├── application/
│   │   ├── auth/
│   │   ├── image/
│   │   ├── gemini/
│   │   ├── blender/
│   │   └── index.ts
│   └── domain/
│       ├── auth/
│       ├── image/
│       ├── gemini/
│       ├── blender/
│       └── index.ts
│
├── page-service/
│   ├── application/
│   │   ├── login/
│   │   ├── upload/
│   │   ├── viewer/
│   │   └── index.ts
│   └── domain/
│       ├── login-page/
│       ├── upload-page/
│       ├── viewer-page/
│       └── index.ts
│
├── errors/
│   ├── auth_error.ts
│   ├── upload_error.ts
│   └── validation_error.ts
│
├── App.tsx
├── main.tsx
└── vite_env.d.ts
```

**Why This Rule Exists:**
- Keeps src/ focused on core business logic (data-service and page-service)
- Prevents src/ from becoming a dumping ground for miscellaneous files
- Makes it clear what the core application logic is
- Simplifies code organization and navigation
- Enforces clean architecture principles
- Makes it easier to extract services later

**File Organization Principles**

**No Generic Files:**
- Every file must have a specific, well-defined purpose
- No `helpers.ts`, `utils.ts`, `manager.ts`, or similar catch-all files
- Each utility function belongs in a feature-specific file

**File Naming Pattern:**
- `{feature}_{type}.ts` where type is: `validator`, `formatter`, `error`, `logger`, `constants`
- Example: `email_validator.ts`, `date_formatter.ts`, `auth_error.ts`

**Organization by Feature:**
- Validators grouped in `validators/` folder with feature-specific files
- Formatters grouped in `formatters/` folder with feature-specific files
- Constants grouped in `constants/` folder with feature-specific files
- Errors grouped in `errors/` folder with feature-specific files (ONLY errors/ allowed in src/)
- Loggers grouped in `logger/` folder with feature-specific files

**Benefits:**
- Clear code ownership and responsibility
- Easy to locate related functionality
- Prevents code from becoming a dumping ground
- Encourages focused, single-purpose modules
- Simplifies testing and maintenance

---

1. **Clear Separation of Concerns**: Application handles API calls, domain handles logic
2. **Scalability**: Easy to add new domains without affecting existing ones
3. **Testability**: Each domain can be tested independently
4. **Maintainability**: Clear boundaries prevent spaghetti code
5. **Reusability**: Domain logic can be reused across different applications
6. **Type Safety**: Interfaces ensure type consistency across domains

---

## Migration Path

This DDD architecture is designed to scale:
- **Phase 1 (Current)**: Frontend with data-service and page-service
- **Phase 2**: Extract data-service to backend microservice
- **Phase 3**: Extract page-service to separate frontend service
- **Phase 4**: Add additional domain services as needed

---

## Tools and Frameworks

**Backend:**
- Test Framework: Vitest
- HTTP Testing: Supertest
- Mocking: Vitest mocks
- Coverage: Vitest coverage
- CI/CD: GitHub Actions

**Frontend:**
- Test Framework: Vitest
- Component Testing: React Testing Library
- E2E Testing: Playwright
- Mocking: Vitest mocks
- Coverage: Vitest coverage
- CI/CD: GitHub Actions

---

## Configuration Files

**Frontend tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@data-service/*": ["src/data-service/*"],
      "@page-service/*": ["src/page-service/*"],
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@hooks/*": ["src/hooks/*"],
      "@store/*": ["src/store/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@styles/*": ["src/styles/*"]
    }
  }
}
```

**Frontend vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@data-service': path.resolve(__dirname, './src/data-service'),
      '@page-service': path.resolve(__dirname, './src/page-service'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@styles': path.resolve(__dirname, './src/styles'),
    }
  }
});
```

---

## TypeScript Guidelines

**Types Only - No Classes:**
- Use TypeScript `type` and `interface` for all type definitions
- Never use `class` keyword for domain models or data structures
- Use `type` for unions, primitives, and simple type aliases
- Use `interface` for object shapes and contracts
- All schema files contain only type definitions

**Example:**
```typescript
// ✅ CORRECT - Types only
export type UserRole = 'admin' | 'user' | 'guest';
export interface IUser {
  id: string;
  email: string;
  role: UserRole;
}

// ❌ INCORRECT - Classes not allowed
export class User {
  id: string;
  email: string;
  role: UserRole;
}
```

---

---

## Comprehensive Folder Structure Rules

This section documents all 15 rules for creating folder structures correctly. Use this as a reference when generating new features, pages, or components.

### Rule 1: src/ Directory - ONLY data-service and page-service

**The src/ directory can ONLY contain:**
1. `data-service/` - Data operations service
2. `page-service/` - Page UI service
3. `errors/` - Error definitions (ONLY in backend, NOT in frontend)
4. Root-level files: `App.tsx`, `main.tsx`, `server.ts`, `vite_env.d.ts`

**Everything else MUST be outside src/:**
- `validators/`, `formatters/`, `constants/`, `hooks/`, `store/`, `types/`, `styles/`, `logger/`
- `components/`, `pages/`, `public/`, `configs/`, `scripts/`, `schema/`

**Why:** Keeps src/ focused on core business logic (data-service and page-service). Prevents src/ from becoming a dumping ground.

---

### Rule 2: data-service Structure - MUST Have Schema Files

**data-service MUST follow this structure:**

```
data-service/
├── application/
│   ├── {feature}/
│   │   ├── {feature}.api.ts
│   │   └── index.ts
│   ├── errors.ts (all errors go here)
│   └── index.ts
└── domain/
    ├── {domain}/
    │   ├── {domain}_schema.ts (REQUIRED - types only)
    │   ├── interface.ts (optional)
    │   └── index.ts
    └── index.ts
```

**Key Rules:**
- Application layer: One file per API endpoint named `{feature}.api.ts`
- Domain layer: MUST have `{domain}_schema.ts` with type definitions
- Domain layer: MUST have `index.ts` with domain logic functions
- Domain layer: Optional `interface.ts` for additional interfaces
- Errors: ALL errors go in `application/errors.ts` (NOT separate errors folder)
- Domains are isolated - cannot import from other domains

**Example:**
```
data-service/
├── application/
│   ├── auth/
│   │   ├── login.api.ts
│   │   ├── logout.api.ts
│   │   └── index.ts
│   ├── image/
│   │   ├── upload_image.api.ts
│   │   ├── get_image.api.ts
│   │   └── index.ts
│   ├── errors.ts
│   └── index.ts
└── domain/
    ├── auth/
    │   ├── auth_schema.ts (REQUIRED)
    │   ├── interface.ts (optional)
    │   └── index.ts
    ├── image/
    │   ├── image_schema.ts (REQUIRED)
    │   ├── interface.ts (optional)
    │   └── index.ts
    └── index.ts
```

---

### Rule 3: page-service Structure - NO Schema Files Required

**page-service MUST follow this structure:**

```
page-service/
├── application/
│   ├── {page}/
│   │   ├── {page}_page.api.ts
│   │   └── index.ts
│   ├── errors.ts (all errors go here)
│   └── index.ts
└── domain/
    ├── {page}-page/
    │   ├── {Page}Page.tsx
    │   ├── {Component}.tsx (flat - no nested folders)
    │   ├── {component}.module.css
    │   ├── {component}_logic.ts (optional - component logic)
    │   ├── index.ts
    │   └── interface.ts (optional)
    └── index.ts
```

**Key Rules:**
- Application layer: One file per page named `{page}_page.api.ts`
- Domain layer: NO schema files required (unlike data-service)
- Domain layer: MUST have `index.ts` with page logic functions
- Domain layer: Optional `interface.ts` for additional interfaces
- Errors: ALL errors go in `application/errors.ts`
- Pages are domains: `login-page/`, `upload-page/`, `viewer-page/`, `dashboard-page/`, `not-found-page/`
- Components are sub-domains within pages (NOT in separate components folder)

**Example - FLAT STRUCTURE (No Nested Component Folders):**
```
page-service/
├── application/
│   ├── login/
│   │   ├── login_page.api.ts
│   │   └── index.ts
│   ├── upload/
│   │   ├── upload_page.api.ts
│   │   └── index.ts
│   ├── errors.ts
│   └── index.ts
└── domain/
    ├── login-page/
    │   ├── LoginPage.tsx
    │   ├── LoginForm.tsx
    │   ├── login_form.module.css
    │   ├── login_form_logic.ts (optional)
    │   ├── index.ts
    │   └── interface.ts (optional)
    ├── upload-page/
    │   ├── UploadPage.tsx
    │   ├── ImageUpload.tsx
    │   ├── CameraCapture.tsx
    │   ├── FileUpload.tsx
    │   ├── UploadProgress.tsx
    │   ├── image_upload.module.css
    │   ├── image_upload_logic.ts (optional)
    │   ├── index.ts
    │   └── interface.ts (optional)
    └── index.ts
```

---

### Rule 4: Components as Domains in page-service - FLAT STRUCTURE

**Components are NOT in a separate components/ folder. They are FLAT files within page-service domains.**

**Structure - FLAT (No Nested Folders):**
- All component files go directly in the page domain folder
- Component domain contains:
  - `{Component}.tsx` - Component file (PascalCase)
  - `{component}.module.css` - Styles (kebab-case)
  - `{component}_logic.ts` - Optional component logic
  - `index.ts` - Component logic functions
  - `interface.ts` - Optional interfaces

**Example - FLAT STRUCTURE:**
```
page-service/domain/login-page/
├── LoginPage.tsx
├── LoginForm.tsx
├── login_form.module.css
├── login_form_logic.ts (optional)
├── index.ts
└── interface.ts (optional)
```

**Key Rules:**
- ✅ NO separate `components/` folder in src/
- ✅ Components are FLAT files in page domain folder
- ✅ NO nested component folders
- ✅ Each component file is isolated from other components
- ✅ Component domains can call data-service domains to fetch data
- ❌ NO nested folders like `login-form/`, `image-upload/`
- ❌ NO separate `components/` folder in src/
- Component domains can call data-service domains to fetch data
- NO schema files for components (unlike data-service domains)

---

### Rule 5: Pages as Domains in page-service

**Pages are NOT in a separate pages/ folder. They are domains within page-service with FLAT component files.**

**Structure - FLAT (No Nested Component Folders):**
- Each page is a domain folder within page-service/domain/
- Page domain contains:
  - `{Page}Page.tsx` - Page component (PascalCase)
  - Component files FLAT (no nested folders)
  - `index.ts` - Page logic functions
  - `interface.ts` - Optional interfaces

**Example - FLAT STRUCTURE:**
```
page-service/domain/
├── login-page/
│   ├── LoginPage.tsx
│   ├── LoginForm.tsx
│   ├── login_form.module.css
│   ├── login_form_logic.ts (optional)
│   ├── index.ts
│   └── interface.ts (optional)
├── upload-page/
│   ├── UploadPage.tsx
│   ├── ImageUpload.tsx
│   ├── CameraCapture.tsx
│   ├── FileUpload.tsx
│   ├── UploadProgress.tsx
│   ├── image_upload.module.css
│   ├── image_upload_logic.ts (optional)
│   ├── index.ts
│   └── interface.ts (optional)
└── index.ts
```

**Key Rules:**
- ✅ NO separate `pages/` folder in src/
- ✅ Pages are domains within page-service/domain/
- ✅ Component files are FLAT in page domain (no nested folders)
- ✅ Each page domain contains its component files
- ✅ Page domains can call data-service domains to fetch data
- ❌ NO nested component folders
- ❌ NO separate `pages/` folder in src/
- ❌ NO separate `components/` folder in src/
- ❌ NO schema files for pages (unlike data-service domains)

---

### Rule 6: NO Common/Helper Files

**Forbidden Files:**
- `helpers.ts`, `utils.ts`, `manager.ts`, `common.ts`
- `common/` folder
- Any generic catch-all files

**Every file must have a specific, well-defined purpose.**

**Correct Pattern:**
- `email_validator.ts` - Email validation logic
- `date_formatter.ts` - Date formatting logic
- `api_constants.ts` - API constants
- `auth_error.ts` - Auth error definitions

**Why:** Prevents code from becoming a dumping ground. Clear code ownership and responsibility.

---

### Rule 7: Outside src/ Directory Organization

**These folders MUST be outside src/ (at root level or in configs/):**

```
root/
├── validators/
│   ├── email_validator.ts
│   ├── image_validator.ts
│   └── dimension_validator.ts
├── formatters/
│   ├── date_formatter.ts
│   ├── image_formatter.ts
│   └── dimension_formatter.ts
├── constants/
│   ├── api_constants.ts
│   ├── validation_constants.ts
│   └── ui_constants.ts
├── hooks/ (frontend only)
│   ├── use_auth.ts
│   ├── use_image_upload.ts
│   └── use_camera.ts
├── store/ (frontend only)
│   ├── slices/
│   │   ├── auth_slice.ts
│   │   ├── upload_slice.ts
│   │   └── viewer_slice.ts
│   ├── store.ts
│   └── hooks.ts
├── types/
│   ├── index.ts
│   ├── api.ts
│   └── models.ts
├── styles/ (frontend only)
│   ├── globals.css
│   ├── variables.css
│   └── reset.css
├── logger/ (backend only)
│   ├── request_logger.ts
│   ├── error_logger.ts
│   └── performance_logger.ts
├── configs/
│   ├── development/
│   ├── production/
│   └── global_config.json
├── scripts/
│   ├── setup.ts
│   └── build.ts
├── schema/
│   ├── user_schema.json
│   ├── image_schema.json
│   └── visualization_schema.json
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
└── src/
    ├── data-service/
    ├── page-service/
    └── App.tsx
```

**Key Rules:**
- All feature-specific utilities organized by type
- Each file has a specific purpose: `{feature}_{type}.ts`
- Validators, formatters, constants, errors, loggers are feature-specific
- No generic files allowed

---

### Rule 8: File Naming Conventions

**Folders:**
- Kebab-case for all folder names
- Examples: `data-service`, `page-service`, `auth`, `image-upload`, `login-form`

**Frontend Files:**
- Components: `PascalCase.tsx` (e.g., `LoginForm.tsx`, `ImageUpload.tsx`)
- Hooks: `use_xxx.ts` (e.g., `use_auth.ts`, `use_image_upload.ts`)
- API files: `{feature}.api.ts` (e.g., `login.api.ts`, `upload_image.api.ts`)
- Schema files: `{domain}_schema.ts` (e.g., `auth_schema.ts`, `image_schema.ts`)
- Interface files: `interface.ts`
- Domain logic: `index.ts`
- Styles: `*.module.css` (e.g., `login_form.module.css`)
- Tests: `*.test.tsx` or `*.spec.tsx`
- Redux slices: `{feature}_slice.ts` (e.g., `auth_slice.ts`)
- Validators: `{feature}_validator.ts` (e.g., `email_validator.ts`)
- Formatters: `{feature}_formatter.ts` (e.g., `date_formatter.ts`)
- Constants: `{feature}_constants.ts` (e.g., `api_constants.ts`)
- Errors: `{feature}_error.ts` (e.g., `auth_error.ts`)

**Backend Files:**
- Controllers: `{feature}_controller.ts` (e.g., `auth_controller.ts`)
- Services: `{feature}_service.ts` (e.g., `image_service.ts`)
- Models: `PascalCase.ts` (e.g., `User.ts`, `Session.ts`)
- Routes: `{feature}.ts` (e.g., `auth.ts`, `images.ts`)
- Middleware: `{feature}.ts` (e.g., `auth.ts`, `error_handler.ts`)
- Schema files: `{domain}_schema.ts` (e.g., `auth_schema.ts`)
- Interface files: `interface.ts`
- Domain logic: `index.ts`
- Validators: `{feature}_validator.ts` (e.g., `email_validator.ts`)
- Formatters: `{feature}_formatter.ts` (e.g., `date_formatter.ts`)
- Constants: `{feature}_constants.ts` (e.g., `api_constants.ts`)
- Errors: `{feature}_error.ts` (e.g., `auth_error.ts`)
- Loggers: `{feature}_logger.ts` (e.g., `request_logger.ts`)
- Tests: `*.test.ts` or `*.spec.ts`

**Functions & Variables:**
- camelCase for functions and variables
- PascalCase for components and classes
- UPPER_SNAKE_CASE for constants

---

### Rule 9: Error Handling Location

**Frontend:**
- data-service errors: `data-service/application/errors.ts`
- page-service errors: `page-service/application/errors.ts`
- NO separate errors folder in src/

**Backend:**
- data-service errors: `data-service/application/errors.ts`
- page-service errors: `page-service/application/errors.ts`
- NO separate errors folder in src/

**Error File Structure:**
```typescript
// data-service/application/errors.ts
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

**Key Rules:**
- All errors for a service go in `application/errors.ts`
- One error class per error type
- Error classes extend Error
- Named descriptively: `{Feature}Error`

---

### Rule 10: Import Rules

**Allowed Imports:**
```typescript
// ✅ Own domain logic
import { validateUserCredentials } from '../domain/auth/index';

// ✅ Own application types
import { ILoginApiRequest, ILoginApiResponse } from './login.api';

// ✅ Validators, formatters, errors (feature-specific)
import { validateEmail } from '@validators/email_validator';
import { formatDate } from '@formatters/date_formatter';
import { AuthError } from '@data-service/application/errors';

// ✅ From other service (only in page-service)
import { loginApi } from '@data-service/application/auth';

// ✅ From data-service domain (only in page-service)
import { validateUserCredentials } from '@data-service/domain/auth';
```

**Forbidden Imports:**
```typescript
// ❌ Domain types in application layer
import { IUser, IAuthToken } from '../domain/auth/auth_schema';

// ❌ Cross-domain in same service
import { validateImageFile } from '../image/index';

// ❌ Direct imports between services (except page-service calling data-service)
import { authDomain } from '@data-service/domain/auth';

// ❌ Generic utility files
import { helpers } from '@utils/helpers';
import { manager } from '@utils/manager';

// ❌ Circular imports
```

---

### Rule 11: Type Definition Strategy

**Domain Types (Internal Business Models):**
- Defined in `{domain}_schema.ts` in domain layer
- Examples: `IUser`, `IAuthToken`, `IImage`
- Used internally by domain logic functions
- NOT imported into application layer

**Application Types (API Contracts):**
- Defined in `{feature}.api.ts` in application layer
- Examples: `ILoginApiRequest`, `ILoginApiResponse`
- Used for API request/response handling
- NOT imported into domain layer

**Key Principle:**
- Never import domain types into application layer
- Application layer can call domain functions but should not depend on domain types
- Each layer owns its type definitions

**Example:**
```typescript
// ✅ CORRECT - Separate types for each layer
// data-service/domain/auth/auth_schema.ts
export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
}

// data-service/application/auth/login.api.ts
export interface ILoginApiRequest {
  email: string;
  password: string;
}

export interface ILoginApiResponse {
  success: boolean;
  token: string;
  userId: string;
}

// ❌ INCORRECT - Importing domain types to application
import { IUser } from '../domain/auth/auth_schema';
export const handleLogin = (user: IUser): void => { };
```

---

### Rule 12: Function Parameter Rules

**For 1-3 parameters:** Use individual parameters
```typescript
// ✅ CORRECT
export const validateUser = (email: string, password: string, userId: string): boolean => {
  return !!email && !!password && !!userId;
};
```

**For 4+ parameters:** Use destructured object only
```typescript
// ✅ CORRECT
export const createUser = ({ email, password, firstName, lastName, role }: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}): IUser => {
  return { email, password, firstName, lastName, role };
};
```

**External API requests/responses:** Always use defined type objects
```typescript
// ✅ CORRECT
export interface ILoginApiRequest {
  email: string;
  password: string;
}

export const loginApi = async (request: ILoginApiRequest): Promise<ILoginApiResponse> => {
  const response = await api.post('/api/auth/login', request);
  return response.data;
};
```

**Forbidden:**
```typescript
// ❌ INCORRECT - Unnecessary wrapper object for 2 parameters
export const validateUser = (params: { email: string; password: string }): boolean => {
  return !!params.email && !!params.password;
};
```

---

### Rule 13: TypeScript Types-Only Approach

**Use TypeScript types and interfaces only - NO classes for domain models:**

```typescript
// ✅ CORRECT - Types only
export type UserRole = 'admin' | 'user' | 'guest';
export interface IUser {
  id: string;
  email: string;
  role: UserRole;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'expired';

// ❌ INCORRECT - Classes not allowed for domain models
export class User {
  id: string;
  email: string;
  role: UserRole;
}

export class AuthStatus {
  status: 'authenticated' | 'unauthenticated' | 'expired';
}
```

**Exception:** Error classes are allowed
```typescript
// ✅ CORRECT - Error classes are allowed
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
```

---

### Rule 14: Summary Checklist for Creating New Features/Pages

**When creating a new feature or page, use this checklist:**

**For data-service domains:**
- [ ] Create domain folder in `data-service/domain/{domain}/`
- [ ] Create `{domain}_schema.ts` with type definitions (REQUIRED)
- [ ] Create `index.ts` with domain logic functions
- [ ] Create `interface.ts` if additional interfaces needed (optional)
- [ ] Create API file in `data-service/application/{feature}/{feature}.api.ts`
- [ ] Add error classes to `data-service/application/errors.ts`
- [ ] Export domain from `data-service/domain/index.ts`
- [ ] Export API from `data-service/application/index.ts`

**For page-service pages:**
- [ ] Create page domain folder in `page-service/domain/{page}-page/`
- [ ] Create `{Page}Page.tsx` component
- [ ] Create `index.ts` with page logic functions
- [ ] Create `interface.ts` if additional interfaces needed (optional)
- [ ] Create sub-component domains within page domain (NO separate components folder)
- [ ] Create API file in `page-service/application/{page}/{page}_page.api.ts`
- [ ] Add error classes to `page-service/application/errors.ts`
- [ ] Export page domain from `page-service/domain/index.ts`
- [ ] Export API from `page-service/application/index.ts`

**For page-service components (sub-domains):**
- [ ] Create component folder within page domain: `page-service/domain/{page}-page/{component}/`
- [ ] Create `{Component}.tsx` component file
- [ ] Create `{component}.module.css` styles file
- [ ] Create `index.ts` with component logic functions
- [ ] Create `interface.ts` if additional interfaces needed (optional)
- [ ] NO schema files for components

**For utilities outside src/:**
- [ ] Create feature-specific file: `{feature}_{type}.ts`
- [ ] Examples: `email_validator.ts`, `date_formatter.ts`, `api_constants.ts`
- [ ] Place in appropriate folder: `validators/`, `formatters/`, `constants/`, etc.
- [ ] NO generic `helpers.ts` or `utils.ts` files

---

### Rule 15: File Organization Principles

**Every file must have a specific, well-defined purpose:**

**Principle 1: Feature-Specific Organization**
- All utilities are organized by feature
- Example: `email_validator.ts` (not `validators.ts`)
- Example: `date_formatter.ts` (not `formatters.ts`)

**Principle 2: Clear Code Ownership**
- Each file has clear responsibility
- Easy to locate related functionality
- Prevents code from becoming a dumping ground

**Principle 3: No Generic Files**
- NO `helpers.ts`, `utils.ts`, `manager.ts`
- NO `common/` folder
- Every file has specific purpose

**Principle 4: Organized by Type**
- Validators grouped in `validators/` folder
- Formatters grouped in `formatters/` folder
- Constants grouped in `constants/` folder
- Errors grouped in `errors/` folder (in application layer)
- Loggers grouped in `logger/` folder

**Benefits:**
- Clear code ownership and responsibility
- Easy to locate related functionality
- Prevents code from becoming a dumping ground
- Encourages focused, single-purpose modules
- Simplifies testing and maintenance
- Reduces cognitive load when navigating codebase

---

## Notes

- This is a template structure - customize as needed
- Keep folder structure consistent across the project
- Follow naming conventions strictly for maintainability
- Use TypeScript types only - no classes for domain models
- Write tests alongside code
- Document complex logic with comments
- Keep files focused on single responsibility
- Schema files are the single source of truth for type definitions
