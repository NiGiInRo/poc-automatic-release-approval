# notification-service

## Responsabilidad

Servicio de notificaciones para releases rechazados. Recibe los datos de una solicitud y las reglas que fallaron, y envía un correo HTML al aprobador técnico del equipo. Es llamado por el api-gateway cuando un release tipo `rs` no pasa la evaluación automática.

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| NestJS | 11 | Framework principal |
| Nodemailer | 6 | Envío de correos vía SMTP |
| class-validator | 0.14 | Validación de datos de entrada |
| @nestjs/swagger | 11 | Documentación interactiva |
| TypeScript | 5.7 | Lenguaje |

## Puerto

`3004`

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servicio |
| `POST` | `/notifications/notify` | Enviar notificación de release fallido |

## Documentación interactiva

Con el servicio corriendo, acceder a:

```
http://localhost:3004/swagger/docs
```

## Correr el servicio

```bash
npm install
npm run start:dev
```

## Correr pruebas

```bash
npm test
```

## Lógica de envío

| Situación | Comportamiento |
|---|---|
| Sin `SMTP_HOST` configurado | Crea cuenta Ethereal automática y loguea la URL para ver el correo en el navegador |
| Con `SMTP_HOST` configurado | Usa las credenciales SMTP del entorno (Gmail, SendGrid, SES, etc.) |
| Error en el envío | Modo degradado — loguea en consola sin romper el servicio |

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `PORT` | No | Puerto del servidor. Por defecto `3004` |
| `SMTP_HOST` | No | Host SMTP. Sin él, usa Ethereal automáticamente |
| `SMTP_PORT` | No | Puerto SMTP. Por defecto `587` |
| `SMTP_USER` | No | Usuario SMTP |
| `SMTP_PASS` | No | Contraseña SMTP |
| `SMTP_FROM` | No | Dirección del remitente. Por defecto `"Release Notifier" <notifier@local>` |

## Ejemplo de request / response

**Notificación enviada:**
```json
// Request
{
  "equipo": "Equipo Pagos",
  "aprobadorEmail": "aprobador@empresa.com",
  "tipo": "rs",
  "descripcion": "Agrega módulo de pagos",
  "reglasFallidas": ["cobertura insuficiente (60 < 80)", "PR no encontrado"]
}

// Response
{ "enviado": true, "mensaje": "Correo enviado a aprobador@empresa.com" }
```

**Modo degradado (SMTP no disponible):**
```json
// Response
{ "enviado": false, "mensaje": "Modo degradado: correo no enviado, ver logs" }
```

**Body inválido:**
```json
// Response — 400 Bad Request
{
  "message": ["aprobadorEmail must be an email", "reglasFallidas should not be empty"],
  "error": "Bad Request",
  "statusCode": 400
}
```
