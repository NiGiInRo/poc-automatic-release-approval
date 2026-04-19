package com.app.integrationsservice.controller;

import com.app.integrationsservice.dto.ValidatePrRequest;
import com.app.integrationsservice.dto.ValidatePrResponse;
import com.app.integrationsservice.service.PrValidationService;
import org.springframework.web.bind.annotation.*;

@RestController
public class PrController {

    private final PrValidationService prValidationService;

    public PrController(PrValidationService prValidationService) {
        this.prValidationService = prValidationService;
    }

    @PostMapping("/validate-pr")
    public ValidatePrResponse validatePr(@RequestBody ValidatePrRequest request) {
        return prValidationService.validate(request.getPr_o_jira());
    }
}
