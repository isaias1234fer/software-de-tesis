# Script para cambiar la contraseña del usuario postgres en PostgreSQL

Write-Host "=== Cambiando contraseña del usuario postgres ===" -ForegroundColor Cyan

$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

Write-Host "`nIngresa la NUEVA contraseña para el usuario postgres:" -ForegroundColor Yellow
$newPassword = Read-Host -AsSecureString
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($newPassword))

Write-Host "`nIngresa tu contraseña ACTUAL de postgres (la que usas para pgAdmin o conexión):" -ForegroundColor Yellow
$currentPassword = Read-Host -AsSecureString
$plainCurrentPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($currentPassword))

$env:PGPASSWORD = $plainCurrentPassword

Write-Host "`nIntentando cambiar contraseña..." -ForegroundColor Cyan

$result = & $psqlPath -h localhost -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD '$plainPassword';" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contraseña cambiada exitosamente" -ForegroundColor Green
    Write-Host "`nAhora actualiza tu archivo .env con:" -ForegroundColor Yellow
    Write-Host "DATABASE_URL=postgresql://postgres:$plainPassword@localhost:5432/thesis_db?schema=public" -ForegroundColor White
} else {
    Write-Host "❌ Error al cambiar contraseña" -ForegroundColor Red
    Write-Host "Error: $result" -ForegroundColor Yellow
    Write-Host "`nVerifica que la contraseña actual sea correcta" -ForegroundColor Yellow
}

$env:PGPASSWORD = ""
