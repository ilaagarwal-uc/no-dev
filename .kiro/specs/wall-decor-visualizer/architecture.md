# Wall Decor Visualizer - Architecture Document

## Overview

The Wall Decor Visualizer is a web-based application built using Domain-Driven Design (DDD) principles with a clear separation between data operations and UI presentation. The architecture follows a two-service pattern: data-service for business logic and API operations, and page-service for UI components and page logic.

---

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Cloud Storage**: Google Cloud Platform (GCP) Cloud Storage
- **AI Integration**: Google Gemini API
- **3D Processing**: Headless Blender
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Vitest, Supertest

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State Management**: React Context API
- **Routing**: React Router
- **HTTP Client**: Axios
- **Testing**: Vitest, React Testing Library, Playwright

### Infrastructure
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Deployment**: TBD (post-demo)
- **Monitoring**: Console logging (enhanced monitoring post-demo)

---

## Architecture Principles

### 1. Domain-Driven Design (DDD)
- Clear separation between domain logic and application logic
- Domain layer contains pure business logic
- Application layer handles API contracts and external interactions
- No cross-domain dependencies within the same service

### 2. Service Separation
- **data-service**: Handles all data operations, business logic, and external API calls
- **page-service**: Handles UI components, page logic, and user interactions
- Services communicate through well-defined API contracts
- No direct imports between services (page-service calls data-service APIs)

### 3. Type Safety
- TypeScript throughout the stack
- Strict type checking enabled
- No `any` types in production code
- Separate type definitions for domain and application layers

### 4. Test-Driven Development
- Tests written before implementation
- 80%+ code coverage target
- Automated testing every 6 hours
- Root cause analysis for all failures

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Login Page      │  │  Image Upload    │  │  3D Viewer   │  │
│  │  (page-service)  │  │  (page-service)  │  │  (page-service)│
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│           │                     │                     │          │
│           └─────────────────────┴─────────────────────┘          │
│                    HTTP/REST API Calls                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
        ┌───────────▼──────────┐  ┌────▼──────────────┐
        │  API Gateway         │  │  WebSocket        │
        │  (REST Endpoints)    │  │  (Future)         │
        └───────────┬──────────┘  └───────────────────┘
                    │
        ┌───────────▼──────────────────────────────┐
        │      Backend (Node.js + Express)         │
        │  ┌──────────────────────────────────┐   │
        │  │  data-service                    │   │
        │  │  - Authentication (auth domain)  │   │
        │  │  - Image Management (image)      │   │
        │  │  - Gemini Integration (gemini)   │   │
        │  │  - Blender Execution (blender)   │   │
        │  └──────────────────────────────────┘   │
        └──────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
    ┌───▼──┐  ┌────▼────┐  ┌──▼────┐
    │ GCP  │  │MongoDB  │  │Headless│
    │Cloud │  │Database │  │Blender │
    │Store │  │         │  │        │
    └──────┘  └─────────┘  └────────┘
```

---

## Directory Structure

### Backend Structure

```
backend/
├── src/
│   ├── data-service/
│   │   ├── domain/
│   │   │   ├── auth/
│   │   │   │   ├── auth_schema.ts       # Auth types (IUser, IAuthToken, IOTP)
│   │   │   │   ├── index.ts             # Auth domain logic + validation
│   │   │   │   └── interface.ts         # Optional additional interfaces
│   │   │   ├── image/
│   │   │   │   ├── image_schema.ts      # Image types
│   │   │   │   └── index.ts             # Image domain logic
│   │   │   └── index.ts                 # Export all domains
│   │   └── application/
│   │       ├── auth/
│   │       │   ├── generate_otp.api.ts  # Generate OTP API
│   │       │   ├── verify_otp.api.ts    # Verify OTP API
│   │       │   └── index.ts             # Export auth APIs
│   │       ├── image/
│   │       │   ├── upload_image.api.ts  # Upload image API
│   │       │   └── index.ts             # Export image APIs
│   │       ├── errors.ts                # ALL data-service errors
│   │       └── index.ts                 # Export all APIs
│   ├── page-service/
│   │   ├── domain/
│   │   │   ├── login-page/
│   │   │   │   ├── LoginPage.tsx        # Main login page component
│   │   │   │   ├── PhoneNumberForm.tsx  # Phone number input form
│   │   │   │   ├── OTPForm.tsx          # OTP verification form
│   │   │   │   ├── login_page.module.css
│   │   │   │   ├── index.ts             # Page logic functions
│   │   │   │   └── interface.ts         # Optional interfaces
│   │   │   ├── upload-page/
│   │   │   │   ├── UploadPage.tsx       # Main upload page
│   │   │   │   ├── ImageUploader.tsx    # Image upload component
│   │   │   │   ├── CameraCapture.tsx    # Camera capture component
│   │   │   │   ├── upload_page.module.css
│   │   │   │   └── index.ts             # Page logic functions
│   │   │   └── index.ts                 # Export all page domains
│   │   └── application/
│   │       ├── login/
│   │       │   ├── login_page.api.ts    # Login page API calls
│   │       │   └── index.ts             # Export login APIs
│   │       ├── upload/
│   │       │   ├── upload_page.api.ts   # Upload page API calls
│   │       │   └── index.ts             # Export upload APIs
│   │       ├── errors.ts                # ALL page-service errors
│   │       └── index.ts                 # Export all APIs
│   ├── server.ts                        # Express server setup
│   └── vite_env.d.ts                    # Vite type definitions (frontend only)
├── formatters/                          # Feature-specific formatters
│   ├── date_formatter.ts
│   └── phone_formatter.ts
├── constants/                           # Feature-specific constants
│   ├── api_constants.ts
│   └── validation_constants.ts
├── logger.ts                            # Single logger file
├── package.json
├── tsconfig.json
└── .env.local
```

### Frontend Structure

```
frontend/
├── src/
│   ├── data-service/
│   │   ├── domain/
│   │   │   ├── auth/
│   │   │   │   ├── auth_schema.ts       # Auth types
│   │   │   │   ├── index.ts             # Auth domain logic
│   │   │   │   └── interface.ts         # Optional interfaces
│   │   │   └── index.ts                 # Export all domains
│   │   └── application/
│   │       ├── auth/
│   │       │   ├── generate_otp.api.ts  # Call backend generate OTP
│   │       │   ├── verify_otp.api.ts    # Call backend verify OTP
│   │       │   └── index.ts             # Export auth APIs
│   │       ├── errors.ts                # ALL data-service errors
│   │       └── index.ts                 # Export all APIs
│   ├── page-service/
│   │   ├── domain/
│   │   │   ├── login-page/
│   │   │   │   ├── LoginPage.tsx        # Main login page
│   │   │   │   ├── PhoneNumberForm.tsx  # Phone form component
│   │   │   │   ├── OTPForm.tsx          # OTP form component
│   │   │   │   ├── login_page.module.css
│   │   │   │   ├── index.ts             # Page logic
│   │   │   │   └── interface.ts         # Optional interfaces
│   │   │   └── index.ts                 # Export all pages
│   │   └── application/
│   │       ├── login/
│   │       │   ├── login_page.api.ts    # Login page API wrapper
│   │       │   └── index.ts             # Export login APIs
│   │       ├── errors.ts                # ALL page-service errors
│   │       └── index.ts                 # Export all APIs
│   ├── App.tsx                          # Main app component
│   ├── main.tsx                         # App entry point
│   └── app.module.css                   # Global app styles
├── constants/
│   └── api_constants.ts                 # API base URLs
├── styles.css                           # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

---

## Domain Models

### Authentication Domain (data-service)

**Schema Types** (`auth_schema.ts`):
```typescript
export interface IUser {
  id: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthToken {
  token: string;
  expiresAt: Date;
  userId: string;
}

export interface IOTP {
  otp: string;
  phoneNumber: string;
  expiresAt: Date;
  createdAt: Date;
  used: boolean;
  failedAttempts: number;
  lockedUntil: Date | null;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'expired';
export type OTPStatus = 'valid' | 'expired' | 'used' | 'locked';
```

**Domain Functions** (`index.ts`):
- `validatePhoneNumber(phone: string): boolean`
- `validateOTP(otp: string): boolean`
- `sanitizePhoneNumber(phone: string): string`
- `sanitizeOTP(otp: string): string`
- `generateOTP(): string` (returns fixed "2213" for demo)
- `generateAuthToken(userId: string): IAuthToken`
- `verifyAuthToken(token: string): { valid: boolean; userId?: string }`
- `hashPhoneNumber(phone: string): string`
- `isOTPExpired(otp: IOTP): boolean`
- `isOTPLocked(otp: IOTP): boolean`
- `shouldPermanentlyInvalidate(failedAttempts: number): boolean`

### Image Domain (data-service)

**Schema Types** (`image_schema.ts`):
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

**Domain Functions** (`index.ts`):
- `validateImageFormat(mimeType: string): boolean`
- `validateImageSize(fileSize: number): boolean`
- `generateImageId(): string`
- `extractImageMetadata(file: File): IImageMetadata`

---

## API Endpoints

### Authentication APIs

#### POST /api/auth/generate-otp
**Purpose**: Generate and send OTP to phone number

**Request**:
```typescript
{
  phoneNumber: string;  // 10-digit phone number
  ipAddress?: string;   // Optional for rate limiting
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
  retryAfter?: number;  // Seconds to wait if rate limited
}
```

**Rate Limiting**:
- 3 requests per phone number per 10 minutes
- 10 requests per IP address per hour

**Validation**:
- Phone number must be exactly 10 digits
- Phone number must be numeric only

---

#### POST /api/auth/verify-otp
**Purpose**: Verify OTP and authenticate user

**Request**:
```typescript
{
  phoneNumber: string;  // 10-digit phone number
  otp: string;          // 4-digit OTP
}
```

**Response**:
```typescript
{
  success: boolean;
  token?: string;       // JWT token (on success)
  userId?: string;      // User ID (on success)
  error?: {
    message: string;
    code: string;
    remainingAttempts?: number;
    lockedUntil?: number;  // Seconds until unlock
  };
}
```

**OTP Lockout Logic**:
- 3 failed attempts: Lock for 1 minute
- 5 failed attempts: Permanently invalidate OTP
- OTP expires after 10 minutes
- OTP can only be used once

**Security**:
- Constant-time comparison to prevent timing attacks
- SHA256 hashing for phone numbers in logs
- JWT tokens with 1-hour expiration

---

### Image APIs

#### POST /api/images/upload
**Purpose**: Upload wall image to GCP Cloud Storage

**Request**: Multipart form data
```typescript
{
  image: File;          // Image file (JPEG, PNG, WebP)
  userId: string;       // Authenticated user ID
}
```

**Response**:
```typescript
{
  success: boolean;
  imageId?: string;     // Unique image identifier
  gcpUrl?: string;      // GCP Cloud Storage URL
  error?: string;
}
```

**Validation**:
- Supported formats: JPEG, PNG, WebP
- Maximum file size: 10MB
- Authenticated users only

---

## Data Flow

### Authentication Flow

```
1. User enters phone number
   ↓
2. Frontend validates format (10 digits)
   ↓
3. Frontend calls POST /api/auth/generate-otp
   ↓
4. Backend validates phone number
   ↓
5. Backend checks rate limiting
   ↓
6. Backend generates OTP ("2213")
   ↓
7. Backend stores OTP in MongoDB (10-minute expiration)
   ↓
8. Backend returns success response
   ↓
9. Frontend displays OTP input form
   ↓
10. User enters OTP
   ↓
11. Frontend calls POST /api/auth/verify-otp
   ↓
12. Backend validates OTP format
   ↓
13. Backend checks OTP status (expired, used, locked)
   ↓
14. Backend compares OTP (constant-time)
   ↓
15. Backend generates JWT token
   ↓
16. Backend marks OTP as used
   ↓
17. Backend creates/updates user record
   ↓
18. Backend returns token and userId
   ↓
19. Frontend stores token (localStorage + cookies)
   ↓
20. Frontend redirects to dashboard
```

### Image Upload Flow

```
1. User selects image (file browser or camera)
   ↓
2. Frontend validates format and size
   ↓
3. Frontend calls POST /api/images/upload
   ↓
4. Backend validates authentication token
   ↓
5. Backend validates image format and size
   ↓
6. Backend generates unique imageId
   ↓
7. Backend uploads to GCP Cloud Storage
   ↓
8. Backend stores metadata in MongoDB
   ↓
9. Backend returns imageId and GCP URL
   ↓
10. Frontend displays uploaded image
```

---

## Security Considerations

### Authentication
- JWT tokens with 1-hour expiration
- HTTP-only cookies for token storage
- Secure flag enabled in production
- SameSite=Strict for CSRF protection

### Rate Limiting
- Phone number: 3 OTP requests per 10 minutes
- IP address: 10 OTP requests per hour
- Prevents brute force attacks

### OTP Security
- Fixed OTP "2213" for demo (production: random 4-digit)
- 10-minute expiration
- One-time use enforcement
- Lockout after 3 failed attempts (1 minute)
- Permanent invalidation after 5 failed attempts
- Constant-time comparison to prevent timing attacks

### Data Protection
- Phone numbers hashed (SHA256) in logs
- Sensitive data never logged in plain text
- Environment variables for secrets
- HTTPS in production

### Input Validation
- All inputs validated on both frontend and backend
- Type checking with TypeScript
- Sanitization before database operations
- SQL injection prevention (MongoDB parameterized queries)

---

## Performance Considerations

### Frontend
- Code splitting by route
- Lazy loading for components
- Image optimization
- CSS Modules for scoped styles
- Vite for fast builds and HMR

### Backend
- MongoDB indexes on frequently queried fields
- Connection pooling for database
- Async/await for non-blocking operations
- Rate limiting to prevent abuse
- TTL indexes for automatic OTP cleanup

### Caching
- No Redis for demo (simplified architecture)
- Browser caching for static assets
- Future: Redis for session management

---

## Monitoring & Logging

### Current (Demo)
- Console logging for all operations
- Error logging with stack traces
- Request/response logging
- Performance timing logs

### Future (Post-Demo)
- Centralized logging (e.g., Winston, Pino)
- Error tracking (e.g., Sentry)
- Performance monitoring (e.g., New Relic)
- Uptime monitoring
- Alert system for critical failures

---

## Deployment Strategy

### Current (Demo)
- Local development environment
- Manual deployment
- Environment variables in `.env.local`

### Future (Post-Demo)
- CI/CD pipeline (GitHub Actions)
- Automated testing before deployment
- Staging environment
- Production environment
- Blue-green deployment
- Rollback capability

---

## Scalability Considerations

### Current Architecture
- Monolithic backend (suitable for demo)
- Single MongoDB instance
- Single GCP bucket

### Future Scaling
- Microservices architecture
- MongoDB replica sets
- Load balancing
- CDN for static assets
- Horizontal scaling for backend
- Caching layer (Redis)
- Message queue for async operations

---

## Testing Strategy

### Unit Tests
- 80%+ coverage target
- Test all domain functions
- Test all API endpoints
- Mock external dependencies

### Integration Tests
- Test service interactions
- Test database operations
- Test API contracts
- Test authentication flow

### E2E Tests
- Test critical user paths
- Test login flow
- Test image upload flow
- Playwright for browser automation

### Continuous Testing
- Automated tests every 6 hours
- Pre-commit hooks for unit tests
- CI pipeline for full test suite
- Coverage reports on every PR

---

## Error Handling

### Error Classes
All errors centralized in `application/errors.ts`:

**data-service errors**:
- `AuthError` - Base authentication error
- `InvalidPhoneNumberError` - Invalid phone format
- `InvalidOTPError` - Invalid OTP format
- `OTPExpiredError` - OTP has expired
- `OTPLockedError` - OTP locked due to failed attempts
- `RateLimitError` - Rate limit exceeded
- `NetworkError` - Network/database errors

**page-service errors**:
- `PageError` - Base page error
- `LoginPageError` - Login page specific errors
- `UploadPageError` - Upload page specific errors

### Error Response Format
```typescript
{
  success: false,
  error: {
    message: string;      // User-friendly message
    code: string;         // Error code for client handling
    details?: object;     // Additional error details
  }
}
```

---

## Configuration Management

### Environment Variables

**Backend** (`.env.local`):
```bash
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wall-decor-visualizer

# GCP
GCP_PROJECT_ID=your-project-id
GCP_BUCKET_NAME=wall-decor-visualizer-images
GCP_CREDENTIALS_PATH=./gcp-credentials.json

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRY=3600

# Gemini API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-pro

# Rate Limiting
OTP_RATE_LIMIT_PHONE=3
OTP_RATE_LIMIT_PHONE_WINDOW=600
OTP_RATE_LIMIT_IP=10
OTP_RATE_LIMIT_IP_WINDOW=3600
```

**Frontend** (`.env.local`):
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Wall Decor Visualizer
```

---

## Dependencies

### Backend Dependencies
```json
{
  "express": "^4.18.0",
  "mongoose": "^8.0.0",
  "@google-cloud/storage": "^7.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "dotenv": "^16.0.0",
  "cors": "^2.8.5"
}
```

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.0"
}
```

### Dev Dependencies
```json
{
  "typescript": "^5.3.0",
  "vite": "^5.0.0",
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0",
  "playwright": "^1.40.0"
}
```

---

## Future Enhancements

### Phase 2 (Post-Demo)
- Dimension marking on images
- Gemini API integration for Blender script generation
- Headless Blender execution
- 3D model viewer
- Model catalog
- Drag-and-drop model application

### Phase 3
- Material quantity calculator
- Bill of materials generation
- Model persistence and sharing
- Advanced 3D manipulation
- Export to multiple formats

### Phase 4
- Real-time collaboration
- Mobile app (React Native)
- AR visualization
- AI-powered design suggestions
- Integration with e-commerce platforms

---

## Glossary

- **DDD**: Domain-Driven Design
- **JWT**: JSON Web Token
- **OTP**: One-Time Password
- **GCP**: Google Cloud Platform
- **TTL**: Time To Live
- **CSRF**: Cross-Site Request Forgery
- **CORS**: Cross-Origin Resource Sharing
- **HMR**: Hot Module Replacement
- **E2E**: End-to-End
- **CI/CD**: Continuous Integration/Continuous Deployment
