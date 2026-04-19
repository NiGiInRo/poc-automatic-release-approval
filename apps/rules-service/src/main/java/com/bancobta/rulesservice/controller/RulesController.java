package com.bancobta.rulesservice.controller;

import com.bancobta.rulesservice.dto.EvaluationResponse;
import com.bancobta.rulesservice.dto.ReleaseRequest;
import com.bancobta.rulesservice.service.RulesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "rules")
@RestController
@RequestMapping("/rules")
public class RulesController {

    private final RulesService rulesService;

    public RulesController(RulesService rulesService) {
        this.rulesService = rulesService;
    }

    @Operation(summary = "Estado del servicio")
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @Operation(summary = "Evaluar reglas de una solicitud de release")
    @PostMapping("/evaluate")
    public EvaluationResponse evaluate(@RequestBody ReleaseRequest request) {
        return rulesService.evaluate(request);
    }
}
