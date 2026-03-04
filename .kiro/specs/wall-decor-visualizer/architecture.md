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
│   │   │   └── index.ts
│   │   └── domain/
│   │       ├── auth/
│   │       │   ├── auth_schema.ts
│   │       │   ├── interface.ts
│   │       │   └── index.ts
│   │       ├── image/
│   │       │   ├── image_schema.ts
│   │       │   ├── interface.ts
│   │       │   └── index.ts
│   │       ├── gemini/
│   │       │   ├── gemini_schema.ts
│   │       │   ├── interface.ts
│   │       │   └── index.ts
│   │       ├── blender/
│   │       │   ├── blender_schema.ts
│   │       │   ├── interface.ts
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
│   │   │   └── index.ts
│   │   └── domain/
│   │       ├── page/
│   │       │   ├── page_schema.ts
│   │       │   ├── interface.ts
│   │       │   └── index.ts
│   │       ├── session/
│   │       │   ├── session_schema.ts
│   │       │   ├── interface.ts
│   │       │   └── index.ts
│   │       ├── ui/
│   │       │   ├── ui_schema.ts
│   │       │   ├── interface.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── login_form.module.css
│   │   │   └── login_form.test.tsx
│   │   ├── upload/
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── CameraCapture.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── UploadProgress.tsx
│   │   │   └── image_upload.module.css
│   │   ├── viewer/
│   │   │   ├── ModelViewer.tsx
│   │   │   ├── ViewportControls.tsx
│   │   │   ├── ModelCatalog.tsx
│   │   │   └── model_viewer.module.css
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── common.module.css
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Layout.tsx
│   │       └── layout.module.css
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── UploadPage.tsx
│   │   ├── ViewerPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── hooks/
│   │   ├── use_auth.ts
│   │   ├── use_image_upload.ts
│   │   ├── use_camera.ts
│   │   ├── use_api.ts
│   │   └── use_local_storage.ts
│   │
│   ├── store/
│   │   ├── slices/
│   │   │   ├── auth_slice.ts
│   │   │   ├── upload_slice.ts
│   │   │   ├── viewer_slice.ts
│   │   │   └── ui_slice.ts
│   │   ├── store.ts
│   │   └── hooks.ts
│   │
│   ├── validators/
│   │   ├── email_validator.ts
│   │   ├── image_validator.ts
│   │   └── dimension_validator.ts
│   │
│   ├── formatters/
│   │   ├── date_formatter.ts
│   │   ├── image_formatter.ts
│   │   └── dimension_formatter.ts
│   │
│   ├── constants/
│   │   ├── api_constants.ts
│   │   ├── validation_constants.ts
│   │   └── ui_constants.ts
│   │
│   ├── errors/
│   │   ├── auth_error.ts
│   │   ├── upload_error.ts
│   │   └── validation_error.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── api.ts
│   │   └── models.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── reset.css
│   │
│   ├── App.tsx
│   ├── app.module.css
│   ├── main.tsx
│   └── vite_env.d.ts
│
├── dist/
├── test/
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.tsx
│   │   └── upload.test.tsx
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
│   │   │   └── index.ts
│   │   └── domain/
│   │       ├── auth/
│   │       │   ├── auth_schema.ts
│   │       │   ├── interface.ts
│   │       │   └── index.ts
│   │       ├── image/
│   │       │   ├── image_schema.ts
│   │       │   ├── interface.ts
│   │       │   └── index.ts
│   │       ├── gemini/
│   │       │   ├── gemini_schema.ts
│   │       │   ├── interface.ts
│   │       │   └── index.ts
│   │       ├── blender/
│   │       │   ├── blender_schema.ts
│   │       │   ├── interface.ts
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
│   │   │   └── index.ts
│   │   └── domain/
│   │       ├── login-page/
│   │       │   ├── login_page_schema.ts
│   │       │   ├── interface.ts
│   │       │   └── index.ts
│   │       ├── upload-page/
│   │       │   ├── upload_page_schema.ts
│   │       │   ├── interface.ts
│   │       │   └── index.ts
│   │       ├── viewer-page/
│   │       │   ├── viewer_page_schema.ts
│   │       │   ├── interface.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── validators/
│   │   ├── email_validator.ts
│   │   ├── image_validator.ts
│   │   └── dimension_validator.ts
│   │
│   ├── formatters/
│   │   ├── date_formatter.ts
│   │   ├── image_formatter.ts
│   │   └── dimension_formatter.ts
│   │
│   ├── constants/
│   │   ├── api_constants.ts
│   │   ├── validation_constants.ts
│   │   └── database_constants.ts
│   │
│   ├── errors/
│   │   ├── auth_error.ts
│   │   ├── upload_error.ts
│   │   └── validation_error.ts
│   │
│   ├── logger/
│   │   ├── request_logger.ts
│   │   ├── error_logger.ts
│   │   └── performance_logger.ts
│   │
│   └── server.ts
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
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── images.test.ts
│   │   └── gemini.test.ts
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

**Strict Isolation Rules:**
- Application layer can only use its own domain
- No cross-domain imports in application layer
- page-service domains CAN call data-service domains to fetch data for UI construction
- **Minimize shared code between domain and application layers**
- **Avoid importing interfaces from domain to application** - define separate interfaces in application layer if needed
- Each layer should have its own type definitions for its specific concerns
- All cross-domain logic goes through API calls

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

**Domain Layer (Page Logic):**
```typescript
// page-service/domain/session/session_schema.ts
export interface ISession {
  user: IUser;
  token: string;
  expiresAt: number;
}

export type SessionStatus = 'active' | 'expired' | 'invalid';

// page-service/domain/session/index.ts
import { ISession } from './session_schema';

export const storeUserSession = (user: IUser, token: string) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};
```

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

## File Organization Principles

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
- Errors grouped in `errors/` folder with feature-specific files
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

## Notes

- This is a template structure - customize as needed
- Keep folder structure consistent across the project
- Follow naming conventions strictly for maintainability
- Use TypeScript types only - no classes for domain models
- Write tests alongside code
- Document complex logic with comments
- Keep files focused on single responsibility
- Schema files are the single source of truth for type definitions
