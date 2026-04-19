package com.app.integrationsservice.service;

import com.app.integrationsservice.client.GitHubClient;
import com.app.integrationsservice.dto.ValidatePrResponse;
import org.springframework.stereotype.Service;

@Service
public class PrValidationService {

    private final GitHubClient gitHubClient;

    public PrValidationService(GitHubClient gitHubClient) {
        this.gitHubClient = gitHubClient;
    }

    public ValidatePrResponse validate(String url) {
        if (url == null || url.isBlank()) {
            return new ValidatePrResponse(false, "pr_o_jira es requerido");
        }

        if (isGithubUrl(url)) {
            return gitHubClient.validate(url);
        }

        return new ValidatePrResponse(true, "URL no es de GitHub, se considera válida");
    }

    boolean isGithubUrl(String url) {
        return url.startsWith("https://github.com/");
    }
}
