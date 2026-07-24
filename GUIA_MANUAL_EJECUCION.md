# GUÍA MANUAL DE EJECUCIÓN

## Sistema de Inteligencia para Revisión de Tesis

Esta guía te proporciona instrucciones paso a paso para ejecutar el sistema correctamente.

---

## PASO 1: VERIFICAR REQUISITOS

Antes de comenzar, asegúrate de tener instalado:

1. **Docker y Docker Compose**
   - Abre una terminal y ejecuta: `docker --version`
   - Deberías ver algo como: `Docker version 29.5.2`

2. **Node.js (v18 o superior)**
   - Ejecuta: `node --version`
   - Deberías ver: `v22.20.0` o superior

3. **npm**
   - Ejecuta: `npm --version`
   - Deberías ver: `10.9.3` o superior

4. **Cuenta de Google** (IMPORTANTE - GRATUITO)
   - Necesitas una cuenta de Google para obtener la API key de Gemini
   - No requiere instalación, solo configuración

---

## PASO 2: OBTENER API KEY DE GEMINI

### 2.1 Crear API key en Google AI Studio

1. Ve a: https://aistudio.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Crea un nuevo proyecto o selecciona uno existente
4. Haz clic en "Create API key"
5. Copia la API key generada (comienza con "AIza...")

### 2.2 Configurar variables de entorno

1. Crea o edita el archivo `backend/.env`
2. Agrega tu API key de Gemini:
```env
GEMINI_API_KEY=AIza... (tu API key aquí)
```

Variables importantes en `backend/.env`:
- `GEMINI_API_KEY`: Tu API key de Gemini (obtenida en el paso 2.1)
- `JWT_SECRET`: Clave secreta para autenticación JWT
- `NEXTAUTH_SECRET`: Clave secreta para NextAuth

### 2.3 Otras variables importantes (opcional)

Si deseas configurar el envío de emails, actualiza:
- `SMTP_USER`: Tu correo de Gmail
- `SMTP_PASS`: Tu contraseña de aplicación de Gmail (no tu contraseña normal)

### 2.4 Configuración del Chat de Soporte con IA (Gemini)

El chat de soporte usa la API gratuita de Gemini 2.5 Flash directamente desde el frontend.

**Configuración:**
1. Asegúrate de tener tu API key de Gemini (obtenida en el paso 2.1)
2. En `frontend/.env` o `frontend/.env.local`, agrega:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=tu-api-key-aqui
   ```

**Nota**: El chat de soporte funcionará automáticamente con Gemini. No requiere configuración adicional.

### 2.5 Configuración de n8n para Soporte Técnico (opcional - alternativa)

Si prefieres usar n8n en lugar de Gemini directo:

1. **Instala n8n**: Sigue las instrucciones en https://docs.n8n.io
2. **Importa el workflow**: Importa el archivo `n8n-support-workflow.json` en tu instancia de n8n
3. **Activa el workflow**: Habilita el workflow para que el webhook esté activo
4. **Configura las variables de entorno**:
   - En `backend/.env`:
     ```env
     N8N_WEBHOOK_URL=http://localhost:5678/webhook/tu-webhook-id
     FRONTEND_URL=http://localhost:3000
     ```
   - En `frontend/.env`:
     ```env
     NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/tu-webhook-id
     ```

Luego modifica la función `handleSendMessage` en los archivos del dashboard para usar el backend en lugar de Gemini directo.

---

## PASO 3: INICIAR SERVICIOS DOCKER

Los servicios Docker (PostgreSQL, Redis, MinIO) deben estar ejecutándose.

1. Abre una terminal en la raíz del proyecto
2. Ejecuta:
```bash
docker-compose up -d
```

3. Verifica que los contenedores estén corriendo:
```bash
docker ps
```

Deberías ver 3 contenedores:
- `softwaredetesis-postgres-1`
- `softwaredetesis-redis-1`
- `softwaredetesis-minio-1`

---

## PASO 4: CONFIGURAR BASE DE DATOS

1. Navega al directorio del backend:
```bash
cd backend
```

2. Instala dependencias (si no lo has hecho antes):
```bash
npm install
```

3. Ejecuta las migraciones de Prisma:
```bash
npm run prisma:push
```

Esto creará todas las tablas necesarias en PostgreSQL.

---

## PASO 5: INICIAR EL BACKEND

1. Asegúrate de estar en el directorio `backend`
2. Ejecuta en modo desarrollo:
```bash
npm run start:dev
```

3. Verás mensajes como:
```
[Nest] 12345  - Application is running on port 3001
```

**IMPORTANTE:** Deja esta terminal abierta. El backend debe seguir ejecutándose.

---

## PASO 6: INICIAR EL FRONTEND

1. Abre una NUEVA terminal (deja la del backend corriendo)
2. Navega al directorio del frontend:
```bash
cd frontend
```

3. Instala dependencias (si no lo has hecho antes):
```bash
npm install
```

4. Ejecuta en modo desarrollo:
```bash
npm run dev
```

5. Verás mensajes como:
```
Ready in 2.3s
- Local: http://localhost:3000
```

**IMPORTANTE:** Deja esta terminal también abierta.

---

## PASO 7: ACCEDER AL SISTEMA

### Opción A: Generador Público (sin autenticación)

1. Abre tu navegador web
2. Ve a: `http://localhost:3000/generador-tesis`
3. Verás el formulario del generador de tesis

### Opción B: Panel de Control (requiere registro)

1. Ve a: `http://localhost:3000`
2. Haz clic en "Registrarse"
3. Completa el formulario de registro
4. Inicia sesión
5. Accede al dashboard y luego al generador

---

## PASO 8: USAR EL GENERADOR DE TESIS CON IA

### 8.1 Completar el formulario

1. **Título de la Tesis**: Ingresa el tema de tu tesis
   - Ejemplo: "Impacto de la inteligencia artificial en la educación superior"

2. **Datos del Autor**:
   - Nombres: Juan
   - Apellidos: Pérez

3. **Datos del Asesor**:
   - Grado: Doctor o Maestro
   - Nombres: Carlos
   - Apellidos: Rodríguez

4. **Línea de Investigación**: Selecciona una opción
   - Ejemplo: "Gestión de Desarrollo de Software"

5. **Ciudad**: Trujillo o Guadalupe

6. **Año**: Se autocompleta con el año actual

### 8.2 Generar documento

Tienes 3 opciones:

**Opción 1: Estructura (TXT)**
- Descarga solo la estructura de la tesis en formato texto
- No utiliza IA
- Es instantáneo

**Opción 2: Generar PDF con IA**
- Utiliza Gemini de Google para generar contenido completo
- Genera contenido para: Realidad Problemática, Antecedentes y Marco Teórico
- Tarda aproximadamente 10-30 segundos
- Costo: GRATUITO (plan gratuito de Gemini)

**Opción 3: Generar Word con IA**
- Igual que el PDF pero en formato Word (.docx)
- Puedes editar el documento después

### 8.3 Esperar la generación

Si elegiste generar con IA:
1. El botón mostrará "Generando PDF..." o "Generando Word..."
2. Espera entre 10-30 segundos
3. El documento se descargará automáticamente

---

## PASO 9: VERIFICAR EL DOCUMENTO GENERADO

1. Abre el documento descargado
2. Verifica que contenga:
   - Carátula con datos de la UNT
   - CAPÍTULO I: INTRODUCCIÓN (3 secciones)
     - 1.1 Realidad Problemática
     - 1.2 Antecedentes del Problema
     - 1.3 Marco Teórico

---

## SOLUCIÓN DE PROBLEMAS COMUNES

### Problema: "Error al generar la tesis"

**Causa 1: Backend no está corriendo**
- Solución: Verifica que la terminal del backend esté activa
- Deberías ver: "Application is running on port 3001"

**Causa 2: API key de Gemini no configurada**
- Solución: Verifica que `GEMINI_API_KEY` esté en `backend/.env`
- Obtén tu API key en: https://aistudio.google.com/app/apikey

**Causa 3: Servicios Docker no están corriendo**
- Solución: Ejecuta `docker ps` y verifica los 3 contenedores
- Si no están corriendo, ejecuta `docker-compose up -d`

### Problema: "Error de conexión a la base de datos"

**Solución:**
1. Verifica que PostgreSQL esté corriendo: `docker ps`
2. Ejecuta las migraciones nuevamente: `cd backend && npm run prisma:push`

### Problema: El frontend no carga

**Solución:**
1. Verifica que la terminal del frontend esté activa
2. Deberías ver: "Ready in Xs - Local: http://localhost:3000"
3. Si no, detén (Ctrl+C) y reinicia: `npm run dev`

### Problema: El chat de soporte no responde

**Causa 1: NEXT_PUBLIC_GEMINI_API_KEY no configurada**
- **Solución**: Agrega `NEXT_PUBLIC_GEMINI_API_KEY` en `frontend/.env` o `frontend/.env.local` y reinicia el frontend.

**Causa 2: API key inválida**
- **Solución**: Verifica que la API key sea correcta y comience con "AIza...". Obtén una nueva en: https://aistudio.google.com/app/apikey

**Causa 3: Error de conexión con Gemini**
- **Solución**: Verifica tu conexión a internet. Si el problema persiste, puede ser un límite de cuota temporal de Gemini.

**Causa 4: Usando n8n en lugar de Gemini**
- **Solución**: Si prefieres usar n8n, configura según el paso 2.5 y modifica la función `handleSendMessage` en los archivos del dashboard.

---

## ESTRUCTURA DE TERMINALES RECOMENDADA

Para ejecutar el sistema correctamente, necesitas 3 terminales:

**Terminal 1:** Servicios Docker
```bash
docker-compose up -d
```
(Esta terminal puede cerrarse después de iniciar los contenedores)

**Terminal 2:** Backend
```bash
cd backend
npm run start:dev
```
(Dejar abierta)

**Terminal 3:** Frontend
```bash
cd frontend
npm run dev
```
(Dejar abierta)

---

## DETENER EL SISTEMA

Para detener todo el sistema:

1. Detén el frontend: En la terminal del frontend, presiona `Ctrl+C`
2. Detén el backend: En la terminal del backend, presiona `Ctrl+C`
3. Detener Docker (opcional):
```bash
docker-compose down
```

---

## COSTOS

**¡GRATUITO!** - El sistema usa Gemini de Google que tiene un plan gratuito generoso.

Límites del plan gratuito de Gemini:
- 15 requests por minuto
- 1,500 requests por día
- Suficiente para uso personal y académico

No hay requisitos de hardware especiales ya que Gemini corre en la nube de Google.

---

## CONTACTO Y SOPORTE

Si encuentras algún problema no documentado aquí:
1. Verifica el archivo README.md
2. Revisa los logs de las terminales
3. Asegúrate de tener las versiones correctas de Node.js y Docker

---

## RESUMEN RÁPIDO

```bash
# 1. Obtener API key de Gemini
# Ve a: https://aistudio.google.com/app/apikey
# Copia tu API key y agrégala a backend/.env como GEMINI_API_KEY

# 2. Iniciar Docker
docker-compose up -d

# 3. Configurar base de datos
cd backend
npm install
npm run prisma:push
npm run start:dev

# 4. Iniciar frontend (en nueva terminal)
cd frontend
npm install
npm run dev

# 5. Acceder a http://localhost:3000/generador-tesis
```

¡Listo! El sistema debería estar funcionando correctamente.
