# 🚀 Guía de Despliegue en Render con Neon PostgreSQL

Esta guía proporciona instrucciones detalladas para desplegar el Sistema de Gestión de Ligas Deportivas en Render usando Neon PostgreSQL como base de datos.

## 📋 Índice

1. [Prerrequisitos](#prerrequisitos)
2. [Configuración de Neon PostgreSQL](#configuración-de-neon-postgresql)
3. [Configuración del Repositorio](#configuración-del-repositorio)
4. [Despliegue en Render](#despliegue-en-render)
5. [Variables de Entorno](#variables-de-entorno)
6. [Verificación Post-Despliegue](#verificación-post-despliegue)
7. [Solución de Problemas](#solución-de-problemas)

## 🎯 Prerrequisitos

### Cuentas Necesarias
- [Cuenta en GitHub](https://github.com/) (para el repositorio)
- [Cuenta en Render](https://render.com/) (para el despliegue)
- [Cuenta en Neon](https://neon.tech/) (para la base de datos)

### Herramientas Locales
- Git instalado
- Node.js 18+ (para desarrollo local)

---

## 🐘 Configuración de Neon PostgreSQL

### 1. Crear Cuenta y Proyecto en Neon

1. **Registrarse en Neon**
   ```bash
   # Visita https://neon.tech y regístrate
   # Puedes usar GitHub, Google o email para registrarte
   ```

2. **Crear un Nuevo Proyecto**
   - En el dashboard de Neon, haz clic en "New Project"
   - Dale un nombre descriptivo (ej: `ligas-deportivas-prod`)
   - Selecciona la región más cercana a tus usuarios
   - Haz clic en "Create Project"

3. **Obtener la Cadena de Conexión**
   - Una vez creado el proyecto, copia la cadena de conexión
   - Tendrá un formato similar a:
   ```
   postgresql://neondb_owner:tu_contraseña@ep-tu-host.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

### 2. Configurar la Base de Datos

La estructura de la base de datos se creará automáticamente durante el despliegue gracias a Prisma. Sin embargo, puedes verificar la conexión:

```bash
# Probar la conexión localmente (opcional)
psql "postgresql://neondb_owner:tu_contraseña@ep-tu-host.neon.tech/neondb?sslmode=require"
```

### 3. Características de Neon para Producción

- **Escalado Automático**: Neon escala automáticamente según la demanda
- **Branching**: Puedes crear branches de base de datos para desarrollo
- **Time Travel**: Recuperación de datos a cualquier punto en el tiempo
- **Monitoreo**: Dashboard con métricas de rendimiento

---

## 📁 Configuración del Repositorio

### 1. Preparar el Repositorio Local

```bash
# Asegúrate de estar en la raíz del proyecto
cd /ruta/a/tu/proyecto

# Inicializar git si no está inicializado
git init

# Añadir archivos al repositorio
git add .

# Hacer commit inicial
git commit -m "Initial commit: Sistema de Gestión de Ligas Deportivas"
```

### 2. Crear Repositorio en GitHub

1. **Crear Nuevo Repositorio**
   - Ve a GitHub y haz clic en "New repository"
   - Dale un nombre (ej: `sistema-ligas-deportivas`)
   - Hazlo público o privado según tu preferencia
   - No inicialices con README (ya tenemos uno)

2. **Conectar Repositorio Local**
   ```bash
   # Reemplaza con tu URL de GitHub
   git remote add origin https://github.com/tu-usuario/sistema-ligas-deportivas.git
   
   # Enviar cambios a GitHub
   git branch -M main
   git push -u origin main
   ```

### 3. Verificar Archivos para Despliegue

Asegúrate de que tu repositorio contiene:

```
✅ src/
✅ prisma/schema.prisma
✅ package.json
✅ .env.example
✅ render.yaml
✅ README.md
✅ DEPLOYMENT.md
❌ .env (este archivo NO debe subirse)
❌ node_modules/
❌ .next/
```

### 4. Configurar .gitignore

Verifica que tu `.gitignore` incluya:

```gitignore
# Variables de entorno
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Dependencias
node_modules/

# Build de Next.js
.next/
out/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Prisma
prisma/migrations/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

---

## 🌐 Despliegue en Render

### 1. Crear Cuenta en Render

1. **Registrarse**
   - Ve a [Render](https://render.com/)
   - Regístrate con tu cuenta de GitHub (recomendado)

### 2. Crear Nuevo Servicio Web

1. **Dashboard de Render**
   - Haz clic en "New +" y selecciona "Web Service"

2. **Conectar Repositorio**
   - Selecciona "Build and deploy from a Git repository"
   - Conecta tu cuenta de GitHub si no está conectada
   - Selecciona el repositorio `sistema-ligas-deportivas`
   - Autoriza el acceso

3. **Configuración Básica**
   - **Name**: `sistema-ligas-deportivas` (o el nombre que prefieras)
   - **Region**: Selecciona la misma región que tu base de datos Neon
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```
     npm install && npx prisma generate && npx prisma db push && npm run build
     ```
   - **Start Command**: 
     ```
     npm start
     ```

4. **Configuración Avanzada**
   - **Instance Type**: `Starter` (puedes actualizar después)
   - **Num Instances**: `1`
   - **Health Check Path**: `/api/health`

### 3. Configurar Variables de Entorno

En la sección "Environment" del servicio, añade las siguientes variables:

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| `DATABASE_URL` | URL de Neon | `postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `NEXTAUTH_SECRET` | Secreto único | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL de la app | `https://sistema-ligas-deportivas.onrender.com` |
| `NODE_ENV` | Entorno | `production` |

### 4. Generar NEXTAUTH_SECRET

```bash
# Generar un secreto seguro
openssl rand -base64 32
```

Copia el resultado y pégalo como valor de `NEXTAUTH_SECRET`.

### 5. Iniciar Despliegue

Haz clic en "Create Web Service". Render comenzará automáticamente:

1. **Clonar el repositorio**
2. **Instalar dependencias**
3. **Generar Prisma Client**
4. **Crear tablas en la base de datos**
5. **Construir la aplicación Next.js**
6. **Iniciar el servidor**

El proceso puede tardar 5-15 minutos en el primer despliegue.

---

## 🔧 Variables de Entorno Detalladas

### Variables Obligatorias

#### `DATABASE_URL`
- **Propósito**: Conexión a la base de datos PostgreSQL
- **Formato**: `postgresql://usuario:contraseña@host:puerto/database?sslmode=require&channel_binding=require`
- **Ejemplo Neon**: `postgresql://neondb_owner:abc123@ep-purple-mountain-123456.neon.tech/neondb?sslmode=require&channel_binding=require`
- **Importancia**: CRÍTICA - Sin esta variable la aplicación no funcionará

#### `NEXTAUTH_SECRET`
- **Propósito**: Firmar y cifrar tokens de sesión
- **Generación**: `openssl rand -base64 32`
- **Seguridad**: Debe ser única y mantenerse en secreto
- **Importancia**: CRÍTICA - Sin esta variable la autenticación no funcionará

#### `NEXTAUTH_URL`
- **Propósito**: URL base para callbacks de autenticación
- **Formato**: URL completa de tu aplicación desplegada
- **Ejemplo**: `https://sistema-ligas-deportivas.onrender.com`
- **Importancia**: CRÍTICA - Sin esta variable los callbacks de autenticación fallarán

#### `NODE_ENV`
- **Propósito**: Define el entorno de ejecución
- **Valores**: `development` o `production`
- **Producción**: `production`
- **Importancia**: ALTA - Afecta el rendimiento y la seguridad

### Variables Opcionales

#### `NEXT_PUBLIC_APP_URL`
- **Propósito**: URL pública para enlaces y correos
- **Valor**: Igual que `NEXTAUTH_URL`

#### `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
- **Propósito**: Autenticación con Google OAuth
- **Importancia**: Opcional - Solo si quieres usar login con Google

---

## ✅ Verificación Post-Despliegue

### 1. Verificar el Despliegue

Una vez completado el despliegue:

1. **Acceder a la Aplicación**
   - Visita la URL asignada (ej: `https://sistema-ligas-deportivas.onrender.com`)
   - Verifica que la página cargue correctamente

2. **Verificar Logs**
   - En el dashboard de Render, ve a "Logs"
   - Revisa que no haya errores críticos
   - Busca mensajes de "Database connected" y "Server ready"

3. **Probar Funcionalidades Básicas**
   - Navega por diferentes páginas
   - Verifica que los estilos carguen correctamente
   - Prueba los formularios si existen

### 2. Verificar Base de Datos

1. **Conexión a Neon**
   - Ve al dashboard de Neon
   - Verifica que las tablas se hayan creado correctamente
   - Deberías ver tablas como: `Season`, `League`, `Team`, `Player`, `Match`, etc.

2. **Prueba de API**
   - Accede a `https://tu-app.onrender.com/api/leagues`
   - Deberías ver una respuesta JSON (aunque sea vacía)

### 3. Verificar Build y Start

1. **Build Exitoso**
   - En los logs de Render, busca "Build completed successfully"
   - Verifica que Prisma se haya generado correctamente

2. **Inicio Correcto**
   - Busca "Server ready on port 10000"
   - Verifica que no haya errores de conexión a la base de datos

---

## 🚨 Solución de Problemas

### Problemas Comunes

#### 1. Error de Conexión a Base de Datos
```
Error: Can't reach database server at...
```

**Solución:**
- Verifica la URL de `DATABASE_URL`
- Asegúrate de incluir `sslmode=require`
- Verifica que la base de datos Neon esté activa
- Revisa las reglas de firewall en Neon

#### 2. Error de Build de Prisma
```
Error: P3018: A migration failed...
```

**Solución:**
- Verifica que el schema de Prisma sea válido
- Asegúrate de que las dependencias estén instaladas
- Revisa los logs completos del build

#### 3. Error de NextAuth
```
Error: NEXTAUTH_SECRET is not defined
```

**Solución:**
- Añade `NEXTAUTH_SECRET` en las variables de entorno de Render
- Genera un nuevo secreto con `openssl rand -base64 32`
- Reinicia el servicio después de añadir la variable

#### 4. Error de Tiempo de Espera
```
Error: Deployment timed out...
```

**Solución:**
- El primer despliegue puede tardar más
- Verifica los logs para ver en qué paso se quedó
- Considera optimizar el build si es muy lento

#### 5. Error de Memoria
```
Error: JavaScript heap out of memory
```

**Solución:**
- En Render, actualiza a un plan con más memoria
- Optimiza las consultas a la base de datos
- Considera implementar paginación

### Comandos Útiles para Debug

#### Verificar Conexión a la Base de Datos
```bash
# Desde tu máquina local (si tienes psql instalado)
psql "postgresql://neondb_owner:tu_pass@ep-tu-host.neon.tech/neondb?sslmode=require"

# Ver tablas
\dt

# Ver conexiones activas
SELECT * FROM pg_stat_activity;
```

#### Verificar Build Localmente
```bash
# Limpiar build anterior
rm -rf .next

# Probar build localmente
npm run build

# Iniciar en modo producción
npm start
```

#### Verificar Logs de Render
```bash
# En el dashboard de Render:
# 1. Selecciona tu servicio
# 2. Haz clic en "Logs"
# 3. Busca errores específicos
```

### Contacto y Soporte

Si encuentras problemas no resueltos:

1. **Revisa esta guía** nuevamente
2. **Consulta la documentación oficial**:
   - [Render Docs](https://render.com/docs)
   - [Neon Docs](https://neon.tech/docs)
   - [Next.js Docs](https://nextjs.org/docs)
3. **Crea un issue** en el repositorio del proyecto
4. **Contacta al soporte** de Render o Neon según corresponda

---

## 🎉 ¡Felicidades!

Si has seguido todos los pasos, tu Sistema de Gestión de Ligas Deportivas debería estar desplegado y funcionando en Render con Neon PostgreSQL como base de datos.

### Próximos Pasos

1. **Monitorear el rendimiento** usando los dashboards de Render y Neon
2. **Configurar dominio personalizado** si lo deseas
3. **Implementar backup automatizado** (Neon ya incluye backups)
4. **Configurar monitoreo y alertas**
5. **Documentar el proceso** para futuros despliegues

### Recursos Útiles

- [Render Dashboard](https://dashboard.render.com)
- [Neon Console](https://console.neon.tech)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides)

---

**Desarrollado con ❤️ para la gestión deportiva escolar**