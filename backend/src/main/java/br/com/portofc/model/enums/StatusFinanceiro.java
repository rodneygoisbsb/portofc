package br.com.portofc.model.enums;

public enum StatusFinanceiro {
    PAGO("Pago"),
    PENDENTE("Pendente"),
    PROGRAMADO("Programado");

    private final String label;

    StatusFinanceiro(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
