package br.com.portofc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrcamentoMesDTO {
    private String mesReferencia;
    private BigDecimal previsto;
    private BigDecimal realizado;
    private BigDecimal diferenca;
}
