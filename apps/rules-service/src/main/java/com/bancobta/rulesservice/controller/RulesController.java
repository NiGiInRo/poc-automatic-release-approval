package com.bancobta.rulesservice.controller;

import com.bancobta.rulesservice.dto.EvaluationResponse;
import com.bancobta.rulesservice.dto.ReleaseRequest;
import com.bancobta.rulesservice.service.RulesService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/rules")
public class RulesController {

    private final RulesService rulesService;

    public RulesController(RulesService rulesService) {
        this.rulesService = rulesService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @PostMapping("/evaluate")
    public EvaluationResponse evaluate(@RequestBody ReleaseRequest request) {
        return rulesService.evaluate(request);
    }
}
