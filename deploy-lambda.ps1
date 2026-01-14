# AWS Lambda Deployment Script for Todo Task API (PowerShell)
# This script builds and deploys the .NET 8 Lambda function

$ErrorActionPreference = "Stop"

Write-Host "Starting Lambda deployment..." -ForegroundColor Yellow

# Configuration
$FUNCTION_NAME = "TodoTaskAPI"
$REGION = "us-east-1"
$PROJECT_PATH = "backend\TodoTask.API"
$OUTPUT_PATH = "lambda-package"

Write-Host "Step 1: Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path $OUTPUT_PATH) {
    Remove-Item -Recurse -Force $OUTPUT_PATH
}
New-Item -ItemType Directory -Path $OUTPUT_PATH -Force | Out-Null

Write-Host "Step 2: Building .NET application..." -ForegroundColor Yellow
Set-Location $PROJECT_PATH
dotnet clean
dotnet publish -c Release -r linux-x64 --self-contained false -o "..\$OUTPUT_PATH"

Write-Host "Step 3: Creating deployment package..." -ForegroundColor Yellow
Set-Location "..\$OUTPUT_PATH"
Compress-Archive -Path * -DestinationPath "..\lambda-deployment.zip" -Force

Write-Host "Step 4: Uploading to Lambda..." -ForegroundColor Yellow
Set-Location ..\..
aws lambda update-function-code `
  --function-name $FUNCTION_NAME `
  --zip-file fileb://lambda-deployment.zip `
  --region $REGION

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Note: Update function configuration (environment variables, timeout, etc.) in AWS Console" -ForegroundColor Yellow

# Cleanup
Remove-Item -Recurse -Force $OUTPUT_PATH -ErrorAction SilentlyContinue
Remove-Item -Force lambda-deployment.zip -ErrorAction SilentlyContinue

