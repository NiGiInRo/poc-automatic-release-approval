# rules-service

## Responsabilidad

Servicio de evaluación automática de reglas para solicitudes de release. Recibe una solicitud del api-gateway y determina si cumple los estándares mínimos de calidad para ser aprobada. Solo evalúa solicitudes de tipo `rs`.

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Spring Boot | 3.2 | Framework principal |
| Java | 21 | Lenguaje |
| springdoc-openapi | 2.5 | Documentación Swagger |
| Maven | 3.9 | Build |

## Puerto

`3002`

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/rules/health` | Estado del servicio |
| `POST` | `/rules/evaluate` | Evaluar reglas de una solicitud |

## Documentación interactiva

Con el servicio corriendo, acceder a:

```
http://localhost:3002/swagger/docs
```

## Correr el servicio

```bash
docker build -t rules-service .
docker run -p 3002:3002 rules-service
```

## Correr pruebas

```bash
mvn test
```

## Reglas evaluadas

Solo aplican para solicitudes con `tipo: "rs"`. Si el tipo es distinto, la solicitud se aprueba sin evaluación.

| Regla | Condición | Fuente de datos |
|---|---|---|
| Cobertura | `cobertura >= 80` | Campo del request |
| Estructura | `descripcion` y `pr_o_jira` presentes y no vacíos | Campo del request |
| Obsolescencia | Frameworks del `stack` dentro de las últimas 4 versiones mayores | APIs públicas (nodejs.org, Maven Central, npm) |

## Ejemplo de request / response

**Request:**
```json
{
  "tipo": "rs",
  "cobertura": 85,
  "descripcion": "Agrega módulo de pagos",
  "pr_o_jira": "https://github.com/org/repo/pull/42",
  "stack": "Spring Boot 3.2, Node 20"
}
```

**Response:**
```json
{
  "aprobado": true,
  "reglas": {
    "cobertura":     { "pasa": true, "detalle": "85 >= 80" },
    "estructura":    { "pasa": true, "detalle": "descripcion y pr_o_jira presentes" },
    "obsolescencia": { "pasa": true, "detalle": "todos los frameworks vigentes" }
  }
}
```
