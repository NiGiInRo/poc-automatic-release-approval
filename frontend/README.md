# frontend

## Responsabilidad

Interfaz web del sistema de aprobación de releases. Permite a los equipos de desarrollo consultar el historial de solicitudes y crear nuevas. Se comunica exclusivamente con el `api-gateway` en `localhost:3000`.

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Angular | 21 | Framework principal |
| TypeScript | 5.7 | Lenguaje |
| CSS puro | — | Sistema de diseño propio (dark mode, variables CSS) |
| nginx | alpine | Servidor de archivos estáticos en producción |

## Puerto

`4200` (desarrollo) / `4200 → 80` (Docker)

## Vistas

| Ruta | Descripción |
|---|---|
| `/list` | Tabla de solicitudes de release con estado y tipo de aprobación |
| `/new` | Formulario para crear una nueva solicitud |

## Estructura de carpetas

```
src/app/
├── core/
│   ├── models/         ← interfaces Release, ReleaseResult
│   └── services/       ← ReleasesService (HTTP al api-gateway)
├── shared/
│   └── components/
│       └── status-badge/   ← badge APROBADO / PENDIENTE / N/A
├── pages/
│   ├── releases-list/  ← vista /list
│   └── releases-form/  ← vista /new
└── layout/
    └── app-layout/     ← navbar + router-outlet
```

## Correr en desarrollo

```bash
npm install
npx @angular/cli@21 serve
```

La app queda disponible en `http://localhost:4200`.

> El backend debe estar corriendo en `http://localhost:3000` para que los datos carguen.

## Correr pruebas

```bash
npx @angular/cli@21 test --watch=false
```

Cubre el `ReleasesService` con 5 pruebas unitarias usando `HttpClientTestingModule`.

## Correr con Docker

Desde la raíz del proyecto:

```bash
docker-compose up --build
```

El frontend se sirve en `http://localhost:4200` mediante nginx.

## Variables de entorno

No requiere variables de entorno. La URL del backend está definida directamente en el servicio:

```
src/app/core/services/releases.service.ts → apiUrl = 'http://localhost:3000/gateway/releases'
```
