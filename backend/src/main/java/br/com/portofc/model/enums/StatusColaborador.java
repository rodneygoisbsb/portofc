package br.com.portofc.model.enums;

public enum StatusColaborador {
    ATIVO("Ativo"),
    INATIVO("Inativo");

    private final String label;

    StatusColaborador(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
