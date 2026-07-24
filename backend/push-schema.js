const { PrismaClient } = require('@prisma/client');

async function pushSchema() {
  // Primero, ejecutamos prisma db push via execSync
  const { execSync } = require('child_process');
  
  try {
    console.log('Ejecutando prisma db push...');
    
    // Ejecutamos prisma db push con la URL directamente
    execSync('npx prisma db push --url="postgresql://postgres:postgres@localhost:5432/thesis_db?schema=public" --accept-data-loss', {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    console.log('Prisma db push completado!');
  } catch (error) {
    console.error('Error en prisma db push:', error);
    process.exit(1);
  }
}

pushSchema();