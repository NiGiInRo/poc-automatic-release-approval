# Smoke Tests - PoC Aprobacion Automatica de Releases
# Requisito: docker-compose up --build corriendo antes de ejecutar este script
#
# Uso: .\smoke-tests\run.ps1

$BASE_URL = "http://localhost:3000"
$PASSED = 0
$FAILED = 0

function Print-Header($text) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " $text" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Assert-Field($response, $field, $expected, $testName) {
    $actual = $response.$field
    if ($actual -eq $expected) {
        Write-Host "[PASS] $testName -> $field = '$actual'" -ForegroundColor Green
        $script:PASSED++
    } else {
        Write-Host "[FAIL] $testName -> $field = '$actual' (esperado: '$expected')" -ForegroundColor Red
        $script:FAILED++
    }
}

# ─────────────────────────────────────────────
# SMOKE TEST 1: Health check del gateway
# ─────────────────────────────────────────────
Print-Header "SMOKE TEST 1: Health check"
try {
    $res = Invoke-RestMethod -Uri "$BASE_URL/health" -Method GET
    Write-Host "[PASS] Gateway responde: status=$($res.status)" -ForegroundColor Green
    $PASSED++
} catch {
    Write-Host "[FAIL] Gateway no responde: $_" -ForegroundColor Red
    $FAILED++
}

# ─────────────────────────────────────────────
# SMOKE TEST 2: fx pasa directo sin evaluar
# ─────────────────────────────────────────────
Print-Header "SMOKE TEST 2: Hot Fix (fx) -> APROBADO / N/A"
$body = @{
    fecha         = "2026-04-20"
    equipo        = "Equipo Alpha"
    tipo          = "fx"
    descripcion   = "Fix critico en modulo de autenticacion"
    pr_o_jira     = "JIRA-001"
    cobertura     = 50
    stack         = "Node 20"
    aprobadorEmail = "aprobador@empresa.com"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$BASE_URL/gateway/releases" -Method POST -Body $body -ContentType "application/json"
    Assert-Field $res "estado"    "APROBADO" "fx directo"
    Assert-Field $res "aprobacion" "N/A"     "fx directo"
} catch {
    Write-Host "[FAIL] Error en smoke test 2: $_" -ForegroundColor Red
    $FAILED++
}

# ─────────────────────────────────────────────
# SMOKE TEST 3: cv pasa directo sin evaluar
# ─────────────────────────────────────────────
Print-Header "SMOKE TEST 3: Ciclo de Vida (cv) -> APROBADO / N/A"
$body = @{
    fecha         = "2026-04-20"
    equipo        = "Equipo Beta"
    tipo          = "cv"
    descripcion   = "Actualizacion de dependencias"
    pr_o_jira     = "JIRA-002"
    cobertura     = 70
    stack         = "Node 20"
    aprobadorEmail = "aprobador@empresa.com"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$BASE_URL/gateway/releases" -Method POST -Body $body -ContentType "application/json"
    Assert-Field $res "estado"    "APROBADO" "cv directo"
    Assert-Field $res "aprobacion" "N/A"     "cv directo"
} catch {
    Write-Host "[FAIL] Error en smoke test 3: $_" -ForegroundColor Red
    $FAILED++
}

# ─────────────────────────────────────────────
# SMOKE TEST 4: rs que pasa las 3 reglas -> APROBADO / AUTOMATICA
# ─────────────────────────────────────────────
Print-Header "SMOKE TEST 4: Release (rs) todas las reglas pasan -> APROBADO / AUTOMATICA"
$body = @{
    fecha         = "2026-04-20"
    equipo        = "Equipo Gamma"
    tipo          = "rs"
    descripcion   = "Nuevo modulo de reportes"
    pr_o_jira     = "https://github.com/NiGiInRo/poc-automatic-release-approval/pull/1"
    cobertura     = 85
    stack         = "Node 22"
    aprobadorEmail = "aprobador@empresa.com"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$BASE_URL/gateway/releases" -Method POST -Body $body -ContentType "application/json"
    Assert-Field $res "estado"    "APROBADO"   "rs aprobado automatico"
    Assert-Field $res "aprobacion" "AUTOMATICA" "rs aprobado automatico"
} catch {
    Write-Host "[FAIL] Error en smoke test 4: $_" -ForegroundColor Red
    $FAILED++
}

# ─────────────────────────────────────────────
# SMOKE TEST 5: rs con cobertura baja -> PENDIENTE / MANUAL
# ─────────────────────────────────────────────
Print-Header "SMOKE TEST 5: Release (rs) cobertura insuficiente -> PENDIENTE / MANUAL"
$body = @{
    fecha         = "2026-04-20"
    equipo        = "Equipo Delta"
    tipo          = "rs"
    descripcion   = "Modulo de pagos"
    pr_o_jira     = "https://github.com/NiGiInRo/poc-automatic-release-approval/pull/1"
    cobertura     = 60
    stack         = "Node 22"
    aprobadorEmail = "aprobador@empresa.com"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$BASE_URL/gateway/releases" -Method POST -Body $body -ContentType "application/json"
    Assert-Field $res "estado"    "PENDIENTE" "rs cobertura baja"
    Assert-Field $res "aprobacion" "MANUAL"   "rs cobertura baja"
} catch {
    Write-Host "[FAIL] Error en smoke test 5: $_" -ForegroundColor Red
    $FAILED++
}

# ─────────────────────────────────────────────
# SMOKE TEST 6: rs sin descripcion -> 400 Bad Request
# ─────────────────────────────────────────────
Print-Header "SMOKE TEST 6: Validacion DTO -> 400 Bad Request si falta descripcion"
$body = @{
    fecha         = "2026-04-20"
    equipo        = "Equipo Epsilon"
    tipo          = "rs"
    pr_o_jira     = "https://github.com/NiGiInRo/poc-automatic-release-approval/pull/1"
    cobertura     = 85
    stack         = "Node 22"
    aprobadorEmail = "aprobador@empresa.com"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$BASE_URL/gateway/releases" -Method POST -Body $body -ContentType "application/json"
    Write-Host "[FAIL] Debio retornar 400 pero retorno 2xx" -ForegroundColor Red
    $FAILED++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "[PASS] Retorno 400 Bad Request correctamente" -ForegroundColor Green
        $PASSED++
    } else {
        Write-Host "[FAIL] Retorno $statusCode (esperado: 400)" -ForegroundColor Red
        $FAILED++
    }
}

# ─────────────────────────────────────────────
# SMOKE TEST 7: Listado de solicitudes
# ─────────────────────────────────────────────
Print-Header "SMOKE TEST 7: GET /gateway/releases -> lista todas las solicitudes"
try {
    $res = Invoke-RestMethod -Uri "$BASE_URL/gateway/releases" -Method GET
    if ($res.Count -ge 4) {
        Write-Host "[PASS] Lista retorna $($res.Count) solicitudes" -ForegroundColor Green
        $PASSED++
    } else {
        Write-Host "[FAIL] Lista retorna $($res.Count) solicitudes (esperado: >= 4)" -ForegroundColor Red
        $FAILED++
    }
} catch {
    Write-Host "[FAIL] Error en smoke test 7: $_" -ForegroundColor Red
    $FAILED++
}

# ─────────────────────────────────────────────
# RESUMEN
# ─────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " RESULTADO FINAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " PASARON: $PASSED" -ForegroundColor Green
Write-Host " FALLARON: $FAILED" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
