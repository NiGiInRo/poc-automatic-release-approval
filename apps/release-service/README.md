# release-service

## Responsabilidad

Servicio de persistencia de solicitudes de release. Recibe, guarda y lista las solicitudes enviadas por los equipos de desarrollo. No evalúa reglas ni toma decisiones — solo gestiona los datos.

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| NestJS | 11 | Framework principal |
| TypeORM | 0.3 | ORM para manejo de base de datos |
| SQLite | 5 | Base de datos embebida (sin servidor) |
| class-validator | 0.15 | Validación de datos de entrada |
| TypeScript | 5.7 | Lenguaje |

## Puerto

`3001`

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servicio |
| `POST` | `/releases` | Crear una solicitud de release |
| `GET` | `/releases` | Listar todas las solicitudes |

## Documentación interactiva

Con el servicio corriendo, acceder a:

```
http://localhost:3001/swagger/docs
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

## Lógica de negocio

| Tipo | Estado inicial | Aprobación |
|---|---|---|
| `rs` (Release) | `PENDIENTE` | `MANUAL` — el rules-service evalúa las reglas |
| `fx` (Hot Fix) | `APROBADO` | `N/A` — pasa directo por ser urgente |
| `cv` (Ciclo de Vida) | `APROBADO` | `N/A` — se considera cambio simple |
