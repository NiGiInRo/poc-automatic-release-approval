package com.app.rulesservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Solicitud de evaluación de release")
public class ReleaseRequest {

    @Schema(description = "Tipo de solicitud", example = "rs")
    private String tipo;

    @Schema(description = "Porcentaje de cobertura de tests", example = "85")
    private Integer cobertura;

    @Schema(description = "Descripción del cambio", example = "Agrega módulo de pagos")
    private String descripcion;

    @Schema(description = "URL del PR o ticket de Jira", example = "https://github.com/org/repo/pull/42")
    private String pr_o_jira;

    @Schema(description = "Frameworks del stack separados por coma", example = "Spring Boot 3.2, Node 20")
    private String stack;

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Integer getCobertura() { return cobertura; }
    public void setCobertura(Integer cobertura) { this.cobertura = cobertura; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getPr_o_jira() { return pr_o_jira; }
    public void setPr_o_jira(String pr_o_jira) { this.pr_o_jira = pr_o_jira; }

    public String getStack() { return stack; }
    public void setStack(String stack) { this.stack = stack; }
}
