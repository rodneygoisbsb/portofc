package br.com.portofc.dto;

import br.com.portofc.model.enums.FormaPagamento;
import br.com.portofc.model.enums.StatusFinanceiro;
import br.com.portofc.model.enums.TipoLancamento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LancamentoResponseDTO {
    private Long id;
    private TipoLancamento tipo;
    private String descricao;
    private String categoria;
    private BigDecimal valor;
    private LocalDate dataVencimento;
    private LocalDate dataPagamento;
    private FormaPagamento formaPagamento;
    private StatusFinanceiro status;
    private String comprovanteUrl;
    private LocalDate dataCriacao;
}
