# integrations-service

## Responsabilidad

Servicio de validación de PRs y tickets para solicitudes de release. Recibe una URL (`pr_o_jira`) y verifica si el cambio está respaldado por un PR real en GitHub o por un ticket externo (Jira u otro). Es llamado por el api-gateway durante el proceso de aprobación automática.

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Spring Boot | 3.2 | Framework principal |
| Java | 21 | Lenguaje |
| springdoc-openapi | 2.5 | Documentación Swagger |
| Maven | 3.9 | Build |

## Puerto

`3003`

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servicio |
| `POST` | `/validate-pr` | Validar una URL de PR o ticket |

## Documentación interactiva

Con el servicio corriendo, acceder a:

```
http://localhost:3003/swagger/docs
```

## Correr el servicio

```bash
docker build -t integrations-service .
docker run -p 3003:3003 -e GITHUB_TOKEN=tu_token integrations-service
```

## Correr pruebas

```bash
mvn test
```

## Lógica de validación

| URL recibida | Comportamiento |
|---|---|
| `https://github.com/...` | Consulta la API de GitHub y verifica que el PR exista y esté `open` o `merged` |
| Cualquier otra URL (Jira, etc.) | Se considera válida sin consultar nada |
| Vacía o nula | Inválida |

## Modo degradado

Si `GITHUB_TOKEN` no está configurado o GitHub no responde, el servicio devuelve válido sin bloquear el flujo. Esto evita que un problema externo detenga el pipeline completo.

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `GITHUB_TOKEN` | No | Token de GitHub para consultar la API. Sin él, opera en modo degradado |
| `SERVER_PORT` | No | Puerto del servidor. Por defecto `3003` |

## Ejemplo de request / response

**PR de GitHub válido:**
```json
// Request
{ "pr_o_jira": "https://github.com/org/repo/pull/42" }

// Response
{ "valido": true, "detalle": "PR #42 encontrado - estado: open" }
```

**Ticket de Jira:**
```json
// Request
{ "pr_o_jira": "https://miempresa.atlassian.net/browse/PROJ-123" }

// Response
{ "valido": true, "detalle": "URL no es de GitHub, se considera válida" }
```

**PR no encontrado:**
```json
// Request
{ "pr_o_jira": "https://github.com/org/repo/pull/999" }

// Response
{ "valido": false, "detalle": "PR #999 no encontrado en org/repo" }
```
