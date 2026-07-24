# Script para configurar el archivo .env del backend
$backendEnvPath = "backend\.env"
$envContent = @"
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/thesis_db?schema=public"

# Auth
JWT_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_SECRET="your-nextauth-secret-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key-here"

# MinIO / S3
S3_ENDPOINT="localhost"
S3_PORT=9000
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="thesis-documents"
S3_USE_SSL=false

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# ORCID
ORCID_CLIENT_ID="APP-your-orcid-client-id"
ORCID_CLIENT_SECRET="your-orcid-client-secret"
ORCID_REDIRECT_URI="http://localhost:3001/auth/orcid/callback"

# App
PORT=3001

# SMTP / Email Configuration (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"
"@

# Verificar si el archivo existe
if (Test-Path $backendEnvPath) {
    Write-Host "El archivo $backendEnvPath ya existe. Haciendo backup..." -ForegroundColor Yellow
    Copy-Item $backendEnvPath "$backendEnvPath.backup"
    Write-Host "Backup creado en $backendEnvPath.backup" -ForegroundColor Green
}

# Escribir el nuevo contenido
Set-Content -Path $backendEnvPath -Value $envContent
Write-Host "Archivo .env configurado correctamente en $backendEnvPath" -ForegroundColor Green
Write-Host "IMPORTANTE: Debes actualizar las siguientes variables con tus valores reales:" -ForegroundColor Yellow
Write-Host "  - JWT_SECRET" -ForegroundColor Cyan
Write-Host "  - NEXTAUTH_SECRET" -ForegroundColor Cyan
Write-Host "  - OPENAI_API_KEY" -ForegroundColor Cyan
Write-Host "  - ORCID_CLIENT_ID y ORCID_CLIENT_SECRET (si usas ORCID)" -ForegroundColor Cyan
Write-Host "  - SMTP_USER y SMTP_PASS (para envío de emails)" -ForegroundColor Cyan
