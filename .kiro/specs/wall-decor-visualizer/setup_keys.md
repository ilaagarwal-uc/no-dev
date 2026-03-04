# Wall Decor Visualizer - Setup Keys & Credentials

This document outlines all the keys, credentials, and configuration values needed to set up the Wall Decor Visualizer project.

---

## Frontend Setup

### Environment Variables (.env.local)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# Authentication
VITE_AUTH_TOKEN_KEY=auth_token
VITE_AUTH_USER_KEY=auth_user

# Image Upload
VITE_MAX_IMAGE_SIZE=10485760
VITE_ACCEPTED_IMAGE_FORMATS=jpg,jpeg,png,webp

# 3D Viewer
VITE_VIEWER_CANVAS_WIDTH=1200
VITE_VIEWER_CANVAS_HEIGHT=800
```

### Production Environment (.env.production)

```env
VITE_API_BASE_URL=https://api.wall-decor-visualizer.com/api
VITE_API_TIMEOUT=30000
```

---

## Backend Setup

### Environment Variables (.env.local)

```env
# Server Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database - MongoDB
MONGODB_URI=mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER].mongodb.net/wall-decor-visualizer?retryWrites=true&w=majority
MONGODB_DB_NAME=wall-decor-visualizer

# JWT Authentication
JWT_SECRET=[GENERATE_RANDOM_SECRET_KEY]
JWT_EXPIRY=3600
JWT_REFRESH_SECRET=[GENERATE_RANDOM_REFRESH_SECRET]
JWT_REFRESH_EXPIRY=604800

# GCP Cloud Storage
GCP_PROJECT_ID=[YOUR_GCP_PROJECT_ID]
GCP_BUCKET_NAME=wall-decor-visualizer-images
GCP_SERVICE_ACCOUNT_KEY=[PATH_TO_SERVICE_ACCOUNT_JSON]

# Google Gemini API
GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]
GEMINI_MODEL=gemini-pro-vision

# Blender Configuration
BLENDER_EXECUTABLE_PATH=/usr/bin/blender
BLENDER_PYTHON_PATH=/usr/bin/python3
BLENDER_TEMP_DIR=/tmp/blender-jobs
BLENDER_OUTPUT_DIR=/tmp/blender-output

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# Email Configuration (Optional - for notifications)
SMTP_HOST=[YOUR_SMTP_HOST]
SMTP_PORT=587
SMTP_USER=[YOUR_SMTP_USER]
SMTP_PASSWORD=[YOUR_SMTP_PASSWORD]
SMTP_FROM=noreply@wall-decor-visualizer.com
```

### Production Environment (.env.production)

```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

MONGODB_URI=mongodb+srv://[PROD_USERNAME]:[PROD_PASSWORD]@[PROD_CLUSTER].mongodb.net/wall-decor-visualizer-prod?retryWrites=true&w=majority
MONGODB_DB_NAME=wall-decor-visualizer-prod

JWT_SECRET=[PROD_JWT_SECRET]
JWT_EXPIRY=3600
JWT_REFRESH_SECRET=[PROD_JWT_REFRESH_SECRET]
JWT_REFRESH_EXPIRY=604800

GCP_PROJECT_ID=[PROD_GCP_PROJECT_ID]
GCP_BUCKET_NAME=wall-decor-visualizer-images-prod
GCP_SERVICE_ACCOUNT_KEY=[PATH_TO_PROD_SERVICE_ACCOUNT_JSON]

GEMINI_API_KEY=[PROD_GEMINI_API_KEY]

BLENDER_EXECUTABLE_PATH=/usr/bin/blender
BLENDER_PYTHON_PATH=/usr/bin/python3
BLENDER_TEMP_DIR=/var/tmp/blender-jobs
BLENDER_OUTPUT_DIR=/var/tmp/blender-output

CORS_ORIGIN=https://wall-decor-visualizer.com
CORS_CREDENTIALS=true

SMTP_HOST=[PROD_SMTP_HOST]
SMTP_PORT=587
SMTP_USER=[PROD_SMTP_USER]
SMTP_PASSWORD=[PROD_SMTP_PASSWORD]
SMTP_FROM=noreply@wall-decor-visualizer.com
```

---

## Required Keys & Credentials

### 1. MongoDB Atlas

**What you need:**
- MongoDB Atlas account (free tier available)
- Cluster connection string
- Database username and password

**Where to get it:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string from "Connect" button
5. Create database user with username and password

**Format:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

---

### 2. Google Cloud Platform (GCP)

**What you need:**
- GCP Project ID
- Service Account JSON key file
- Cloud Storage bucket name

**Where to get it:**
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Cloud Storage API
4. Create a Service Account
5. Generate JSON key file
6. Create a Cloud Storage bucket
7. Grant Service Account access to bucket

**Files needed:**
- `gcp-service-account.json` (keep this secure, add to .gitignore)

**Environment variables:**
```
GCP_PROJECT_ID=your-project-id
GCP_BUCKET_NAME=wall-decor-visualizer-images
GCP_SERVICE_ACCOUNT_KEY=/path/to/gcp-service-account.json
```

---

### 3. Google Gemini API

**What you need:**
- Gemini API key

**Where to get it:**
1. Go to https://ai.google.dev
2. Click "Get API Key"
3. Create new API key in Google Cloud Console
4. Enable Generative Language API

**Environment variable:**
```
GEMINI_API_KEY=your-gemini-api-key
```

---

### 4. JWT Secrets

**What you need:**
- JWT secret key (for access tokens)
- JWT refresh secret key (for refresh tokens)

**How to generate:**
```bash
# Generate random secret (run in terminal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Environment variables:**
```
JWT_SECRET=your-generated-secret-key
JWT_REFRESH_SECRET=your-generated-refresh-secret-key
```

---

### 5. Blender Setup

**What you need:**
- Blender installed on server
- Python 3 installed
- Paths to Blender executable and Python

**Installation:**
```bash
# macOS
brew install blender

# Ubuntu/Debian
sudo apt-get install blender

# CentOS/RHEL
sudo yum install blender
```

**Find paths:**
```bash
# Find Blender
which blender

# Find Python
which python3
```

**Environment variables:**
```
BLENDER_EXECUTABLE_PATH=/usr/bin/blender
BLENDER_PYTHON_PATH=/usr/bin/python3
BLENDER_TEMP_DIR=/tmp/blender-jobs
BLENDER_OUTPUT_DIR=/tmp/blender-output
```

---

### 6. SMTP Configuration (Optional)

**What you need:**
- SMTP server details
- Email credentials

**Common providers:**
- Gmail: smtp.gmail.com:587
- SendGrid: smtp.sendgrid.net:587
- AWS SES: email-smtp.[region].amazonaws.com:587

**Environment variables:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@wall-decor-visualizer.com
```

---

## Setup Checklist

### Before Starting Development

- [ ] MongoDB Atlas cluster created and connection string obtained
- [ ] GCP project created with Cloud Storage enabled
- [ ] GCP Service Account created and JSON key downloaded
- [ ] GCP Cloud Storage bucket created
- [ ] Gemini API key generated
- [ ] JWT secrets generated
- [ ] Blender installed and paths identified
- [ ] Frontend .env.local created with all variables
- [ ] Backend .env.local created with all variables
- [ ] .env files added to .gitignore

### Before Production Deployment

- [ ] Production MongoDB cluster created
- [ ] Production GCP project and bucket created
- [ ] Production Gemini API key obtained
- [ ] Production JWT secrets generated (different from dev)
- [ ] Production SMTP credentials configured
- [ ] Backend .env.production created with all variables
- [ ] Frontend .env.production created with all variables
- [ ] All secrets stored securely (not in git)
- [ ] Environment variables configured in deployment platform

---

## Security Notes

**Never commit these files to git:**
- `.env.local`
- `.env.production`
- `gcp-service-account.json`
- Any file containing API keys or secrets

**Add to .gitignore:**
```
.env.local
.env.production
.env.*.local
gcp-service-account.json
*.key
*.pem
```

**For production:**
- Use environment variable management (Render, Vercel, etc.)
- Rotate secrets regularly
- Use separate credentials for dev and prod
- Enable audit logging for sensitive operations
- Use VPC and private endpoints where possible

---

## Deployment Platforms Configuration

### Render (Backend)

1. Create new Web Service
2. Connect GitHub repository
3. Set environment variables in Render dashboard:
   - MONGODB_URI
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - GCP_PROJECT_ID
   - GCP_BUCKET_NAME
   - GCP_SERVICE_ACCOUNT_KEY (paste JSON content)
   - GEMINI_API_KEY
   - BLENDER_EXECUTABLE_PATH
   - BLENDER_PYTHON_PATH
   - CORS_ORIGIN

### Vercel (Frontend)

1. Create new project from GitHub
2. Set environment variables in Vercel dashboard:
   - VITE_API_BASE_URL
   - VITE_API_TIMEOUT
   - VITE_MAX_IMAGE_SIZE
   - VITE_ACCEPTED_IMAGE_FORMATS

---

## Testing Keys (Development Only)

For local development and testing, you can use these test values:

```env
# Test MongoDB (local)
MONGODB_URI=mongodb://localhost:27017/wall-decor-visualizer-test

# Test JWT (development only)
JWT_SECRET=dev-secret-key-do-not-use-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key-do-not-use-in-production

# Test Blender paths (adjust for your system)
BLENDER_EXECUTABLE_PATH=/usr/bin/blender
BLENDER_PYTHON_PATH=/usr/bin/python3
```

---

## Next Steps

1. Gather all required keys and credentials
2. Create `.env.local` files in both frontend and backend
3. Verify all connections work
4. Run setup scripts to initialize databases
5. Start development servers
6. Begin implementation

