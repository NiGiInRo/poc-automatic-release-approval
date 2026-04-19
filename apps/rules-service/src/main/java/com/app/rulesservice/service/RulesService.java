package com.app.rulesservice.service;

import com.app.rulesservice.dto.EvaluationResponse;
import com.app.rulesservice.dto.ReleaseRequest;
import com.app.rulesservice.dto.RuleResult;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class RulesService {

    private final ObsolescenciaService obsolescenciaService;

    public RulesService(ObsolescenciaService obsolescenciaService) {
        this.obsolescenciaService = obsolescenciaService;
    }

    public EvaluationResponse evaluate(ReleaseRequest request) {
        if (!"rs".equals(request.getTipo())) {
            return new EvaluationResponse(true, Map.of());
        }

        RuleResult cobertura     = evaluarCobertura(request.getCobertura());
        RuleResult estructura    = evaluarEstructura(request.getDescripcion(), request.getPr_o_jira());
        RuleResult obsolescencia = obsolescenciaService.evaluar(request.getStack());

        boolean aprobado = cobertura.isPasa() && estructura.isPasa() && obsolescencia.isPasa();

        return new EvaluationResponse(
            aprobado,
            Map.of(
                "cobertura",     cobertura,
                "estructura",    estructura,
                "obsolescencia", obsolescencia
            )
        );
    }

    private RuleResult evaluarCobertura(Integer cobertura) {
        if (cobertura == null) {
            return new RuleResult(false, "cobertura no informada");
        }
        if (cobertura >= 80) {
            return new RuleResult(true, cobertura + " >= 80");
        }
        return new RuleResult(false, cobertura + " < 80");
    }

    private RuleResult evaluarEstructura(String descripcion, String prOJira) {
        boolean tieneDescripcion = descripcion != null && !descripcion.isBlank();
        boolean tienePrOJira     = prOJira != null && !prOJira.isBlank();

        if (tieneDescripcion && tienePrOJira) {
            return new RuleResult(true, "descripcion y pr_o_jira presentes");
        }
        if (!tieneDescripcion && !tienePrOJira) {
            return new RuleResult(false, "falta descripcion y pr_o_jira");
        }
        if (!tieneDescripcion) {
            return new RuleResult(false, "falta descripcion");
        }
        return new RuleResult(false, "falta pr_o_jira");
    }
}
