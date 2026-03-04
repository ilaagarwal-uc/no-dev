# Wall Decor Visualizer - Design Document

## Overview

The Wall Decor Visualizer is a web-based application that enables users to transform 2D wall images into interactive 3D models with decorative elements. This design document focuses on the authentication and image upload flows as the foundational entry points to the application.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Login Page      │  │  Image Upload    │  │  3D Viewer   │  │
│  │  Component       │  │  Component       │  │  Component   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│           │                     │                     │          │
│           └─────────────────────┴─────────────────────┘          │
│                    State Management (Redux)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
        ┌───────────▼──────────┐  ┌────▼──────────────┐
        │  API Gateway         │  │  WebSocket        │
        │  (REST Endpoints)    │  │  (Real-time)      │
        └───────────┬──────────┘  └────┬──────────────┘
                    │                   │
        ┌───────────▼──────────────────▼──────────┐
        │      Backend (Node.js/Express)          │
        │  ┌──────────────────────────────────┐   │
        │  │  Authentication Service          │   │
        │  │  - Login/Logout                  │   │
        │  │  - Token Management              │   │
        │  │  - Session Validation            │   │
        │  └──────────────────────────────────┘   │
        │  ┌──────────────────────────────────┐   │
        │  │  Image Upload Service            │   │
        │  │  - File Validation               │   │
        │  │  - GCP Integration               │   │
        │  │  - Metadata Storage              │   │
        │  └──────────────────────────────────┘   │
        │  ┌──────────────────────────────────┐   │
        │  │  Gemini API Integration          │   │
        │  │  - Prompt Engineering            │   │
        │  │  - Script Generation             │   │
        │  └──────────────────────────────────┘   │
        │  ┌──────────────────────────────────┐   │
        │  │  Job Queue Manager               │   │
        │  │  - Blender Execution             │   │
        │  │  - Status Tracking               │   │
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

### Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Redux Toolkit for state management
- React Query for server state management
- Tailwind CSS for styling
- Three.js for 3D visualization
- Vite as build tool

**Backend:**
- Node.js 18+ with Express.js
- TypeScript for type safety
- Passport.js for authentication
- Multer for file upload handling
- Google Cloud SDK for GCP integration
- Bull for job queue management
- Winston for logging

**Database:**
- MongoDB for document storage (users, sessions, images, visualizations)
- GCP Cloud Storage for image storage

**External Services:**
- Google Gemini API for script generation
- Headless Blender for 3D model generation
- GCP Cloud Storage for image persistence

### Database Schema

**MongoDB Collections:**

**Users Collection:**
```javascript
db.users.insertOne({
  _id: ObjectId(),
  email: "user@example.com",
  password_hash: "$2b$12$...",
  created_at: ISODate("2024-01-15T10:30:00Z"),
  updated_at: ISODate("2024-01-15T10:30:00Z"),
  is_active: true
});

// Index for email lookup
db.users.createIndex({ email: 1 }, { unique: true });
```

**Sessions Collection:**
```javascript
db.sessions.insertOne({
  _id: ObjectId(),
  user_id: ObjectId("..."),
  token_hash: "hash_of_jwt_token",
  expires_at: ISODate("2024-02-14T10:30:00Z"),
  created_at: ISODate("2024-01-15T10:30:00Z"),
  ip_address: "192.168.1.1",
  user_agent: "Mozilla/5.0..."
});

// Index for user_id lookup and expiration cleanup
db.sessions.createIndex({ user_id: 1 });
db.sessions.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
```

**Images Collection:**
```javascript
db.images.insertOne({
  _id: ObjectId(),
  user_id: ObjectId("..."),
  gcp_object_id: "gs://bucket/images/uuid.jpg",
  original_filename: "wall_photo.jpg",
  file_size_bytes: 2457600,
  mime_type: "image/jpeg",
  width: 3024,
  height: 4032,
  created_at: ISODate("2024-01-15T10:30:00Z"),
  updated_at: ISODate("2024-01-15T10:30:00Z")
});

// Index for user_id lookup
db.images.createIndex({ user_id: 1 });
```

**Visualizations Collection:**
```javascript
db.visualizations.insertOne({
  _id: ObjectId(),
  user_id: ObjectId("..."),
  image_id: ObjectId("..."),
  blender_script_id: "script_uuid",
  model_id: "model_uuid",
  created_at: ISODate("2024-01-15T10:30:00Z"),
  updated_at: ISODate("2024-01-15T10:30:00Z")
});

// Index for user_id lookup
db.visualizations.createIndex({ user_id: 1 });
```



## Login Page Design

### UI Layout and Components

The login page serves as the primary entry point for user authentication. It features a clean, minimal design that prioritizes usability and security.

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│                                         │
│         Wall Decor Visualizer           │
│              Logo/Branding              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Email Input Field              │   │
│  │  [                            ] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Password Input Field           │   │
│  │  [                            ] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      [  Login Button  ]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Error Message Display Area (if any)   │
│                                         │
│  "Don't have an account? Sign up"      │
│                                         │
└─────────────────────────────────────────┘
```

### Component Specifications

**Email Input Field:**
- Type: text input with email validation
- Placeholder: "Enter your email"
- Validation: Real-time email format validation
- Error display: Shows validation error below field
- Accessibility: Label associated with input via htmlFor

**Password Input Field:**
- Type: password input (masked characters)
- Placeholder: "Enter your password"
- Show/hide toggle: Eye icon to reveal password
- Validation: Minimum 8 characters required
- Accessibility: Label associated with input via htmlFor

**Login Button:**
- Type: Primary action button
- State: Disabled during API request
- Loading indicator: Spinner shown during submission
- Accessibility: Keyboard accessible, proper ARIA labels

**Error Message Display:**
- Location: Below password field
- Types of errors:
  - "Invalid email format"
  - "Email not found"
  - "Incorrect password"
  - "Account is inactive"
  - "Server error - please try again"
- Styling: Red text with error icon
- Auto-dismiss: Clears when user modifies input

### Session Token Storage Approach

**Token Storage Strategy:**
1. **HTTP-Only Secure Cookie (Primary):**
   - Name: `sessionToken`
   - HttpOnly: true (prevents JavaScript access)
   - Secure: true (HTTPS only)
   - SameSite: Strict (CSRF protection)
   - Max-Age: 30 days (2,592,000 seconds)
   - Path: /

2. **Local Storage (Secondary - for client-side checks):**
   - Key: `authToken`
   - Value: JWT token (non-sensitive claims only)
   - Purpose: Quick client-side authentication state checks
   - Note: Does not contain sensitive data

**Token Structure (JWT):**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id_uuid",
    "email": "user@example.com",
    "iat": 1234567890,
    "exp": 1234654290,
    "iss": "wall-decor-visualizer"
  }
}
```

### Redirect Flow After Login

**Successful Login Flow:**
```
1. User submits credentials
   ↓
2. Frontend validates email format
   ↓
3. POST /api/auth/login with credentials
   ↓
4. Backend validates credentials
   ↓
5. Backend generates session token
   ↓
6. Backend sets HTTP-Only cookie
   ↓
7. Backend returns response with token
   ↓
8. Frontend stores token in localStorage
   ↓
9. Frontend updates Redux state (isAuthenticated: true)
   ↓
10. Frontend redirects to /dashboard/upload
   ↓
11. Image Upload Page loads
```

**Failed Login Flow:**
```
1. User submits credentials
   ↓
2. Backend validates credentials
   ↓
3. Credentials invalid
   ↓
4. Backend returns 401 error with message
   ↓
5. Frontend displays error message
   ↓
6. User remains on login page
   ↓
7. User can retry
```

### API Endpoint: /api/auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 2592000
}
```

**Response (Failure - 401):**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "code": "AUTH_INVALID_CREDENTIALS"
}
```



## Image Upload Page Design

### UI Layout and Components

The image upload page provides users with multiple options to provide wall images. It features a prominent upload area with clear visual hierarchy.

**Layout Structure:**
```
┌──────────────────────────────────────────────────┐
│  Wall Decor Visualizer                  [Logout] │
├──────────────────────────────────────────────────┤
│                                                  │
│  Step 1: Upload Wall Image                       │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │                                            │  │
│  │   Choose how to upload your wall image:   │  │
│  │                                            │  │
│  │  ┌──────────────────────────────────────┐ │  │
│  │  │  📷 Capture from Camera              │ │  │
│  │  │  Take a photo directly from your     │ │  │
│  │  │  device camera                       │ │  │
│  │  └──────────────────────────────────────┘ │  │
│  │                                            │  │
│  │  ┌──────────────────────────────────────┐ │  │
│  │  │  📁 Upload from Camera Roll          │ │  │
│  │  │  Select an existing image from your  │ │  │
│  │  │  device storage                      │ │  │
│  │  └──────────────────────────────────────┘ │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  Supported formats: JPEG, PNG, WebP             │
│  Maximum file size: 50MB                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Upload Options

**Option 1: Capture from Camera**
- Button text: "📷 Capture from Camera"
- Action: Opens camera capture interface
- Permissions: Requests camera access on first use
- Flow: Live feed → Capture → Preview → Confirm/Retake

**Option 2: Upload from Camera Roll**
- Button text: "📁 Upload from Camera Roll"
- Action: Opens native file browser
- Accepted formats: .jpg, .jpeg, .png, .webp
- Max file size: 50MB
- Flow: File selection → Preview → Upload

### Camera Capture Flow

**Camera Permission Request:**
```
1. User clicks "Capture from Camera"
   ↓
2. Browser requests camera permission
   ↓
3. User grants/denies permission
   ↓
4a. If granted: Open camera view
4b. If denied: Show error message with instructions
```

**Camera View Interface:**
```
┌──────────────────────────────────────┐
│                                      │
│      Live Camera Feed                │
│      (Full Screen or Large Area)     │
│                                      │
│                                      │
│                                      │
│      ┌──────────────────────────┐   │
│      │  [  Capture Button  ]    │   │
│      │  (Center/Bottom)         │   │
│      └──────────────────────────┘   │
│                                      │
│      [Cancel]                        │
│                                      │
└──────────────────────────────────────┘
```

**Capture Button Behavior:**
- Visual: Large, prominent button with camera icon
- Feedback: Visual/audio feedback on capture
- Result: Captures high-resolution image from camera feed
- Next step: Display preview with confirm/retake options

**Preview After Capture:**
```
┌──────────────────────────────────────┐
│                                      │
│      Captured Image Preview          │
│      (Full Resolution)               │
│                                      │
│                                      │
│                                      │
│      ┌──────────────────────────┐   │
│      │  [  Confirm  ]           │   │
│      │  [  Retake   ]           │   │
│      └──────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

**Confirm/Retake Options:**
- Confirm: Proceeds with upload
- Retake: Returns to camera view for another capture
- Cancel: Closes camera and returns to upload options

### File Browser Integration

**File Selection Dialog:**
- Triggered by: "Upload from Camera Roll" button
- File types: Image files only (.jpg, .jpeg, .png, .webp)
- Multiple selection: Single file only
- Validation: File size and format checked before upload

**File Validation:**
- Format check: MIME type validation
- Size check: Maximum 50MB
- Dimension check: Minimum 640x480 pixels
- Error handling: Display specific error message if validation fails

### Image Preview Before Upload

**Preview Display:**
```
┌──────────────────────────────────────┐
│  Selected Image Preview              │
├──────────────────────────────────────┤
│                                      │
│      [Image Preview Area]            │
│      (Maintains aspect ratio)        │
│                                      │
│      Filename: wall_photo.jpg        │
│      Size: 2.4 MB                    │
│      Dimensions: 3024 x 4032         │
│                                      │
│      ┌──────────────────────────┐   │
│      │  [  Upload  ]            │   │
│      │  [  Cancel  ]            │   │
│      └──────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

**Preview Information:**
- Filename display
- File size in MB
- Image dimensions (width x height)
- Aspect ratio indicator
- Option to change image before upload

### Upload Progress Indicator

**Upload Progress UI:**
```
┌──────────────────────────────────────┐
│  Uploading...                        │
├──────────────────────────────────────┤
│                                      │
│  [████████░░░░░░░░░░░░░░░░░░░░░░]   │
│  45% (1.1 MB / 2.4 MB)               │
│                                      │
│  Estimated time: 12 seconds          │
│                                      │
│  [  Cancel Upload  ]                 │
│                                      │
└──────────────────────────────────────┘
```

**Progress Tracking:**
- Percentage complete
- Bytes uploaded / total bytes
- Estimated time remaining
- Cancel button to abort upload
- Real-time updates via XMLHttpRequest or Fetch API

### Error Handling and Retry Logic

**Error Types and Messages:**

1. **File Format Error:**
   - Message: "Unsupported file format. Please use JPEG, PNG, or WebP."
   - Action: Allow user to select different file

2. **File Size Error:**
   - Message: "File is too large. Maximum size is 50MB."
   - Action: Allow user to select different file

3. **Dimension Error:**
   - Message: "Image is too small. Minimum dimensions are 640x480 pixels."
   - Action: Allow user to select different file

4. **Camera Permission Error:**
   - Message: "Camera access denied. Please enable camera permissions in your browser settings."
   - Action: Provide link to browser settings instructions

5. **Upload Network Error:**
   - Message: "Upload failed. Please check your connection and try again."
   - Action: Retry button to attempt upload again

6. **Server Error:**
   - Message: "Server error occurred. Please try again later."
   - Action: Retry button with exponential backoff

**Retry Logic:**
- Automatic retry: Up to 3 attempts for network errors
- Manual retry: User can click "Retry" button
- Exponential backoff: Wait 1s, 2s, 4s between retries
- Clear error state: When user selects new file or retries

### API Endpoint: /api/images/upload

**Request (Multipart Form Data):**
```
POST /api/images/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "file": <binary image data>,
  "filename": "wall_photo.jpg"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "image": {
    "id": "uuid",
    "gcp_object_id": "gs://bucket/images/uuid.jpg",
    "filename": "wall_photo.jpg",
    "size_bytes": 2457600,
    "mime_type": "image/jpeg",
    "width": 3024,
    "height": 4032,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (Failure - 400):**
```json
{
  "success": false,
  "error": "File size exceeds maximum limit of 50MB",
  "code": "FILE_SIZE_EXCEEDED"
}
```

**Response (Failure - 413):**
```json
{
  "success": false,
  "error": "Payload too large",
  "code": "PAYLOAD_TOO_LARGE"
}
```



## Data Models

### User Schema

```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique email address
  password_hash: string;         // Bcrypt hash (never exposed)
  created_at: Date;              // Account creation timestamp
  updated_at: Date;              // Last update timestamp
  is_active: boolean;            // Account status
}
```

**Password Hashing Strategy:**
- Algorithm: bcrypt with salt rounds = 12
- Never store plain text passwords
- Hash generated on backend before storage
- Comparison done using bcrypt.compare() for timing attack resistance

### Session Schema

```typescript
interface Session {
  id: string;                    // UUID
  user_id: string;               // Reference to User
  token_hash: string;            // Hash of JWT token
  expires_at: Date;              // Token expiration time
  created_at: Date;              // Session creation timestamp
  ip_address: string;            // Client IP for security audit
  user_agent: string;            // Browser/device info for audit
}
```

**Session Token (JWT):**
```typescript
interface SessionToken {
  header: {
    alg: "HS256";
    typ: "JWT";
  };
  payload: {
    sub: string;                 // User ID
    email: string;               // User email
    iat: number;                 // Issued at (Unix timestamp)
    exp: number;                 // Expiration (Unix timestamp)
    iss: string;                 // Issuer
    jti: string;                 // JWT ID (unique token identifier)
  };
}
```

### Image Metadata Schema

```typescript
interface ImageMetadata {
  id: string;                    // UUID
  user_id: string;               // Reference to User
  gcp_object_id: string;         // GCP Cloud Storage object path
  original_filename: string;     // Original filename from upload
  file_size_bytes: number;       // File size in bytes
  mime_type: string;             // MIME type (image/jpeg, etc.)
  width: number;                 // Image width in pixels
  height: number;                // Image height in pixels
  created_at: Date;              // Upload timestamp
  updated_at: Date;              // Last update timestamp
}
```

**GCP Object ID Format:**
```
gs://wall-decor-visualizer-bucket/images/{user_id}/{image_id}.{extension}
```

### Authentication Token Structure

**Access Token (Short-lived):**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT",
    "kid": "key_id_v1"
  },
  "payload": {
    "sub": "user_uuid",
    "email": "user@example.com",
    "iat": 1705315800,
    "exp": 1705319400,
    "iss": "wall-decor-visualizer",
    "jti": "token_uuid",
    "scope": ["read:images", "write:images", "read:visualizations"]
  }
}
```

**Refresh Token (Long-lived):**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT",
    "kid": "key_id_v1"
  },
  "payload": {
    "sub": "user_uuid",
    "iat": 1705315800,
    "exp": 1707907800,
    "iss": "wall-decor-visualizer",
    "jti": "refresh_token_uuid",
    "type": "refresh"
  }
}
```

**Token Expiration Times:**
- Access Token: 1 hour (3600 seconds)
- Refresh Token: 30 days (2,592,000 seconds)
- Session Cookie: 30 days (2,592,000 seconds)



## Security Design

### Password Hashing Strategy

**Implementation:**
- Library: bcrypt (npm package: bcryptjs or native bcrypt)
- Salt rounds: 12 (provides strong security with acceptable performance)
- Timing: Hash generated on backend before database storage
- Comparison: Always use bcrypt.compare() to prevent timing attacks

**Password Requirements:**
- Minimum length: 8 characters
- Complexity: At least one uppercase, one lowercase, one number
- No common patterns: Checked against common password list
- Rate limiting: Maximum 5 login attempts per 15 minutes per IP

**Password Reset Flow:**
- User requests password reset via email
- Backend generates secure reset token (32 bytes random)
- Token stored in database with 1-hour expiration
- User receives email with reset link
- User sets new password
- Old token invalidated after use

### Session Token Generation and Validation

**Token Generation:**
```typescript
function generateSessionToken(userId: string, email: string): string {
  const payload = {
    sub: userId,
    email: email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    iss: "wall-decor-visualizer",
    jti: generateUUID()
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: "HS256",
    header: { kid: "key_id_v1" }
  });
}
```

**Token Validation:**
```typescript
function validateSessionToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "wall-decor-visualizer"
    });
    
    // Check token blacklist (for logout)
    if (await isTokenBlacklisted(decoded.jti)) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}
```

**Token Refresh Mechanism:**
- Access token expires after 1 hour
- Client automatically requests new token before expiration
- Refresh endpoint: POST /api/auth/refresh
- Requires valid refresh token in HTTP-only cookie
- Returns new access token

### HTTPS/TLS Requirements

**SSL/TLS Configuration:**
- Minimum TLS version: 1.2 (preferably 1.3)
- Certificate: Valid SSL certificate from trusted CA
- HSTS: Enabled with max-age=31536000 (1 year)
- Certificate pinning: Optional for mobile apps

**HTTP Headers for Security:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
Referrer-Policy: strict-origin-when-cross-origin
```

### CORS Configuration

**CORS Policy:**
```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://app.example.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
  maxAge: 86400 // 24 hours
};
```

**Allowed Origins:**
- Production: https://app.example.com
- Development: http://localhost:3000
- Staging: https://staging.example.com

**Credentials Handling:**
- Cookies sent with requests: credentials: 'include'
- Backend sets SameSite=Strict on cookies
- CSRF tokens not needed with SameSite=Strict

### GCP Credential Management

**Service Account Setup:**
- Create service account in GCP project
- Grant minimal required permissions:
  - storage.buckets.get
  - storage.objects.create
  - storage.objects.get
  - storage.objects.delete
- Store credentials in environment variables (never in code)

**Environment Variables:**
```
GCP_PROJECT_ID=wall-decor-visualizer-prod
GCP_BUCKET_NAME=wall-decor-visualizer-images
GCP_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GCP_SERVICE_ACCOUNT_KEY_PATH=/secrets/gcp-key.json
```

**GCP Authentication:**
```typescript
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);
```

**Bucket Security:**
- Versioning: Enabled for recovery
- Lifecycle policy: Delete old versions after 30 days
- Access control: Private bucket, no public access
- Encryption: Google-managed encryption at rest
- Logging: Access logs enabled for audit trail

**Image Upload Security:**
- Validate file type before upload
- Scan for malware using VirusTotal API (optional)
- Store with user_id prefix for access control
- Generate signed URLs for temporary access
- Implement rate limiting per user



## Component Architecture

### Frontend Component Structure

**Login Page Components:**
```
LoginPage
├── LoginForm
│   ├── EmailInput
│   ├── PasswordInput
│   ├── LoginButton
│   └── ErrorMessage
├── SignUpLink
└── BrandingHeader
```

**Image Upload Page Components:**
```
ImageUploadPage
├── UploadHeader
├── UploadOptions
│   ├── CameraButton
│   └── FileUploadButton
├── CameraCapture (conditional)
│   ├── CameraFeed
│   ├── CaptureButton
│   ├── CancelButton
│   └── PreviewModal
├── FilePreview (conditional)
│   ├── ImagePreview
│   ├── FileInfo
│   ├── UploadButton
│   └── CancelButton
├── UploadProgress (conditional)
│   ├── ProgressBar
│   ├── ProgressText
│   └── CancelUploadButton
└── ErrorDisplay (conditional)
```

### Reusable Components

**Input Component:**
```typescript
interface InputProps {
  type: 'text' | 'email' | 'password';
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({ ... }) => {
  // Reusable input with validation and error display
};
```

**Button Component:**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'small' | 'medium' | 'large';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ ... }) => {
  // Reusable button with loading state
};
```

**Modal Component:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ ... }) => {
  // Reusable modal for camera preview and confirmations
};
```

**ErrorBoundary Component:**
```typescript
export class ErrorBoundary extends React.Component {
  // Catches errors in child components
  // Displays fallback UI
  // Logs errors for debugging
}
```

### State Management Approach

**Redux Store Structure:**
```typescript
interface RootState {
  auth: AuthState;
  upload: UploadState;
  ui: UIState;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface UploadState {
  selectedFile: File | null;
  uploadProgress: number;
  isUploading: boolean;
  uploadedImage: ImageMetadata | null;
  error: string | null;
}

interface UIState {
  isCameraOpen: boolean;
  isPreviewOpen: boolean;
  theme: 'light' | 'dark';
}
```

**Redux Actions:**
```typescript
// Auth actions
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await api.post('/auth/logout');
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
);

// Upload actions
export const uploadImage = createAsyncThunk(
  'upload/uploadImage',
  async (file: File, { dispatch }) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/images/upload', formData, {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        dispatch(setUploadProgress(progress));
      }
    });
    
    return response.data;
  }
);
```

### Error Handling Patterns

**Global Error Handler:**
```typescript
// Middleware for handling API errors
export const errorMiddleware = (store: any) => (next: any) => (action: any) => {
  try {
    return next(action);
  } catch (error) {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      store.dispatch(logoutUser());
    } else if (error.response?.status === 403) {
      // Forbidden - show permission error
      store.dispatch(setError('You do not have permission to perform this action'));
    } else if (error.response?.status >= 500) {
      // Server error - show generic message
      store.dispatch(setError('Server error occurred. Please try again later.'));
    } else {
      // Other errors - show specific message
      store.dispatch(setError(error.response?.data?.error || 'An error occurred'));
    }
    throw error;
  }
};
```

**Component-Level Error Handling:**
```typescript
const LoginForm: React.FC = () => {
  const [localError, setLocalError] = useState<string | null>(null);
  const dispatch = useDispatch();
  
  const handleSubmit = async (credentials: LoginCredentials) => {
    try {
      setLocalError(null);
      await dispatch(loginUser(credentials)).unwrap();
      // Success - redirect handled by useEffect
    } catch (error) {
      if (error instanceof Error) {
        setLocalError(error.message);
      } else {
        setLocalError('An unexpected error occurred');
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {localError && <ErrorMessage message={localError} />}
      {/* Form fields */}
    </form>
  );
};
```

**API Error Response Handling:**
```typescript
// Axios interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = {
      message: error.response?.data?.error || 'An error occurred',
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      status: error.response?.status || 500
    };
    
    return Promise.reject(errorData);
  }
);
```



## User Flow Diagrams

### Login Flow

```mermaid
graph TD
    A[User Visits App] --> B{Session Token<br/>Exists?}
    B -->|Yes| C{Token<br/>Valid?}
    B -->|No| D[Display Login Page]
    C -->|Yes| E[Auto-Login User]
    C -->|No| D
    E --> F[Redirect to Dashboard]
    D --> G[User Enters Email]
    G --> H[User Enters Password]
    H --> I[User Clicks Login]
    I --> J[Frontend Validates<br/>Email Format]
    J -->|Invalid| K[Show Email Error]
    K --> G
    J -->|Valid| L[POST /api/auth/login]
    L --> M{Credentials<br/>Valid?}
    M -->|No| N[Show Error Message]
    N --> G
    M -->|Yes| O[Backend Generates<br/>Session Token]
    O --> P[Set HTTP-Only Cookie]
    P --> Q[Return Token to Client]
    Q --> R[Store Token in<br/>localStorage]
    R --> S[Update Redux State]
    S --> F
    F --> T[Load Image Upload Page]
```

### Image Upload Flow - Camera Capture

```mermaid
graph TD
    A[User on Upload Page] --> B[User Clicks<br/>Capture from Camera]
    B --> C[Request Camera<br/>Permission]
    C --> D{Permission<br/>Granted?}
    D -->|No| E[Show Permission Error]
    E --> A
    D -->|Yes| F[Open Camera View]
    F --> G[Display Live Feed]
    G --> H[User Clicks<br/>Capture Button]
    H --> I[Capture Image<br/>from Feed]
    I --> J[Display Preview]
    J --> K{User<br/>Confirms?}
    K -->|No| L[User Clicks Retake]
    L --> G
    K -->|Yes| M[User Clicks Confirm]
    M --> N[Proceed to Upload]
    N --> O[Display File Info]
    O --> P[User Clicks Upload]
    P --> Q[POST /api/images/upload]
    Q --> R[Show Upload Progress]
    R --> S{Upload<br/>Success?}
    S -->|No| T[Show Error Message]
    T --> U[Offer Retry]
    U --> P
    S -->|Yes| V[Store Image Metadata]
    V --> W[Redirect to<br/>Dimension Marking]
```

### Image Upload Flow - Camera Roll

```mermaid
graph TD
    A[User on Upload Page] --> B[User Clicks<br/>Upload from Camera Roll]
    B --> C[Open File Browser]
    C --> D[User Selects Image]
    D --> E[Validate File Format]
    E -->|Invalid| F[Show Format Error]
    F --> C
    E -->|Valid| G[Validate File Size]
    G -->|Too Large| H[Show Size Error]
    H --> C
    G -->|Valid| I[Validate Dimensions]
    I -->|Too Small| J[Show Dimension Error]
    J --> C
    I -->|Valid| K[Display Preview]
    K --> L[Show File Info]
    L --> M{User<br/>Confirms?}
    M -->|No| N[User Clicks Cancel]
    N --> A
    M -->|Yes| O[User Clicks Upload]
    O --> P[POST /api/images/upload]
    P --> Q[Show Upload Progress]
    Q --> R{Upload<br/>Success?}
    R -->|No| S[Show Error Message]
    S --> T[Offer Retry]
    T --> P
    R -->|Yes| U[Store Image Metadata]
    U --> V[Redirect to<br/>Dimension Marking]
```

### Session Persistence Flow

```mermaid
graph TD
    A[User Logs In] --> B[Backend Generates<br/>Session Token]
    B --> C[Set HTTP-Only Cookie<br/>Max-Age: 30 days]
    C --> D[Return Token to Client]
    D --> E[Store in localStorage]
    E --> F[User Closes Browser]
    F --> G[User Reopens Browser]
    G --> H[App Checks for<br/>Session Cookie]
    H --> I{Cookie<br/>Exists?}
    I -->|No| J[Display Login Page]
    I -->|Yes| K{Cookie<br/>Valid?}
    K -->|No| J
    K -->|Yes| L[Auto-Authenticate User]
    L --> M[Load Dashboard]
    M --> N[Token Expiring Soon?]
    N -->|Yes| O[POST /api/auth/refresh]
    O --> P[Backend Issues<br/>New Token]
    P --> Q[Update Cookie]
    Q --> R[Continue Session]
    N -->|No| R
    S[User Clicks Logout] --> T[DELETE /api/auth/logout]
    T --> U[Backend Invalidates<br/>Session]
    U --> V[Clear HTTP-Only Cookie]
    V --> W[Clear localStorage]
    W --> X[Redirect to Login Page]
```



## Deployment Architecture

### Frontend Hosting

**Platform:** Google Cloud Platform (Cloud Run or Firebase Hosting)

**Cloud Run Deployment:**
- Container: Docker image with Node.js + React build
- Build process: Vite build → Docker image → Cloud Run
- Auto-scaling: Based on traffic
- Environment: Production, Staging, Development

**Firebase Hosting (Alternative):**
- Static hosting for React SPA
- CDN distribution globally
- Automatic SSL/TLS
- Deployment: `firebase deploy`

**Build Process:**
```bash
# Development
npm run dev

# Production build
npm run build
# Output: dist/ directory with optimized assets

# Docker build
docker build -t wall-decor-visualizer:latest .
docker push gcr.io/project-id/wall-decor-visualizer:latest
```

**Environment Configuration:**
```
VITE_API_BASE_URL=https://api.example.com
VITE_GCP_PROJECT_ID=wall-decor-visualizer-prod
VITE_ANALYTICS_ID=UA-XXXXXXXXX-X
```

### Backend Hosting

**Platform:** Google Cloud Platform (Cloud Run or Compute Engine)

**Cloud Run Deployment:**
- Container: Docker image with Node.js + Express
- Memory: 2GB (adjustable based on load)
- Timeout: 3600 seconds (for long-running Blender jobs)
- Concurrency: 80 requests per instance
- Auto-scaling: 0-100 instances

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["node", "dist/server.js"]
```

**Deployment:**
```bash
# Build and push
docker build -t gcr.io/project-id/wall-decor-api:latest .
docker push gcr.io/project-id/wall-decor-api:latest

# Deploy to Cloud Run
gcloud run deploy wall-decor-api \
  --image gcr.io/project-id/wall-decor-api:latest \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --timeout 3600
```

### Database Hosting

**MongoDB:**
- Platform: Google Cloud Platform (MongoDB Atlas or Cloud Firestore alternative)
- Instance: M10 cluster (2GB storage, auto-scaling)
- Backup: Automated daily backups, 30-day retention
- Replication: 3-node replica set for high availability
- SSL: Required for all connections
- Authentication: Database user with minimal required permissions

**Connection Pooling:**
```typescript
// MongoDB connection with pooling
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI, {
  maxPoolSize: 50,
  minPoolSize: 10,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true
});

const db = client.db(process.env.MONGODB_DATABASE);
```

### GCP Integration

**Cloud Storage Bucket:**
- Name: wall-decor-visualizer-images
- Location: us-central1
- Storage class: Standard
- Versioning: Enabled
- Lifecycle: Delete old versions after 30 days

**Service Account:**
- Email: wall-decor-api@project.iam.gserviceaccount.com
- Permissions:
  - storage.buckets.get
  - storage.objects.create
  - storage.objects.get
  - storage.objects.delete
  - storage.objects.list

**Gemini API:**
- Project: wall-decor-visualizer-prod
- API enabled: Generative Language API
- Quota: 100 requests per minute
- Model: gemini-1.5-pro

**Headless Blender:**
- Compute Engine instance: n1-standard-4 (4 vCPU, 15GB RAM)
- OS: Ubuntu 22.04 LTS
- Blender: 3.6 LTS (headless)
- Job queue: Bull (Redis-backed)
- Worker processes: 2 concurrent jobs

### Environment Configuration

**Production Environment Variables:**
```
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/wall_decor_prod?retryWrites=true&w=majority
MONGODB_DATABASE=wall_decor_prod

# GCP
GCP_PROJECT_ID=wall-decor-visualizer-prod
GCP_BUCKET_NAME=wall-decor-visualizer-images
GCP_SERVICE_ACCOUNT_KEY_PATH=/secrets/gcp-key.json

# JWT
JWT_SECRET=<secure-random-string>
JWT_EXPIRATION=3600

# API
API_PORT=8080
API_BASE_URL=https://api.example.com
ALLOWED_ORIGINS=https://app.example.com,https://staging.example.com

# Gemini
GEMINI_API_KEY=<api-key>
GEMINI_MODEL=gemini-1.5-pro

# Blender
BLENDER_PATH=/usr/bin/blender
BLENDER_PYTHON_PATH=/usr/bin/python3

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

**Staging Environment Variables:**
```
# Similar to production but with staging endpoints
MONGODB_URI=mongodb+srv://user:password@cluster-staging.mongodb.net/wall_decor_staging?retryWrites=true&w=majority
MONGODB_DATABASE=wall_decor_staging
API_BASE_URL=https://staging-api.example.com
ALLOWED_ORIGINS=https://staging.example.com,http://localhost:3000
LOG_LEVEL=debug
```

**Development Environment Variables:**
```
# Local development
MONGODB_URI=mongodb://localhost:27017/wall_decor_dev
MONGODB_DATABASE=wall_decor_dev

API_PORT=3001
API_BASE_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

LOG_LEVEL=debug
```

### Monitoring and Logging

**Cloud Logging:**
- Centralized logging for all services
- Log retention: 30 days
- Log levels: DEBUG, INFO, WARN, ERROR
- Structured logging: JSON format

**Cloud Monitoring:**
- Metrics: CPU, memory, request latency, error rate
- Alerts: High error rate (>5%), High latency (>2s), Low availability
- Dashboards: Service health, API performance, Database metrics

**Error Tracking:**
- Service: Google Cloud Error Reporting
- Automatic error grouping
- Stack trace analysis
- Notification on new errors



## API Specifications

### Authentication Endpoints

#### POST /api/auth/login

**Purpose:** Authenticate user with email and password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid email or password",
  "code": "AUTH_INVALID_CREDENTIALS"
}
```

**Response (429 Too Many Requests):**
```json
{
  "success": false,
  "error": "Too many login attempts. Please try again later.",
  "code": "AUTH_RATE_LIMITED",
  "retryAfter": 900
}
```

---

#### POST /api/auth/refresh

**Purpose:** Refresh expired access token using refresh token

**Headers:**
```
Authorization: Bearer {refresh_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid or expired refresh token",
  "code": "AUTH_INVALID_REFRESH_TOKEN"
}
```

---

#### POST /api/auth/logout

**Purpose:** Invalidate current session

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Image Upload Endpoints

#### POST /api/images/upload

**Purpose:** Upload wall image to backend storage

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <binary image data>
filename: wall_photo.jpg
```

**Response (200 OK):**
```json
{
  "success": true,
  "image": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "gcp_object_id": "gs://wall-decor-visualizer-images/550e8400-e29b-41d4-a716-446655440000/550e8400-e29b-41d4-a716-446655440001.jpg",
    "filename": "wall_photo.jpg",
    "size_bytes": 2457600,
    "mime_type": "image/jpeg",
    "width": 3024,
    "height": 4032,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 Bad Request - Invalid Format):**
```json
{
  "success": false,
  "error": "Unsupported file format. Supported formats: JPEG, PNG, WebP",
  "code": "UPLOAD_INVALID_FORMAT"
}
```

**Response (413 Payload Too Large):**
```json
{
  "success": false,
  "error": "File size exceeds maximum limit of 50MB",
  "code": "UPLOAD_FILE_TOO_LARGE"
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized",
  "code": "AUTH_UNAUTHORIZED"
}
```

---

#### GET /api/images/{image_id}

**Purpose:** Retrieve image metadata and download URL

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "image": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "filename": "wall_photo.jpg",
    "size_bytes": 2457600,
    "mime_type": "image/jpeg",
    "width": 3024,
    "height": 4032,
    "download_url": "https://storage.googleapis.com/wall-decor-visualizer-images/...",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Image not found",
  "code": "IMAGE_NOT_FOUND"
}
```

---

#### DELETE /api/images/{image_id}

**Purpose:** Delete image from storage

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Image not found",
  "code": "IMAGE_NOT_FOUND"
}
```

---

### Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_INVALID_CREDENTIALS | 401 | Email or password is incorrect |
| AUTH_UNAUTHORIZED | 401 | Missing or invalid authentication token |
| AUTH_INVALID_REFRESH_TOKEN | 401 | Refresh token is invalid or expired |
| AUTH_RATE_LIMITED | 429 | Too many login attempts |
| UPLOAD_INVALID_FORMAT | 400 | File format not supported |
| UPLOAD_FILE_TOO_LARGE | 413 | File exceeds size limit |
| UPLOAD_INVALID_DIMENSIONS | 400 | Image dimensions too small |
| IMAGE_NOT_FOUND | 404 | Image does not exist |
| SERVER_ERROR | 500 | Internal server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid Token Auto-Login

For any valid session token stored in cookies or local storage, when the application initializes, the user should be automatically authenticated and redirected to the dashboard without requiring manual login.

**Validates: Requirements 0.2, 0.5.3**

### Property 2: Invalid Token Triggers Login Page

For any invalid, expired, or missing session token, when the application initializes, the login page should be displayed to the user.

**Validates: Requirements 0.3, 0.5.9**

### Property 3: Credentials Sent to Correct Endpoint

For any login attempt with valid email and password, the credentials should be sent to the /api/auth/login endpoint with the correct request format.

**Validates: Requirements 0.4, 1.7**

### Property 4: Invalid Credentials Rejected

For any login attempt with incorrect email or password, the backend should reject the credentials and return a 401 error, and the frontend should display an error message allowing retry.

**Validates: Requirements 0.5, 0.6**

### Property 5: Valid Credentials Generate Token

For any login attempt with correct credentials, the backend should generate a session token with a valid expiration time and return it to the client.

**Validates: Requirements 0.7, 0.8**

### Property 6: Token Storage Round Trip

For any session token received from the backend, storing it in local storage and/or HTTP-only cookies should result in the token being retrievable and valid for subsequent API requests.

**Validates: Requirements 0.9, 0.5.1**

### Property 7: Successful Login Redirects to Dashboard

For any successful login (valid credentials accepted and token generated), the user should be redirected to the dashboard/upload page after token storage.

**Validates: Requirements 0.10**

### Property 8: Token Refresh Updates Expiration

For any token refresh request with a valid refresh token, the backend should issue a new access token with an updated expiration time that is later than the current time.

**Validates: Requirements 0.5.4, 0.5.5**

### Property 9: Failed Token Refresh Redirects to Login

For any token refresh request that fails (invalid or expired refresh token), the system should redirect the user to the login page.

**Validates: Requirements 0.5.6**

### Property 10: Logout Clears All Tokens

For any logout action, all session tokens should be deleted from local storage, cookies, and the backend session store, and the user should be redirected to the login page.

**Validates: Requirements 0.5.7, 0.5.8**

### Property 11: Supported Image Formats Accepted

For any image file with a supported format (JPEG, PNG, WebP), the file should be accepted for upload and not rejected due to format validation.

**Validates: Requirements 1.3, 1.8**

### Property 12: Unsupported Image Formats Rejected

For any image file with an unsupported format, the backend should reject the file and return a descriptive error message indicating the supported formats.

**Validates: Requirements 1.9**

### Property 13: Oversized Images Rejected

For any image file exceeding the 50MB size limit, the backend should reject the file and return an error message indicating the size limit.

**Validates: Requirements 1.9**

### Property 14: Valid Images Uploaded to GCP

For any valid image file (correct format, within size limits), the backend should successfully upload the image to GCP Cloud Storage and return a success response.

**Validates: Requirements 1.10**

### Property 15: Uploaded Images Have Unique IDs

For any image uploaded to the backend, the system should generate a unique image_id and store a reference to the GCP object, allowing the image to be retrieved later using that ID.

**Validates: Requirements 1.11, 1.12**

### Property 16: Image Retrieval Round Trip

For any image uploaded and stored with an image_id, retrieving the image using that ID should return the same image data with the original aspect ratio maintained.

**Validates: Requirements 1.12, 1.13, 1.14**

### Property 17: Failed Image Retrieval Shows Error

For any image retrieval request that fails (network error, GCP unavailable, image not found), the system should display an error message with a retry option.

**Validates: Requirements 1.15**

### Property 18: Camera Capture Produces High-Resolution Image

For any image captured from the device camera, the captured image should be high-resolution (minimum 1920x1080 pixels) and suitable for wall analysis.

**Validates: Requirements 1.5.6**

### Property 19: Confirm Upload Triggers Backend Request

For any image preview confirmation (either from camera capture or file upload), clicking the confirm button should trigger an upload request to the /api/images/upload endpoint.

**Validates: Requirements 1.5.8**

### Property 20: Retake Returns to Camera View

For any camera capture preview, clicking the retake button should return the user to the camera view without uploading the image.

**Validates: Requirements 1.5.9**

### Property 21: Cancel Closes Camera

For any camera view (during capture or preview), clicking the cancel button should close the camera and return the user to the upload options without uploading.

**Validates: Requirements 1.5.10**



## Testing Strategy

### Dual Testing Approach

The Wall Decor Visualizer employs both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests:**
- Specific examples and edge cases
- Integration points between components
- Error conditions and recovery flows
- UI component rendering and interactions
- API endpoint request/response validation

**Property-Based Tests:**
- Universal properties across all valid inputs
- Comprehensive input coverage through randomization
- Invariant preservation across operations
- Round-trip properties for serialization/deserialization
- State consistency across user flows

### Property-Based Testing Framework

**Framework Selection:** fast-check (JavaScript/TypeScript)

**Configuration:**
- Minimum iterations: 100 per property test
- Timeout: 30 seconds per test
- Seed: Fixed for reproducibility in CI/CD
- Shrinking: Enabled for minimal failing examples

**Installation:**
```bash
npm install --save-dev fast-check
```

### Property Test Implementation Examples

**Property 1: Valid Token Auto-Login**
```typescript
import fc from 'fast-check';

describe('Authentication - Valid Token Auto-Login', () => {
  it('should auto-login with valid token', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.emailAddress(),
        (userId, email) => {
          // Feature: wall-decor-visualizer, Property 1: Valid Token Auto-Login
          const token = generateValidToken(userId, email);
          localStorage.setItem('authToken', token);
          
          const app = initializeApp();
          
          expect(app.isAuthenticated).toBe(true);
          expect(app.currentUser.id).toBe(userId);
          expect(app.currentRoute).toBe('/dashboard');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 4: Invalid Credentials Rejected**
```typescript
describe('Authentication - Invalid Credentials Rejected', () => {
  it('should reject invalid credentials', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        fc.string({ minLength: 1 }),
        async (email, wrongPassword) => {
          // Feature: wall-decor-visualizer, Property 4: Invalid Credentials Rejected
          const response = await api.post('/auth/login', {
            email,
            password: wrongPassword
          });
          
          expect(response.status).toBe(401);
          expect(response.data.error).toBeDefined();
          expect(response.data.code).toBe('AUTH_INVALID_CREDENTIALS');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 11: Supported Image Formats Accepted**
```typescript
describe('Image Upload - Supported Formats Accepted', () => {
  it('should accept supported image formats', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('image/jpeg'),
          fc.constant('image/png'),
          fc.constant('image/webp')
        ),
        async (mimeType) => {
          // Feature: wall-decor-visualizer, Property 11: Supported Image Formats Accepted
          const imageBuffer = generateImageBuffer(mimeType);
          const formData = new FormData();
          formData.append('file', new Blob([imageBuffer], { type: mimeType }));
          
          const response = await api.post('/images/upload', formData);
          
          expect(response.status).toBe(200);
          expect(response.data.image.id).toBeDefined();
          expect(response.data.image.mime_type).toBe(mimeType);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 16: Image Retrieval Round Trip**
```typescript
describe('Image Upload - Retrieval Round Trip', () => {
  it('should retrieve uploaded image with original aspect ratio', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 640, max: 4096 }),
        fc.integer({ min: 480, max: 4096 }),
        async (width, height) => {
          // Feature: wall-decor-visualizer, Property 16: Image Retrieval Round Trip
          const originalImage = generateImageWithDimensions(width, height);
          const uploadResponse = await api.post('/images/upload', {
            file: originalImage
          });
          
          const imageId = uploadResponse.data.image.id;
          const retrieveResponse = await api.get(`/images/${imageId}`);
          
          expect(retrieveResponse.status).toBe(200);
          expect(retrieveResponse.data.image.width).toBe(width);
          expect(retrieveResponse.data.image.height).toBe(height);
          
          const aspectRatioOriginal = width / height;
          const aspectRatioRetrieved = 
            retrieveResponse.data.image.width / retrieveResponse.data.image.height;
          
          expect(aspectRatioRetrieved).toBeCloseTo(aspectRatioOriginal, 2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Test Coverage

**Login Component Tests:**
- Email input validation (valid/invalid formats)
- Password input masking and reveal toggle
- Form submission with valid credentials
- Form submission with invalid credentials
- Error message display and dismissal
- Loading state during submission
- Keyboard navigation and accessibility

**Image Upload Component Tests:**
- Camera button click opens camera view
- File upload button opens file browser
- File selection triggers preview
- Preview displays file information
- Upload button triggers API request
- Cancel button closes preview
- Error message display for invalid files
- Retry button attempts upload again

**Authentication Service Tests:**
- Token generation with correct payload
- Token validation and expiration check
- Token refresh with valid refresh token
- Token refresh with expired refresh token
- Session persistence to localStorage
- Session persistence to HTTP-only cookies
- Automatic logout on token expiration

**Image Upload Service Tests:**
- File format validation (JPEG, PNG, WebP)
- File size validation (max 50MB)
- Image dimension validation (min 640x480)
- GCP upload with valid credentials
- GCP upload error handling
- Image metadata storage
- Image retrieval by ID

### Test Execution

**Run All Tests:**
```bash
npm test
```

**Run Property-Based Tests Only:**
```bash
npm test -- --testNamePattern="Property"
```

**Run Unit Tests Only:**
```bash
npm test -- --testNamePattern="^(?!.*Property)"
```

**Run with Coverage:**
```bash
npm test -- --coverage
```

**Coverage Targets:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

### CI/CD Integration

**GitHub Actions Workflow:**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Performance Testing

**Load Testing:**
- Tool: k6 or Apache JMeter
- Scenario: 100 concurrent users uploading images
- Target: Response time < 2 seconds for 95th percentile
- Success criteria: 0% error rate

**Stress Testing:**
- Scenario: Gradual increase to 1000 concurrent users
- Target: System remains responsive up to 500 concurrent users
- Failure point: Document maximum sustainable load



## Design Decisions and Rationale

### Technology Stack Choices

**React + TypeScript:**
- Rationale: Strong ecosystem for UI components, excellent TypeScript support, large community
- Alternative considered: Vue.js (simpler learning curve but smaller ecosystem)
- Decision: React chosen for scalability and component reusability

**Node.js + Express:**
- Rationale: JavaScript full-stack enables code sharing, Express is lightweight and flexible
- Alternative considered: Python/Django (better for ML/AI but overkill for this use case)
- Decision: Node.js chosen for rapid development and JavaScript consistency

**PostgreSQL:**
- Rationale: ACID compliance for transaction safety, excellent JSON support, proven reliability
- Alternative considered: MongoDB (flexible schema but less suitable for relational data)
- Decision: PostgreSQL chosen for data integrity and complex queries

**Redis:**
- Rationale: Fast in-memory store for sessions and caching, excellent for job queues
- Alternative considered: Memcached (simpler but less feature-rich)
- Decision: Redis chosen for session management and Bull job queue integration

**GCP Cloud Storage:**
- Rationale: Integrates well with Gemini API, automatic scaling, built-in security
- Alternative considered: AWS S3 (more mature but higher complexity)
- Decision: GCP chosen for ecosystem consistency with Gemini API

### Authentication Strategy

**JWT + HTTP-Only Cookies:**
- Rationale: JWT provides stateless authentication, HTTP-Only cookies prevent XSS attacks
- Alternative considered: Session-based with server-side storage (more secure but less scalable)
- Decision: Hybrid approach chosen for security and scalability balance

**Bcrypt with 12 Salt Rounds:**
- Rationale: Industry standard, resistant to GPU attacks, acceptable performance
- Alternative considered: Argon2 (more secure but slower)
- Decision: Bcrypt chosen for balance of security and performance

**30-Day Session Expiration:**
- Rationale: Balances user convenience with security (long enough to avoid frequent re-login, short enough to limit token exposure)
- Alternative considered: 7 days (more secure but more inconvenient)
- Decision: 30 days chosen based on user experience requirements

### Image Upload Strategy

**Multipart Form Data:**
- Rationale: Standard for file uploads, supported by all browsers, easy to implement
- Alternative considered: Base64 encoding (simpler but larger payload)
- Decision: Multipart chosen for efficiency and browser compatibility

**50MB File Size Limit:**
- Rationale: Balances functionality (high-resolution images) with performance (reasonable upload times)
- Alternative considered: 100MB (more flexibility but slower uploads)
- Decision: 50MB chosen based on typical wall image sizes and network constraints

**GCP Cloud Storage for Images:**
- Rationale: Scalable, secure, integrates with Gemini API for image analysis
- Alternative considered: Local file storage (simpler but less scalable)
- Decision: GCP chosen for scalability and integration benefits

### Error Handling Strategy

**Specific Error Codes:**
- Rationale: Enables client-side handling of specific error types, better user experience
- Alternative considered: Generic error messages (simpler but less helpful)
- Decision: Specific codes chosen for better error handling and debugging

**Automatic Retry with Exponential Backoff:**
- Rationale: Handles transient failures gracefully, reduces user frustration
- Alternative considered: Manual retry only (simpler but worse UX)
- Decision: Automatic retry chosen for better resilience

**Error Logging and Monitoring:**
- Rationale: Enables debugging and performance monitoring, critical for production
- Alternative considered: No logging (simpler but impossible to debug)
- Decision: Comprehensive logging chosen for production reliability

### Security Considerations

**HTTPS/TLS 1.2+:**
- Rationale: Encrypts data in transit, prevents man-in-the-middle attacks
- Alternative considered: HTTP (not acceptable for production)
- Decision: HTTPS mandatory for all endpoints

**CORS with SameSite Cookies:**
- Rationale: Prevents CSRF attacks, allows cross-origin requests when needed
- Alternative considered: CSRF tokens (more complex but equally secure)
- Decision: SameSite=Strict chosen for simplicity and security

**GCP Service Account with Minimal Permissions:**
- Rationale: Follows principle of least privilege, limits damage if credentials are compromised
- Alternative considered: Root credentials (not acceptable)
- Decision: Service account with minimal permissions chosen for security

### Scalability Considerations

**Stateless Backend:**
- Rationale: Enables horizontal scaling, load balancing across multiple instances
- Alternative considered: Stateful backend (simpler but not scalable)
- Decision: Stateless chosen for production scalability

**Redis for Session Store:**
- Rationale: Shared session store enables multiple backend instances to serve same user
- Alternative considered: In-memory session store (simpler but not scalable)
- Decision: Redis chosen for distributed session management

**Cloud Run for Auto-Scaling:**
- Rationale: Automatically scales based on traffic, pay-per-use pricing
- Alternative considered: Fixed VM instances (simpler but less cost-effective)
- Decision: Cloud Run chosen for cost efficiency and scalability

### Performance Considerations

**Image Compression:**
- Rationale: Reduces file size and upload time without significant quality loss
- Implementation: Compress images on client before upload
- Target: 80% quality JPEG, 50% reduction in file size

**Lazy Loading:**
- Rationale: Improves initial page load time by deferring non-critical resources
- Implementation: Load 3D viewer and model catalog only when needed
- Target: Initial page load < 2 seconds

**Caching Strategy:**
- Rationale: Reduces server load and improves response times
- Implementation: Cache user data, image metadata, and model catalog
- TTL: 1 hour for user data, 24 hours for catalog

