package com.app.integrationsservice.client;

import com.app.integrationsservice.dto.ValidatePrResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GitHubClientTest {

    @Mock
    private RestTemplate restTemplate;

    private GitHubClient client(String token) {
        return new GitHubClient(restTemplate, token);
    }

    // --- sin token ---

    @Test
    void sinToken_retornaValidoSinConsultar() {
        ValidatePrResponse response = client("").validate("https://github.com/org/repo/pull/42");

        assertTrue(response.isValido());
        assertEquals("GITHUB_TOKEN no configurado, se omite validación", response.getDetalle());
    }

    // --- URL con formato inválido ---

    @Test
    void urlSinNumeroDePr_retornaInvalido() {
        ValidatePrResponse response = client("token").validate("https://github.com/org/repo");

        assertFalse(response.isValido());
        assertTrue(response.getDetalle().contains("formato válido"));
    }

    // --- PR open ---

    @Test
    @SuppressWarnings("unchecked")
    void prOpen_retornaValido() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(), eq(Map.class)))
            .thenReturn(ResponseEntity.ok(Map.of("state", "open")));

        ValidatePrResponse response = client("token").validate("https://github.com/org/repo/pull/42");

        assertTrue(response.isValido());
        assertTrue(response.getDetalle().contains("open"));
    }

    // --- PR merged ---

    @Test
    @SuppressWarnings("unchecked")
    void prMerged_retornaValido() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(), eq(Map.class)))
            .thenReturn(ResponseEntity.ok(Map.of("state", "closed", "merged_at", "2024-01-01T00:00:00Z")));

        ValidatePrResponse response = client("token").validate("https://github.com/org/repo/pull/42");

        assertTrue(response.isValido());
        assertTrue(response.getDetalle().contains("merged"));
    }

    // --- PR cerrado sin merge ---

    @Test
    @SuppressWarnings("unchecked")
    void prCerradoSinMerge_retornaInvalido() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(), eq(Map.class)))
            .thenReturn(ResponseEntity.ok(Map.of("state", "closed")));

        ValidatePrResponse response = client("token").validate("https://github.com/org/repo/pull/42");

        assertFalse(response.isValido());
        assertTrue(response.getDetalle().contains("cerrado sin merge"));
    }

    // --- PR no encontrado (404) ---

    @Test
    void pr404_retornaInvalido() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(), eq(Map.class)))
            .thenThrow(HttpClientErrorException.NotFound.create(
                HttpStatus.NOT_FOUND, "Not Found", HttpHeaders.EMPTY, null, null));

        ValidatePrResponse response = client("token").validate("https://github.com/org/repo/pull/99");

        assertFalse(response.isValido());
        assertTrue(response.getDetalle().contains("no encontrado"));
    }

    // --- error de red ---

    @Test
    void errorDeRed_modoDegradado() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(), eq(Map.class)))
            .thenThrow(new RuntimeException("timeout"));

        ValidatePrResponse response = client("token").validate("https://github.com/org/repo/pull/42");

        assertTrue(response.isValido());
        assertTrue(response.getDetalle().contains("no se pudo consultar"));
    }
}
