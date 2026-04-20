package com.app.integrationsservice.dto;

public class ValidatePrResponse {

    private boolean valido;
    private String detalle;

    public ValidatePrResponse(boolean valido, String detalle) {
        this.valido = valido;
        this.detalle = detalle;
    }

    public boolean isValido() { return valido; }
    public String getDetalle() { return detalle; }
}
