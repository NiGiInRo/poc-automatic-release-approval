package com.app.rulesservice.dto;

import java.util.Map;

public class EvaluationResponse {

    private boolean aprobado;
    private Map<String, RuleResult> reglas;

    public EvaluationResponse(boolean aprobado, Map<String, RuleResult> reglas) {
        this.aprobado = aprobado;
        this.reglas = reglas;
    }

    public boolean isAprobado() { return aprobado; }
    public Map<String, RuleResult> getReglas() { return reglas; }
}
