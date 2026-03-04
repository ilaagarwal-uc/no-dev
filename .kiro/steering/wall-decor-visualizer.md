---
inclusion: auto
---

# DDD Architecture & Folder Structure Rules

This steering file contains comprehensive architecture patterns and folder structure rules for Domain-Driven Design (DDD) projects. These are generic rules applicable to any project using DDD with data-service and page-service separation.

## Core Architecture Principle

Projects using this pattern implement Domain-Driven Design (DDD) with two isolated services:
- **data-service**: Handles all data operations (API calls, business logic)
- **page-service**: Handles UI pages and components

---

## CRITICAL RULE 1: src/ Directory - ONLY data-service and page-service

### What's Allowed in src/
```
src/
├── data-service/
├── page-service/
├── App.tsx (frontend only)
├── main.tsx (frontend only)
├── server.ts (backend only)
└── vite_env.d.ts (frontend only)
```

### What's FORBIDDEN in src/
- ❌ `components/` folder
- ❌ `pages/` folder
- ❌ `errors/` folder (errors go in application/errors.ts)
- ❌ `validators/` folder (validation logic goes in domain layer)
- ❌ `formatters/`, `constants/`, `hooks/`, `store/`, `types/`, `styles/`, `logger/`
- ❌ `common/`, `helpers/`, `utils/`, `manager/` folders or files
- ❌ Any generic catch-all folders

### Where Everything Else Goes
All utilities go at root level (outside src/):
```
root/
├── src/
├── formatters/
├── constants/
├── hooks/ (frontend only)
├── store/ (frontend only)
├── types/
├── styles/ (frontend only)
├── logger/ (backend only)
├── configs/
├── scripts/
├── schema/
└── public/
```

**IMPORTANT: Validation Logic**
- ❌ NO separate `validators/` folder
- ✅ Validation logic goes in domain layer (in `index.ts` of each domain)
- ✅ Validation functions are part of domain business logic
- Example: `data-service/domain/auth/index.ts` contains `validateUserCredentials()`, `validateEmail()`, etc.

---

## CRITICAL RULE 2: data-service Structure

### MUST Have Schema Files
Every domain in data-service MUST have a `{domain}_schema.ts` file with type definitions.

### Structure Template
```
data-service/
├── application/
│   ├── {feature}/
│   │   ├── {feature}.api.ts
│   │   └── index.ts
│   ├── errors.ts (ALL errors go here)
│   └── index.ts
└── domain/
    ├── {domain}/
    │   ├── {domain}_schema.ts (REQUIRED - types only)
    │   ├── index.ts (domain logic functions)
    │   └── interface.ts (optional - additional interfaces)
    └── index.ts
```

### Example: Auth Domain
```
data-service/
├── application/
│   ├── auth/
│   │   ├── login.api.ts
│   │   ├── logout.api.ts
│   │   └── index.ts
│   ├── errors.ts
│   └── index.ts
└── domain/
    ├── auth/
    │   ├── auth_schema.ts (REQUIRED)
    │   ├── index.ts
    │   └── interface.ts (optional)
    └── index.ts
```

### Key Rules
- ✅ One API file per endpoint: `{feature}.api.ts`
- ✅ Domain types in `{domain}_schema.ts`
- ✅ Domain logic in `index.ts`
- ✅ All errors in `application/errors.ts`
- ✅ Validation functions in domain `index.ts`
- ❌ NO nested domain folders
- ❌ NO importing domain types into application layer
- ❌ NO cross-domain imports within same service

---

## CRITICAL RULE 3: page-service Structure

### NO Schema Files Required
Page-service domains do NOT need schema files. Only `index.ts` and optional `interface.ts`.

### Structure Template - FLAT (No Nested Component Folders)
```
page-service/
├── application/
│   ├── {page}/
│   │   ├── {page}_page.api.ts
│   │   └── index.ts
│   ├── errors.ts (ALL errors go here)
│   └── index.ts
└── domain/
    ├── {page}-page/
    │   ├── {Page}Page.tsx (page component)
    │   ├── {Component}.tsx (flat - no nested folders)
    │   ├── {component}.module.css
    │   ├── {component}_logic.ts (optional - component logic)
    │   ├── index.ts (page logic functions)
    │   └── interface.ts (optional - additional interfaces)
    └── index.ts
```

### Example: Login Page - FLAT STRUCTURE
```
page-service/
├── application/
│   ├── login/
│   │   ├── login_page.api.ts
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
    └── index.ts
```

### Key Rules
- ✅ All components FLAT in page domain folder
- ✅ NO nested component folders
- ✅ One API file per page: `{page}_page.api.ts`
- ✅ Page logic in `index.ts`
- ✅ All errors in `application/errors.ts`
- ✅ Optional `{component}_logic.ts` for component-specific logic
- ❌ NO schema files for pages or components
- ❌ NO nested folders for components
- ❌ NO separate `components/` folder in src/
- ❌ NO separate `pages/` folder in src/

---

## CRITICAL RULE 4: File Naming Conventions

### Folder Names
- **ALWAYS kebab-case**: `data-service`, `page-service`, `login-page`, `image-upload`, `auth`

### Frontend File Names
- **Components**: `PascalCase.tsx` → `LoginForm.tsx`, `ImageUpload.tsx`
- **Hooks**: `use_xxx.ts` → `use_auth.ts`, `use_image_upload.ts`
- **API files**: `{feature}.api.ts` → `login.api.ts`, `upload_image.api.ts`
- **Schema files**: `{domain}_schema.ts` → `auth_schema.ts`, `image_schema.ts`
- **Interface files**: `interface.ts`
- **Domain logic**: `index.ts`
- **Styles**: `*.module.css` → `login_form.module.css`
- **Component logic**: `{component}_logic.ts` → `login_form_logic.ts`
- **Tests**: `*.test.tsx` or `*.spec.tsx`
- **Redux slices**: `{feature}_slice.ts` → `auth_slice.ts`
- **Formatters**: `{feature}_formatter.ts` → `date_formatter.ts`
- **Constants**: `{feature}_constants.ts` → `api_constants.ts`
- **Errors**: `{feature}_error.ts` → `auth_error.ts`

### Backend File Names
- **Controllers**: `{feature}_controller.ts` → `auth_controller.ts`
- **Services**: `{feature}_service.ts` → `image_service.ts`
- **Models**: `PascalCase.ts` → `User.ts`, `Session.ts`
- **Routes**: `{feature}.ts` → `auth.ts`, `images.ts`
- **Middleware**: `{feature}.ts` → `auth.ts`, `error_handler.ts`
- **Schema files**: `{domain}_schema.ts` → `auth_schema.ts`
- **Interface files**: `interface.ts`
- **Domain logic**: `index.ts`
- **Formatters**: `{feature}_formatter.ts` → `date_formatter.ts`
- **Constants**: `{feature}_constants.ts` → `api_constants.ts`
- **Errors**: `{feature}_error.ts` → `auth_error.ts`
- **Loggers**: `{feature}_logger.ts` → `request_logger.ts`
- **Tests**: `*.test.ts` or `*.spec.ts`

### Functions & Variables
- **Functions**: `camelCase` → `validateUser()`, `handleLogin()`
- **Components**: `PascalCase` → `LoginForm`, `ImageUpload`
- **Constants**: `UPPER_SNAKE_CASE` → `MAX_FILE_SIZE`, `API_TIMEOUT`

---

## CRITICAL RULE 5: Error Handling Location

### Error File Structure
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

### Key Rules
- ✅ All errors for a service in `application/errors.ts`
- ✅ One error class per error type
- ✅ Error classes extend Error
- ✅ Named descriptively: `{Feature}Error`
- ❌ NO separate `errors/` folder in src/
- ❌ NO error files scattered across domains

---

## CRITICAL RULE 6: Type Definition Strategy

### Domain Types (Internal Business Models)
- **Location**: `{domain}_schema.ts` in domain layer
- **Examples**: `IUser`, `IAuthToken`, `IImage`
- **Usage**: Internal domain logic only
- **Import**: ❌ NEVER import into application layer

### Application Types (API Contracts)
- **Location**: `{feature}.api.ts` in application layer
- **Examples**: `ILoginApiRequest`, `ILoginApiResponse`
- **Usage**: API request/response handling
- **Import**: ❌ NEVER import into domain layer

### Key Rules
- ✅ Each layer owns its type definitions
- ✅ Domain types separate from application types
- ✅ Application can call domain functions but NOT depend on domain types
- ❌ NO importing domain types into application layer
- ❌ NO importing application types into domain layer

### Example
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

## CRITICAL RULE 7: Function Parameter Rules

### 1-3 Parameters: Use Individual Parameters
```typescript
// ✅ CORRECT
export const validateUser = (email: string, password: string, userId: string): boolean => {
  return !!email && !!password && !!userId;
};
```

### 4+ Parameters: Use Destructured Object
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

### External API Requests/Responses: Always Use Typed Object
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

---

## CRITICAL RULE 8: TypeScript Types-Only Approach

### Use Types and Interfaces - NO Classes for Domain Models
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
```

### Exception: Error Classes Are Allowed
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

## CRITICAL RULE 9: Import Rules

### Allowed Imports
```typescript
// ✅ Own domain logic
import { validateUserCredentials } from '../domain/auth/index';

// ✅ Own application types
import { ILoginApiRequest, ILoginApiResponse } from './login.api';

// ✅ Feature-specific utilities
import { formatDate } from '@formatters/date_formatter';
import { AuthError } from '@data-service/application/errors';

// ✅ From other service (only in page-service)
import { loginApi } from '@data-service/application/auth';

// ✅ From data-service domain (only in page-service)
import { validateUserCredentials } from '@data-service/domain/auth';
```

### Forbidden Imports
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

## CRITICAL RULE 10: No Generic/Helper Files & No Validators Folder

### Forbidden Files
- ❌ `helpers.ts`, `utils.ts`, `manager.ts`, `common.ts`
- ❌ `common/` folder
- ❌ `validators/` folder (validation goes in domain layer)
- ❌ Any generic catch-all files

### Correct Pattern: Feature-Specific Files
```
formatters/
├── date_formatter.ts (NOT formatters.ts)
├── image_formatter.ts
└── dimension_formatter.ts

constants/
├── api_constants.ts (NOT constants.ts)
├── validation_constants.ts
└── ui_constants.ts
```

### Validation Logic Goes in Domain Layer
```
data-service/domain/auth/index.ts
├── validateUserCredentials()
├── validateEmail()
├── validatePassword()
└── ... other auth domain logic

data-service/domain/image/index.ts
├── validateImageFile()
├── validateImageDimensions()
└── ... other image domain logic

page-service/domain/login-page/index.ts
├── validateLoginForm()
├── validateFormFields()
└── ... other login page logic
```

### Key Rules
- ✅ Every file has specific, well-defined purpose
- ✅ Feature-specific organization
- ✅ Clear code ownership and responsibility
- ✅ Validation functions are part of domain business logic
- ❌ NO generic catch-all files
- ❌ NO dumping grounds for miscellaneous code
- ❌ NO separate validators folder

---

## CRITICAL RULE 11: Outside src/ Directory Organization

### Formatters (Feature-Specific)
```
formatters/
├── date_formatter.ts
├── image_formatter.ts
└── dimension_formatter.ts
```

### Constants (Feature-Specific)
```
constants/
├── api_constants.ts
├── validation_constants.ts
└── ui_constants.ts
```

### Hooks (Frontend Only)
```
hooks/
├── use_auth.ts
├── use_image_upload.ts
└── use_camera.ts
```

### Store (Frontend Only)
```
store/
├── slices/
│   ├── auth_slice.ts
│   ├── upload_slice.ts
│   └── viewer_slice.ts
├── store.ts
└── hooks.ts
```

### Types
```
types/
├── index.ts
├── api.ts
└── models.ts
```

### Styles (Frontend Only)
```
styles/
├── globals.css
├── variables.css
└── reset.css
```

### Logger (Backend Only)
```
logger/
├── request_logger.ts
├── error_logger.ts
└── performance_logger.ts
```

### Configs
```
configs/
├── development/
│   ├── api_config.json
│   └── app_config.json
├── production/
│   ├── api_config.json
│   └── app_config.json
└── global_config.json
```

### Scripts
```
scripts/
├── setup.ts
└── build.ts
```

### Schema
```
schema/
├── user_schema.json
├── image_schema.json
└── visualization_schema.json
```

### Public (Frontend Only)
```
public/
├── images/
├── icons/
└── favicon.ico
```

**IMPORTANT: NO Validators Folder**
- ❌ NO separate `validators/` folder
- ✅ Validation logic goes in domain layer
- ✅ Each domain contains its own validation functions in `index.ts`

---

## Checklist: Creating New Features/Pages

### For data-service Domains
- [ ] Create domain folder: `data-service/domain/{domain}/`
- [ ] Create `{domain}_schema.ts` with type definitions (REQUIRED)
- [ ] Create `index.ts` with domain logic functions (including validation)
- [ ] Create `interface.ts` if needed (optional)
- [ ] Create API file: `data-service/application/{feature}/{feature}.api.ts`
- [ ] Add error classes to `data-service/application/errors.ts`
- [ ] Export domain from `data-service/domain/index.ts`
- [ ] Export API from `data-service/application/index.ts`

### For page-service Pages
- [ ] Create page domain folder: `page-service/domain/{page}-page/`
- [ ] Create `{Page}Page.tsx` component
- [ ] Create `index.ts` with page logic functions
- [ ] Create `interface.ts` if needed (optional)
- [ ] Create all components FLAT in page domain (NO nested folders)
- [ ] Create API file: `page-service/application/{page}/{page}_page.api.ts`
- [ ] Add error classes to `page-service/application/errors.ts`
- [ ] Export page domain from `page-service/domain/index.ts`
- [ ] Export API from `page-service/application/index.ts`

### For page-service Components (Flat Structure)
- [ ] Create component files FLAT in page domain folder
- [ ] Create `{Component}.tsx` component file
- [ ] Create `{component}.module.css` styles file
- [ ] Create `{component}_logic.ts` if needed (optional)
- [ ] Create `index.ts` with component logic functions
- [ ] Create `interface.ts` if needed (optional)
- [ ] NO schema files for components
- [ ] NO nested folders for components

### For Utilities Outside src/
- [ ] Create feature-specific file: `{feature}_{type}.ts`
- [ ] Examples: `date_formatter.ts`, `api_constants.ts`
- [ ] Place in appropriate folder: `formatters/`, `constants/`, etc.
- [ ] NO generic `helpers.ts` or `utils.ts` files
- [ ] NO separate `validators/` folder - validation goes in domain layer

---

## Summary: Key Takeaways

1. **src/ is SACRED**: Only `data-service/`, `page-service/`, and root files
2. **data-service MUST have schema files**: Every domain needs `{domain}_schema.ts`
3. **page-service NO schema files**: Only `index.ts` and optional `interface.ts`
4. **Components are FLAT**: No nested component folders in page domains
5. **Errors in application layer**: `application/errors.ts` for each service
6. **Feature-specific files**: `date_formatter.ts` not `formatters.ts`
7. **No generic files**: NO `helpers.ts`, `utils.ts`, `manager.ts`
8. **NO validators folder**: Validation logic goes in domain layer
9. **Type separation**: Domain types ≠ Application types
10. **Kebab-case folders**: Always kebab-case for folder names
11. **TypeScript types only**: NO classes for domain models (except errors)

---

## When to Apply These Rules

Apply these rules when:
- ✅ Creating new features or domains
- ✅ Adding new pages or components
- ✅ Creating utility files (formatters, constants, etc.)
- ✅ Organizing error handling
- ✅ Setting up new services or modules
- ✅ Refactoring existing code
- ✅ Reviewing code structure

These rules ensure consistency, maintainability, and scalability across DDD projects.
