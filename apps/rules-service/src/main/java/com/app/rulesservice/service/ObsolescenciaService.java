package com.app.rulesservice.service;

import com.app.rulesservice.dto.RuleResult;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ObsolescenciaService {

    private final RestTemplate restTemplate;

    public ObsolescenciaService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public RuleResult evaluar(String stack) {
        if (stack == null || stack.isBlank()) {
            return new RuleResult(false, "stack no informado");
        }

        List<FrameworkVersion> frameworks = parsearStack(stack);
        List<String> desactualizados = new ArrayList<>();

        for (FrameworkVersion fw : frameworks) {
            try {
                int latestMajor = obtenerUltimoMajor(fw.nombre());
                if (latestMajor < 0) continue;
                if (fw.major() < latestMajor - 3) {
                    desactualizados.add(fw.nombre() + " " + fw.version() + " (último major: " + latestMajor + ")");
                }
            } catch (Exception e) {
                // si la API externa falla, no bloqueamos la evaluación
            }
        }

        if (desactualizados.isEmpty()) {
            return new RuleResult(true, "todos los frameworks vigentes");
        }
        return new RuleResult(false, "desactualizados: " + String.join(", ", desactualizados));
    }

    List<FrameworkVersion> parsearStack(String stack) {
        List<FrameworkVersion> result = new ArrayList<>();
        for (String parte : stack.split(",")) {
            parte = parte.trim();
            int lastSpace = parte.lastIndexOf(' ');
            if (lastSpace < 0) continue;
            String nombre = parte.substring(0, lastSpace).trim();
            String version = parte.substring(lastSpace + 1).trim();
            int major = extraerMajor(version);
            if (major >= 0) {
                result.add(new FrameworkVersion(nombre, version, major));
            }
        }
        return result;
    }

    int obtenerUltimoMajor(String nombre) {
        String nombreLower = nombre.toLowerCase().trim();
        if (nombreLower.equals("node") || nombreLower.equals("nodejs") || nombreLower.equals("node.js")) {
            return obtenerUltimoMajorNode();
        }
        if (nombreLower.equals("spring boot")) {
            return obtenerUltimoMajorSpringBoot();
        }
        return obtenerUltimoMajorNpm(nombreLower.replace(" ", "-"));
    }

    private int obtenerUltimoMajorNode() {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> versions = restTemplate.getForObject(
            "https://nodejs.org/dist/index.json", List.class);
        if (versions == null || versions.isEmpty()) return -1;
        String latest = (String) versions.get(0).get("version");
        return extraerMajor(latest.startsWith("v") ? latest.substring(1) : latest);
    }

    @SuppressWarnings("unchecked")
    private int obtenerUltimoMajorSpringBoot() {
        String url = "https://search.maven.org/solrsearch/select" +
            "?q=g:\"org.springframework.boot\"+AND+a:\"spring-boot-starter-parent\"" +
            "&core=gav&rows=100&wt=json";
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        if (response == null) return -1;
        Map<String, Object> body = (Map<String, Object>) response.get("response");
        List<Map<String, Object>> docs = (List<Map<String, Object>>) body.get("docs");
        return docs.stream()
            .map(d -> extraerMajor((String) d.get("v")))
            .filter(m -> m >= 0)
            .mapToInt(Integer::intValue)
            .max()
            .orElse(-1);
    }

    @SuppressWarnings("unchecked")
    private int obtenerUltimoMajorNpm(String packageName) {
        String url = "https://registry.npmjs.org/" + packageName + "/latest";
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        if (response == null) return -1;
        String version = (String) response.get("version");
        return version != null ? extraerMajor(version) : -1;
    }

    private int extraerMajor(String version) {
        try {
            return Integer.parseInt(version.split("\\.")[0]);
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    record FrameworkVersion(String nombre, String version, int major) {}
}
