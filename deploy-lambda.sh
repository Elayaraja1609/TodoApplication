#!/bin/bash

# AWS Lambda Deployment Script for Todo Task API
# This script builds and deploys the .NET 8 Lambda function

set -e

echo "Starting Lambda deployment..."

# Configuration
FUNCTION_NAME="TodoTaskAPI"
REGION="us-east-1"
PROJECT_PATH="backend/TodoTask.API"
OUTPUT_PATH="lambda-package"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Cleaning previous build...${NC}"
rm -rf $OUTPUT_PATH
mkdir -p $OUTPUT_PATH

echo -e "${YELLOW}Step 2: Building .NET application...${NC}"
cd $PROJECT_PATH
dotnet clean
dotnet publish -c Release -r linux-x64 --self-contained false -o ../$OUTPUT_PATH

echo -e "${YELLOW}Step 3: Creating deployment package...${NC}"
cd ../$OUTPUT_PATH
zip -r ../lambda-deployment.zip .

echo -e "${YELLOW}Step 4: Uploading to Lambda...${NC}"
cd ../..
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://lambda-deployment.zip \
  --region $REGION

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Note: Update function configuration (environment variables, timeout, etc.) in AWS Console${NC}"

# Cleanup
rm -rf lambda-package
rm -f lambda-deployment.zip

