# Propuesta de Mejoras al Proceso

Este documento describe mejoras identificadas durante el desarrollo de la PoC que fortalecerían el sistema en un ambiente productivo real.

---

## 1. Aprobación/Rechazo manual desde el sistema

**Problema actual:**
Cuando una solicitud `rs` falla las reglas, queda en estado `PENDIENTE` indefinidamente. El aprobador técnico recibe el correo pero no tiene forma de actualizar el estado desde el sistema — debe hacerlo por fuera.

**Mejora propuesta:**
Agregar un endpoint en el `api-gateway` que permita al aprobador cambiar el estado de una solicitud pendiente:

```
PATCH /gateway/releases/:id/decision
Body: { "decision": "APROBADO" | "RECHAZADO", "comentario": "..." }
```

**Impacto:** Cierra el ciclo completo del flujo — una solicitud ya no queda abierta para siempre y queda trazabilidad de quién aprobó o rechazó y por qué.

---

## 2. Dashboard de métricas


**Problema actual:**
El sistema lista todas las solicitudes pero no ofrece visibilidad agregada del proceso.

**Mejora propuesta:**
Agregar un endpoint y vista de métricas:

```
GET /gateway/metrics
```

```json
{
  "total": 45,
  "aprobados_automaticos": 30,
  "pendientes_manual": 10,
  "aprobados_manual": 4,
  "rechazados": 1,
  "tasa_aprobacion_automatica": "66.7%",
  "regla_que_mas_falla": "cobertura"
}
```

**Impacto:** Permite identificar qué equipos tienen más problemas y qué regla falla con mayor frecuencia, orientando acciones de mejora en el proceso de desarrollo.

---

## 4. Historial de cambios de estado

**Problema actual:**
La entidad `Release` solo guarda el estado final. No hay trazabilidad de cómo llegó a ese estado ni cuándo cambió.

**Mejora propuesta:**
Agregar una tabla `release_events` que registre cada cambio de estado:

```
id | release_id | estado_anterior | estado_nuevo | usuario | fecha | comentario
```

**Impacto:** Auditoría completa del ciclo de vida de cada solicitud — requerimiento típico en entidades financieras reguladas.

---

## 5. Reintentar evaluación automática

**Problema actual:**
Si una solicitud `rs` queda `PENDIENTE` porque la cobertura era 78%, el equipo debe crear una solicitud nueva desde cero.

**Mejora propuesta:**
Endpoint para re-evaluar una solicitud existente:

```
POST /gateway/releases/:id/re-evaluate
```

El sistema vuelve a correr las 3 reglas con los datos actuales. Si ahora pasa, cambia a `APROBADO/AUTOMÁTICA`.

**Impacto:** Reduce fricción para los equipos — corrigen el problema y reenvían sin duplicar solicitudes.

---

## 6. Notificación al equipo cuando se aprueba

**Problema actual:**
El correo solo se envía cuando una solicitud falla. El equipo no recibe confirmación cuando es aprobada automáticamente.

**Mejora propuesta:**
Enviar correo de confirmación también en aprobaciones automáticas:

> *"Tu release 'Módulo de pagos' fue aprobado automáticamente. Puedes proceder al despliegue."*

**Impacto:** Mejor experiencia para los equipos y trazabilidad por correo de todas las decisiones del sistema.
