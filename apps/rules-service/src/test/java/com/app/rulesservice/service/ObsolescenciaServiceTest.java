package com.app.rulesservice.service;

import com.app.rulesservice.dto.RuleResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ObsolescenciaServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private ObsolescenciaService service;

    @BeforeEach
    void setUp() {
        service = new ObsolescenciaService(restTemplate);
    }

    // --- parsearStack ---

    @Test
    void parsearStack_dosFrameworks() {
        List<ObsolescenciaService.FrameworkVersion> result = service.parsearStack("Spring Boot 3.2, Node 20");

        assertEquals(2, result.size());
        assertEquals("Spring Boot", result.get(0).nombre());
        assertEquals("3.2", result.get(0).version());
        assertEquals(3, result.get(0).major());
        assertEquals("Node", result.get(1).nombre());
        assertEquals(20, result.get(1).major());
    }

    @Test
    void parsearStack_unFramework() {
        List<ObsolescenciaService.FrameworkVersion> result = service.parsearStack("Node 20");

        assertEquals(1, result.size());
        assertEquals("Node", result.get(0).nombre());
        assertEquals(20, result.get(0).major());
    }

    @Test
    void parsearStack_versionSinNumero_seIgnora() {
        List<ObsolescenciaService.FrameworkVersion> result = service.parsearStack("Node latest");

        assertTrue(result.isEmpty());
    }

    // --- evaluar: stack null o blank ---

    @Test
    void evaluar_stackNull_noPasa() {
        RuleResult result = service.evaluar(null);

        assertFalse(result.isPasa());
        assertEquals("stack no informado", result.getDetalle());
    }

    @Test
    void evaluar_stackBlank_noPasa() {
        RuleResult result = service.evaluar("  ");

        assertFalse(result.isPasa());
    }

    // --- evaluar: Node ---

    @Test
    @SuppressWarnings("unchecked")
    void evaluar_nodeVigente_pasa() {
        when(restTemplate.getForObject(anyString(), eq(List.class)))
            .thenReturn(List.of(Map.of("version", "v22.0.0")));

        RuleResult result = service.evaluar("Node 20");

        assertTrue(result.isPasa());
        assertEquals("todos los frameworks vigentes", result.getDetalle());
    }

    @Test
    @SuppressWarnings("unchecked")
    void evaluar_nodeDesactualizado_noPasa() {
        when(restTemplate.getForObject(anyString(), eq(List.class)))
            .thenReturn(List.of(Map.of("version", "v22.0.0")));

        // Node 14: latestMajor=22, 14 < 22-3=19 → desactualizado
        RuleResult result = service.evaluar("Node 14");

        assertFalse(result.isPasa());
        assertTrue(result.getDetalle().contains("Node 14"));
    }

    // --- evaluar: API externa falla ---

    @Test
    @SuppressWarnings("unchecked")
    void evaluar_apiExternaFalla_noBloqueaEvaluacion() {
        when(restTemplate.getForObject(anyString(), eq(List.class)))
            .thenThrow(new RuntimeException("timeout"));

        RuleResult result = service.evaluar("Node 20");

        assertTrue(result.isPasa());
    }

    // --- evaluar: framework desconocido ---

    @Test
    @SuppressWarnings("unchecked")
    void evaluar_frameworkDesconocido_seOmite() {
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
            .thenReturn(null);

        RuleResult result = service.evaluar("UnknownFramework 5");

        assertTrue(result.isPasa());
    }
}
