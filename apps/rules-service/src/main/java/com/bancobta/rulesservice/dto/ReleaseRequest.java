package com.bancobta.rulesservice.dto;

public class ReleaseRequest {

    private String tipo;
    private Integer cobertura;
    private String descripcion;
    private String pr_o_jira;
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
