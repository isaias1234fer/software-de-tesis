# Script para verificar y configurar la base de datos PostgreSQL

Write-Host "=== Verificando PostgreSQL ===" -ForegroundColor Cyan

# Verificar si PostgreSQL está instalado (buscar en PATH y ubicaciones típicas)
$pgPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $pgPath) {
    # Buscar en ubicaciones típicas de Windows
    $possiblePaths = @(
        "C:\Program Files\PostgreSQL\*\bin\psql.exe",
        "C:\Program Files (x86)\PostgreSQL\*\bin\psql.exe",
        "C:\PostgreSQL\*\bin\psql.exe"
    )

    foreach ($pathPattern in $possiblePaths) {
        $found = Get-ChildItem -Path $pathPattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) {
            $pgPath = $found
            break
        }
    }
}

if (-not $pgPath) {
    Write-Host "❌ PostgreSQL no está instalado o no se encontró en ubicaciones típicas" -ForegroundColor Red
    Write-Host "Por favor, instala PostgreSQL desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "O agrega la carpeta bin de PostgreSQL al PATH del sistema" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ PostgreSQL encontrado en: $($pgPath.FullName)" -ForegroundColor Green

# Usar la ruta completa encontrada
$psqlPath = $pgPath.FullName

# Intentar conectar a PostgreSQL
Write-Host "`n=== Intentando conectar a PostgreSQL ===" -ForegroundColor Cyan

$env:PGPASSWORD = "76858382"
$connectionTest = & $psqlPath -h localhost -U postgres -d postgres -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Conexión exitosa a PostgreSQL" -ForegroundColor Green
} else {
    Write-Host "❌ Error al conectar a PostgreSQL" -ForegroundColor Red
    Write-Host "Error: $connectionTest" -ForegroundColor Yellow
    Write-Host "`nPosibles soluciones:" -ForegroundColor Yellow
    Write-Host "1. Verifica que el servicio de PostgreSQL esté corriendo" -ForegroundColor White
    Write-Host "2. Verifica que la contraseña del usuario postgres sea correcta" -ForegroundColor White
    Write-Host "3. Verifica que PostgreSQL esté escuchando en el puerto 5432" -ForegroundColor White
    exit 1
}

# Verificar si la base de datos thesis_db existe
Write-Host "`n=== Verificando base de datos thesis_db ===" -ForegroundColor Cyan

$dbCheck = & $psqlPath -h localhost -U postgres -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='thesis_db';" 2>&1

if ($LASTEXITCODE -eq 0 -and $dbCheck.Trim() -eq "1") {
    Write-Host "✅ La base de datos 'thesis_db' ya existe" -ForegroundColor Green
} else {
    Write-Host "⚠️ La base de datos 'thesis_db' no existe, creándola..." -ForegroundColor Yellow
    & $psqlPath -h localhost -U postgres -d postgres -c "CREATE DATABASE thesis_db;" 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de datos 'thesis_db' creada exitosamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error al crear la base de datos" -ForegroundColor Red
        exit 1
    }
}

# Verificar configuración de pg_hba.conf (opcional)
Write-Host "`n=== Información de configuración ===" -ForegroundColor Cyan
Write-Host "Asegúrate de que en pg_hba.conf tengas:" -ForegroundColor Yellow
Write-Host "host    all             all             127.0.0.1/32            md5" -ForegroundColor White
Write-Host "host    all             all             ::1/128                 md5" -ForegroundColor White

Write-Host "`n=== Verificación completada ===" -ForegroundColor Cyan
Write-Host "Ahora puedes ejecutar: npm run start:dev" -ForegroundColor Green
