# PoC — Aprobación Automática de Releases

Sistema de aprobación automática de solicitudes de paso a producción basado en microservicios. Evalúa automáticamente si un release cumple los estándares de calidad y notifica al aprobador técnico cuando requiere revisión manual.

---

## Arquitectura

```
[Frontend Angular :4200]
         ↓
[API Gateway :3000]  ← único punto de entrada
         ↓
 ┌───────┬────────┬──────────────┬──────────────────┐
 ↓       ↓        ↓              ↓                  ↓
Release  Rules    Integrations   Notification
:3001    :3002    :3003          :3004
NestJS   Spring   Spring         NestJS
SQLite   Boot     Boot           Nodemailer
```

| Servicio | Stack | Puerto | Responsabilidad |
|---|---|---|---|
| `api-gateway` | NestJS | 3000 | Orquesta el flujo completo |
| `release-service` | NestJS + TypeORM + SQLite | 3001 | Persiste y lista solicitudes |
| `rules-service` | Spring Boot Java 21 | 3002 | Evalúa las 3 reglas de calidad |
| `integrations-service` | Spring Boot Java 21 | 3003 | Valida PRs en GitHub |
| `notification-service` | NestJS + Nodemailer | 3004 | Envía correos al aprobador |
| `frontend` | Angular 21 | 4200 | Formulario + tabla de solicitudes |

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

| URL | Qué es |
|---|---|
| http://localhost:4200 | Frontend |
| http://localhost:3000/swagger/docs | API Gateway — Swagger |
| http://localhost:3001/swagger/docs | Release Service — Swagger |
| http://localhost:3002/swagger/docs | Rules Service — Swagger |
| http://localhost:3003/swagger/docs | Integrations Service — Swagger |
| http://localhost:3004/swagger/docs | Notification Service — Swagger |

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

Con el sistema corriendo, ejecuta:

```powershell
.\smoke-tests\run.ps1
```

Los smoke tests verifican los 7 casos principales del flujo de negocio:

| Test | Caso | Resultado esperado |
|---|---|---|
| 1 | Health check del gateway | 200 OK |
| 2 | `fx` → pasa directo | APROBADO / N/A |
| 3 | `cv` → pasa directo | APROBADO / N/A |
| 4 | `rs` con cobertura 85%, stack vigente | APROBADO / AUTOMÁTICA |
| 5 | `rs` con cobertura 60% | PENDIENTE / MANUAL |
| 6 | `rs` sin descripción | 400 Bad Request |
| 7 | Listado de solicitudes | Array con todas las creadas |

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
├── smoke-tests/
│   └── run.ps1                ← smoke tests en PowerShell
├── docker-compose.yml
└── .env.example
```

---

## Pruebas unitarias

Cada servicio tiene sus propias pruebas unitarias:

```bash
# NestJS (api-gateway, release-service, notification-service, frontend)
cd apps/<servicio>
npm test

# Spring Boot (rules-service, integrations-service)
cd apps/<servicio>
./mvnw test
```
