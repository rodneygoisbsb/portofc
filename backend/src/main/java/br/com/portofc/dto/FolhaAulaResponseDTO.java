package br.com.portofc.dto;

import br.com.portofc.model.enums.StatusFolha;
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
public class FolhaAulaResponseDTO {
    private Long id;
    private Long colaboradorId;
    private String colaboradorNome;
    private String colaboradorFuncao;
    private String colaboradorFotoUrl;
    private br.com.portofc.model.enums.TipoContratacao tipoContratacao;
    private String mesReferencia;
    private BigDecimal horasRegistradas;
    private BigDecimal valorHora;
    private BigDecimal totalBruto;
    private BigDecimal beneficios;
    private BigDecimal passagem;
    private Integer diasTransporte;
    private BigDecimal valorDiarioTransporte;
    private BigDecimal outrosBeneficios;
    private BigDecimal descontos;
    private BigDecimal liquidoPagar;
    private StatusFolha status;
    private LocalDate dataPagamento;
}
