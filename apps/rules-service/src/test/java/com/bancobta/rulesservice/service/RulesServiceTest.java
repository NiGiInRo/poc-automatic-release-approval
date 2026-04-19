package com.bancobta.rulesservice.service;

import com.bancobta.rulesservice.dto.EvaluationResponse;
import com.bancobta.rulesservice.dto.ReleaseRequest;
import com.bancobta.rulesservice.dto.RuleResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RulesServiceTest {

    @Mock
    private ObsolescenciaService obsolescenciaService;

    private RulesService rulesService;

    @BeforeEach
    void setUp() {
        rulesService = new RulesService(obsolescenciaService);
        when(obsolescenciaService.evaluar(anyString()))
            .thenReturn(new RuleResult(true, "todos los frameworks vigentes"));
    }

    // --- filtro de tipo ---

    @Test
    void cuandoTipoNoEsRs_apruebaSinEvaluarReglas() {
        EvaluationResponse response = rulesService.evaluate(requestBase("hotfix", 85, "desc", "PR-1"));

        assertTrue(response.isAprobado());
        assertTrue(response.getReglas().isEmpty());
    }

    @Test
    void cuandoTipoEsNull_apruebaSinEvaluarReglas() {
        EvaluationResponse response = rulesService.evaluate(requestBase(null, 85, "desc", "PR-1"));

        assertTrue(response.isAprobado());
        assertTrue(response.getReglas().isEmpty());
    }

    // --- regla cobertura ---

    @Test
    void cobertura_exactamente80_pasa() {
        assertTrue(rulesService.evaluate(requestBase("rs", 80, "desc", "PR-1"))
            .getReglas().get("cobertura").isPasa());
    }

    @Test
    void cobertura_mayorA80_pasa() {
        assertTrue(rulesService.evaluate(requestBase("rs", 95, "desc", "PR-1"))
            .getReglas().get("cobertura").isPasa());
    }

    @Test
    void cobertura_menorA80_noPasa() {
        EvaluationResponse response = rulesService.evaluate(requestBase("rs", 79, "desc", "PR-1"));

        assertFalse(response.getReglas().get("cobertura").isPasa());
        assertFalse(response.isAprobado());
    }

    @Test
    void cobertura_null_noPasa() {
        EvaluationResponse response = rulesService.evaluate(requestBase("rs", null, "desc", "PR-1"));

        assertFalse(response.getReglas().get("cobertura").isPasa());
        assertFalse(response.isAprobado());
    }

    // --- regla estructura ---

    @Test
    void estructura_ambosPresentes_pasa() {
        assertTrue(rulesService.evaluate(requestBase("rs", 85, "Agrega módulo de pagos", "PR-42"))
            .getReglas().get("estructura").isPasa());
    }

    @Test
    void estructura_sinDescripcion_noPasa() {
        EvaluationResponse response = rulesService.evaluate(requestBase("rs", 85, null, "PR-42"));

        assertFalse(response.getReglas().get("estructura").isPasa());
        assertFalse(response.isAprobado());
    }

    @Test
    void estructura_sinPrOJira_noPasa() {
        EvaluationResponse response = rulesService.evaluate(requestBase("rs", 85, "Agrega módulo de pagos", null));

        assertFalse(response.getReglas().get("estructura").isPasa());
        assertFalse(response.isAprobado());
    }

    @Test
    void estructura_descripcionBlank_noPasa() {
        assertFalse(rulesService.evaluate(requestBase("rs", 85, "   ", "PR-42"))
            .getReglas().get("estructura").isPasa());
    }

    @Test
    void estructura_prOJiraBlank_noPasa() {
        assertFalse(rulesService.evaluate(requestBase("rs", 85, "Agrega módulo de pagos", "  "))
            .getReglas().get("estructura").isPasa());
    }

    // --- aprobado general ---

    @Test
    void cuandoTodasLasReglasPasan_aprobado() {
        EvaluationResponse response = rulesService.evaluate(requestBase("rs", 85, "Agrega módulo de pagos", "PR-42"));

        assertTrue(response.isAprobado());
    }

    @Test
    void cuandoObsolescenciaFalla_noAprobado() {
        when(obsolescenciaService.evaluar(anyString()))
            .thenReturn(new RuleResult(false, "desactualizados: Node 14 (último major: 22)"));

        EvaluationResponse response = rulesService.evaluate(requestBase("rs", 85, "Agrega módulo de pagos", "PR-42"));

        assertFalse(response.isAprobado());
        assertFalse(response.getReglas().get("obsolescencia").isPasa());
    }

    // --- helper ---

    private ReleaseRequest requestBase(String tipo, Integer cobertura, String descripcion, String prOJira) {
        ReleaseRequest r = new ReleaseRequest();
        r.setTipo(tipo);
        r.setCobertura(cobertura);
        r.setDescripcion(descripcion);
        r.setPr_o_jira(prOJira);
        r.setStack("Spring Boot 3.2, Node 20");
        return r;
    }
}
