# DDD Architecture Rules - Quick Reference

This is a consolidated reference of all DDD architecture rules established during the wall-decor-visualizer project. These rules apply to ALL future file and folder creation.

---

## RULE 1: src/ Directory - ONLY data-service and page-service

### ✅ ALLOWED in src/
```
src/
├── data-service/
├── page-service/
├── App.tsx (frontend only)
├── main.tsx (frontend only)
├── server.ts (backend only)
└── vite_env.d.ts (frontend only)
```

### ❌ FORBIDDEN in src/
- `components/`, `pages/`, `errors/`, `validators/`, `formatters/`, `constants/`, `hooks/`, `store/`, `types/`, `styles/`, `logger/`, `common/`, `helpers/`, `utils/`, `manager/`



---

## RULE 2: data-service Structure

### MUST Have Schema Files
Every domain in data-service MUST have `{domain}_schema.ts` with type definitions.

### Template
```
data-service/
├── application/
│   ├── {feature}/
│   │   ├── {feature}.api.ts
│   │   └── index.ts
│   ├── errors.ts (ALL errors here)
│   └── index.ts
└── domain/
    ├── {domain}/
    │   ├── {domain}_schema.ts (REQUIRED)
    │   ├── index.ts (domain logic + validation)
    │   └── interface.ts (optional)
    └── index.ts
```

### Key Rules
- ✅ One API file per endpoint: `{feature}.api.ts`
- ✅ Domain types in `{domain}_schema.ts`
- ✅ Domain logic + validation in `index.ts`
- ✅ All errors in `application/errors.ts`
- ❌ NO nested domain folders
- ❌ NO importing domain types into application layer
- ❌ NO cross-domain imports

---

## RULE 3: page-service Structure

### NO Schema Files Required
Page-service domains do NOT need schema files.

### Template - FLAT (No Nested Component Folders)
```
page-service/
├── application/
│   ├── {page}/
│   │   ├── {page}_page.api.ts
│   │   └── index.ts
│   ├── errors.ts (ALL errors here)
│   └── index.ts
└── domain/
    ├── {page}-page/
    │   ├── {Page}Page.tsx
    │   ├── {Component}.tsx (FLAT - no nested folders)
    │   ├── {component}.module.css
    │   ├── {component}_logic.ts (optional)
    │   ├── index.ts (page logic)
    │   └── interface.ts (optional)
    └── index.ts
```

### Key Rules
- ✅ All components FLAT in page domain folder
- ✅ One API file per page: `{page}_page.api.ts`
- ✅ Page logic in `index.ts`
- ✅ All errors in `application/errors.ts`
- ✅ Optional `{component}_logic.ts` for component-specific logic
- ❌ NO schema files for pages or components
- ❌ NO nested component folders
- ❌ NO separate `components/` or `pages/` folder in src/

---

## RULE 4: File Naming Conventions

### Folder Names
- **ALWAYS kebab-case**: `data-service`, `page-service`, `login-page`, `image-upload`, `auth`

### Frontend File Names
| Type | Pattern | Example |
|------|---------|---------|
| Components | `PascalCase.tsx` | `LoginForm.tsx` |
| Hooks | `use_xxx.ts` | `use_auth.ts` |
| API files | `{feature}.api.ts` | `login.api.ts` |
| Schema files | `{domain}_schema.ts` | `auth_schema.ts` |
| Interface files | `interface.ts` | `interface.ts` |
| Domain logic | `index.ts` | `index.ts` |
| Styles | `*.module.css` | `login_form.module.css` |
| Component logic | `{component}_logic.ts` | `login_form_logic.ts` |
| Tests | `*.test.tsx` | `LoginForm.test.tsx` |
| Redux slices | `{feature}_slice.ts` | `auth_slice.ts` |
| Formatters | `{feature}_formatter.ts` | `date_formatter.ts` |
| Constants | `{feature}_constants.ts` | `api_constants.ts` |
| Errors | `{feature}_error.ts` | `auth_error.ts` |

### Backend File Names
| Type | Pattern | Example |
|------|---------|---------|
| Controllers | `{feature}_controller.ts` | `auth_controller.ts` |
| Services | `{feature}_service.ts` | `image_service.ts` |
| Models | `PascalCase.ts` | `User.ts` |
| Routes | `{feature}.ts` | `auth.ts` |
| Middleware | `{feature}.ts` | `auth.ts` |
| Schema files | `{domain}_schema.ts` | `auth_schema.ts` |
| Interface files | `interface.ts` | `interface.ts` |
| Domain logic | `index.ts` | `index.ts` |
| Formatters | `{feature}_formatter.ts` | `date_formatter.ts` |
| Constants | `{feature}_constants.ts` | `api_constants.ts` |
| Errors | `{feature}_error.ts` | `auth_error.ts` |
| Loggers | `{feature}_logger.ts` | `request_logger.ts` |
| Tests | `*.test.ts` | `auth.test.ts` |

### Functions & Variables
- **Functions**: `camelCase` → `validateUser()`, `handleLogin()`
- **Components**: `PascalCase` → `LoginForm`, `ImageUpload`
- **Constants**: `UPPER_SNAKE_CASE` → `MAX_FILE_SIZE`, `API_TIMEOUT`

---

## RULE 5: Error Handling Location

### ALL Errors in application/errors.ts
```typescript
// data-service/application/errors.ts
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
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

## RULE 6: Type Definition Strategy

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

---

## RULE 7: Function Parameter Rules

### 1-3 Parameters: Use Individual Parameters
```typescript
export const validateUser = (email: string, password: string, userId: string): boolean => {
  return !!email && !!password && !!userId;
};
```

### 4+ Parameters: Use Destructured Object
```typescript
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

## RULE 8: TypeScript Types-Only Approach

### Use Types and Interfaces - NO Classes for Domain Models
```typescript
// ✅ CORRECT - Types only
export type UserRole = 'admin' | 'user' | 'guest';
export interface IUser {
  id: string;
  email: string;
  role: UserRole;
}

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

## RULE 9: Import Rules

### ✅ Allowed Imports
```typescript
// Own domain logic
import { validateUserCredentials } from '../domain/auth/index';

// Own application types
import { ILoginApiRequest, ILoginApiResponse } from './login.api';

// Feature-specific utilities
import { formatDate } from '@formatters/date_formatter';
import { AuthError } from '@data-service/application/errors';

// From other service (only in page-service)
import { loginApi } from '@data-service/application/auth';
import { validateUserCredentials } from '@data-service/domain/auth';
```

### ❌ Forbidden Imports
```typescript
// Domain types in application layer
import { IUser, IAuthToken } from '../domain/auth/auth_schema';

// Cross-domain in same service
import { validateImageFile } from '../image/index';

// Generic utility files
import { helpers } from '@utils/helpers';
import { manager } from '@utils/manager';

// Circular imports
```

---

## RULE 10: No Generic/Helper Files & No Validators Folder

### ❌ Forbidden Files
- `helpers.ts`, `utils.ts`, `manager.ts`, `common.ts`
- `common/` folder
- `validators/` folder (validation goes in domain layer)
- Any generic catch-all files

### ✅ Correct Pattern: Feature-Specific Files
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

### ✅ Validation Logic Goes in Domain Layer
```
data-service/domain/auth/index.ts
├── validateUserCredentials()
├── validateEmail()
├── validatePassword()

data-service/domain/image/index.ts
├── validateImageFile()
├── validateImageDimensions()

page-service/domain/login-page/index.ts
├── validateLoginForm()
├── validateFormFields()
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

## RULE 11: Outside src/ Directory Organization

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
