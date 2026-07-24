const { execSync } = require('child_process');

process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/thesis_db?schema=public";

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('Ejecutando prisma db push...');

try {
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('¡Tablas creadas exitosamente!');
  
  // Ahora ejecutamos create-user.js
  console.log('\nCreando usuario de prueba...');
  execSync('node create-user.js', {
    stdio: 'inherit',
    cwd: __dirname
  });
} catch (e) {
  console.error('Error:', e);
  process.exit(1);
}