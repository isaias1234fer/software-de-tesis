# Sistema de Inteligencia para Revisión de Tesis

Sistema completo para la gestión, revisión y generación automática de tesis universitarias utilizando inteligencia artificial.

## Características

- **Generador de Tesis con IA**: Genera contenido completo de tesis basado en un tema, utilizando Gemini de Google (GRATUITO)
- **Exportación en múltiples formatos**: PDF y Word (.docx)
- **Revisión automática**: Análisis de borradores de tesis con IA
- **Gestión de plantillas**: Plantillas institucionales personalizables
- **Sistema de usuarios**: Estudiantes, asesores, coordinadores y administradores
- **Integración con ORCID**: Validación de perfiles académicos
- **Almacenamiento en la nube**: MinIO para documentos

## Requisitos Previos

- Docker y Docker Compose
- Node.js (v18 o superior)
- npm o yarn
- Cuenta de Google (para obtener API key de Gemini - GRATUITO)

## Configuración

### 1. Obtener API Key de Gemini (GRATUITO)

Gemini es el modelo de IA de Google que ofrece una API gratuita a través de Google AI Studio.

**Pasos para obtener tu API key:**
1. Ve a: https://aistudio.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Crea un nuevo proyecto o selecciona uno existente
4. Genera una API key (comienza con "AIza...")
5. Copia la API key

### 2. Configurar variables de entorno

Crea o edita el archivo `backend/.env` con tu API key de Gemini:

Variables importantes en `backend/.env`:
- `GEMINI_API_KEY`: Tu API key de Gemini (obtenida en el paso anterior)
- `JWT_SECRET`: Clave secreta para autenticación JWT
- `NEXTAUTH_SECRET`: Clave secreta para NextAuth
- `SMTP_USER` y `SMTP_PASS`: Configuración de Gmail para envío de emails (opcional)

Variables importantes en `frontend/.env`:
- `NEXT_PUBLIC_N8N_WEBHOOK_URL`: URL del webhook de n8n para soporte técnico con IA (opcional)

### 3. Iniciar servicios Docker

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL (puerto 5432)
- Redis (puerto 6379)
- MinIO (puertos 9000 y 9001)

### 4. Configurar el Backend

```bash
cd backend
npm install
npm run prisma:push
npm run start:dev
```

El backend se ejecutará en `http://localhost:3001`

### 5. Configurar el Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend se ejecutará en `http://localhost:3000`

## Uso del Generador de Tesis con IA

### Generador Público

Accede a: `http://localhost:3000/generador-tesis`

1. Completa el formulario con los datos de la tesis:
   - Título del tema
   - Datos del autor
   - Datos del asesor
   - Línea de investigación
   - Ciudad y año

2. Opciones de generación:
   - **Estructura (TXT)**: Descarga solo la estructura de la tesis
   - **Generar PDF con IA**: Genera contenido completo en formato PDF
   - **Generar Word con IA**: Genera contenido completo en formato Word

### Generador en el Dashboard

Accede a: `http://localhost:3000/dashboard/generator` (requiere autenticación)

Misma funcionalidad que el generador público, pero integrado en el panel de control.

## Cómo funciona la generación con IA

1. El sistema envía el tema y datos de la tesis a Gemini (Google AI Studio)
2. La IA genera contenido académico original para las secciones seleccionadas:
   - Realidad Problemática
   - Antecedentes del Problema
   - Marco Teórico
3. El contenido generado se formatea y exporta en PDF o Word
4. **TODO ES GRATUITO** - No hay costos por uso (Gemini tiene un plan gratuito generoso)

## Estructura del Proyecto

```
.
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── ai/             # Servicios de IA
│   │   ├── auth/           # Autenticación
│   │   ├── drafts/         # Gestión de borradores
│   │   ├── templates/      # Plantillas institucionales
│   │   └── users/          # Gestión de usuarios
│   └── prisma/             # Schema de base de datos
├── frontend/               # Next.js
│   └── src/
│       ├── app/
│       │   ├── generador-tesis/  # Generador público
│       │   └── dashboard/         # Panel de control
│       └── components/
├── docker-compose.yml      # Servicios Docker
└── .env.example           # Variables de entorno ejemplo
```

## Endpoints de la API

### Generación de Tesis

- `POST /ai/generate-thesis-pdf` - Genera tesis en PDF
- `POST /ai/generate-thesis-word` - Genera tesis en Word
- `POST /ai/generate-thesis` - Genera contenido JSON

### Otros Endpoints

- `POST /auth/login` - Inicio de sesión
- `POST /auth/register` - Registro
- `GET /api` - Documentación Swagger

## Soporte Técnico con IA (Gemini)

El sistema incluye un chat de soporte técnico integrado con Gemini de Google para proporcionar respuestas inteligentes.

### Configuración

El chat de soporte usa la API gratuita de Gemini directamente desde el frontend. Solo necesitas configurar la API key:

**En `frontend/.env` o `frontend/.env.local`:**
```env
NEXT_PUBLIC_GEMINI_API_KEY=tu-api-key-aqui
```

**Obtener API key gratuita:**
1. Ve a: https://aistudio.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Genera una API key (comienza con "AIza...")
4. Copia la API key y agrégala a las variables de entorno

### Funcionamiento

- El chat envía mensajes directamente a la API de Gemini 2.5 Flash
- Gemini procesa la consulta con el contexto del sistema Tesis-IA
- La respuesta se muestra en el chat del dashboard
- Indicador de "Escribiendo..." mientras se procesa la respuesta
- Manejo de errores con mensaje amigable

### Características del Chatbot

- **Modelo**: Gemini 2.5 Flash (rápido y gratuito)
- **Idioma**: Español
- **Estilo**: Amable y conciso (máximo 3 oraciones cortas)
- **Contexto**: Conoce todas las funcionalidades del sistema Tesis-IA
- **Temas cubiertos**:
  - Generación de tesis con IA
  - Revisión de borradores
  - Vinculación ORCID
  - KPIs y estadísticas
  - Asesorías
  - Recursos descargables
  - Normas APA y UNT

### Configuración de n8n (Opcional - Alternativa)

Si prefieres usar n8n en lugar de Gemini directo:

1. **Instala n8n**: Sigue las instrucciones en https://docs.n8n.io
2. **Importa el workflow**: Usa el archivo `n8n-support-workflow.json`
3. **Configura las variables de entorno**:
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

## Solución de Problemas

### Error de conexión a la base de datos

Asegúrate de que Docker esté ejecutándose:
```bash
docker ps
```

### Error de Gemini

**Causa 1: API key no configurada**
- Solución: Asegúrate de que `GEMINI_API_KEY` esté configurada en `backend/.env`
- Obtén tu API key gratuita en: https://aistudio.google.com/app/apikey

**Causa 2: API key inválida**
- Solución: Verifica que la API key sea correcta y comience con "AIza..."

**Causa 3: Límite de cuota excedido**
- Solución: El plan gratuito de Gemini tiene límites, espera un momento antes de volver a intentar

### Error al generar PDF/Word

Asegúrate de que el backend esté corriendo en el puerto 3001 y que las dependencias estén instaladas.

## Costos

**¡GRATUITO!** - El sistema usa Gemini de Google que tiene un plan gratuito generoso.

Límites del plan gratuito de Gemini:
- 15 requests por minuto
- 1,500 requests por día
- Suficiente para uso personal y académico

## Licencia

UNLICENSED

## Soporte

Para reportar problemas o sugerencias, por favor abre un issue en el repositorio.
