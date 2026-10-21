package br.com.portofc.dto;

import br.com.portofc.model.enums.StatusFolha;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class FolhaAulaRequestDTO {

    @NotNull(message = "O ID do colaborador é obrigatório")
    private Long colaboradorId;

    @NotBlank(message = "O mês de referência é obrigatório")
    private String mesReferencia; // Formato "YYYY-MM"

    private BigDecimal horasRegistradas;
    private BigDecimal valorHora;
    private BigDecimal beneficios;
    private BigDecimal passagem;
    private Integer diasTransporte;
    private BigDecimal valorDiarioTransporte;
    private BigDecimal outrosBeneficios;
    private BigDecimal descontos;
    private StatusFolha status;
    private LocalDate dataPagamento;
}
