package br.com.portofc.service;

import br.com.portofc.dto.CategoriaDespesaDTO;
import br.com.portofc.dto.DashboardStatsDTO;
import br.com.portofc.dto.OrcamentoMesDTO;
import br.com.portofc.model.enums.StatusAluno;
import br.com.portofc.model.enums.StatusFinanceiro;
import br.com.portofc.model.enums.TipoLancamento;
import br.com.portofc.repository.AlunoRepository;
import br.com.portofc.repository.FrequenciaRepository;
import br.com.portofc.repository.LancamentoFinanceiroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LancamentoFinanceiroRepository lancamentoRepository;
    private final AlunoRepository alunoRepository;
    private final FrequenciaRepository frequenciaRepository;
    private final FinanceiroService financeiroService;

    @Transactional(readOnly = true)
    public DashboardStatsDTO obterEstatisticas() {
        // Métricas financeiras
        BigDecimal totalReceitasPagas = lancamentoRepository.sumValorByTipoAndStatus(TipoLancamento.ENTRADA, StatusFinanceiro.PAGO);
        if (totalReceitasPagas == null) totalReceitasPagas = BigDecimal.ZERO;

        BigDecimal totalDespesasPagas = lancamentoRepository.sumValorByTipoAndStatus(TipoLancamento.SAIDA, StatusFinanceiro.PAGO);
        if (totalDespesasPagas == null) totalDespesasPagas = BigDecimal.ZERO;
        
        BigDecimal despesasPendentes = lancamentoRepository.sumValorByTipoAndStatus(TipoLancamento.SAIDA, StatusFinanceiro.PENDENTE);
        if (despesasPendentes == null) despesasPendentes = BigDecimal.ZERO;

        BigDecimal despesasProgramadas = lancamentoRepository.sumValorByTipoAndStatus(TipoLancamento.SAIDA, StatusFinanceiro.PROGRAMADO);
        if (despesasProgramadas == null) despesasProgramadas = BigDecimal.ZERO;

        BigDecimal totalDespesasComprometidas = despesasPendentes.add(despesasProgramadas);

        // Se não houver lançamentos de receitas registradas (ENTRADA), o recurso base é o teto global pactuado da emenda (R$ 120.000,00)
        BigDecimal orcamentoPrevisto = BigDecimal.valueOf(120000.00);
        BigDecimal recursoBase = totalReceitasPagas.compareTo(BigDecimal.ZERO) > 0 ? totalReceitasPagas : orcamentoPrevisto;

        // Saldo Disponível = Recurso Base (Receitas ou Teto da Emenda) - Total Pago
        BigDecimal saldoDisponivel = recursoBase.subtract(totalDespesasPagas);

        // Saldo Livre = Saldo Disponível - Despesas Comprometidas
        BigDecimal saldoLivre = saldoDisponivel.subtract(totalDespesasComprometidas);

        // Resumo de Alunos
        long alunosAtivos = alunoRepository.countByStatus(StatusAluno.ATIVO);

        // Taxa de frequência global
        long presencasTotais = frequenciaRepository.countPresencasTotais();
        long aulasTotais = frequenciaRepository.countTotalAulasGerais();
        double taxaGlobal = 100.0;
        if (aulasTotais > 0) {
            taxaGlobal = Math.round(((double) presencasTotais / aulasTotais * 100.0) * 10.0) / 10.0;
        }

        // Gráfico: Despesas por Categoria
        List<Object[]> despesasBrutas = lancamentoRepository.sumDespesasPorCategoria();
        List<CategoriaDespesaDTO> despesasPorCategoria = new ArrayList<>();
        BigDecimal totalDespesasGerais = lancamentoRepository.sumValorByTipo(TipoLancamento.SAIDA);

        for (Object[] row : despesasBrutas) {
            String cat = (String) row[0];
            BigDecimal valor = (BigDecimal) row[1];
            double pct = 0.0;
            if (totalDespesasGerais.compareTo(BigDecimal.ZERO) > 0) {
                pct = valor.divide(totalDespesasGerais, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
            }
            despesasPorCategoria.add(CategoriaDespesaDTO.builder()
                    .categoria(cat)
                    .total(valor)
                    .percentual(Math.round(pct * 10.0) / 10.0)
                    .build());
        }

        // Gráfico: Orçamento Previsto vs Realizado
        List<OrcamentoMesDTO> orcamentos = financeiroService.obterResumoOrcamento();

        return DashboardStatsDTO.builder()
                .saldoDisponivel(saldoDisponivel)
                .saldoLivre(saldoLivre)
                .totalReceitasPagas(totalReceitasPagas)
                .totalDespesasPagas(totalDespesasPagas)
                .totalDespesasComprometidas(totalDespesasComprometidas)
                .orcamentoPrevisto(orcamentoPrevisto)
                .totalAlunosAtivos(alunosAtivos)
                .taxaFrequenciaGlobal(taxaGlobal)
                .despesasPorCategoria(despesasPorCategoria)
                .execucaoOrcamentaria(orcamentos)
                .build();
    }
}
