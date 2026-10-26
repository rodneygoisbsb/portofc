package br.com.portofc.model.enums;

public enum TipoContratacao {
    HORISTA("Horista / Valor por Aula"),
    MENSALISTA("Mensalista / Salário Fixo"),
    CLT("CLT"),
    PJ("Pessoa Jurídica (PJ)"),
    VOLUNTARIO("Voluntário");

    private final String label;

    TipoContratacao(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
