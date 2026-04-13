#!/bin/bash
# Jurryi Backend - Google Cloud Run Deployment Script
#
# Prerequisites:
#   1. Google Cloud SDK (gcloud) installed and authenticated
#   2. A Google Cloud project created
#   3. Cloud Run API enabled
#   4. Billing enabled on the project
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh <project-id>
#
# Example:
#   ./deploy.sh jurryi-prod

set -e

PROJECT_ID=${1:-$(gcloud config get-value project)}

if [ -z "$PROJECT_ID" ]; then
  echo "Error: No project ID specified."
  echo "Usage: ./deploy.sh <project-id>"
  echo "   or: gcloud config set project <project-id> && ./deploy.sh"
  exit 1
fi

echo "============================================"
echo "  Jurryi API — Google Cloud Run Deploy"
echo "============================================"
echo "Project: $PROJECT_ID"
echo "Region:  asia-south1 (Mumbai)"
echo ""

# Step 1: Set the project
echo "[1/5] Setting Google Cloud project..."
gcloud config set project $PROJECT_ID

# Step 2: Enable required APIs
echo "[2/5] Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Step 3: Build and push Docker image
echo "[3/5] Building container image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/jurryi-api .

# Step 4: Deploy to Cloud Run
echo "[4/5] Deploying to Cloud Run (asia-south1 / Mumbai)..."
gcloud run deploy jurryi-api \
  --image gcr.io/$PROJECT_ID/jurryi-api \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --port 5000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production

# Step 5: Get the service URL
echo ""
echo "[5/5] Deployment complete!"
SERVICE_URL=$(gcloud run services describe jurryi-api --region asia-south1 --format 'value(status.url)')
echo ""
echo "============================================"
echo "  Your API is live at:"
echo "  $SERVICE_URL"
echo "============================================"
echo ""
echo "IMPORTANT: Set your secret environment variables:"
echo "  gcloud run services update jurryi-api --region asia-south1 \\"
echo "    --set-env-vars MONGODB_URI=<your-uri> \\"
echo "    --set-env-vars JWT_SECRET=<your-secret> \\"
echo "    --set-env-vars JWT_REFRESH_SECRET=<your-secret> \\"
echo "    --set-env-vars ANTHROPIC_API_KEY=<your-key> \\"
echo "    --set-env-vars TAVILY_API_KEY=<your-key>"
echo ""
echo "Or use Google Secret Manager (recommended for production):"
echo "  gcloud secrets create mongodb-uri --data-file=-"
echo "  gcloud run services update jurryi-api --region asia-south1 \\"
echo "    --set-secrets MONGODB_URI=mongodb-uri:latest"
