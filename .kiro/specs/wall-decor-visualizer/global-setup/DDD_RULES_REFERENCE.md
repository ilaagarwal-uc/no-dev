# DDD Architecture Rules - Universal Reference

This document contains universal DDD (Domain-Driven Design) architecture rules applicable to ANY project using data-service and page-service separation. These are NOT project-specific.

---

## Core Architecture Principle

Projects using this pattern implement Domain-Driven Design (DDD) with two isolated services:
- **data-service**: Handles all data operations (API calls, business logic)
- **page-service**: Handles UI pages and components

---

# SECTION A: PROJECT STRUCTURE RULES

## RULE 1: src/ Directory - ONLY data-service and page-service

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

### Why This Rule Exists
- Keeps src/ focused on core business logic (data-service and page-service)
- Prevents src/ from becoming a dumping ground for miscellaneous files
- Makes it clear what the core application logic is
- Simplifies code organization and navigation
- Enforces clean architecture principles

---

## RULE 1.5: PROHIBITION - No Abstraction Folders in src/

### ⛔ FORBIDDEN FOLDERS - NEVER CREATE THESE IN src/

```
src/
├── ❌ middleware/          - FORBIDDEN
├── ❌ guards/              - FORBIDDEN
├── ❌ interceptors/        - FORBIDDEN
├── ❌ decorators/          - FORBIDDEN
├── ❌ pipes/               - FORBIDDEN
├── ❌ filters/             - FORBIDDEN
├── ❌ validators/          - FORBIDDEN
├── ❌ helpers/             - FORBIDDEN
├── ❌ utils/               - FORBIDDEN
├── ❌ common/              - FORBIDDEN
├── ❌ shared/              - FORBIDDEN
├── ❌ core/                - FORBIDDEN
├── ❌ lib/                 - FORBIDDEN
└── ❌ ANY folder that isn't data-service or page-service
```

### 🚨 CRITICAL PRINCIPLE: NO MIDDLEWARE ABSTRACTION

**If you're thinking "this should be middleware"** → STOP. It belongs in the feature's application layer.

**Examples:**
- JWT authentication → `data-service/application/auth/authenticate_jwt.api.ts`
- Request validation → `data-service/application/{feature}/validate_request.api.ts`
- Rate limiting → `data-service/application/{feature}/rate_limit.api.ts`
- Logging → `src/logger.ts` (single file, not a folder)
- Error handling → `data-service/application/errors.ts`

### WHY THIS RULE EXISTS

Traditional web frameworks (Express, NestJS, etc.) encourage "middleware" folders. **WE DON'T DO THAT.**

**Reasons:**
1. **Feature Ownership** - Auth logic belongs to the auth feature, not a generic middleware folder
2. **No Abstraction Layers** - We don't create abstraction for the sake of patterns
3. **Clear Dependencies** - If image-upload needs auth, it imports from auth feature
4. **No Dumping Grounds** - Prevents src/ from becoming cluttered with generic folders

### BEFORE YOU CREATE A NEW FOLDER IN src/

Ask yourself these questions:
1. ❓ Is this folder `data-service` or `page-service`? 
   - **NO** → ⛔ DON'T CREATE IT
2. ❓ Is this "middleware" or "cross-cutting concern"?
   - **YES** → ⛔ Put it in the feature's application layer instead
3. ❓ Is this a "utility" or "helper"?
   - **YES** → ⛔ Put the function in the domain/application that uses it

### CORRECT PATTERN: Feature-Owned Functions

```typescript
// ✅ CORRECT - Auth feature owns authentication logic
// src/data-service/application/auth/authenticate_jwt.api.ts
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  // ... JWT validation logic
  next();
}

// src/data-service/application/auth/index.ts
export { authenticateJWT } from './authenticate_jwt.api.js';

// src/server.ts
import { authenticateJWT } from './data-service/application/auth/index.js';
app.post('/api/images/upload', authenticateJWT, uploadImageHandler);
```

```typescript
// ❌ WRONG - Separate middleware folder
// src/middleware/auth.ts  ← DON'T DO THIS
export function authenticateJWT(...) { }
```

### ENFORCEMENT CHECKLIST

Before committing code, verify:
- [ ] No folders in `src/` except `data-service/`, `page-service/`, and root files
- [ ] No `middleware/`, `guards/`, `validators/`, `helpers/`, `utils/` folders
- [ ] All "middleware-like" functions are in their feature's application layer
- [ ] Authentication logic is in `data-service/application/auth/`
- [ ] Validation logic is in the domain layer of the feature being validated

### VIOLATION EXAMPLES (Learn from these mistakes)

| ❌ WRONG | ✅ CORRECT |
|----------|-----------|
| `src/middleware/auth.ts` | `src/data-service/application/auth/authenticate_jwt.api.ts` |
| `src/validators/image_validator.ts` | `src/data-service/domain/image-upload/index.ts` (validation functions) |
| `src/guards/role_guard.ts` | `src/data-service/application/auth/check_role.api.ts` |
| `src/utils/file_helper.ts` | `src/data-service/domain/image-upload/index.ts` (file functions) |
| `src/common/response_formatter.ts` | Put in the API file that needs it |

### REMEMBER

**There is NO such thing as "middleware" in our architecture.**  
**There are only features with their own application and domain logic.**

If you find yourself creating a folder that isn't `data-service` or `page-service`, you're doing it wrong.

---

## RULE 2: data-service Structure

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
    │   ├── index.ts (domain logic functions + validation)
    │   └── interface.ts (optional - additional interfaces)
    └── index.ts
```

### Key Rules
- ✅ One API file per endpoint: `{feature}.api.ts`
- ✅ Domain types in `{domain}_schema.ts`
- ✅ Domain logic + validation in `index.ts`
- ✅ All errors in `application/errors.ts`
- ❌ NO nested domain folders
- ❌ NO importing domain types into application layer
- ❌ NO cross-domain imports within same service

---

## RULE 3: page-service Structure

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
    │   ├── {Component}.tsx (FLAT - no nested folders)
    │   ├── {component}.module.css
    │   ├── {component}_logic.ts (optional - component logic)
    │   ├── index.ts (page logic functions)
    │   └── interface.ts (optional - additional interfaces)
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

## RULE 3.5: Backend BFF (Backend for Frontend) - page-service

### What is BFF?
Backend for Frontend (BFF) is a backend page-service that returns UI code/components to the frontend. It follows the exact same rules as the frontend page-service.

### When to Use BFF
- When backend needs to return pre-rendered UI components
- When backend needs to return page structure/layout
- When backend needs to return dynamic UI based on business logic
- Example: `GET /api/page/login-page` returns the login page UI code

### BFF Structure (Backend page-service)
```
backend/src/page-service/
├── application/
│   ├── {page}/
│   │   ├── {page}_page.api.ts
│   │   └── index.ts
│   ├── errors.ts (ALL errors go here)
│   └── index.ts
└── domain/
    ├── {page}-page/
    │   ├── {page}_page_builder.ts (builds page structure)
    │   ├── {component}_builder.ts (builds individual components)
    │   ├── index.ts (page logic functions)
    │   └── interface.ts (optional - additional interfaces)
    └── index.ts
```

### Key Rules for BFF
- ✅ Follows exact same structure as frontend page-service
- ✅ Returns UI code/components as JSON or serialized format
- ✅ One API file per page: `{page}_page.api.ts`
- ✅ Page logic in `index.ts`
- ✅ All errors in `application/errors.ts`
- ✅ Builder functions for constructing UI components
- ❌ NO schema files for pages or components
- ❌ NO nested folders for components
- ❌ NO separate `components/` folder in src/
- ❌ NO separate `pages/` folder in src/

### Example - BFF API Endpoint
```typescript
// backend/src/page-service/application/login/login_page.api.ts
import * as LoginPageDomain from '../../domain/login-page/index.js';

export async function getLoginPageHandler(req: Request, res: Response): Promise<void> {
  try {
    // Build the login page UI
    const pageUI = await LoginPageDomain.buildLoginPage();
    
    res.status(200).json({
      success: true,
      page: pageUI
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to build login page'
    });
  }
}
```

### Example - BFF Domain Logic
```typescript
// backend/src/page-service/domain/login-page/index.ts
import * as PhoneFormBuilder from './phone_form_builder.js';
import * as OTPFormBuilder from './otp_form_builder.js';

export async function buildLoginPage() {
  return {
    title: 'Wall Decor Visualizer',
    subtitle: 'Sign in to your account',
    forms: [
      PhoneFormBuilder.buildPhoneNumberForm(),
      OTPFormBuilder.buildOTPForm()
    ]
  };
}
```

---

# SECTION B: NAMING CONVENTIONS

## RULE 4: File Naming Conventions

### Backend API naming conventions
API endpoint and function names must reflect what the SERVER DOES,
not what the UI element or user action is called.

Before naming an API, ask:
"What is the server actually performing?" — use that as the name.

PATTERN: UI label → strip the user/client intent → name the server operation

  UI Label        | BAD API Name          | GOOD API Name
  ----------------|-----------------------|----------------------
  Send OTP        | send_otp              | generate_otp
  Submit Form     | submit_form           | create_user / update_profile
  Click to Pay    | click_pay             | process_payment
  Resend Email    | resend_email          | trigger_email_notification
  Save Draft      | save_draft            | persist_draft / upsert_draft

RULE OF THUMB:
If the name makes sense only because you've seen the UI, it's a bad API name.
A backend developer with no UI context should understand what the API does
from its name alone.

CORE PRINCIPLE (use this in agent prompts):
"API names must describe the server-side operation being performed,
not the client-side action or UI element that triggers it."

This applies to: REST endpoints, RPC methods, GraphQL mutations,
and internal service functions.

### Folder Names
- **ALWAYS kebab-case**: `data-service`, `page-service`, `login-page`, `image-upload`, `auth`

### Frontend File Names
| Type | Pattern | Example |
|------|---------|---------|
| API files | `{feature}.api.ts` | `login.api.ts` |
| Schema files | `{domain}_schema.ts` | `auth_schema.ts` |
| Interface files | `interface.ts` | `interface.ts` |
| Domain logic | `index.ts` | `index.ts` |
| Styles | `*.module.css` | `login_form.module.css` |
| Tests | `*.test.tsx` | `LoginForm.test.tsx` |
| Constants | `{feature}_constants.ts` | `api_constants.ts` |

### Backend File Names
| Type | Pattern | Example |
|------|---------|---------|
| Schema files | `{domain}_schema.ts` | `auth_schema.ts` |
| Interface files | `interface.ts` | `interface.ts` |
| Domain logic | `index.ts` | `index.ts` |
| Constants | `{feature}_constants.ts` | `api_constants.ts` |
| Loggers | `{feature}_logger.ts` | `request_logger.ts` |
| Tests | `*.test.ts` | `auth.test.ts` |

### Functions & Variables
- **Functions**: `camelCase` → `validateUser()`, `handleLogin()`
- **Components**: `PascalCase` → `LoginForm`, `ImageUpload`
- **Constants**: `UPPER_SNAKE_CASE` → `MAX_FILE_SIZE`, `API_TIMEOUT`

---

# SECTION C: TYPE SYSTEM & INTERFACES

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

# SECTION D: ERROR HANDLING

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

## RULE 12: Error Handling - No Silent Failures

### NEVER Use Try-Catch for Silent Error Suppression
- **Only catch specific errors you can actually handle**
- **Always re-throw unexpected errors**
- **Prefer conditional logic over try-catch for existence checks**

### Example - CORRECT
```typescript
// ✅ Conditional check instead of try-catch
if (mongoose.models.User) {
  return mongoose.models.User;
}
return mongoose.model('User', UserSchema);

// ✅ Catch specific error and re-throw others
try {
  await processPayment(amount);
} catch (error) {
  if (error instanceof PaymentError) {
    // Handle specific error
    return { success: false, error: error.message };
  }
  // Re-throw unexpected errors
  throw error;
}
```

### Example - INCORRECT
```typescript
// ❌ WRONG - Silent error suppression
try {
  return mongoose.model('User', UserSchema);
} catch (error) {
  // Empty catch - error is silently ignored!
}

// ❌ WRONG - Catching all errors without re-throwing
try {
  await criticalOperation();
} catch (error) {
  console.log('Error occurred'); // Logged but not handled or re-thrown
  return null; // Silent failure
}
```

### Key Rules
- ✅ Use conditional logic for existence checks
- ✅ Catch only errors you can handle
- ✅ Re-throw unexpected errors
- ✅ Let errors bubble up if you can't handle them
- ❌ NO empty catch blocks
- ❌ NO silent error suppression
- ❌ NO catching all errors without re-throwing

---

# SECTION E: IMPORT & DEPENDENCY RULES

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

## RULE 13: Domain Import Pattern - Namespace Imports

### Application Layer MUST Import Domain as Namespace
- **NEVER import individual functions from domain**
- **ALWAYS import domain as namespace using `import * as`**
- **Call domain methods through namespace: `DomainName.methodName()`**

### Example - CORRECT
```typescript
// ✅ CORRECT - Import domain as namespace
import * as AuthDomain from '../../domain/auth/index.js';

export async function generateOTPHandler(req: Request, res: Response): Promise<void> {
  const { phoneNumber } = req.body;
  
  // Validate using domain namespace
  if (!AuthDomain.validatePhoneNumber(phoneNumber)) {
    res.status(400).json({ error: 'Invalid phone number' });
    return;
  }
  
  // Sanitize using domain namespace
  const sanitized = AuthDomain.sanitizePhoneNumber(phoneNumber);
  
  // Call domain business logic
  await AuthDomain.createOrUpdateOTP(sanitized);
  
  res.status(200).json({ success: true });
}
```

### Example - INCORRECT
```typescript
// ❌ WRONG - Importing individual functions
import {
  validatePhoneNumber,
  sanitizePhoneNumber,
  createOrUpdateOTP
} from '../../domain/auth/index.js';

export async function generateOTPHandler(req: Request, res: Response): Promise<void> {
  if (!validatePhoneNumber(phoneNumber)) { // Not clear this is from domain
    // ...
  }
}
```

### Why This Pattern?
- **Clarity**: Makes it obvious which layer is being called
- **Maintainability**: Easy to see domain dependencies
- **Refactoring**: Easier to track domain usage
- **Architecture**: Enforces proper layer separation

### Key Rules
- ✅ Import domain as namespace: `import * as DomainName`
- ✅ Call methods through namespace: `DomainName.method()`
- ✅ Makes domain calls explicit and traceable
- ❌ NO individual function imports from domain
- ❌ NO destructured imports from domain

### Application Layer Responsibilities
The application layer should be thin and focused on:
1. **Input validation** - Check request format
2. **Sanitization** - Clean input data
3. **Domain orchestration** - Call domain methods
4. **HTTP mapping** - Map domain results to HTTP responses
5. **Error handling** - Catch and format errors for HTTP

All business logic MUST be in the domain layer.

---

# SECTION F: CODE ORGANIZATION PATTERNS

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

## RULE 9: Rules to create extra files like formatter, constants, loggers in backend folder code

Example : Dont do this
formatters/
└── phone_formatter.ts                   # Phone number formatting

constants/
├── auth_constants.ts                    # OTP_LENGTH, TOKEN_EXPIRY
└── validation_constants.ts              # Phone regex patterns

loggers/
└── auth_logger.ts                       # Authentication event logging

1.Only create one logger.ts ( not specific to features)
2. Formatter.ts ( create this method in the file that it is being used, it is okay if it gets repeated in a few places)
3. constants dont create this seperately - maximum add in types.ts in domain folders. try to make apis so that constants dont leak, eg: instead of exposing from domain update_status ( status), export from domain mark_status_complete mark_status_canelled etc

---

## RULE 14: Logger File Creation and Usage

### Logger File Location
- **Backend**: `src/logger.ts` (single file at root of src/)
- **Frontend**: `src/logger.ts` (single file at root of src/)
- **NEVER create**: `loggers/` folder or feature-specific logger files

### Logger File Structure

**Backend Logger** (`src/logger.ts`):
```typescript
// Backend API Logger
// Logs all API calls with request parameters and responses

import { Request, Response, NextFunction } from 'express';

export function apiLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  // Log request
  console.log('\n🔵 === API REQUEST ===');
  console.log(`📍 API: ${req.method} ${req.path}`);
  console.log(`📦 Params:`, JSON.stringify(req.body, null, 2));
  console.log(`🔍 Query:`, JSON.stringify(req.query, null, 2));
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  // Capture original send function
  const originalSend = res.send;
  
  // Override send to log response
  res.send = function(data: any): Response {
    const duration = Date.now() - startTime;
    const isError = res.statusCode >= 400;
    const icon = isError ? '🔴' : '🟢';
    
    console.log(`\n${icon} === API RESPONSE ===`);
    console.log(`📍 API: ${req.method} ${req.path}`);
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📄 Response:`, typeof data === 'string' ? data : JSON.stringify(JSON.parse(data), null, 2));
    console.log('===================\n');
    
    return originalSend.call(this, data);
  };
  
  next();
}
```

**Frontend Logger** (`src/logger.ts`):
```typescript
// Frontend API Logger
// Logs all API calls with request parameters and responses

interface ILogAPICallParams {
  apiName: string;
  method: string;
  params?: any;
  query?: any;
}

interface ILogAPIResponseParams {
  apiName: string;
  method: string;
  status: number;
  duration: number;
  response: any;
  error?: boolean;
}

export function logAPICall({ apiName, method, params, query }: ILogAPICallParams): number {
  const startTime = Date.now();
  
  console.log('\n🔵 === API REQUEST ===');
  console.log(`📍 API: ${method} ${apiName}`);
  if (params) {
    console.log(`📦 Params:`, params);
  }
  if (query) {
    console.log(`🔍 Query:`, query);
  }
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  return startTime;
}

export function logAPIResponse({ apiName, method, status, duration, response, error = false }: ILogAPIResponseParams): void {
  const icon = error ? '🔴' : '🟢';
  
  console.log(`\n${icon} === API RESPONSE ===`);
  console.log(`📍 API: ${method} ${apiName}`);
  console.log(`📊 Status: ${status}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📄 Response:`, response);
  console.log('===================\n');
}

export function logAPIError({ apiName, method, error }: { apiName: string; method: string; error: any }): void {
  console.log('\n🔴 === API ERROR ===');
  console.log(`📍 API: ${method} ${apiName}`);
  console.log(`❌ Error:`, error.message || error);
  if (error.response) {
    console.log(`📊 Status: ${error.response.status}`);
    console.log(`📄 Response:`, error.response.data);
  }
  console.log('===================\n');
}
```

### Usage in Application Layer

**Backend Usage** (in `src/server.ts`):
```typescript
import { apiLogger } from './logger.js';

app.use(apiLogger);
```

**Frontend Usage** (in API files):
```typescript
import { logAPICall, logAPIResponse, logAPIError } from '../logger.js';

export async function generateOTPApi(phoneNumber: string): Promise<IGenerateOTPResponse> {
  const apiName = '/api/auth/generate-otp';
  const method = 'POST';
  const startTime = logAPICall({ apiName, method, params: { phoneNumber } });
  
  try {
    const response = await axios.post<IGenerateOTPResponse>(
      `${API_BASE_URL}${apiName}`,
      { phoneNumber }
    );
    
    const duration = Date.now() - startTime;
    logAPIResponse({ apiName, method, status: response.status, duration, response: response.data });
    
    return response.data;
  } catch (error) {
    logAPIError({ apiName, method, error });
    throw error;
  }
}
```

### Key Rules
- ✅ Only ONE logger.ts file per project (backend and frontend each have one)
- ✅ Located at `src/logger.ts` (root of src folder)
- ✅ Exports logging functions for API calls, responses, and errors
- ✅ Used in application layer for HTTP logging
- ✅ Logs API name, method, parameters, status, duration, and response
- ✅ Masks sensitive data (e.g., OTP shown as '****')
- ❌ NO separate `loggers/` folder
- ❌ NO feature-specific logger files
- ❌ NO logger middleware (frontend uses functions, not middleware)
- ❌ NO logging in domain layer (only application layer)

---

# SECTION G: DATABASE & PERSISTENCE

## RULE 11: Mongoose Schema and Model Management

### Schema and Model Location
- **Mongoose schemas and models MUST be defined in `domain/{domain}/{domain}_schema.ts`**
- **NEVER create a separate `models.ts` file in the application layer**

### Index Definition Rules
- **NEVER define the same index twice**
- Use EITHER `index: true` in field definition OR `schema.index()`, NOT both
- If a field has `unique: true`, it automatically creates an index - don't add `schema.index()` for it

### Example - CORRECT
```typescript
// domain/auth/auth_schema.ts
const UserSchema = new Schema({
  phoneNumber: { type: String, required: true, unique: true }, // unique creates index
  email: { type: String, required: true, index: true } // explicit index
});

// TTL index (different purpose, OK to add)
UserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
```

### Example - INCORRECT
```typescript
// ❌ WRONG - Duplicate index definition
const UserSchema = new Schema({
  phoneNumber: { type: String, required: true, unique: true }
});
UserSchema.index({ phoneNumber: 1 }); // Duplicate! unique already creates index

// ❌ WRONG - Models in application layer
// application/models.ts
export const UserModel = mongoose.model('User', UserSchema);
```

### Model Registration Pattern
Use the safe registration pattern to avoid duplicate model errors:
```typescript
export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
```

---

# SECTION H: CHECKLISTS & SUMMARY

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
12. **Namespace imports**: Import domain as `import * as DomainName`
13. **No silent failures**: Catch specific errors, re-throw others

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
