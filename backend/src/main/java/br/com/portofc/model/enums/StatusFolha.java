package br.com.portofc.model.enums;

public enum StatusFolha {
    PENDENTE("Pendente"),
    PAGO("Pago");

    private final String label;

    StatusFolha(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
