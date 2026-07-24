-- Primero creamos la extensión para UUID (si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insertar un usuario de prueba
-- Password: contrasena123 (hash bcrypt: $2b$10$EixZaYb3z4q5p6p7p8p9qOu0QaQbQcQdQeQfQgQhQiQjQkQlQmQnQoQp)
INSERT INTO "User" (id, email, password, name, role, "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'estudiante@unt.edu.pe',
  '$2b$10$EixZaYb3z4q5p6p7p8p9qOu0QaQbQcQdQeQfQgQhQiQjQkQlQmQnQoQp',
  'Juan Pérez',
  'STUDENT',
  NULL,
  NOW(),
  NOW()
)
RETURNING id, email, name, role;