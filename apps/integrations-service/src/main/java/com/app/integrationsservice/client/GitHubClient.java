package com.app.integrationsservice.client;

import com.app.integrationsservice.dto.ValidatePrResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class GitHubClient {

    private static final Pattern PR_URL_PATTERN =
        Pattern.compile("https://github\\.com/([^/]+)/([^/]+)/pull/(\\d+)");

    private final RestTemplate restTemplate;
    private final String githubToken;

    public GitHubClient(RestTemplate restTemplate,
                        @Value("${github.token:}") String githubToken) {
        this.restTemplate = restTemplate;
        this.githubToken = githubToken;
    }

    public ValidatePrResponse validate(String url) {
        Matcher matcher = PR_URL_PATTERN.matcher(url);
        if (!matcher.matches()) {
            return new ValidatePrResponse(false, "URL de GitHub no tiene formato válido de PR");
        }

        if (githubToken == null || githubToken.isBlank()) {
            return new ValidatePrResponse(true, "GITHUB_TOKEN no configurado, se omite validación");
        }

        String owner  = matcher.group(1);
        String repo   = matcher.group(2);
        String number = matcher.group(3);

        return consultarPr(owner, repo, number);
    }

    @SuppressWarnings("unchecked")
    private ValidatePrResponse consultarPr(String owner, String repo, String number) {
        String apiUrl = "https://api.github.com/repos/" + owner + "/" + repo + "/pulls/" + number;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + githubToken);
        headers.set("Accept", "application/vnd.github+json");

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

            Map<String, Object> body = response.getBody();
            String state    = (String) body.get("state");
            boolean merged  = body.get("merged_at") != null;

            if ("open".equals(state)) {
                return new ValidatePrResponse(true, "PR #" + number + " encontrado - estado: open");
            }
            if (merged) {
                return new ValidatePrResponse(true, "PR #" + number + " encontrado - estado: merged");
            }
            return new ValidatePrResponse(false, "PR #" + number + " está cerrado sin merge");

        } catch (HttpClientErrorException.NotFound e) {
            return new ValidatePrResponse(false, "PR #" + number + " no encontrado en " + owner + "/" + repo);
        } catch (Exception e) {
            return new ValidatePrResponse(true, "no se pudo consultar GitHub, se omite validación");
        }
    }
}
