# PoC — Aprobación Automática de Releases

Sistema de aprobación automática de solicitudes de paso a producción basado en microservicios. Evalúa automáticamente si un release cumple los estándares de calidad y notifica al aprobador técnico cuando requiere revisión manual.

La seguridad está implementada con **Keycloak + JWT**: todos los endpoints del gateway requieren un Bearer token válido.

---

## Arquitectura

```
[Frontend Angular :4200]
         ↓  (Bearer JWT)
[API Gateway :3000]  ← valida token contra Keycloak
         ↓
 ┌───────┬────────┬──────────────┬──────────────────┐
 ↓       ↓        ↓              ↓                  ↓
Release  Rules    Integrations   Notification    Keycloak
:3001    :3002    :3003          :3004            :8080
NestJS   Spring   Spring         NestJS          Identity
SQLite   Boot     Boot           Nodemailer      Server
```

| Servicio | Stack | Puerto | Responsabilidad |
|---|---|---|---|
| `api-gateway` | NestJS | 3000 | Orquesta el flujo, valida JWT |
| `release-service` | NestJS + TypeORM + SQLite | 3001 | Persiste y lista solicitudes |
| `rules-service` | Spring Boot Java 21 | 3002 | Evalúa las 3 reglas de calidad |
| `integrations-service` | Spring Boot Java 21 | 3003 | Valida PRs en GitHub |
| `notification-service` | NestJS + Nodemailer | 3004 | Envía correos al aprobador |
| `frontend` | Angular 21 | 4200 | Login + formulario + tabla |
| `keycloak` | Keycloak 24 | 8080 | Identity server (realm: poc-realm) |

---

## Tipos de release

| Tipo | Nombre | ¿Se evalúa? |
|---|---|---|
| `rs` | Release | ✅ Sí — pasa por las 3 reglas |
| `fx` | Hot Fix | ❌ No — aprobado directo |
| `cv` | Ciclo de Vida | ❌ No — aprobado directo |

## Reglas de evaluación (solo para `rs`)

1. **Cobertura** — debe ser ≥ 80%
2. **Estructura** — debe tener descripción y PR/JIRA asociado
3. **Obsolescencia** — los frameworks deben estar dentro de las últimas 4 versiones mayores

---

## Requisitos

- Docker Desktop
- (Opcional) Para smoke tests: PowerShell

---

## Levantar el sistema

```bash
docker-compose up --build
```

Al levantar, `keycloak-setup` configura automáticamente el realm, el cliente y el usuario de prueba. No se requiere configuración manual.

| URL | Qué es |
|---|---|
| http://localhost:4200 | Frontend |
| http://localhost:3000/swagger/docs | API Gateway — Swagger |
| http://localhost:8080 | Keycloak Admin Console |

---

## Login

### Frontend

1. Abrí `http://localhost:4200`
2. Ingresá con las credenciales de prueba:
   - **Usuario:** `dev`
   - **Contraseña:** `dev123`
3. El token se guarda automáticamente y se envía en cada request al gateway

### Swagger

1. Abrí `http://localhost:3000/swagger/docs`
2. Obtené un token:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8080/realms/poc-realm/protocol/openid-connect/token" `
  -ContentType "application/x-www-form-urlencoded" `
  -Body "grant_type=password&client_id=poc-client&username=dev&password=dev123"
```

3. Hacé click en **Authorize** (arriba a la derecha), pegá el `access_token` y cerrá

---

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

```env
# GitHub (para validar PRs reales)
GITHUB_TOKEN=tu_token_aqui

# SMTP (para envío de correos)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=tu_usuario
SMTP_PASS=tu_password
SMTP_FROM=noreply@app.com
```

> Sin estas variables el sistema funciona en **modo degradado**: los PRs se consideran válidos y los correos se loguean en consola.

---

## Smoke Tests

Con el sistema corriendo, ejecutá:

```powershell
.\smoke-tests\run.ps1
```

El script obtiene el token de Keycloak automáticamente antes de correr los tests.

| Test | Caso | Resultado esperado |
|---|---|---|
| 1 | Health check del gateway | 200 OK (sin token) |
| 2 | Request sin token al gateway | 401 Unauthorized |
| 3 | `fx` → pasa directo | APROBADO / N/A |
| 4 | `cv` → pasa directo | APROBADO / N/A |
| 5 | `rs` con cobertura 85%, stack vigente | APROBADO / AUTOMÁTICA |
| 6 | `rs` con cobertura 60% | PENDIENTE / MANUAL |
| 7 | `rs` sin descripción | 400 Bad Request |
| 8 | Listado de solicitudes | Array con todas las creadas |

---

## Estructura del repositorio

```
poc-automatic-release-approval/
├── apps/
│   ├── api-gateway/           ← NestJS, puerto 3000
│   ├── release-service/       ← NestJS + SQLite, puerto 3001
│   ├── rules-service/         ← Spring Boot, puerto 3002
│   ├── integrations-service/  ← Spring Boot, puerto 3003
│   └── notification-service/  ← NestJS, puerto 3004
├── frontend/                  ← Angular 21, puerto 4200
├── keycloak/
│   └── setup.sh               ← configura realm, cliente y usuario al arrancar
├── smoke-tests/
│   └── run.ps1                ← smoke tests en PowerShell
├── docker-compose.yml
└── .env.example
```

---

## Pruebas unitarias

Cada servicio tiene sus propias pruebas unitarias:

```bash
# NestJS (api-gateway, release-service, notification-service)
cd apps/<servicio>
npm test

# Spring Boot (rules-service, integrations-service)
cd apps/<servicio>
./mvnw test
```
