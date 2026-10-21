package br.com.portofc.model.enums;

public enum CategoriaAluno {
    SUB_7("Sub-7"),
    SUB_9("Sub-9"),
    SUB_15("Sub-15"),
    SUB_17("Sub-17"),
    ADULTO("Adulto");

    private final String label;

    CategoriaAluno(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
