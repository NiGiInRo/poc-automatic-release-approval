package com.app.rulesservice.dto;

public class RuleResult {

    private boolean pasa;
    private String detalle;

    public RuleResult(boolean pasa, String detalle) {
        this.pasa = pasa;
        this.detalle = detalle;
    }

    public boolean isPasa() { return pasa; }
    public String getDetalle() { return detalle; }
}
