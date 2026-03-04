# Wall Decor Visualizer - Setup Guide

## Overview

This setup guide covers the free hosting stack for demo purposes. After demo validation, this setup will be migrated to an enterprise microservice architecture.

**Demo Stack:**
- Frontend: Vercel (React)
- Backend: Render (Node.js/Express)
- Database: MongoDB Atlas (free tier)
- Storage: GCP Cloud Storage (free tier)

---

## Prerequisites

- GitHub account
- Node.js 18+ installed locally
- Git installed
- Google Cloud account (for GCP Cloud Storage)

---

## Part 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" and create account
3. Verify email address

### Step 2: Create Free Cluster

1. Click "Create" to build a new cluster
2. Select "M0 Sandbox" (free tier)
3. Choose cloud provider: Google Cloud
4. Choose region: us-central1 (or closest to you)
5. Click "Create Cluster" (takes 2-3 minutes)

### Step 3: Create Database User

1. In left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Enter username: `wall_decor_app`
4. Enter password: Generate secure password (save it!)
5. Click "Add User"

### Step 4: Whitelist IP Address

1. In left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for demo only)
4. Click "Confirm"

### Step 5: Get Connection String

1. Click "Databases" in left sidebar
2. Click "Connect" button on your cluster
3. Select "Drivers"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `myFirstDatabase` with `wall_decor_demo`

**Example:**
```
mongodb+srv://wall_decor_app:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/wall_decor_demo?retryWrites=true&w=majority
```

Save this connection string - you'll need it later.

---

## Part 2: GCP Cloud Storage Setup

### Step 1: Create GCP Project

1. Go to https://console.cloud.google.com
2. Click project dropdown at top
3. Click "New Project"
4. Enter name: `wall-decor-visualizer-demo`
5. Click "Create"

### Step 2: Enable Cloud Storage API

1. In search bar, search "Cloud Storage"
2. Click "Cloud Storage" API
3. Click "Enable"

### Step 3: Create Storage Bucket

1. In left sidebar, click "Buckets"
2. Click "Create Bucket"
3. Enter name: `wall-decor-demo-images` (must be globally unique)
4. Choose location: us-central1
5. Choose storage class: Standard
6. Click "Create"

### Step 4: Create Service Account

1. In left sidebar, click "Service Accounts"
2. Click "Create Service Account"
3. Enter name: `wall-decor-api`
4. Click "Create and Continue"
5. Click "Continue" (skip optional steps)
6. Click "Done"

### Step 5: Create Service Account Key

1. Click on the service account you just created
2. Click "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON"
5. Click "Create" (downloads JSON file)
6. Save this file securely - you'll need it for backend

### Step 6: Grant Bucket Permissions

1. Go back to "Buckets"
2. Click on your bucket
3. Click "Permissions" tab
4. Click "Grant Access"
5. Enter service account email (from JSON file: `client_email`)
6. Select role: "Storage Object Admin"
7. Click "Save"

---

## Part 3: Backend Setup (Render)

### Step 1: Prepare Backend Code

1. Create GitHub repository: `wall-decor-visualizer-backend`
2. Clone locally:
```bash
git clone https://github.com/YOUR_USERNAME/wall-decor-visualizer-backend.git
cd wall-decor-visualizer-backend
```

3. Initialize Node.js project:
```bash
npm init -y
npm install express cors dotenv mongoose multer axios winston
npm install --save-dev typescript @types/node @types/express ts-node
```

4. Create `.gitignore`:
```
node_modules/
.env
.env.local
dist/
*.log
gcp-key.json
```

5. Create `.env.example` (for reference):
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/wall_decor_demo
MONGODB_DATABASE=wall_decor_demo
GCP_PROJECT_ID=wall-decor-visualizer-demo
GCP_BUCKET_NAME=wall-decor-demo-images
GCP_SERVICE_ACCOUNT_KEY_PATH=/etc/secrets/gcp-key.json
JWT_SECRET=your-super-secret-jwt-key-change-this
API_PORT=8080
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
LOG_LEVEL=info
```

6. Create `src/server.ts` (basic Express server):
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 8080;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

7. Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

8. Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

9. Commit and push to GitHub:
```bash
git add .
git commit -m "Initial backend setup"
git push origin main
```

### Step 2: Deploy to Render

1. Go to https://render.com
2. Sign up with GitHub account
3. Click "New +" → "Web Service"
4. Select your GitHub repository
5. Configure:
   - Name: `wall-decor-api`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: Free

6. Click "Create Web Service"

### Step 3: Add Environment Variables to Render

1. In Render dashboard, go to your service
2. Click "Environment" tab
3. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `MONGODB_DATABASE`: `wall_decor_demo`
   - `GCP_PROJECT_ID`: Your GCP project ID
   - `GCP_BUCKET_NAME`: `wall-decor-demo-images`
   - `JWT_SECRET`: Generate a random string (use `openssl rand -base64 32`)
   - `ALLOWED_ORIGINS`: Your frontend URL (will update after frontend deployment)
   - `LOG_LEVEL`: `info`

4. For `GCP_SERVICE_ACCOUNT_KEY_PATH`:
   - Click "Add File"
   - Name: `gcp-key.json`
   - Paste contents of your GCP service account JSON file
   - Path: `/etc/secrets/gcp-key.json`

5. Click "Save Changes"

### Step 4: Verify Deployment

1. Wait for deployment to complete (2-3 minutes)
2. Click the URL provided by Render
3. Add `/health` to URL
4. Should see: `{"status":"ok","timestamp":"..."}`

Save your Render URL - you'll need it for frontend.

---

## Part 4: Frontend Setup (Vercel)

### Step 1: Prepare Frontend Code

1. Create GitHub repository: `wall-decor-visualizer-frontend`
2. Clone locally:
```bash
git clone https://github.com/YOUR_USERNAME/wall-decor-visualizer-frontend.git
cd wall-decor-visualizer-frontend
```

3. Create React app with Vite:
```bash
npm create vite@latest . -- --template react-ts
npm install
npm install axios redux @reduxjs/toolkit react-redux
```

4. Create `.env.example`:
```
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=Wall Decor Visualizer
```

5. Create `.env.production`:
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
VITE_APP_NAME=Wall Decor Visualizer
```

6. Update `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

7. Commit and push to GitHub:
```bash
git add .
git commit -m "Initial frontend setup"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub account
3. Click "Add New..." → "Project"
4. Select your frontend repository
5. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. Add environment variables:
   - `VITE_API_BASE_URL`: Your Render backend URL
   - `VITE_APP_NAME`: Wall Decor Visualizer

7. Click "Deploy"

### Step 3: Update Backend CORS

1. Go back to Render dashboard
2. Update `ALLOWED_ORIGINS` to include your Vercel URL
3. Click "Save Changes"

---

## Part 5: Local Development

### Step 1: Setup Local Environment

1. Clone both repositories locally
2. Create `.env` files in both projects with local values:

**Backend `.env`:**
```
MONGODB_URI=mongodb+srv://wall_decor_app:PASSWORD@cluster0.xxxxx.mongodb.net/wall_decor_demo
MONGODB_DATABASE=wall_decor_demo
GCP_PROJECT_ID=wall-decor-visualizer-demo
GCP_BUCKET_NAME=wall-decor-demo-images
GCP_SERVICE_ACCOUNT_KEY_PATH=./gcp-key.json
JWT_SECRET=local-dev-secret-key
API_PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
LOG_LEVEL=debug
```

2. Place your GCP service account JSON file in backend root as `gcp-key.json`

### Step 2: Run Locally

**Terminal 1 - Backend:**
```bash
cd wall-decor-visualizer-backend
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd wall-decor-visualizer-frontend
npm run dev
# App runs on http://localhost:5173
```

### Step 3: Test Locally

1. Open http://localhost:5173
2. Test login functionality
3. Test image upload
4. Check browser console for errors
5. Check backend logs for issues

---

## Part 6: Monitoring and Debugging

### Render Logs

1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. View real-time logs

### MongoDB Atlas Monitoring

1. Go to MongoDB Atlas
2. Click "Monitoring" tab
3. View database metrics
4. Check connection status

### GCP Cloud Storage

1. Go to GCP Console
2. Click "Buckets"
3. Click your bucket
4. View uploaded files in "Objects" tab

---

## Part 7: Troubleshooting

### Backend Won't Deploy

**Issue:** Build fails on Render
**Solution:**
1. Check build logs in Render dashboard
2. Ensure `package.json` has correct scripts
3. Verify all dependencies are listed
4. Try building locally: `npm run build`

### MongoDB Connection Error

**Issue:** "Cannot connect to MongoDB"
**Solution:**
1. Verify connection string in `.env`
2. Check IP whitelist in MongoDB Atlas
3. Verify username/password are correct
4. Test connection locally first

### GCP Upload Fails

**Issue:** "Permission denied" when uploading to GCP
**Solution:**
1. Verify service account has "Storage Object Admin" role
2. Check bucket name is correct
3. Verify GCP key file is in correct location
4. Check GCP project ID matches

### CORS Errors

**Issue:** Frontend can't reach backend
**Solution:**
1. Verify `ALLOWED_ORIGINS` includes frontend URL
2. Check backend is running and accessible
3. Verify API endpoint URLs match
4. Check browser console for specific error

---

## Migration to Enterprise Microservice

After demo validation, migration steps:

1. **Database**: Move from MongoDB Atlas to enterprise MongoDB cluster
2. **Backend**: Move from Render to Kubernetes/Docker on enterprise infrastructure
3. **Storage**: Move from GCP free tier to enterprise GCP project
4. **Authentication**: Integrate with enterprise OAuth/SSO
5. **Monitoring**: Setup enterprise logging and monitoring (DataDog, New Relic, etc.)
6. **CI/CD**: Setup enterprise CI/CD pipeline (GitHub Actions, GitLab CI, etc.)

---

## Quick Reference

| Component | Service | Free Tier | URL |
|-----------|---------|-----------|-----|
| Frontend | Vercel | Unlimited | https://vercel.com |
| Backend | Render | 1 service | https://render.com |
| Database | MongoDB Atlas | 512MB | https://mongodb.com/cloud/atlas |
| Storage | GCP | 5GB/month | https://cloud.google.com |

---

## Support

For issues or questions:
1. Check logs in respective dashboards
2. Review error messages carefully
3. Test locally before deploying
4. Check GitHub issues for similar problems
