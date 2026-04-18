package com.bancobta.rulesservice.controller;

import com.bancobta.rulesservice.dto.EvaluationResponse;
import com.bancobta.rulesservice.dto.ReleaseRequest;
import com.bancobta.rulesservice.dto.RuleResult;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/rules")
public class RulesController {

    @PostMapping("/evaluate")
    public EvaluationResponse evaluate(@RequestBody ReleaseRequest request) {
        return new EvaluationResponse(
            true,
            Map.of(
                "cobertura",     new RuleResult(true, "hardcoded - pendiente implementar"),
                "estructura",    new RuleResult(true, "hardcoded - pendiente implementar"),
                "obsolescencia", new RuleResult(true, "hardcoded - pendiente implementar")
            )
        );
    }
}
