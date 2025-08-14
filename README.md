# 🏆 Sistema de Gestión de Ligas Deportivas

Un sistema completo para la gestión de ligas deportivas escolares, desarrollado con Next.js 15, TypeScript y Prisma ORM. Soporta fútbol y baloncesto con categorías por edades.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalación Local](#instalación-local)
- [Variables de Entorno](#variables-de-entorno)
- [Despliegue en Render](#despliegue-en-render)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Contribución](#contribución)
- [Licencia](#licencia)

## ✨ Características

### 🏆 Gestión de Ligas
- Creación y gestión de múltiples ligas deportivas
- Soporte para fútbol y baloncesto
- Categorización por edades (1°-2°, 3°-4°, 5°-6° grado)
- Gestión de temporadas académicas

### 👥 Gestión de Equipos y Jugadores
- Creación de equipos por liga
- Registro de jugadores por equipo
- Información detallada de participantes

### 📅 Gestión de Partidos
- Programación de partidos entre equipos
- Registro de resultados y estadísticas
- Control de jornadas y fechas
- Seguimiento de goles/anotaciones por jugador

### 📊 Estadísticas y Reportes
- Tablas de posiciones automáticas
- Estadísticas de jugadores
- Historial de partidos
- Reportes por liga y categoría

## 🛠 Stack Tecnológico

- **Frontend**: Next.js 15 con App Router
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Base de Datos**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js
- **Estado**: Zustand + TanStack Query
- **Despliegue**: Render

## 🚀 Instalación Local

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta en Neon PostgreSQL (o cualquier base de datos PostgreSQL)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/sistema-ligas-deportivas.git
   cd sistema-ligas-deportivas
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Editar el archivo `.env` con tus credenciales:
   ```env
   DATABASE_URL=tu_url_de_base_de_datos_postgresql
   NEXTAUTH_SECRET=tu_secreto_nextauth
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Configurar la base de datos**
   ```bash
   # Generar Prisma Client
   npx prisma generate
   
   # Crear tablas en la base de datos
   npx prisma db push
   ```

5. **Ejecutar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🔧 Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de Datos
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/database?sslmode=require

# NextAuth.js
NEXTAUTH_SECRET=tu_secreto_muy_seguro
NEXTAUTH_URL=http://localhost:3000

# Opcional: Proveedores OAuth
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Opcional: Configuración adicional
NODE_ENV=development
```

### Generar NEXTAUTH_SECRET

Para generar un secreto seguro para NextAuth.js:

```bash
openssl rand -base64 32
```

## 🌐 Despliegue en Render

### 1. Preparar el Repositorio

Asegúrate de que tu repositorio contiene todos los archivos necesarios:

- ✅ Código fuente del proyecto
- ✅ `package.json` con scripts de producción
- ✅ `prisma/schema.prisma`
- ✅ Archivos de configuración de Render
- ✅ `.env.example` (no incluir `.env`)

### 2. Configurar Variables de Entorno en Render

En tu dashboard de Render, añade las siguientes variables de entorno:

```env
# Base de Datos Neon PostgreSQL
DATABASE_URL=postgresql://neondb_owner:tu_contraseña@ep-tu-host.neon.tech/neondb?sslmode=require&channel_binding=require

# NextAuth.js
NEXTAUTH_SECRET=tu_secreto_generado_con_openssl
NEXTAUTH_URL=https://tu-app.onrender.com

# Node.js
NODE_ENV=production
```

### 3. Configuración de Build Command

En la configuración de tu servicio en Render:

- **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
- **Start Command**: `npm start`
- **Runtime**: Node 18+

### 4. Archivo de Configuración Render (Opcional)

Crear `render.yaml` en la raíz del proyecto:

```yaml
services:
  - type: web
    name: sistema-ligas-deportivas
    env: node
    buildCommand: npm install && npx prisma generate && npx prisma db push && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: NEXTAUTH_SECRET
        sync: false
      - key: NEXTAUTH_URL
        sync: false
      - key: NODE_ENV
        value: production
```

### 5. Despliegue Automático

1. Conecta tu repositorio de GitHub a Render
2. Render detectará automáticamente que es una aplicación Next.js
3. Configura las variables de entorno
4. Haz deploy

### 6. Base de Datos en Producción

#### Opción A: Usar Neon PostgreSQL (Recomendado)

1. Crea una cuenta en [Neon](https://neon.tech/)
2. Crea un nuevo proyecto de base de datos
3. Copia la cadena de conexión
4. Añádela como variable de entorno en Render

#### Opción B: Usar Render PostgreSQL

1. En tu dashboard de Render, crea una nueva base de datos PostgreSQL
2. Espera a que se cree la instancia
3. Copia la cadena de conexión
4. Añádela como variable de entorno en tu aplicación

### 7. Verificación Post-Despliegue

Después del despliegue, verifica:

- ✅ La aplicación carga correctamente
- ✅ Las páginas funcionan sin errores
- ✅ La conexión a la base de datos funciona
- ✅ Las operaciones CRUD funcionan
- ✅ Los estilos se cargan correctamente

## 📁 Estructura del Proyecto

```
├── src/
│   ├── app/                    # App Router
│   │   ├── api/               # API Routes
│   │   ├── globals.css        # Estilos globales
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página principal
│   ├── components/            # Componentes React
│   │   └── ui/                # Componentes shadcn/ui
│   ├── lib/                   # Utilidades y configuración
│   │   ├── db.ts              # Configuración Prisma
│   │   └── auth.ts            # Configuración NextAuth
│   └── types/                 # Tipos TypeScript
├── prisma/
│   └── schema.prisma          # Esquema de base de datos
├── public/                    # Archivos estáticos
├── .env.example               # Plantilla de variables de entorno
├── .gitignore                # Archivos ignorados por Git
├── package.json              # Dependencias y scripts
├── tailwind.config.js        # Configuración Tailwind
├── tsconfig.json             # Configuración TypeScript
└── README.md                 # Este archivo
```

## 🔌 API Endpoints

### Ligas
- `GET /api/leagues` - Obtener todas las ligas
- `POST /api/leagues` - Crear nueva liga
- `GET /api/leagues/[id]` - Obtener liga por ID
- `PUT /api/leagues/[id]` - Actualizar liga
- `DELETE /api/leagues/[id]` - Eliminar liga

### Equipos
- `GET /api/teams` - Obtener todos los equipos
- `POST /api/teams` - Crear nuevo equipo
- `GET /api/teams/[id]` - Obtener equipo por ID
- `PUT /api/teams/[id]` - Actualizar equipo
- `DELETE /api/teams/[id]` - Eliminar equipo

### Jugadores
- `GET /api/players` - Obtener todos los jugadores
- `POST /api/players` - Crear nuevo jugador
- `GET /api/players/[id]` - Obtener jugador por ID
- `PUT /api/players/[id]` - Actualizar jugador
- `DELETE /api/players/[id]` - Eliminar jugador

### Partidos
- `GET /api/matches` - Obtener todos los partidos
- `POST /api/matches` - Crear nuevo partido
- `GET /api/matches/[id]` - Obtener partido por ID
- `PUT /api/matches/[id]` - Actualizar partido
- `DELETE /api/matches/[id]` - Eliminar partido

### Resultados
- `GET /api/results` - Obtener todos los resultados
- `POST /api/results` - Crear nuevo resultado
- `GET /api/results/[id]` - Obtener resultado por ID

## 🤝 Contribución

1. Haz Fork del proyecto
2. Crea tu rama de características (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca issues existentes
3. Crea un nuevo issue si es necesario
4. Contacta al mantenedor del proyecto

---

**Desarrollado con ❤️ para la gestión deportiva escolar**