# Wall Decor Visualizer - Design Document

## Overview

The Wall Decor Visualizer is a web-based application that enables users to transform 2D wall images into interactive 3D models with decorative elements. This design document focuses on the authentication and image upload flows as the foundational entry points to the application, following Domain-Driven Design (DDD) principles with strict separation between data-service and page-service layers.

---

## Design Philosophy

### Core Principles

1. **Domain-Driven Design (DDD)**
   - Clear separation between domain logic (business rules) and application logic (API contracts)
   - Domain layer contains pure, stateless functions
   - Application layer handles external interactions and API contracts
   - No cross-layer type dependencies

2. **Service Isolation**
   - data-service: Handles all data operations and business logic
   - page-service: Handles UI components and page logic
   - Services communicate only through well-defined API contracts
   - No direct imports between services

3. **Type Safety First**
   - TypeScript throughout the stack
   - Strict type checking enabled
   - Separate type definitions for each layer
   - No `any` types in production code

4. **Security by Design**
   - Authentication required for all protected routes
   - Rate limiting on sensitive endpoints
   - Input validation on both frontend and backend
   - Secure token storage and transmission

5. **User Experience**
   - Premium, smooth aesthetic with pastel colors
   - Responsive design (mobile-first)
   - Smooth animations and transitions
   - Clear error messages and feedback

---

## Authentication Design

### Overview

Authentication uses a phone number + OTP flow with JWT tokens for session management. The design prioritizes security while maintaining a smooth user experience.



### Authentication Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ 1. Enter phone number
       ▼
┌─────────────────────────┐
│  PhoneNumberForm        │
│  (page-service)         │
│  - Validate format      │
│  - Sanitize input       │
└──────┬──────────────────┘
       │
       │ 2. POST /api/auth/generate-otp
       ▼
┌─────────────────────────┐
│  generate_otp.api.ts    │
│  (data-service)         │
│  - Validate phone       │
│  - Check rate limit     │
│  - Generate OTP         │
│  - Store in MongoDB     │
└──────┬──────────────────┘
       │
       │ 3. Success response
       ▼
┌─────────────────────────┐
│  OTPForm                │
│  (page-service)         │
│  - Display OTP input    │
│  - Auto-focus           │
│  - Track attempts       │
└──────┬──────────────────┘
       │
       │ 4. POST /api/auth/verify-otp
       ▼
┌─────────────────────────┐
│  verify_otp.api.ts      │
│  (data-service)         │
│  - Validate OTP         │
│  - Check lockout        │
│  - Verify OTP           │
│  - Generate JWT         │
│  - Create/update user   │
└──────┬──────────────────┘
       │
       │ 5. Return token + userId
       ▼
┌─────────────────────────┐
│  LoginPage              │
│  (page-service)         │
│  - Store token          │
│  - Redirect to dashboard│
└─────────────────────────┘
```

### Backend Design (data-service)

#### Domain Layer: auth

**File**: `auth_schema.ts`
```typescript
// Type definitions only - no logic
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

**File**: `index.ts`
```typescript
// Pure domain logic functions
export function validatePhoneNumber(phone: string): boolean;
export function validateOTP(otp: string): boolean;
export function sanitizePhoneNumber(phone: string): string;
export function sanitizeOTP(otp: string): string;
export function generateOTP(): string;
export function generateAuthToken(userId: string): IAuthToken;
export function verifyAuthToken(token: string): { valid: boolean; userId?: string };
export function hashPhoneNumber(phone: string): string;
export function isOTPExpired(otp: IOTP): boolean;
export function isOTPLocked(otp: IOTP): boolean;
export function shouldPermanentlyInvalidate(failedAttempts: number): boolean;
```



#### Application Layer: auth

**File**: `generate_otp.api.ts`
```typescript
// API contract types (separate from domain types)
export interface IGenerateOTPRequest {
  phoneNumber: string;
  ipAddress?: string;
}

export interface IGenerateOTPResponse {
  success: boolean;
  message: string;
  retryAfter?: number;
}

// API implementation
export async function generateOTP(request: IGenerateOTPRequest): Promise<IGenerateOTPResponse> {
  // 1. Validate phone number using domain function
  // 2. Check rate limiting (phone + IP)
  // 3. Generate OTP using domain function
  // 4. Store OTP in MongoDB with TTL
  // 5. Return response
}
```

**File**: `verify_otp.api.ts`
```typescript
// API contract types
export interface IVerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

export interface IVerifyOTPResponse {
  success: boolean;
  token?: string;
  userId?: string;
  error?: {
    message: string;
    code: string;
    remainingAttempts?: number;
    lockedUntil?: number;
  };
}

// API implementation
export async function verifyOTP(request: IVerifyOTPRequest): Promise<IVerifyOTPResponse> {
  // 1. Validate OTP format using domain function
  // 2. Retrieve OTP from MongoDB
  // 3. Check lockout status using domain function
  // 4. Check expiration using domain function
  // 5. Verify OTP (constant-time comparison)
  // 6. Track failed attempts
  // 7. Generate JWT token using domain function
  // 8. Mark OTP as used
  // 9. Create/update user in MongoDB
  // 10. Return response
}
```

**File**: `errors.ts`
```typescript
// ALL data-service errors in one file
export class AuthError extends Error {}
export class InvalidPhoneNumberError extends Error {}
export class InvalidOTPError extends Error {}
export class OTPExpiredError extends Error {}
export class OTPLockedError extends Error {}
export class RateLimitError extends Error {}
export class NetworkError extends Error {}
```

### Frontend Design (page-service)

#### Domain Layer: login-page

**File**: `LoginPage.tsx`
```typescript
// Main login page component
export function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.loginPage}>
      {step === 'phone' && (
        <PhoneNumberForm
          onSubmit={handlePhoneSubmit}
          onError={setError}
        />
      )}
      {step === 'otp' && (
        <OTPForm
          phoneNumber={phoneNumber}
          onSubmit={handleOTPSubmit}
          onBack={() => setStep('phone')}
          onError={setError}
        />
      )}
    </div>
  );
}
```

**File**: `PhoneNumberForm.tsx`
```typescript
// Phone number input form component
export function PhoneNumberForm({ onSubmit, onError }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate using domain function
    // Call API
    // Handle response
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="tel"
        placeholder="Enter 10-digit phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send OTP'}
      </button>
    </form>
  );
}
```

**File**: `OTPForm.tsx`
```typescript
// OTP verification form component
export function OTPForm({ phoneNumber, onSubmit, onBack, onError }) {
  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate using domain function
    // Call API
    // Handle response (success, error, lockout)
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>OTP sent to {phoneNumber}</p>
      <input
        type="text"
        placeholder="Enter 4-digit OTP"
        value={otp}
        onChange={(e) => setOTP(e.target.value)}
        maxLength={4}
        autoFocus
      />
      {failedAttempts > 0 && (
        <p>{5 - failedAttempts} attempts remaining</p>
      )}
      {lockedUntil && (
        <p>Locked. Try again in {countdown} seconds</p>
      )}
      <button type="submit" disabled={loading || !!lockedUntil}>
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
      <button type="button" onClick={onBack}>
        Back
      </button>
    </form>
  );
}
```

**File**: `index.ts`
```typescript
// Page logic functions
export function initializeLoginForm(): ILoginFormState;
export function validateLoginForm(state: ILoginFormState): { valid: boolean; errors: object };
export function initializeOTPForm(): IOTPFormState;
export function validateOTPForm(state: IOTPFormState): { valid: boolean; errors: object };
export function calculateRemainingLockoutTime(lockedUntil: number): number;
export function shouldShowCountdown(failedAttempts: number): boolean;
```



#### Application Layer: login

**File**: `login_page.api.ts`
```typescript
// API wrapper for login page
export interface ILoginPageRequest {
  phoneNumber: string;
}

export interface ILoginPageResponse {
  success: boolean;
  message: string;
  retryAfter?: number;
}

export async function handleLoginPage(request: ILoginPageRequest): Promise<ILoginPageResponse> {
  // Call data-service generate_otp API
  // Return response
}
```

**File**: `errors.ts`
```typescript
// ALL page-service errors in one file
export class PageError extends Error {}
export class LoginPageError extends Error {}
export class UploadPageError extends Error {}
```

### Security Design

#### OTP Generation
- **Demo**: Fixed OTP "2213" for testing
- **Production**: Random 4-digit numeric OTP
- **Expiration**: 10 minutes from generation
- **Storage**: MongoDB with TTL index for automatic cleanup

#### OTP Verification
- **Constant-time comparison**: Prevents timing attacks
- **Failed attempt tracking**: Increments on each failure
- **Lockout mechanism**:
  - 3 failed attempts: Lock for 1 minute
  - 5 failed attempts: Permanently invalidate OTP
- **One-time use**: OTP marked as used after successful verification

#### Rate Limiting
- **Phone number**: 3 OTP requests per 10 minutes
- **IP address**: 10 OTP requests per hour
- **Implementation**: MongoDB tracking with TTL indexes
- **Response**: Returns `retryAfter` seconds when rate limited

#### JWT Tokens
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 1 hour (configurable via JWT_EXPIRY env var)
- **Payload**: `{ sub: userId, iat: timestamp, exp: timestamp, iss: 'wall-decor-visualizer' }`
- **Storage**: localStorage + HTTP-only cookies
- **Transmission**: Authorization header: `Bearer <token>`

#### Phone Number Privacy
- **Logging**: SHA256 hash only (never plain text)
- **Storage**: Plain text in database (encrypted at rest by MongoDB)
- **Transmission**: HTTPS only in production

---

## Image Upload Design

### Overview

Image upload allows users to upload wall images from their device or capture directly from camera. Images are stored in GCP Cloud Storage with metadata in MongoDB.

### Image Upload Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ 1. Select image (file browser or camera)
       ▼
┌─────────────────────────┐
│  ImageUploader          │
│  (page-service)         │
│  - Validate format      │
│  - Validate size        │
│  - Show preview         │
└──────┬──────────────────┘
       │
       │ 2. POST /api/images/upload
       ▼
┌─────────────────────────┐
│  upload_image.api.ts    │
│  (data-service)         │
│  - Validate auth token  │
│  - Validate image       │
│  - Generate imageId     │
│  - Upload to GCP        │
│  - Store metadata       │
└──────┬──────────────────┘
       │
       │ 3. Return imageId + GCP URL
       ▼
┌─────────────────────────┐
│  UploadPage             │
│  (page-service)         │
│  - Display success      │
│  - Show uploaded image  │
└─────────────────────────┘
```

### Backend Design (data-service)

#### Domain Layer: image

**File**: `image_schema.ts`
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

**File**: `index.ts`
```typescript
export function validateImageFormat(mimeType: string): boolean;
export function validateImageSize(fileSize: number): boolean;
export function generateImageId(): string;
export function extractImageMetadata(file: File): IImageMetadata;
export function sanitizeFilename(filename: string): string;
```

#### Application Layer: image

**File**: `upload_image.api.ts`
```typescript
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

export async function uploadImage(request: IUploadImageRequest): Promise<IUploadImageResponse> {
  // 1. Validate image format using domain function
  // 2. Validate image size using domain function
  // 3. Generate imageId using domain function
  // 4. Upload to GCP Cloud Storage
  // 5. Store metadata in MongoDB
  // 6. Return response
}
```

### Frontend Design (page-service)

#### Domain Layer: upload-page

**File**: `UploadPage.tsx`
```typescript
export function UploadPage() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('pending');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<IImage[]>([]);

  return (
    <div className={styles.uploadPage}>
      <ImageUploader
        onUpload={handleUpload}
        onProgress={setUploadProgress}
      />
      <CameraCapture
        onCapture={handleCapture}
      />
      <RecentUploads images={uploadedImages} />
    </div>
  );
}
```

**File**: `ImageUploader.tsx`
```typescript
export function ImageUploader({ onUpload, onProgress }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate using domain function
      // Generate preview
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    // Call API
    // Track progress
    // Handle response
  };

  return (
    <div className={styles.uploader}>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
      />
      {preview && <img src={preview} alt="Preview" />}
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
```

**File**: `CameraCapture.tsx`
```typescript
export function CameraCapture({ onCapture }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    setStream(mediaStream);
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  };

  const captureImage = () => {
    // Capture frame from video
    // Convert to blob
    // Call onCapture
  };

  return (
    <div className={styles.cameraCapture}>
      <video ref={videoRef} autoPlay />
      <button onClick={startCamera}>Open Camera</button>
      <button onClick={captureImage}>Capture</button>
    </div>
  );
}
```

### Image Validation

#### Format Validation
- **Supported formats**: JPEG, PNG, WebP
- **MIME type check**: `image/jpeg`, `image/png`, `image/webp`
- **File extension check**: `.jpg`, `.jpeg`, `.png`, `.webp`

#### Size Validation
- **Maximum size**: 10MB (10,485,760 bytes)
- **Minimum size**: 1KB (1,024 bytes)
- **Check**: Both frontend and backend

#### Security
- **Authentication required**: JWT token validation
- **File type verification**: Magic number check (not just extension)
- **Virus scanning**: Future enhancement
- **Content moderation**: Future enhancement

---

## UI Design System

### Color Palette

**Primary Colors** (Pastel Harmony):
- Primary Accent: `#97B3AE` (Muted Teal) - Buttons, links, focus states
- Secondary Accent: `#F2C3B9` (Soft Rose) - Hover states, highlights
- Main Background: `#F0EEEA` (Off-white) - Page background
- Light Background: `#F0DDD6` (Warm Beige) - Cards, sections
- Subtle Background: `#D2E0D3` (Soft Sage) - Depth variations
- Borders: `#D6CBBF` (Taupe) - Borders, dividers

**Text Colors**:
- Primary Text: `#2d3748` (Soft Charcoal)
- Secondary Text: `#78716c` (Warm Gray)

**Utility Colors**:
- Error: `#ef4444` (Soft Red)
- Success: `#10b981` (Soft Green)
- Warning: `#f59e0b` (Soft Amber)
- Loading: `#C1E1C1` (Soft Mint Green)

### Typography

**Font Family**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen'`

**Font Sizes**:
- H1: 2.5rem (40px), Bold (700)
- H2: 2rem (32px), Bold (700)
- H3: 1.5rem (24px), Semi-bold (600)
- Body: 1rem (16px), Regular (400)
- Small: 0.875rem (14px), Regular (400)
- Caption: 0.75rem (12px), Regular (400)

### Spacing

- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

### Border Radius

- sm: 0.375rem (6px)
- md: 0.5rem (8px)
- lg: 0.75rem (12px)
- xl: 1rem (16px)
- full: 9999px

### Animations

**Transitions**:
- Button hover: 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)
- Input focus: 0.25s cubic-bezier(0.4, 0, 0.2, 1)
- Card hover: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)

**Keyframes**:
- Fade in: 0.6s ease-in-out
- Slide up: 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)
- Pulse: 2s ease-in-out infinite

**Micro-interactions**:
- Button: Scale 1.02x + shadow on hover
- Input: Soft glow + border color on focus
- Card: Lift (translateY -4px) + shadow on hover

### Responsive Design

**Breakpoints**:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Adjustments**:
- Single column layout
- Larger touch targets (min 44px)
- Reduced padding
- Full-width buttons
- Simplified navigation

---

## Component Specifications

### Input Field

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

### Button (Primary)

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

### Card

```css
background: white
border: 1px solid #D6CBBF
border-radius: 0.75rem (12px)
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
padding: 1.5rem
transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)

hover:
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
  transform: translateY(-4px)
```

---

## Error Handling Design

### Error Display

**Inline Errors** (Form validation):
```typescript
<input />
{error && (
  <p className={styles.error}>
    {error}
  </p>
)}
```

**Toast Notifications** (API errors):
```typescript
<Toast
  type="error"
  message="Failed to send OTP. Please try again."
  duration={5000}
  onClose={handleClose}
/>
```

**Error Boundaries** (React errors):
```typescript
<ErrorBoundary
  fallback={<ErrorPage />}
  onError={logError}
>
  <App />
</ErrorBoundary>
```

### Error Messages

**User-friendly messages**:
- "Invalid phone number. Please enter a 10-digit number."
- "OTP has expired. Please request a new one."
- "Too many attempts. Please try again in 1 minute."
- "Network error. Please check your connection."

**Error codes** (for client handling):
- `INVALID_PHONE_NUMBER`
- `INVALID_OTP_FORMAT`
- `OTP_EXPIRED`
- `OTP_LOCKED`
- `OTP_PERMANENTLY_INVALIDATED`
- `RATE_LIMIT_EXCEEDED`
- `NETWORK_ERROR`

---

## Performance Optimization

### Frontend

**Code Splitting**:
```typescript
const LoginPage = lazy(() => import('./pages/LoginPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
```

**Image Optimization**:
- Lazy loading for images
- WebP format with JPEG fallback
- Responsive images with srcset
- Compression before upload

**Bundle Optimization**:
- Tree shaking
- Minification
- Gzip compression
- CDN for static assets

### Backend

**Database Optimization**:
- Indexes on frequently queried fields
- TTL indexes for automatic cleanup
- Connection pooling
- Query optimization

**API Optimization**:
- Response compression
- Caching headers
- Rate limiting
- Request validation

---

## Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast**:
- Text on background: 4.5:1 minimum
- Interactive elements: 3:1 minimum
- Large text (18px+): 3:1 minimum

**Keyboard Navigation**:
- Tab order follows visual flow
- All interactive elements keyboard accessible
- Escape key closes modals
- Enter key submits forms

**Screen Readers**:
- Semantic HTML (button, input, label)
- ARIA labels for icon-only buttons
- Form labels associated with inputs
- Error messages linked to inputs
- Proper heading hierarchy

**Motion**:
- Respect prefers-reduced-motion
- No auto-playing animations
- Animations can be disabled

---

## Testing Strategy

### Unit Tests

**Domain Layer**:
- Test all validation functions
- Test all sanitization functions
- Test all generation functions
- Test edge cases

**Application Layer**:
- Test API request/response handling
- Test error handling
- Test rate limiting logic
- Mock external dependencies

**Components**:
- Test rendering
- Test user interactions
- Test state management
- Test error states

### Integration Tests

**API Endpoints**:
- Test full request/response cycle
- Test database interactions
- Test authentication flow
- Test error scenarios

**Component Integration**:
- Test form submission
- Test API calls from components
- Test state updates
- Test navigation

### E2E Tests

**Critical Paths**:
- Complete login flow
- Complete upload flow
- Error handling
- Session persistence

---

## Deployment Considerations

### Environment Configuration

**Development**:
- Local MongoDB
- Local GCP emulator (optional)
- Debug logging enabled
- Hot module replacement

**Staging**:
- Staging MongoDB
- Staging GCP bucket
- Info logging
- Similar to production

**Production**:
- Production MongoDB
- Production GCP bucket
- Error logging only
- Performance monitoring
- HTTPS enforced

### Build Process

**Frontend**:
```bash
npm run build
# Output: dist/
# - Minified JS/CSS
# - Optimized images
# - Source maps (optional)
```

**Backend**:
```bash
npm run build
# Output: dist/
# - Compiled TypeScript
# - Source maps
```

### Monitoring

**Metrics to Track**:
- API response times
- Error rates
- Authentication success/failure rates
- Image upload success rates
- Database query performance
- Memory usage
- CPU usage

**Alerts**:
- Error rate > 5%
- Response time > 2s
- Database connection failures
- GCP upload failures

---

## Future Enhancements

### Phase 2
- Dimension marking on images
- Gemini API integration
- Blender script generation
- 3D model viewer

### Phase 3
- Material quantity calculator
- Model catalog
- Drag-and-drop model application
- Model persistence

### Phase 4
- Real-time collaboration
- Mobile app
- AR visualization
- AI-powered suggestions

---

## Glossary

- **DDD**: Domain-Driven Design
- **JWT**: JSON Web Token
- **OTP**: One-Time Password
- **GCP**: Google Cloud Platform
- **TTL**: Time To Live
- **WCAG**: Web Content Accessibility Guidelines
- **ARIA**: Accessible Rich Internet Applications
- **HMR**: Hot Module Replacement
- **E2E**: End-to-End
