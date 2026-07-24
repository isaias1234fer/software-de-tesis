const { exec } = require('child_process');
const tsNode = require('ts-node');

// Configurar ts-node
tsNode.register({
  transpileOnly: true,
  project: './tsconfig.json',
});

// Ejecutar el archivo main.ts
require('./src/main.ts');