package br.com.portofc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    // Saldos essenciais calculados conforme regra do agent.md
    private BigDecimal saldoDisponivel; // Total Recebido (Pago) - Total Gasto (Pago)
    private BigDecimal saldoLivre;      // Total Recebido - (Total Pago + Despesas Comprometidas/Programadas)
    private BigDecimal totalReceitasPagas;
    private BigDecimal totalDespesasPagas;
    private BigDecimal totalDespesasComprometidas;

    // Resumo de Alunos e Frequência
    private long totalAlunosAtivos;
    private double taxaFrequenciaGlobal; // ex: 87.5%

    // Gráficos
    private List<CategoriaDespesaDTO> despesasPorCategoria;
    private List<OrcamentoMesDTO> execucaoOrcamentaria;
}
