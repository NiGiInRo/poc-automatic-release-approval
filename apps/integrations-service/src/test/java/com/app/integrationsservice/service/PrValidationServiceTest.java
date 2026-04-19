package com.app.integrationsservice.service;

import com.app.integrationsservice.client.GitHubClient;
import com.app.integrationsservice.dto.ValidatePrResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrValidationServiceTest {

    @Mock
    private GitHubClient gitHubClient;

    private PrValidationService service;

    @BeforeEach
    void setUp() {
        service = new PrValidationService(gitHubClient);
    }

    // --- isGithubUrl ---

    @Test
    void url_github_esReconocida() {
        assertTrue(service.isGithubUrl("https://github.com/org/repo/pull/42"));
    }

    @Test
    void url_jira_noEsGithub() {
        assertFalse(service.isGithubUrl("https://miempresa.atlassian.net/browse/PROJ-123"));
    }

    @Test
    void url_gitlab_noEsGithub() {
        assertFalse(service.isGithubUrl("https://gitlab.com/org/repo/merge_requests/5"));
    }

    // --- validate: url vacía o nula ---

    @Test
    void url_nula_retornaInvalido() {
        ValidatePrResponse response = service.validate(null);

        assertFalse(response.isValido());
        assertEquals("pr_o_jira es requerido", response.getDetalle());
    }

    @Test
    void url_blank_retornaInvalido() {
        assertFalse(service.validate("   ").isValido());
    }

    // --- validate: no-GitHub ---

    @Test
    void url_jira_retornaValidoSinConsultarGitHub() {
        ValidatePrResponse response = service.validate("https://miempresa.atlassian.net/browse/PROJ-123");

        assertTrue(response.isValido());
        assertEquals("URL no es de GitHub, se considera válida", response.getDetalle());
    }

    // --- validate: GitHub delega al cliente ---

    @Test
    void url_github_delegaAGitHubClient() {
        when(gitHubClient.validate(anyString()))
            .thenReturn(new ValidatePrResponse(true, "PR #42 encontrado - estado: open"));

        ValidatePrResponse response = service.validate("https://github.com/org/repo/pull/42");

        assertTrue(response.isValido());
        verify(gitHubClient).validate("https://github.com/org/repo/pull/42");
    }
}
