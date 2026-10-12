package br.com.portofc.model.enums;

public enum StatusAluno {
    ATIVO("Ativo"),
    INATIVO("Inativo");

    private final String label;

    StatusAluno(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
