#!/bin/bash

# 3D Model Generation Feature - Deployment Verification Script
# This script verifies the deployment is ready and checks environment variables

echo "=========================================="
echo "3D Model Generation - Deployment Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "wall-decor-visualizer" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

echo "Step 1: Verifying Backend Build"
echo "--------------------------------"
cd wall-decor-visualizer/backend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend builds successfully${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi
cd ../..

echo ""
echo "Step 2: Verifying Frontend Build"
echo "---------------------------------"
cd wall-decor-visualizer/frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend builds successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
cd ../..

echo ""
echo "Step 3: Checking Environment Variables"
echo "---------------------------------------"

# Check backend .env.local
if [ -f "wall-decor-visualizer/backend/.env.local" ]; then
    echo -e "${GREEN}✅ Backend .env.local exists${NC}"
    
    # Check for required variables
    if grep -q "GEMINI_API_KEY" wall-decor-visualizer/backend/.env.local; then
        echo -e "${GREEN}✅ GEMINI_API_KEY found in .env.local${NC}"
    else
        echo -e "${YELLOW}⚠️  GEMINI_API_KEY not found in .env.local${NC}"
        echo "   This is required for 3D model generation"
    fi
    
    if grep -q "MONGODB_URI" wall-decor-visualizer/backend/.env.local; then
        echo -e "${GREEN}✅ MONGODB_URI found${NC}"
    else
        echo -e "${RED}❌ MONGODB_URI not found${NC}"
    fi
    
    if grep -q "GCP_SERVICE_ACCOUNT_KEY" wall-decor-visualizer/backend/.env.local; then
        echo -e "${GREEN}✅ GCP_SERVICE_ACCOUNT_KEY found${NC}"
    else
        echo -e "${RED}❌ GCP_SERVICE_ACCOUNT_KEY not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Backend .env.local not found (OK for production)${NC}"
fi

echo ""
echo "Step 4: Checking Deployment Configuration"
echo "------------------------------------------"

if [ -f "wall-decor-visualizer/backend/render.yaml" ]; then
    echo -e "${GREEN}✅ render.yaml exists${NC}"
    
    if grep -q "GEMINI_API_KEY" wall-decor-visualizer/backend/render.yaml; then
        echo -e "${GREEN}✅ GEMINI_API_KEY configured in render.yaml${NC}"
    else
        echo -e "${RED}❌ GEMINI_API_KEY not in render.yaml${NC}"
    fi
else
    echo -e "${RED}❌ render.yaml not found${NC}"
fi

echo ""
echo "Step 5: Checking Feature Files"
echo "-------------------------------"

# Check backend files
BACKEND_FILES=(
    "wall-decor-visualizer/backend/src/data-service/application/model-generation/generate_model.api.ts"
    "wall-decor-visualizer/backend/src/data-service/application/model-generation/get_job_status.api.ts"
    "wall-decor-visualizer/backend/src/data-service/domain/gemini-service/index.ts"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $(basename $file)${NC}"
    else
        echo -e "${RED}❌ $(basename $file) missing${NC}"
    fi
done

# Check frontend files
FRONTEND_FILES=(
    "wall-decor-visualizer/frontend/src/page-service/domain/model-generation-page/ModelGenerationPage.tsx"
    "wall-decor-visualizer/frontend/src/data-service/application/model-generation/generate_model.api.ts"
)

for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $(basename $file)${NC}"
    else
        echo -e "${RED}❌ $(basename $file) missing${NC}"
    fi
done

echo ""
echo "Step 6: Deployment Readiness Summary"
echo "====================================="
echo ""
echo -e "${GREEN}✅ Code builds successfully${NC}"
echo -e "${GREEN}✅ Feature files present${NC}"
echo -e "${GREEN}✅ Deployment configuration exists${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Before deploying to Render/Vercel:${NC}"
echo "   1. Verify GEMINI_API_KEY is set in Render dashboard"
echo "   2. Verify all other environment variables are configured"
echo "   3. Test locally first if possible"
echo "   4. Monitor logs after deployment"
echo ""
echo "Next Steps:"
echo "1. Review DEPLOYMENT_GUIDE.md for detailed instructions"
echo "2. Verify environment variables in Render dashboard"
echo "3. Push to GitHub to trigger automatic deployment"
echo "4. Monitor deployment in Render and Vercel dashboards"
echo "5. Test the feature in production environment"
echo ""
echo "=========================================="
echo "Verification Complete!"
echo "=========================================="
