# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install              # Install dependencies
npm run build            # Build for production
npm run start:dev        # Development mode with watch
npm run start:prod       # Production mode
npm run lint             # ESLint with auto-fix
npm run format           # Prettier format
npm run test             # Unit tests
npm run test:e2e         # E2E tests
npx prisma generate      # Regenerate Prisma client
npx prisma db push       # Sync schema to database
npx prisma db seed       # Seed database
```

## Architecture

**NestJS** monopost backend (SQLite) para sistema de gestión política/campaña electoral.

### Módulos

- `auth` - JWT authentication (access + refresh tokens), login, registro, logout
- `usuario` - CRUD usuarios con jerarquía organizacional (`candidato_superior_id`)
- `perfiles` - Roles con niveles de acceso
- `permisos` - Sistema RBAC por módulo/acción + permisos personalizados
- `simpatizantes` - Base de datos de adherentes con ubicación geográfica
- `eventos` - Gestión de actos/campañas con coordenadas GPS
- `asistencias` - Tracking de confirmación y asistencia a eventos
- `dashboard` - Métricas y estadísticas organizacionales
- `prisma` - Wrapper del Prisma client

### Patrones clave

- **Soft delete**: Campos `eliminado`, `fecha_eliminacion`, `eliminado_por_id`
- **Audit trail**: Todas las entidades trackean `creado_por`, `actualizado_por`, `eliminado_por`
- **Jerarquía**: Usuarios con `nivel` y `candidato_superior_id` para estructura en árbol
- **RBAC**: Permisos por perfil + permisos personalizados por usuario
- **Password hash**: bcrypt
- **JWT**: Access token + refresh token rotativo

### Autenticación

Los servicios validan nivel de usuario contra `usuarioActual.perfil.nombre === 'ROOT'` para operaciones privilegiadas. Usuarios solo pueden gestionar (crear/editar/eliminar) otros de nivel inferior.

### Roles

- no utilizar any, ya que estamos usando typescript.
- todos los nombres, declaraciones, funciones y atributos lo haremos en español.