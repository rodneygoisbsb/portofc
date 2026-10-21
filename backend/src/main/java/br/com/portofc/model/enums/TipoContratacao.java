package br.com.portofc.model.enums;

public enum TipoContratacao {
    HORISTA("Horista / Valor por Aula"),
    MENSALISTA("Mensalista / Salário Fixo");

    private final String label;

    TipoContratacao(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
