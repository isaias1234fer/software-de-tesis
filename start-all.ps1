# Script para iniciar backend y frontend en paralelo

Write-Host "=== Iniciando Sistema de Tesis ===" -ForegroundColor Cyan

# Verificar si el backend está corriendo
$backendRunning = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($backendRunning) {
    Write-Host "⚠️ El backend ya está corriendo en el puerto 3001" -ForegroundColor Yellow
} else {
    Write-Host "`n🚀 Iniciando backend..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Nueva carpeta\TESIS I\Software de Tesis\backend'; npm run start:dev"
    Write-Host "✅ Backend iniciado en nueva ventana" -ForegroundColor Green
}

# Esperar un poco antes de iniciar el frontend
Start-Sleep -Seconds 3

# Verificar si el frontend está corriendo
$frontendRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($frontendRunning) {
    Write-Host "⚠️ El frontend ya está corriendo en el puerto 3000" -ForegroundColor Yellow
} else {
    Write-Host "`n🚀 Iniciando frontend..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Nueva carpeta\TESIS I\Software de Tesis\frontend'; npm run dev"
    Write-Host "✅ Frontend iniciado en nueva ventana" -ForegroundColor Green
}

Write-Host "`n=== Servicios iniciados ===" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3001" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`nAbre tu navegador en http://localhost:3000" -ForegroundColor Yellow
