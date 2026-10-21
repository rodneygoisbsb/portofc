package br.com.portofc.model.enums;

public enum FormaPagamento {
    PIX("PIX"),
    BOLETO("Boleto Bancário"),
    CARTAO_CREDITO("Cartão de Crédito"),
    TRANSFERENCIA("Transferência TED/DOC"),
    DINHEIRO("Dinheiro / Caixa");

    private final String label;

    FormaPagamento(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
