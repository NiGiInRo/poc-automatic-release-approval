# api-gateway

## Responsabilidad

Punto de entrada único del sistema. Recibe todas las solicitudes del frontend y orquesta el flujo de aprobación de releases. Es el único servicio expuesto al exterior — los demás microservicios solo son accesibles internamente.

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| NestJS | 11 | Framework principal |
| @nestjs/axios | - | Llamadas HTTP entre microservicios |
| @nestjs/config | - | Lectura de variables de entorno |
| @nestjs/swagger | - | Documentación interactiva |
| class-validator | - | Validación de datos de entrada |
| TypeScript | 5.7 | Lenguaje |

## Puerto

`3000`

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servicio |
| `POST` | `/gateway/releases` | Crear solicitud de release — orquesta el flujo completo |
| `GET` | `/gateway/releases` | Listar todas las solicitudes (proxy al release-service) |

## Documentación interactiva

Con el servicio corriendo, acceder a:

```
http://localhost:3000/swagger/docs
```

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar según el entorno:

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del gateway (default: 3000) |
| `RELEASE_SERVICE_URL` | URL del release-service |
| `RULES_SERVICE_URL` | URL del rules-service |
| `INTEGRATIONS_SERVICE_URL` | URL del integrations-service |
| `NOTIFICATION_SERVICE_URL` | URL del notification-service |

## Correr el servicio

```bash
npm install
npm run start:dev
```

## Correr pruebas

```bash
npm test
```

## Flujo de orquestación

### Tipo `fx` / `cv`
```
POST /gateway/releases
  → release-service (APROBADO / N/A)
  → retorna release persistido
```

### Tipo `rs`
```
POST /gateway/releases
  → integrations-service: valida el PR
  → rules-service: evalúa las 3 reglas
  → si todo pasa  → release-service (APROBADO / AUTOMÁTICA)
  → si algo falla → notification-service (correo al aprobador)
                  → release-service (PENDIENTE / MANUAL)
```

## Modo degradado

Si `integrations-service`, `rules-service` o `notification-service` no están disponibles, el gateway no se rompe:
- `integrations-service` caído → PR se considera inválido
- `rules-service` caído → reglas se consideran no aprobadas
- `notification-service` caído → el release igual se persiste como `PENDIENTE/MANUAL`
