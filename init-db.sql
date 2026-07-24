-- Crear extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tipo Role (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADVISOR', 'ADMIN');
    END IF;
END $$;

-- Crear tabla User
CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT,
    role "Role" DEFAULT 'STUDENT',
    "emailVerified" TIMESTAMP(3),
    image TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT NOW(),
    "updatedAt" TIMESTAMP(3) DEFAULT NOW()
);

-- Insertar usuario de prueba
-- Contraseña: contrasena123 (hash bcrypt válido)
INSERT INTO "User" (id, email, password, name, role, "emailVerified", "createdAt", "updatedAt")
VALUES (
    uuid_generate_v4(),
    'estudiante@unt.edu.pe',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Juan Pérez',
    'STUDENT',
    NULL,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING
RETURNING id, email, name, role;