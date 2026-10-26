package br.com.portofc.model.enums;

public enum TipoLancamento {
    ENTRADA("Entrada"),
    SAIDA("Saída");

    private final String label;

    TipoLancamento(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
