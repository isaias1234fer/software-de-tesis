# Establecer la variable de entorno
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/thesis_db?schema=public"

# 1. Generar cliente Prisma
Write-Host "Generando cliente Prisma..."
npx prisma generate

# 2. Crear las tablas con db push
Write-Host "Creando tablas en la base de datos..."
npx prisma db push --accept-data-loss

# 3. Ejecutar el script de creación de usuario
Write-Host "Creando usuario de prueba..."
node create-user.js