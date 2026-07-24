const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@localhost:5432/thesis_db?schema=public"
    }
  }
});

async function main() {
  // Datos del usuario de prueba
  const email = 'estudiante@unt.edu.pe';
  const password = 'contrasena123'; // Contraseña de prueba
  const name = 'Juan Pérez';
  const role = 'STUDENT';

  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log('El usuario ya existe:', existingUser);
    return;
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el usuario y su perfil
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      studentProfile: {
        create: {},
      },
    },
  });

  console.log('Usuario de prueba creado exitosamente!');
  console.log('Email:', email);
  console.log('Contraseña:', password);
  console.log('Rol:', role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });